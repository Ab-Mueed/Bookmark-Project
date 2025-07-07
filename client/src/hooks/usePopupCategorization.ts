import { useState } from "react"
import { ChromeBookmarks } from "../utils/chrome-bookmarks"
import { ChromeStorage, STORAGE_KEYS } from "../utils/chrome-storage"
import { BookmarksAPI } from "../api/bookmarks"
import type { UserSettings, CategorizedBookmark, CategorizedBookmarkStore } from "../types"

export const usePopupCategorization = (
  settings: UserSettings | null,
  setIsLoading: (loading: boolean) => void,
  loadData: () => Promise<void>
) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewBookmarks, setPreviewBookmarks] = useState<CategorizedBookmark[]>([])

  const handleCategorizeBookmarks = async () => {
    if (!settings) return
    setIsLoading(true)
    try {
      const uncategorizedBookmarks = await ChromeBookmarks.getUncategorized()
      if (uncategorizedBookmarks.length === 0) {
        setIsLoading(false)
        return
      }
      const bookmarksWithDescriptions = await ChromeBookmarks.getBookmarksWithDescriptions(uncategorizedBookmarks)
      const response = await BookmarksAPI.categorize({
        persona: settings.persona,
        bookmarks: bookmarksWithDescriptions,
        structure: settings.structure,
      })
      if (response.error) throw new Error(response.error)
      if (response.data) {
        setPreviewBookmarks(response.data)
        setPreviewOpen(true)
      }
    } catch (error) {
      console.error("Categorization error:", error)
      setIsLoading(false)
    }
  }

  const handleAcceptPreview = async () => {
    setPreviewOpen(false)
    setIsLoading(true)
    try {
      if (!settings) {
        setIsLoading(false)
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
    } catch (error) {
      console.error("Error organizing bookmarks:", error)
    } finally {
      setIsLoading(false)
      setPreviewBookmarks([])
    }
  }

  const handleDenyPreview = () => {
    setPreviewOpen(false)
    setIsLoading(false)
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