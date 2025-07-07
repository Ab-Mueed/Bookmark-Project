import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../components/ui/Button"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { IntentSearch } from "../components/ui/IntentSearch"
import { NestedSpace } from "../components/ui/NestedSpace"
import { ColumnView } from "../components/ui/ColumnView"
import { ChromeBookmarks } from "../utils/chrome-bookmarks"
import { ChromeStorage, STORAGE_KEYS } from "../utils/chrome-storage"
import { BookmarksAPI } from "../api/bookmarks"
import type {
  UserSettings,
  CategorizedBookmark,
  CategorizedBookmarkStore,
} from "../types"

export const Dashboard: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [allBookmarks, setAllBookmarks] = useState<CategorizedBookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<CategorizedBookmark[]>([])
  const [uncategorizedCount, setUncategorizedCount] = useState(0)
  const [viewMode, setViewMode] = useState<'spaces' | 'list' | 'columns'>('columns')

  const [isCategorizing, setIsCategorizing] = useState(false)

  useEffect(() => {
    loadData()
    
    // Listen for Chrome bookmark changes to keep extension in sync
    const handleBookmarkChanged = async () => {
      // Don't sync during categorization to avoid infinite loops
      if (isCategorizing) {
        console.log("Skipping bookmark sync during categorization...")
        return
      }
      
      console.log("Bookmark changed, syncing with Chrome bookmarks...")
      try {
        // Sync extension storage with Chrome bookmarks
        await ChromeBookmarks.syncWithChromeBookmarks()
        // Reload data to reflect changes
        await loadData()
      } catch (error) {
        console.error("Error syncing bookmarks:", error)
      }
    }

    if (typeof chrome !== "undefined" && chrome.bookmarks) {
      chrome.bookmarks.onCreated.addListener(handleBookmarkChanged)
      chrome.bookmarks.onRemoved.addListener(handleBookmarkChanged)
      chrome.bookmarks.onChanged.addListener(handleBookmarkChanged)
      chrome.bookmarks.onMoved.addListener(handleBookmarkChanged)
    }

    return () => {
      if (typeof chrome !== "undefined" && chrome.bookmarks) {
        chrome.bookmarks.onCreated.removeListener(handleBookmarkChanged)
        chrome.bookmarks.onRemoved.removeListener(handleBookmarkChanged)
        chrome.bookmarks.onChanged.removeListener(handleBookmarkChanged)
        chrome.bookmarks.onMoved.removeListener(handleBookmarkChanged)
      }
    }
  }, [isCategorizing])

  const loadData = async () => {
    // Load user settings
    const userSettings = await ChromeStorage.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS)
    setSettings(userSettings)

    // Load categorized bookmarks with synchronization
    const categorizedBookmarks = await ChromeBookmarks.getValidCategorizedBookmarks()
    setAllBookmarks(categorizedBookmarks)
    setFilteredBookmarks(categorizedBookmarks)

    // Count uncategorized bookmarks
    const uncategorized = await ChromeBookmarks.getUncategorized()
    setUncategorizedCount(uncategorized.length)
  }

  const handleCategorizeBookmarks = async () => {
    if (!settings) return

    setIsLoading(true)
    setIsCategorizing(true)

    try {
      const uncategorizedBookmarks = await ChromeBookmarks.getUncategorized()

      if (uncategorizedBookmarks.length === 0) {
        return
      }

      // Fetch descriptions for the bookmarks before categorizing
      const bookmarksWithDescriptions = await ChromeBookmarks.getBookmarksWithDescriptions(uncategorizedBookmarks)

      const response = await BookmarksAPI.categorize({
        persona: settings.persona,
        bookmarks: bookmarksWithDescriptions,
        structure: settings.structure,
      })

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.data) {
        const categorizedStore =
          (await ChromeStorage.get<CategorizedBookmarkStore>(STORAGE_KEYS.CATEGORIZED_BOOKMARKS)) || {}

        response.data.forEach((bookmark: CategorizedBookmark) => {
          if (bookmark.id) {
            categorizedStore[bookmark.id] = {
              bookmark,
              categorizedAt: Date.now(),
            }
          }
        })

        await ChromeStorage.set(STORAGE_KEYS.CATEGORIZED_BOOKMARKS, categorizedStore)

        // Organize bookmarks in Chrome's native bookmark system
        try {
          await ChromeBookmarks.organizeBookmarksInChrome(response.data, settings.structure === "flattened" ? "flatten" : "nested")
        } catch (chromeError) {
          console.warn("Failed to organize in Chrome bookmarks:", chromeError)
        }

        await loadData()
        
        // Add a small delay to ensure Chrome bookmark operations complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error("Categorization error:", error)
    } finally {
      setIsLoading(false)
      setIsCategorizing(false)
    }
  }

  const handleClearAll = async () => {
    try {
      // Remove from extension storage
      await ChromeStorage.remove(STORAGE_KEYS.CATEGORIZED_BOOKMARKS)
      
      // Remove categorized bookmarks from Chrome's native bookmark system
      if (typeof chrome !== "undefined" && chrome.bookmarks) {
        const allBookmarks = await ChromeBookmarks.getAll()
        
        // Find and remove bookmarks that are in categorized folders
        for (const bookmark of allBookmarks) {
          if (bookmark.id) {
            const isInCategorizedFolder = await ChromeBookmarks.isInCategorizedFolder(bookmark)
            if (isInCategorizedFolder) {
              try {
                await chrome.bookmarks.remove(bookmark.id)
                console.log(`Removed categorized bookmark: ${bookmark.title}`)
              } catch (error) {
                console.warn(`Failed to remove bookmark ${bookmark.id}:`, error)
              }
            }
          }
        }
        
        // Remove the main categorized bookmarks folder if it exists
        try {
          const bookmarkBar = await chrome.bookmarks.getSubTree("1")
          const bookmarkBarId = bookmarkBar[0].id
          const existingFolders = await chrome.bookmarks.getChildren(bookmarkBarId)
          const categorizedFolder = existingFolders.find(folder => folder.title === "📚 Categorized Bookmarks")
          
          if (categorizedFolder) {
            await chrome.bookmarks.removeTree(categorizedFolder.id)
            console.log("Removed categorized bookmarks folder")
          }
        } catch (error) {
          console.warn("Failed to remove categorized bookmarks folder:", error)
        }
      }
      
      // Update UI state
      setAllBookmarks([])
      setFilteredBookmarks([])
      
      // Reload data to reflect changes
      await loadData()
      
      console.log("Successfully cleared all categorized bookmarks")
    } catch (error) {
      console.error("Error clearing all bookmarks:", error)
    }
  }

  const handleBookmarkClick = (bookmark: CategorizedBookmark) => {
    chrome.tabs.create({ url: bookmark.url })
  }

  const handleSearchResults = (results: CategorizedBookmark[]) => {
    setFilteredBookmarks(results)
  }

  const getSpaceColor = (category: string): 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' => {
    const colors: ('blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo')[] = ['blue', 'purple', 'green', 'orange', 'pink', 'indigo']
    const hash = category.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const groupBookmarksByCategory = (bookmarks: CategorizedBookmark[]) => {
    // Create a nested structure based on the category path
    const nestedGroups = new Map<string, any>()
    
    bookmarks.forEach((bookmark) => {
      const categoryPath = Array.isArray(bookmark.category) 
        ? bookmark.category.join('/') 
        : bookmark.category
      const pathParts = categoryPath.split('/').filter((part: string) => part.trim() !== '')
      
      if (pathParts.length === 0) {
        // Uncategorized bookmarks
        if (!nestedGroups.has('Uncategorized')) {
          nestedGroups.set('Uncategorized', { bookmarks: [], subcategories: new Map() })
        }
        nestedGroups.get('Uncategorized')!.bookmarks.push(bookmark)
      } else {
        // Categorized bookmarks
        const topLevelCategory = pathParts[0]
        
        if (!nestedGroups.has(topLevelCategory)) {
          nestedGroups.set(topLevelCategory, { bookmarks: [], subcategories: new Map() })
        }
        
        const topLevelGroup = nestedGroups.get(topLevelCategory)!
        
        if (pathParts.length === 1) {
          // Direct category
          topLevelGroup.bookmarks.push(bookmark)
        } else {
          // Nested category - create subcategory structure
          let currentSubcategories = topLevelGroup.subcategories
          
          for (let i = 1; i < pathParts.length; i++) {
            const subcategoryName = pathParts[i]
            
            if (i === pathParts.length - 1) {
              // Final level - add bookmark here
              if (!currentSubcategories.has(subcategoryName)) {
                currentSubcategories.set(subcategoryName, { bookmarks: [], subcategories: new Map() })
              }
              currentSubcategories.get(subcategoryName)!.bookmarks.push(bookmark)
            } else {
              // Intermediate level - create nested structure
              if (!currentSubcategories.has(subcategoryName)) {
                currentSubcategories.set(subcategoryName, { bookmarks: [], subcategories: new Map() })
              }
              currentSubcategories = currentSubcategories.get(subcategoryName)!.subcategories
            }
          }
        }
      }
    })

    // Convert the nested structure to a flat array for rendering
    const result: Array<{category: string, bookmarks: CategorizedBookmark[], subcategories?: any}> = []
    
    for (const [category, group] of nestedGroups) {
      result.push({
        category,
        bookmarks: group.bookmarks,
        subcategories: group.subcategories
      })
    }

    return result
  }



  if (!settings) {
    return (
      <div className="min-h-screen liquid-gradient-secondary flex items-center justify-center p-6">
        <div className="liquid-card text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 liquid-gradient-primary rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Setup Required</h1>
          <p className="text-slate-600 mb-6">Please complete the setup in the extension popup first.</p>
          <Button onClick={() => window.close()}>Close</Button>
        </div>
      </div>
    )
  }

  const bookmarkGroups = groupBookmarksByCategory(filteredBookmarks)
  
  // Debug logging
  console.log('All bookmarks:', allBookmarks)
  console.log('Filtered bookmarks:', filteredBookmarks)
  console.log('Bookmark groups:', bookmarkGroups)

  return (
    <div className="min-h-screen liquid-gradient-secondary">
      {/* Header */}
      <div className="liquid-glass border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 liquid-gradient-primary rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Bookmark Spaces</h1>
                <p className="text-slate-600">Organized by {settings.persona}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={async () => {
                  try {
                    await ChromeBookmarks.syncWithChromeBookmarks()
                    await loadData()
                  } catch (error) {
                    console.error("Error syncing:", error)
                  }
                }}
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar - Always Visible */}
        <div className="mb-6">
          <IntentSearch
            bookmarks={allBookmarks || []}
            onSearchResults={handleSearchResults}
            className="w-full max-w-2xl"
          />
        </div>

        {/* Stats and Actions */}
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="liquid-card py-3 px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Uncategorized</p>
                    <p className="text-lg font-semibold text-slate-900">{uncategorizedCount}</p>
                  </div>
                </div>
              </div>

              <div className="liquid-card py-3 px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Categorized</p>
                    <p className="text-lg font-semibold text-slate-900">{allBookmarks.length}</p>
                  </div>
                </div>
              </div>

              <div className="liquid-card py-3 px-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Spaces</p>
                    <p className="text-lg font-semibold text-slate-900">{bookmarkGroups.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={handleCategorizeBookmarks}
                loading={isLoading}
                disabled={uncategorizedCount === 0}
              >
                {isLoading ? "Categorizing..." : `Categorize ${uncategorizedCount} Bookmarks`}
              </Button>
              <Button variant="outline" onClick={handleClearAll} disabled={allBookmarks.length === 0}>
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="liquid-card text-center py-12">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-slate-600">Analyzing your bookmarks and categorizing them...</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && (
          <>
            {filteredBookmarks.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {viewMode === 'spaces' ? 'Bookmark Spaces' : 'All Bookmarks'} ({filteredBookmarks.length})
                  </h2>
                  
                  <div className="liquid-nav">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setViewMode('columns')}
                        className={`liquid-nav-item ${viewMode === 'columns' ? 'active' : ''}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span>Columns</span>
                      </button>
                      <button
                        onClick={() => setViewMode('spaces')}
                        className={`liquid-nav-item ${viewMode === 'spaces' ? 'active' : ''}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Spaces</span>
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`liquid-nav-item ${viewMode === 'list' ? 'active' : ''}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span>List</span>
                      </button>
                    </div>
                  </div>
                </div>

                {viewMode === 'columns' ? (
                  <div className="liquid-card h-96">
                    <ColumnView
                      bookmarks={filteredBookmarks}
                      onBookmarkClick={handleBookmarkClick}
                      className="h-full"
                    />
                  </div>
                ) : viewMode === 'spaces' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkGroups.map((group, index) => (
                      <div 
                        key={index}
                        className="liquid-scale-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <NestedSpace
                          title={group.category}
                          bookmarks={group.bookmarks}
                          subcategories={group.subcategories}
                          color={getSpaceColor(group.category)}
                          onBookmarkClick={handleBookmarkClick}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="liquid-card">
                    <div className="space-y-3">
                      {filteredBookmarks.map((bookmark, index) => (
                        <div
                          key={bookmark.id || `${bookmark.url}-${index}`}
                          onClick={() => handleBookmarkClick(bookmark)}
                          className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/60 transition-all duration-200 cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`}
                              alt=""
                              className="w-6 h-6"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                              {bookmark.title}
                            </h4>
                            <p className="text-sm text-slate-500 truncate">{bookmark.url}</p>
                            <p className="text-xs text-slate-400">{bookmark.category}</p>
                          </div>
                          <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="liquid-card text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-slate-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No bookmarks found</h3>
                <p className="text-slate-600">
                  {uncategorizedCount > 0
                    ? `Click "Categorize Bookmarks" to organize your ${uncategorizedCount} bookmarks.`
                    : "All your bookmarks are already categorized!"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
