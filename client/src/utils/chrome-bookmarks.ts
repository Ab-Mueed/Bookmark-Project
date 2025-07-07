import type { Bookmark, ChromeBookmarkNode, BookmarkWithDescription, CategorizedBookmarkStore, CategorizedBookmark } from "../types"
import { ChromeStorage, STORAGE_KEYS } from "./chrome-storage"

// Set to true for local development to see fetch errors, false for production/extension
const IS_DEV = false;

export class ChromeBookmarks {
  static async getAll(): Promise<Bookmark[]> {
    try {
      if (typeof chrome !== "undefined" && chrome.bookmarks) {
        const bookmarkTree = await chrome.bookmarks.getTree()
        const bookmarks: Bookmark[] = []

        const extractBookmarks = (nodes: ChromeBookmarkNode[]) => {
          nodes.forEach((node) => {
            if (node.url) {
              bookmarks.push({
                id: node.id,
                title: node.title,
                url: node.url,
                dateAdded: node.dateAdded,
                parentId: node.parentId,
              })
            }
            if (node.children) {
              extractBookmarks(node.children)
            }
          })
        }

        extractBookmarks(bookmarkTree)
        return bookmarks
      }

      throw new Error("Chrome bookmarks API not available")
    } catch (error) {
      console.error("Error fetching bookmarks:", error)
      throw new Error("Failed to fetch bookmarks from Chrome")
    }
  }

  static async getUncategorized(): Promise<Bookmark[]> {
    try {
      // Ensure sync runs before getting uncategorized bookmarks
      await this.syncWithChromeBookmarks()
      
      const allBookmarks = await this.getAll()
      const categorizedStore =
        (await ChromeStorage.get<CategorizedBookmarkStore>(STORAGE_KEYS.CATEGORIZED_BOOKMARKS)) || {}

      const uncategorizedBookmarks: Bookmark[] = []

      for (const bookmark of allBookmarks) {
        // Skip bookmarks without IDs
        if (!bookmark.id) continue

        // If already categorized in storage, skip
        if (categorizedStore[bookmark.id]) continue

        // Check if bookmark is in a categorized folder (under '📚 Categorized Bookmarks', but not directly under it or in 'Uncategorized')
        const isInCategorizedFolder = await this.isInCategorizedFolder(bookmark)
        if (isInCategorizedFolder) continue

        // If not in a categorized folder, treat as uncategorized
        // This includes bookmarks in the Bookmarks Bar, in folders not under '📚 Categorized Bookmarks', or loose in 'Other Bookmarks'
        uncategorizedBookmarks.push(bookmark)
      }

      return uncategorizedBookmarks
    } catch (error) {
      console.error("Error fetching uncategorized bookmarks:", error)
      return []
    }
  }

