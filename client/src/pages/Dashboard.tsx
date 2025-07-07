import type React from "react"
import { useState } from "react"
import { LoadingSpinner } from "../components/ui/LoadingSpinner"
import { IntentSearch } from "../components/ui/IntentSearch"
import { ColumnView } from "../components/ui/ColumnView"
import { PreviewCategories } from "../components/PreviewCategories"
import { DashboardHeader } from "../components/DashboardHeader"
import { DashboardStats } from "../components/DashboardStats"
import { ViewModeSelector } from "../components/ViewModeSelector"
import { BookmarkListView } from "../components/BookmarkListView"
import { BookmarkSpacesView } from "../components/BookmarkSpacesView"
import { EmptyState } from "../components/EmptyState"
import { SetupRequired } from "../components/SetupRequired"
import { useDashboardState } from "../hooks/useDashboardState"
import { useCategorization } from "../hooks/useCategorization"
import { handleBookmarkClick, handleClearAll } from "../utils/bookmark-utils"

export const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'spaces' | 'list' | 'columns'>('columns')
  
  const {
    settings,
    isLoading,
    setIsLoading,
    allBookmarks,
    setAllBookmarks,
    filteredBookmarks,
    setFilteredBookmarks,
    uncategorizedCount,
    setIsCategorizing,
    loadData
  } = useDashboardState()

  const {
    previewOpen,
    previewBookmarks,
    handleCategorizeBookmarks,
    handleAcceptPreview,
    handleDenyPreview
  } = useCategorization(settings, setIsLoading, setIsCategorizing, loadData)

  const handleSearchResults = (results: any[]) => {
    setFilteredBookmarks(results)
  }

  const handleSync = async () => {
    try {
      await loadData()
    } catch (error) {
      console.error("Error syncing:", error)
    }
  }

  const handleClearAllBookmarks = () => {
    handleClearAll(setAllBookmarks, setFilteredBookmarks, loadData)
  }

  if (!settings) {
    return <SetupRequired />
  }

  const bookmarkGroups = filteredBookmarks.length > 0 ? 
    filteredBookmarks.reduce((acc, bookmark) => {
      const category = Array.isArray(bookmark.category) 
        ? bookmark.category.join('/') 
        : bookmark.category
      if (!acc[category]) acc[category] = []
      acc[category].push(bookmark)
      return acc
    }, {} as Record<string, any[]>) : {}

  // Debug logging
  console.log('All bookmarks:', allBookmarks)
  console.log('Filtered bookmarks:', filteredBookmarks)
  console.log('Bookmark groups:', bookmarkGroups)

  return (
    <div className="min-h-screen liquid-gradient-secondary">
      <DashboardHeader 
        settings={settings}
        isLoading={isLoading}
        onSync={handleSync}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar - Always Visible */}
        <div className="mb-6">
          <IntentSearch
            bookmarks={allBookmarks || []}
            onSearchResults={handleSearchResults}
            className="w-full max-w-2xl"
          />
        </div>

        <DashboardStats
          uncategorizedCount={uncategorizedCount}
          categorizedCount={allBookmarks.length}
          spacesCount={Object.keys(bookmarkGroups).length}
          isLoading={isLoading}
          onCategorize={handleCategorizeBookmarks}
          onClearAll={handleClearAllBookmarks}
        />

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
                  
                  <ViewModeSelector
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
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
                  <BookmarkSpacesView
                    bookmarks={filteredBookmarks}
                    onBookmarkClick={handleBookmarkClick}
                  />
                ) : (
                  <BookmarkListView
                    bookmarks={filteredBookmarks}
                    onBookmarkClick={handleBookmarkClick}
                  />
                )}
              </div>
            ) : (
              <EmptyState uncategorizedCount={uncategorizedCount} />
            )}
          </>
        )}
      </div>

      <PreviewCategories
        isOpen={previewOpen}
        onAccept={handleAcceptPreview}
        onDeny={handleDenyPreview}
        categorizedBookmarks={previewBookmarks}
      />
    </div>
  )
}
