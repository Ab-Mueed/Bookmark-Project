// Chrome extension storage utilities
declare const chrome: any // Declare the chrome variable to fix the lint error

export class ChromeStorage {
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get([key])
        return result[key] || null
      }

      // Fallback for development
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error("Error getting from storage:", error)
      return null
    }
  }

  static async set<T>(key: string, value: T): Promise<boolean> {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        await chrome.storage.local.set({ [key]: value })
        return true
      }

      // Fallback for development
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Error setting storage:", error)
      return false
    }
  }

  static async remove(key: string): Promise<boolean> {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        await chrome.storage.local.remove([key])
        return true
      }

      // Fallback for development
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error("Error removing from storage:", error)
      return false
    }
  }
}

export const STORAGE_KEYS = {
  USER_SETTINGS: "user_settings",
  CATEGORIZED_BOOKMARKS: "categorized_bookmarks",
  LAST_CATEGORIZATION: "last_categorization",
} as const
