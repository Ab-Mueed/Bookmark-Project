import { useState } from "react"
import { ChromeBookmarks } from "../utils/chrome-bookmarks"
import { ChromeStorage, STORAGE_KEYS } from "../utils/chrome-storage"
import { BookmarksAPI } from "../api/bookmarks"
import type { UserSettings, CategorizedBookmark, CategorizedBookmarkStore } from "../types"

export const useCategorization = (
  settings: UserSettings | null,
  setIsLoading: (loading: boolean) => void,
  setIsCategorizing: (categorizing: boolean) => void,
  loadData: () => Promise<void>
) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewBookmarks, setPreviewBookmarks] = useState<CategorizedBookmark[]>([])

  const handleCategorizeBookmarks = async () => {
    if (!settings) return

    setIsLoading(true)
    setIsCategorizing(true)

    try {
      const uncategorizedBookmarks = await ChromeBookmarks.getUncategorized()

      if (uncategorizedBookmarks.length === 0) {
        setIsLoading(false)
        setIsCategorizing(false)
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
        // Show preview modal instead of immediately organizing
        setPreviewBookmarks(response.data)
        setPreviewOpen(true)
      }
    } catch (error) {
      console.error("Categorization error:", error)
      setIsLoading(false)
      setIsCategorizing(false)
    }
  }

  // Accept: organize bookmarks and update storage
  const handleAcceptPreview = async () => {
    setPreviewOpen(false)
    setIsLoading(true)
    setIsCategorizing(true)
    try {
      if (!settings) {
        setIsLoading(false)
        setIsCategorizing(false)
        setPreviewBookmarks([])
        return
      }
      const categorizedStore =
        (await ChromeStorage.get<CategorizedBookmarkStore>(STORAGE_KEYS.CATEGORIZED_BOOKMARKS)) || {}
      previewBookmarks.forEach((bookmark: CategorizedBookmark) => {
        if (bookmark.id) {
          categorizedStore[bookmark.id] = {
            bookmark,
            categorizedAt: Date.now(),
          }
        }
      })
      await ChromeStorage.set(STORAGE_KEYS.CATEGORIZED_BOOKMARKS, categorizedStore)
      await ChromeBookmarks.organizeBookmarksInChrome(previewBookmarks, settings.structure === "flattened" ? "flatten" : "nested")
      await loadData()
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Error organizing bookmarks:", error)
    } finally {
      setIsLoading(false)
      setIsCategorizing(false)
      setPreviewBookmarks([])
    }
  }

  // Deny: abort process
  const handleDenyPreview = () => {
    setPreviewOpen(false)
    setIsLoading(false)
    setIsCategorizing(false)
    setPreviewBookmarks([])
  }

  return {
    previewOpen,
    previewBookmarks,
    handleCategorizeBookmarks,
    handleAcceptPreview,
    handleDenyPreview
  }
} 