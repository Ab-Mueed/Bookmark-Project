import React from "react"
import { NestedSpace } from "../ui/NestedSpace"
import { getSpaceColor, groupBookmarksByCategory } from "../../utils/bookmark-utils"
import type { CategorizedBookmark } from "../../types"

interface BookmarkSpacesViewProps {
  bookmarks: CategorizedBookmark[]
  onBookmarkClick: (bookmark: CategorizedBookmark) => void
}

export const BookmarkSpacesView: React.FC<BookmarkSpacesViewProps> = ({
  bookmarks,
  onBookmarkClick
}) => {
  const bookmarkGroups = groupBookmarksByCategory(bookmarks)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookmarkGroups.map((group, index) => (
        <div 
          key={index}
          className="liquid-scale-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <NestedSpace
            title={group.category}
            bookmarks={group.bookmarks}
            subcategories={group.subcategories}
            color={getSpaceColor(group.category)}
            onBookmarkClick={onBookmarkClick}
          />
        </div>
      ))}
    </div>
  )
} 