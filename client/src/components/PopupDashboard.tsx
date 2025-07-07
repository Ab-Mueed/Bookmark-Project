"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "./ui/Button"
import { LoadingSpinner } from "./ui/LoadingSpinner"
import { SetupWizard } from "./SetupWizard"
import { ChromeBookmarks } from "../utils/chrome-bookmarks"
import { ChromeStorage, STORAGE_KEYS } from "../utils/chrome-storage"
import { BookmarksAPI } from "../api/bookmarks"
import type {
  UserSettings,
  CategorizedBookmark,
  CategorizedBookmarkStore,
} from "../types"
import { PreviewCategories } from "./PreviewCategories"

export const PopupDashboard: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [categorizedCount, setCategorizedCount] = useState(0)
  const [uncategorizedCount, setUncategorizedCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewBookmarks, setPreviewBookmarks] = useState<CategorizedBookmark[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Load user settings
    const userSettings = await ChromeStorage.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS)
    setSettings(userSettings)

    // Ensure sync runs before counting
    await ChromeBookmarks.syncWithChromeBookmarks()

    // Count categorized bookmarks using the same logic as the dashboard
    const categorizedBookmarks = await ChromeBookmarks.getValidCategorizedBookmarks()
    setCategorizedCount(categorizedBookmarks.length)

    // Count uncategorized bookmarks
    const uncategorized = await ChromeBookmarks.getUncategorized()
    setUncategorizedCount(uncategorized.length)
  }

  const handleCategorizeBookmarks = async () => {
    if (!settings) return

    setIsLoading(true)

    try {
      const uncategorizedBookmarks = await ChromeBookmarks.getUncategorized()

      if (uncategorizedBookmarks.length === 0) {
        setIsLoading(false)
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
    }
  }

  // Accept: organize bookmarks and update storage
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

  // Deny: abort process
  const handleDenyPreview = () => {
    setPreviewOpen(false)
    setIsLoading(false)
    setPreviewBookmarks([])
  }

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") })
  }

  const handleSetupComplete = async (newSettings: UserSettings) => {
    await ChromeStorage.set(STORAGE_KEYS.USER_SETTINGS, newSettings)
    setSettings(newSettings)
    setShowSettings(false)
  }

  if (!settings) {
    return (
      <div className="w-80 h-96 liquid-gradient-secondary rounded-sm">
        <SetupWizard onComplete={handleSetupComplete} />
      </div>
    )
  }

  if (showSettings) {
    return (
      <div className="w-80 h-96 liquid-gradient-secondary rounded-sm">
        <SetupWizard onComplete={handleSetupComplete} />
      </div>
    )
  }

  return (
    <div className="w-80 h-96 liquid-gradient-secondary rounded-sm">
      {/* Header */}
      <div className="liquid-glass border-b border-white/20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 liquid-gradient-primary rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900">Bookmark Categorizer</h1>
                <p className="text-xs text-slate-600">{settings.persona}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="liquid-card p-3 text-center">
            <div className="text-xl font-bold text-slate-900">{categorizedCount}</div>
            <div className="text-xs text-slate-600">Categorized</div>
          </div>
          <div className="liquid-card p-3 text-center">
            <div className="text-xl font-bold text-slate-900">{uncategorizedCount}</div>
            <div className="text-xs text-slate-600">Uncategorized</div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleCategorizeBookmarks}
            disabled={isLoading || uncategorizedCount === 0}
            className="w-full text-sm py-2.5 shadow-lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                Categorizing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Categorize {uncategorizedCount} Bookmarks
              </>
            )}
          </Button>

          <Button 
            variant="ghost" 
            onClick={handleOpenDashboard}
            className="w-full text-sm py-2.5 shadow-lg"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open Full Dashboard
          </Button>
        </div>

        {/* Quick Info */}
        <div className="liquid-card p-3">
          <div className="text-xs text-slate-600">
            <p className="mb-1"><strong>Structure:</strong> {settings.structure}</p>
            <p>Bookmarks are automatically organized in Chrome's native bookmark system.</p>
          </div>
        </div>
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