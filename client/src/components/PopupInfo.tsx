import React from "react"

interface PopupInfoProps {
  structure: string
}

export const PopupInfo: React.FC<PopupInfoProps> = ({ structure }) => (
  <div className="liquid-card p-3">
    <div className="text-xs text-slate-600">
      <p className="mb-1"><strong>Structure:</strong> {structure}</p>
      <p>Bookmarks are automatically organized in Chrome's native bookmark system.</p>
    </div>
  </div>
) 