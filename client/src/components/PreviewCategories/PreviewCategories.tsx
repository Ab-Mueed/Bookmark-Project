import React from "react"
import { Modal } from "../ui/Modal"
import { PreviewCategoriesHeader } from "./PreviewCategoriesHeader"
import { PreviewCategoryList } from "./PreviewCategoryList"
import { PreviewCategoriesActions } from "./PreviewCategoriesActions"
import type { CategorizedBookmark } from "../../types"

interface PreviewCategoriesProps {
  isOpen: boolean
  onAccept: () => void
  onDeny: () => void
  categorizedBookmarks: CategorizedBookmark[]
}

export const PreviewCategories: React.FC<PreviewCategoriesProps> = ({
  isOpen,
  onAccept,
  onDeny,
  categorizedBookmarks,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onDeny} title="Preview Categories & Placements" className="max-w-3xl w-full">
      <div className="space-y-3">
        <PreviewCategoriesHeader />
        <PreviewCategoryList categorizedBookmarks={categorizedBookmarks} />
        <PreviewCategoriesActions onAccept={onAccept} onDeny={onDeny} />
      </div>
    </Modal>
  )
} 