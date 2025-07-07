import { ChromeBookmarks } from "./chrome-bookmarks"
import { ChromeStorage, STORAGE_KEYS } from "./chrome-storage"
import type { CategorizedBookmark } from "../types"

export const handleBookmarkClick = (bookmark: CategorizedBookmark) => {
  chrome.tabs.create({ url: bookmark.url })
}

export const getSpaceColor = (category: string): 'blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo' => {
  const colors: ('blue' | 'purple' | 'green' | 'orange' | 'pink' | 'indigo')[] = ['blue', 'purple', 'green', 'orange', 'pink', 'indigo']
  const hash = category.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export const groupBookmarksByCategory = (bookmarks: CategorizedBookmark[]) => {
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

export const handleClearAll = async (
  setAllBookmarks: (bookmarks: CategorizedBookmark[]) => void,
  setFilteredBookmarks: (bookmarks: CategorizedBookmark[]) => void,
  loadData: () => Promise<void>
) => {
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

export const getDomainFromUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    return domain.split('.')[0]
  } catch {
    return 'link'
  }
}

export const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
  } catch {
    return ''
  }
}

export const formatDate = (timestamp?: number): string => {
  if (!timestamp) return 'Unknown date'
  return new Date(timestamp).toLocaleDateString()
} 