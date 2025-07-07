import React from "react"
import { Button } from "./ui/Button"

interface DashboardStatsProps {
  uncategorizedCount: number
  categorizedCount: number
  spacesCount: number
  isLoading: boolean
  onCategorize: () => void
  onClearAll: () => void
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  uncategorizedCount,
  categorizedCount,
  spacesCount,
  isLoading,
  onCategorize,
  onClearAll
}) => {
  return (
    <div className="mb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="liquid-card py-3 px-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500">Uncategorized</p>
                <p className="text-lg font-semibold text-slate-900">{uncategorizedCount}</p>
              </div>
            </div>
          </div>

          <div className="liquid-card py-3 px-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500">Categorized</p>
                <p className="text-lg font-semibold text-slate-900">{categorizedCount}</p>
              </div>
            </div>
          </div>

          <div className="liquid-card py-3 px-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-slate-500">Spaces</p>
                <p className="text-lg font-semibold text-slate-900">{spacesCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={onCategorize}
            loading={isLoading}
            disabled={uncategorizedCount === 0}
          >
            {isLoading ? "Categorizing..." : `Categorize ${uncategorizedCount} Bookmarks`}
          </Button>
          <Button variant="outline" onClick={onClearAll} disabled={categorizedCount === 0}>
            Clear All
          </Button>
        </div>
      </div>
    </div>
  )
} 