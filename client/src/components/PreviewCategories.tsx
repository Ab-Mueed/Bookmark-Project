import React from "react"
import { Modal } from "./ui/Modal"
import { Button } from "./ui/Button"
import type { CategorizedBookmark } from "../types"

interface PreviewCategoriesProps {
  isOpen: boolean
  onAccept: () => void
  onDeny: () => void
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

export const PreviewCategories: React.FC<PreviewCategoriesProps> = ({
  isOpen,
  onAccept,
  onDeny,
  categorizedBookmarks,
}) => {
  const groups = groupByCategory(categorizedBookmarks)
  return (
    <Modal isOpen={isOpen} onClose={onDeny} title="Preview Categories & Placements" className="max-w-3xl w-full">
      <div className="space-y-3">
        <p className="text-gray-600 text-xs mb-1">
          Review the generated categories and bookmark names below. Accept to organize your bookmarks, or Deny to cancel.
        </p>
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
        <div className="flex justify-end space-x-2 pt-3">
          <Button variant="outline" onClick={onDeny}>Deny</Button>
          <Button onClick={onAccept}>Accept</Button>
        </div>
      </div>
    </Modal>
  )
} 