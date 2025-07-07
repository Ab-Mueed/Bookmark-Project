import type { CategorizeRequest, CategorizedBookmark, ApiResponse, BookmarkWithDescription } from "../types"

const API_BASE_URL = "http://localhost:8080/api/bookmarks/categorize"

export class BookmarksAPI {
  static async testConnection(): Promise<boolean> {
    try {

      
      const response = await fetch(API_BASE_URL, {
        method: "OPTIONS",
        headers: {
          "Accept": "application/json",
        },
      })
      

      return response.ok || response.status === 405 // 405 Method Not Allowed is also OK for OPTIONS
    } catch (error) {

      return false
    }
  }

  static async categorize(request: CategorizeRequest): Promise<ApiResponse<CategorizedBookmark[]>> {
    try {
      // Map structure to backend expected value
      const structureMap: Record<string, string> = {
        flattened: "flat_folders",
        nested: "nested_folders"
      }
      const apiRequest = {
        userContext: {
          persona: request.persona,
          preferred_structure: structureMap[request.structure] || request.structure
        },
        bookmarks: request.bookmarks
      }


      
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(apiRequest),
      })



      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()

      
      // Handle both old and new response formats
      let categorizedBookmarks: any[]
      if (data.bookmarks && Array.isArray(data.bookmarks)) {
        // New format with bookmarks array
        categorizedBookmarks = data.bookmarks
      } else if (Array.isArray(data)) {
        // Old format - direct array
        categorizedBookmarks = data
      } else {

        throw new Error("Invalid response format: expected bookmarks array")
      }

      // Process and validate the categorized bookmarks
      const processedBookmarks = categorizedBookmarks.map((bookmark: any, idx: number) => {
        const originalBookmark = request.bookmarks[idx]
        
        // Ensure we have required fields
        if (!bookmark.title || !bookmark.url) {
          throw new Error(`Invalid bookmark data: missing title or url for bookmark ${idx}`)
        }

        // Create category path for nested structure
        let categoryPath: string | undefined
        if (Array.isArray(bookmark.category)) {
          categoryPath = bookmark.category.join('/')
        } else if (typeof bookmark.category === 'string') {
          categoryPath = bookmark.category
        } else {
          throw new Error(`Invalid category format for bookmark ${idx}`)
        }

        return {
          ...originalBookmark, // Preserve original bookmark data
          title: bookmark.title,
          url: bookmark.url,
          category: bookmark.category,
          categoryPath,
          summary: bookmark.summary || bookmark.title, // Fallback to title if no summary
          categorizedAt: Date.now(),
        }
      })


      return { data: processedBookmarks }
    } catch (error) {

      return {
        error: error instanceof Error ? error.message : "Failed to categorize bookmarks",
      }
    }
  }

  static async categorizeInBatches(
    bookmarks: BookmarkWithDescription[], 
    persona: string, 
    structure: "flattened" | "nested",
    batchSize: number = 50,
    onProgress?: (processed: number, total: number) => void
  ): Promise<CategorizedBookmark[]> {
    const allCategorizedBookmarks: CategorizedBookmark[] = []
    
    for (let i = 0; i < bookmarks.length; i += batchSize) {
      const batch = bookmarks.slice(i, i + batchSize)
      

      
      const request: CategorizeRequest = {
        persona,
        bookmarks: batch,
        structure
      }
      
      const result = await this.categorize(request)
      
      if (result.error) {
        throw new Error(`Batch ${Math.floor(i / batchSize) + 1} failed: ${result.error}`)
      }
      
      if (result.data) {
        allCategorizedBookmarks.push(...result.data)
      }
      
      // Report progress
      if (onProgress) {
        onProgress(Math.min(i + batchSize, bookmarks.length), bookmarks.length)
      }
      
      // Add delay between batches to avoid overwhelming the API
      if (i + batchSize < bookmarks.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    return allCategorizedBookmarks
  }
}
