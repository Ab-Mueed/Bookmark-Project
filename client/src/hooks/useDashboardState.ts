import { useState, useEffect } from "react"
import { ChromeBookmarks } from "../utils/chrome-bookmarks"
import { ChromeStorage, STORAGE_KEYS } from "../utils/chrome-storage"
import type { UserSettings, CategorizedBookmark } from "../types"

export const useDashboardState = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [allBookmarks, setAllBookmarks] = useState<CategorizedBookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<CategorizedBookmark[]>([])
  const [uncategorizedCount, setUncategorizedCount] = useState(0)
  const [isCategorizing, setIsCategorizing] = useState(false)

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

  return {
    settings,
    isLoading,
    setIsLoading,
    allBookmarks,
    setAllBookmarks,
    filteredBookmarks,
    setFilteredBookmarks,
    uncategorizedCount,
    isCategorizing,
    setIsCategorizing,
    loadData
  }
} 