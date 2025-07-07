import { useState, useEffect } from "react"
import { ChromeBookmarks } from "../utils/chrome-bookmarks"
import { ChromeStorage, STORAGE_KEYS } from "../utils/chrome-storage"
import type { UserSettings } from "../types"

export const usePopupDashboardState = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [categorizedCount, setCategorizedCount] = useState(0)
  const [uncategorizedCount, setUncategorizedCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const userSettings = await ChromeStorage.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS)
    setSettings(userSettings)
    await ChromeBookmarks.syncWithChromeBookmarks()
    const categorizedBookmarks = await ChromeBookmarks.getValidCategorizedBookmarks()
    setCategorizedCount(categorizedBookmarks.length)
    const uncategorized = await ChromeBookmarks.getUncategorized()
    setUncategorizedCount(uncategorized.length)
  }

  const handleSetupComplete = async (newSettings: UserSettings) => {
    await ChromeStorage.set(STORAGE_KEYS.USER_SETTINGS, newSettings)
    setSettings(newSettings)
    setShowSettings(false)
  }

  return {
    settings,
    setSettings,
    isLoading,
    setIsLoading,
    categorizedCount,
    setCategorizedCount,
    uncategorizedCount,
    setUncategorizedCount,
    showSettings,
    setShowSettings,
    loadData,
    handleSetupComplete
  }
} 