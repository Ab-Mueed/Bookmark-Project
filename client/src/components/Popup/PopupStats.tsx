import React from "react"

interface PopupStatsProps {
  categorizedCount: number
  uncategorizedCount: number
}

export const PopupStats: React.FC<PopupStatsProps> = ({ categorizedCount, uncategorizedCount }) => (
  <div className="grid grid-cols-2 gap-3">
    <div className="liquid-card p-3 text-center">
      <div className="text-xl font-bold text-slate-900">{categorizedCount}</div>
      <div className="text-xs text-slate-600">Categorized</div>
    </div>
    <div className="liquid-card p-3 text-center">
      <div className="text-xl font-bold text-slate-900">{uncategorizedCount}</div>
      <div className="text-xs text-slate-600">Uncategorized</div>
    </div>
  </div>
) 