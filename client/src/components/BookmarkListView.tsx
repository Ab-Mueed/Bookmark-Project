import React from "react"
import type { CategorizedBookmark } from "../types"

interface BookmarkListViewProps {
  bookmarks: CategorizedBookmark[]
  onBookmarkClick: (bookmark: CategorizedBookmark) => void
}

export const BookmarkListView: React.FC<BookmarkListViewProps> = ({
  bookmarks,
  onBookmarkClick
}) => {
  return (
    <div className="liquid-card">
      <div className="space-y-3">
        {bookmarks.map((bookmark, index) => (
          <div
            key={bookmark.id || `${bookmark.url}-${index}`}
            onClick={() => onBookmarkClick(bookmark)}
            className="flex items-center space-x-4 p-4 rounded-xl hover:bg-white/60 transition-all duration-200 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <img
                src={`https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}&sz=32`}
                alt=""
                className="w-6 h-6"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                {bookmark.title}
              </h4>
              <p className="text-sm text-slate-500 truncate">{bookmark.url}</p>
              <p className="text-xs text-slate-400">{bookmark.category}</p>
            </div>
            <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
} 