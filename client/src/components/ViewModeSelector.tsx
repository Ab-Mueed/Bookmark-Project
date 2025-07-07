import React from "react"

interface ViewModeSelectorProps {
  viewMode: 'spaces' | 'list' | 'columns'
  onViewModeChange: (mode: 'spaces' | 'list' | 'columns') => void
}

export const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  onViewModeChange
}) => {
  return (
    <div className="liquid-nav">
      <div className="flex space-x-1">
        <button
          onClick={() => onViewModeChange('columns')}
          className={`liquid-nav-item ${viewMode === 'columns' ? 'active' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>Columns</span>
        </button>
        <button
          onClick={() => onViewModeChange('spaces')}
          className={`liquid-nav-item ${viewMode === 'spaces' ? 'active' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Spaces</span>
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`liquid-nav-item ${viewMode === 'list' ? 'active' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span>List</span>
        </button>
      </div>
    </div>
  )
} 