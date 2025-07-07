import React from 'react'
import type { CategorizationProgress } from '../../types'

interface ProgressBarProps {
  progress: CategorizationProgress
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  if (!progress.isProcessing || progress.total === 0) {
    return null
  }

  const percentage = Math.round((progress.processed / progress.total) * 100)
  const currentBatch = Math.ceil(progress.processed / 50) // Assuming 50 is batch size

  return (
    <div className={`liquid-glass border border-white/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-900">
          Categorizing bookmarks...
        </span>
        <span className="text-xs text-slate-600">
          {progress.processed} / {progress.total}
        </span>
      </div>
      
      <div className="w-full bg-white/20 rounded-full h-2 mb-2">
        <div 
          className="liquid-gradient-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{percentage}% complete</span>
        <span>Batch {currentBatch}</span>
      </div>
    </div>
  )
} 