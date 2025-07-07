import React from "react"
import { Button } from "../ui/Button"
import { LoadingSpinner } from "../ui/LoadingSpinner"

interface PopupActionsProps {
  isLoading: boolean
  uncategorizedCount: number
  onCategorize: () => void
  onOpenDashboard: () => void
  disableCategorize: boolean
}

export const PopupActions: React.FC<PopupActionsProps> = ({
  isLoading,
  uncategorizedCount,
  onCategorize,
  onOpenDashboard,
  disableCategorize
}) => (
  <div className="space-y-3">
    <Button 
      onClick={onCategorize}
      disabled={disableCategorize}
      className="w-full text-sm py-2.5 shadow-lg"
    >
      {isLoading ? (
        <LoadingSpinner size="sm" className="mr-2" />
      ) : null}
      {isLoading ? "Categorizing..." : `Categorize ${uncategorizedCount} Bookmarks`}
    </Button>
    <Button
      onClick={onOpenDashboard}
      variant="outline"
      className="w-full text-sm py-2.5"
    >
      Open Dashboard
    </Button>
  </div>
) 