  static async getBookmarksWithDescriptions(bookmarks: Bookmark[], batchSize: number = 50): Promise<BookmarkWithDescription[]> {
    const bookmarksWithDescriptions: BookmarkWithDescription[] = []
    
    for (let i = 0; i < bookmarks.length; i += batchSize) {
      const batch = bookmarks.slice(i, i + batchSize)
      const batchPromises = batch.map(async (bookmark) => {
        try {
          const description = await this.fetchPageDescription(bookmark.url)
          return {
            ...bookmark,
            description: description || bookmark.title // Fallback to title if no description
          }
        } catch (error) {
          if (IS_DEV) {
            console.warn(`Failed to fetch description for ${bookmark.url}:`, error)
          }
          return {
            ...bookmark,
            description: bookmark.title // Fallback to title
          }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      bookmarksWithDescriptions.push(...batchResults)
      
      // Add a small delay between batches to avoid overwhelming servers
      if (i + batchSize < bookmarks.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return bookmarksWithDescriptions
  }

  static async fetchPageDescription(url: string): Promise<string | null> {
    try {
      // Use a CORS proxy or service to fetch the page content
      // For now, we'll use a simple approach that might work for some sites
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
      const data = await response.json()
      
      if (data.contents) {
        const html = data.contents
        const metaDescriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)
        if (metaDescriptionMatch) {
          return metaDescriptionMatch[1].trim()
        }
      }
      
      return null
    } catch (error) {
      if (IS_DEV) {
        console.warn(`Failed to fetch description for ${url}:`, error)
      }
      return null
    }
  }

  static async isInCategorizedFolder(bookmark: Bookmark): Promise<boolean> {
    try {
      if (!bookmark.id || typeof chrome === "undefined" || !chrome.bookmarks) {
        return false
      }

      // Get the bookmark's actual location in the folder structure
      const bookmarkNode = await chrome.bookmarks.get(bookmark.id)
      if (!bookmarkNode || !bookmarkNode[0]) {
        return false
      }

      const node = bookmarkNode[0]
      
      // Check if this bookmark is inside the "📚 Categorized Bookmarks" folder
      let currentParentId = node.parentId
      let isInCategorizedFolder = false
      let isInUncategorizedFolder = false
      
      while (currentParentId && currentParentId !== "0" && currentParentId !== "1") {
        try {
          const parent = await chrome.bookmarks.get(currentParentId)
          if (!parent || !parent[0]) {
            break
          }
          
          const parentNode = parent[0]
          
          // Check if we're in the main categorized bookmarks folder
          if (parentNode.title === "📚 Categorized Bookmarks") {
            isInCategorizedFolder = true
            // If we're directly under the main folder, treat as uncategorized
            if (node.parentId === parentNode.id) {
              isInUncategorizedFolder = true
            }
            break // No need to check further up the tree
          }
          
          // Check if we're in the "Uncategorized" folder
          if (parentNode.title === "📁 Uncategorized") {
            isInUncategorizedFolder = true
          }
          
          currentParentId = parentNode.parentId
        } catch (parentError) {
          console.warn(`Could not access parent folder ${currentParentId}:`, parentError)
          break
        }
      }
      
      // A bookmark is considered "in a categorized folder" only if:
      // 1. It's inside the "📚 Categorized Bookmarks" folder AND
      // 2. It's not directly under the main folder AND
      // 3. It's not in the "Uncategorized" folder
      return isInCategorizedFolder && !isInUncategorizedFolder
    } catch (error) {
      // If the bookmark doesn't exist, it's not in a categorized folder
      if (error instanceof Error && error.message && error.message.includes("Can't find bookmark for id")) {
        console.warn(`Bookmark ${bookmark.id} no longer exists in Chrome bookmarks`)
        return false
      }
      console.error("Error checking if bookmark is in categorized folder:", error)
      return false
    }
  }

  static async createFolder(parentId: string, title: string): Promise<string> {
    try {
      if (typeof chrome !== "undefined" && chrome.bookmarks) {
        const folder = await chrome.bookmarks.create({
          parentId,
          title,
        })
        return folder.id
      }
      throw new Error("Chrome bookmarks API not available")
    } catch (error) {
      console.error("Error creating folder:", error)
      throw error
    }
  }

  static async moveBookmark(bookmarkId: string, parentId: string): Promise<void> {
    try {
      if (typeof chrome !== "undefined" && chrome.bookmarks) {
        await chrome.bookmarks.move(bookmarkId, {
          parentId,
        })
      } else {
        throw new Error("Chrome bookmarks API not available")
      }
    } catch (error) {
      console.error("Error moving bookmark:", error)
      throw error
    }
  }

  static async createNestedFolders(parentId: string, categoryPath: string): Promise<string> {
    const pathParts = categoryPath.split('/').filter(part => part.trim() !== '')
    let currentParentId = parentId

    for (const folderName of pathParts) {
      // Check if folder already exists
      const existingFolders = await chrome.bookmarks.getChildren(currentParentId)
      const existingFolder = existingFolders.find(folder => folder.title === folderName)
      
      if (existingFolder) {
        currentParentId = existingFolder.id
      } else {
        // Create new folder
        const newFolder = await chrome.bookmarks.create({
          parentId: currentParentId,
          title: folderName,
        })
        currentParentId = newFolder.id
      }
    }

    return currentParentId
  }

  // Helper method to check if a bookmark is already in the correct category folder
  static async isBookmarkInCategoryFolder(bookmarkId: string, categoryFolderId: string): Promise<boolean> {
    try {
      const bookmark = await chrome.bookmarks.get(bookmarkId)
      return bookmark[0].parentId === categoryFolderId
    } catch (error) {
      console.error("Error checking bookmark location:", error)
      return false
    }
  }

  static async organizeBookmarksInChrome(
    categorizedBookmarks: CategorizedBookmark[],
    structure: "flatten" | "nested" = "nested"
  ): Promise<void> {
    try {
      if (typeof chrome !== "undefined" && chrome.bookmarks) {
        // Get the bookmark bar (main folder)
        const bookmarkBar = await chrome.bookmarks.getSubTree("1")
        const bookmarkBarId = bookmarkBar[0].id

        // Check if main categorized bookmarks folder already exists
        const existingFolders = await chrome.bookmarks.getChildren(bookmarkBarId)
        const existingMainFolder = existingFolders.find(folder => folder.title === "📚 Categorized Bookmarks")
        
        let mainFolderId: string
        if (existingMainFolder) {
          mainFolderId = existingMainFolder.id
          console.log("Using existing categorized bookmarks folder")
        } else {
          // Create a main folder for categorized bookmarks
          const newMainFolder = await this.createFolder(bookmarkBarId, "📚 Categorized Bookmarks")
          mainFolderId = newMainFolder
          console.log("Created new categorized bookmarks folder")
        }

        // Group bookmarks by category
        const bookmarksByCategory = new Map<string, CategorizedBookmark[]>()
        categorizedBookmarks.forEach((bookmark) => {
          const categoryKey = Array.isArray(bookmark.category) 
            ? bookmark.category.join('/') 
            : bookmark.category
          
          if (!bookmarksByCategory.has(categoryKey)) {
            bookmarksByCategory.set(categoryKey, [])
          }
          bookmarksByCategory.get(categoryKey)!.push(bookmark)
        })

        // Organize based on structure
        if (structure === "flatten") {
          // All category folders directly under main folder
          for (const [category, bookmarks] of bookmarksByCategory) {
            const categoryFolderId = await this.createFolder(mainFolderId, `📁 ${category}`)
            for (const bookmark of bookmarks) {
              if (bookmark.id && !(await this.isBookmarkInCategoryFolder(bookmark.id, categoryFolderId))) {
                await this.moveBookmark(bookmark.id, categoryFolderId)
              }
            }
          }
        } else if (structure === "nested") {
          // Create proper nested folder structure
          for (const [category, bookmarks] of bookmarksByCategory) {
            // Create nested folders based on category path
            const finalFolderId = await this.createNestedFolders(mainFolderId, category)
            
            // Move bookmarks to the final nested folder
            for (const bookmark of bookmarks) {
              if (bookmark.id && !(await this.isBookmarkInCategoryFolder(bookmark.id, finalFolderId))) {
                await this.moveBookmark(bookmark.id, finalFolderId)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error organizing bookmarks in Chrome:", error)
      throw error
    }
  }

  static async getBookmarkBar(): Promise<ChromeBookmarkNode | null> {
    try {
      if (typeof chrome !== "undefined" && chrome.bookmarks) {
        const bookmarkBar = await chrome.bookmarks.getSubTree("1")
        return bookmarkBar[0]
      }
      return null
    } catch (error) {
      console.error("Error getting bookmark bar:", error)
      return null
    }
  }

  // Helper method to check if a bookmark still exists
  static bookmarkStillExists(bookmarkId: string, allBookmarks: Bookmark[]): boolean {
    return allBookmarks.some(bookmark => bookmark.id === bookmarkId)
  }

  // Method to sync extension storage with actual Chrome bookmarks
  static async syncWithChromeBookmarks(): Promise<void> {
    try {
      const allBookmarks = await this.getAll()
      const categorizedStore =
        (await ChromeStorage.get<CategorizedBookmarkStore>(STORAGE_KEYS.CATEGORIZED_BOOKMARKS)) || {}

      // Remove bookmarks that no longer exist in Chrome OR are no longer in a categorized folder
      const updatedStore: CategorizedBookmarkStore = {}
      for (const [bookmarkId, storedData] of Object.entries(categorizedStore)) {
        const bookmark = allBookmarks.find(b => b.id === bookmarkId)
        if (bookmark) {
          const isInCategorizedFolder = await this.isInCategorizedFolder(bookmark)
          if (isInCategorizedFolder) {
            updatedStore[bookmarkId] = storedData
          }
          // else: do not add to updatedStore, so it is removed from storage
        }
      }

      // Add bookmarks that are in categorized folders but not in storage
      for (const bookmark of allBookmarks) {
        if (bookmark.id && !updatedStore[bookmark.id]) {
          const isInCategorizedFolder = await this.isInCategorizedFolder(bookmark)
          if (isInCategorizedFolder) {
            // Get the actual category from the folder structure
            const bookmarkNode = await chrome.bookmarks.get(bookmark.id)
            const actualCategory = await this.getBookmarkCategoryPath(bookmarkNode[0])
            
            // Don't add bookmarks that are in the "Uncategorized" folder to the categorized store
            if (actualCategory !== "Uncategorized") {
              updatedStore[bookmark.id] = {
                bookmark: {
                  ...bookmark,
                  category: actualCategory,
                  summary: bookmark.title, // Default summary
                  categorizedAt: Date.now()
                },
                categorizedAt: Date.now()
              }
            }
          }
        }
      }

      // Update storage with cleaned data
      await ChromeStorage.set(STORAGE_KEYS.CATEGORIZED_BOOKMARKS, updatedStore)
      console.log("Synced extension storage with Chrome bookmarks")
    } catch (error) {
      console.error("Error syncing with Chrome bookmarks:", error)
    }
  }

  // Method to get categorized bookmarks that still exist
  static async getValidCategorizedBookmarks(): Promise<CategorizedBookmark[]> {
    try {
      await this.syncWithChromeBookmarks()
      const allBookmarks = await this.getAll()
      const categorizedStore =
        (await ChromeStorage.get<CategorizedBookmarkStore>(STORAGE_KEYS.CATEGORIZED_BOOKMARKS)) || {}

      const validBookmarks = Object.values(categorizedStore)
        .map(item => item.bookmark)
        .filter(bookmark => this.bookmarkStillExists(bookmark.id!, allBookmarks))

      // Update categories to match actual Chrome folder structure
      const updatedBookmarks = await Promise.all(
        validBookmarks.map(async (bookmark) => {
          try {
            if (bookmark.id) {
              const bookmarkNode = await chrome.bookmarks.get(bookmark.id)
              const actualCategory = await this.getBookmarkCategoryPath(bookmarkNode[0])
              console.log(`Bookmark "${bookmark.title}" category: ${bookmark.category} -> ${actualCategory}`)
              return {
                ...bookmark,
                category: actualCategory
              }
            }
            return bookmark
          } catch (error) {
            console.error("Error updating bookmark category:", error)
            return bookmark
          }
        })
      )

      // Filter out bookmarks that are in the "Uncategorized" folder
      const filteredBookmarks = updatedBookmarks.filter(bookmark => {
        const category = Array.isArray(bookmark.category) 
          ? bookmark.category.join('/') 
          : bookmark.category
        return category !== "Uncategorized"
      })

      return filteredBookmarks
    } catch (error) {
      console.error("Error getting valid categorized bookmarks:", error)
      return []
    }
  }

  // Helper method to get the full category path for a bookmark
  static async getBookmarkCategoryPath(bookmarkNode: any): Promise<string> {
    try {
      console.log('Getting category path for bookmark:', bookmarkNode.title, 'parentId:', bookmarkNode.parentId)
      
      if (!bookmarkNode.parentId || bookmarkNode.parentId === "0" || bookmarkNode.parentId === "1") {
        console.log('Bookmark is in root, returning Uncategorized')
        return "Uncategorized"
      }

      const parent = await chrome.bookmarks.get(bookmarkNode.parentId)
      const parentNode = parent[0]
      console.log('Parent node:', parentNode.title)
      
      // Check if this is the main categorized bookmarks folder
      if (parentNode.title === "📚 Categorized Bookmarks") {
        console.log('Bookmark is directly in categorized folder, returning Uncategorized')
        return "Uncategorized"
      }

      // Build the category path
      let categoryPath = parentNode.title.replace(/^📁\s*/, '') // Remove folder emoji
      let currentParentId = parentNode.parentId
      console.log('Initial category path:', categoryPath)

      while (currentParentId && currentParentId !== "0" && currentParentId !== "1") {
        const grandParent = await chrome.bookmarks.get(currentParentId)
        const grandParentNode = grandParent[0]
        console.log('Grandparent node:', grandParentNode.title)
        
        // Stop if we reach the main categorized bookmarks folder
        if (grandParentNode.title === "📚 Categorized Bookmarks") {
          console.log('Reached main categorized folder, stopping')
          break
        }

        categoryPath = grandParentNode.title.replace(/^📁\s*/, '') + '/' + categoryPath
        currentParentId = grandParentNode.parentId
        console.log('Updated category path:', categoryPath)
      }

      console.log('Final category path:', categoryPath)
      return categoryPath
    } catch (error) {
      console.error("Error getting bookmark category path:", error)
      return "Uncategorized"
    }
  }
}
