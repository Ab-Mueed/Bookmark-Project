import React from "react"
import type { CategorizedBookmark } from "../types"

interface PreviewCategoryListProps {
  categorizedBookmarks: CategorizedBookmark[]
}

function groupByCategory(bookmarks: CategorizedBookmark[]) {
  const groups: Record<string, string[]> = {}
  bookmarks.forEach(bm => {
    let category = Array.isArray(bm.category) ? bm.category.join(" / ") : bm.category
    if (!category) category = "Uncategorized"
    if (!groups[category]) groups[category] = []
    groups[category].push(bm.title)
  })
  return groups
}

export const PreviewCategoryList: React.FC<PreviewCategoryListProps> = ({ categorizedBookmarks }) => {
  const groups = groupByCategory(categorizedBookmarks)
  
  return (
    <div className="max-h-[36rem] overflow-y-auto border rounded p-3 bg-slate-50">
      {Object.entries(groups).map(([category, titles]) => (
        <div key={category} className="mb-3">
          <div className="font-semibold text-sm text-slate-800 mb-1">{category}</div>
          <ul className="list-disc list-inside space-y-0.5">
            {titles.map((title, idx) => (
              <li key={idx} className="text-slate-700 text-xs">{title}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
} 