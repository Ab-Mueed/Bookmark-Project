export interface Bookmark {
  id?: string;
  title: string;
  url: string;
  description?: string;
  dateAdded?: string;
  parentId?: string;
}

export interface CategorizedBookmark extends Bookmark {
  category: string[];
  summary: string;
}

export interface UserContext {
  persona: string;
  preferred_structure: "flat" | "nested_folders";
}

export interface CategorizeRequest {
  userContext: UserContext;
  bookmarks: Bookmark[];
}

