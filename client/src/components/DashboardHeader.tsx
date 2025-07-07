import React from "react"
import { Button } from "./ui/Button"
import type { UserSettings } from "../types"

interface DashboardHeaderProps {
  settings: UserSettings
  isLoading: boolean
  onSync: () => Promise<void>
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  settings,
  isLoading,
  onSync
}) => {
  return (
    <div className="liquid-glass border-b border-white/20 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 liquid-gradient-primary rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bookmark Spaces</h1>
              <p className="text-slate-600">Organized by {settings.persona}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={onSync}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <title>Sync bookmarks</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.93 4.93a10 10 0 0114.14 0m0 0V1m0 3.93H17m-1.07 13.07a10 10 0 01-14.14 0m0 0V23m0-3.93H7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 