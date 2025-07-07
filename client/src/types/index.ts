export interface Bookmark {
  title: string
  url: string
  id?: string
  dateAdded?: number
  parentId?: string
  description?: string // Page description from meta tags
}

export interface CategorizedBookmark extends Bookmark {
  category: string | string[] // Single category for flattened, array for nested
  summary: string // AI-generated summary
  categorizedAt: number
  categoryPath?: string // Full path for nested structure (e.g., "Learning/Development/AI Tools")
}

export interface BookmarkGroup {
  category: string
  bookmarks: CategorizedBookmark[]
}

export interface ChromeBookmarkNode {
  id: string
  title: string
  url?: string
  children?: ChromeBookmarkNode[]
  dateAdded?: number
  parentId?: string
}

export interface CategorizeRequest {
  persona: string
  bookmarks: Bookmark[]
  structure: "flattened" | "nested"
}

export interface CategorizeResponse {
  bookmarks: Array<{
    id?: string
    title: string
    url: string
    category: string | string[]
    summary: string
  }>
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface UserSettings {
  persona: string
  structure: "flattened" | "nested"
  setupCompleted: boolean
}

export interface CategorizedBookmarkStore {
  [bookmarkId: string]: {
    bookmark: CategorizedBookmark
    categorizedAt: number
  }
}

// New types for enhanced functionality
export interface BookmarkWithDescription extends Bookmark {
  description: string
}

export interface CategorizationProgress {
  total: number
  processed: number
  currentBatch: number
  isProcessing: boolean
}

export interface FolderStructure {
  id: string
  title: string
  path: string
  children: FolderStructure[]
  bookmarkCount: number
}

export interface DashboardViewMode {
  type: "columns" | "spaces" | "list"
  expandedFolders: Set<string>
}
