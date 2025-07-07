import React from "react"
import { Button } from "./ui/Button"

export const SetupRequired: React.FC = () => {
  return (
    <div className="min-h-screen liquid-gradient-secondary flex items-center justify-center p-6">
      <div className="liquid-card text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 liquid-gradient-primary rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Setup Required</h1>
        <p className="text-slate-600 mb-6">Please complete the setup in the extension popup first.</p>
        <Button onClick={() => window.close()}>Close</Button>
      </div>
    </div>
  )
} 