import { useState, useEffect, useCallback } from 'react'
import type { 
  Bookmark, 
  CategorizedBookmark, 
  BookmarkWithDescription, 
  CategorizationProgress,
  UserSettings 
} from '../types'
import { ChromeBookmarks } from '../utils/chrome-bookmarks'
import { BookmarksAPI } from '../api/bookmarks'
import { ChromeStorage, STORAGE_KEYS } from '../utils/chrome-storage'

export const useBookmarks = () => {
  const [uncategorizedBookmarks, setUncategorizedBookmarks] = useState<Bookmark[]>([])
  const [categorizedBookmarks, setCategorizedBookmarks] = useState<CategorizedBookmark[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState<CategorizationProgress>({
    total: 0,
    processed: 0,
    currentBatch: 0,
    isProcessing: false
  })
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)

  // Load user settings
  const loadUserSettings = useCallback(async () => {
    try {
      const settings = await ChromeStorage.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS)
      setUserSettings(settings)
      return settings
    } catch (error) {
      console.error('Error loading user settings:', error)
      return null
    }
  }, [])

  // Save user settings
  const saveUserSettings = useCallback(async (settings: UserSettings) => {
    try {
      await ChromeStorage.set(STORAGE_KEYS.USER_SETTINGS, settings)
      setUserSettings(settings)
      return true
    } catch (error) {
      console.error('Error saving user settings:', error)
      return false
    }
  }, [])

  // Load uncategorized bookmarks
  const loadUncategorizedBookmarks = useCallback(async () => {
    try {
      setIsLoading(true)
      const bookmarks = await ChromeBookmarks.getUncategorized()
      setUncategorizedBookmarks(bookmarks)
      return bookmarks
    } catch (error) {
      console.error('Error loading uncategorized bookmarks:', error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load categorized bookmarks
  const loadCategorizedBookmarks = useCallback(async () => {
    try {
      const bookmarks = await ChromeBookmarks.getValidCategorizedBookmarks()
      setCategorizedBookmarks(bookmarks)
      return bookmarks
    } catch (error) {
      console.error('Error loading categorized bookmarks:', error)
      return []
    }
  }, [])

  // Fetch descriptions for bookmarks
  const fetchBookmarkDescriptions = useCallback(async (bookmarks: Bookmark[]) => {
    try {
      setIsLoading(true)
      const bookmarksWithDescriptions = await ChromeBookmarks.getBookmarksWithDescriptions(bookmarks)
      return bookmarksWithDescriptions
    } catch (error) {
      console.error('Error fetching bookmark descriptions:', error)
      return bookmarks.map(bookmark => ({ ...bookmark, description: bookmark.title }))
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Categorize bookmarks
  const categorizeBookmarks = useCallback(async (
    bookmarks: BookmarkWithDescription[],
    persona: string,
    structure: "flattened" | "nested"
  ) => {
    try {
      setProgress({
        total: bookmarks.length,
        processed: 0,
        currentBatch: 0,
        isProcessing: true
      })

      const categorizedBookmarks = await BookmarksAPI.categorizeInBatches(
        bookmarks,
        persona,
        structure,
        50, // batch size
        (processed, total) => {
          setProgress(prev => ({
            ...prev,
            processed,
            total
          }))
        }
      )

      // Store categorized bookmarks
      const categorizedStore: Record<string, { bookmark: CategorizedBookmark; categorizedAt: number }> = {}
      categorizedBookmarks.forEach(bookmark => {
        if (bookmark.id) {
          categorizedStore[bookmark.id] = {
            bookmark,
            categorizedAt: bookmark.categorizedAt
          }
        }
      })

      await ChromeStorage.set(STORAGE_KEYS.CATEGORIZED_BOOKMARKS, categorizedStore)

      // Organize bookmarks in Chrome
      await ChromeBookmarks.organizeBookmarksInChrome(
        categorizedBookmarks,
        structure === "flattened" ? "flatten" : "nested"
      )

      // Update local state
      setCategorizedBookmarks(prev => [...prev, ...categorizedBookmarks])
      setUncategorizedBookmarks(prev => 
        prev.filter(bookmark => !categorizedBookmarks.find(cat => cat.id === bookmark.id))
      )

      setProgress(prev => ({ ...prev, isProcessing: false }))
      return categorizedBookmarks
    } catch (error) {
      console.error('Error categorizing bookmarks:', error)
      setProgress(prev => ({ ...prev, isProcessing: false }))
      throw error
    }
  }, [])

  // Refresh all bookmark data
  const refreshBookmarks = useCallback(async () => {
    await Promise.all([
      loadUncategorizedBookmarks(),
      loadCategorizedBookmarks()
    ])
  }, [loadUncategorizedBookmarks, loadCategorizedBookmarks])

  // Initialize on mount
  useEffect(() => {
    loadUserSettings()
    refreshBookmarks()
  }, [loadUserSettings, refreshBookmarks])

  return {
    // State
    uncategorizedBookmarks,
    categorizedBookmarks,
    isLoading,
    progress,
    userSettings,
    
    // Actions
    loadUncategorizedBookmarks,
    loadCategorizedBookmarks,
    fetchBookmarkDescriptions,
    categorizeBookmarks,
    refreshBookmarks,
    loadUserSettings,
    saveUserSettings
  }
} 