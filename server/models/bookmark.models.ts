export interface Bookmark {
  title: string;
  url: string;
}

export interface CategorizedBookmark extends Bookmark {
  category: string;
  summary: string;
}

export interface UserContext {
  persona: string;
  preferred_structure: "flat" | "nested_folders";
}

