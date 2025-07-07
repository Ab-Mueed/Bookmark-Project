import React from "react"

interface EmptyStateProps {
  uncategorizedCount: number
}

export const EmptyState: React.FC<EmptyStateProps> = ({ uncategorizedCount }) => {
  return (
    <div className="liquid-card text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 text-slate-400">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">No bookmarks found</h3>
      <p className="text-slate-600">
        {uncategorizedCount > 0
          ? `Click "Categorize Bookmarks" to organize your ${uncategorizedCount} bookmarks.`
          : "All your bookmarks are already categorized!"}
      </p>
    </div>
  )
} 