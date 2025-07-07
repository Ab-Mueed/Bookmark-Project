import React from "react"

export const SetupWizardHeader: React.FC = () => (
  <div className="liquid-glass border-b border-white/20">
    <div className="px-4 py-3">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-3 liquid-gradient-primary rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Welcome to Bookmark Categorizer</h2>
        <p className="text-xs text-slate-600">Let's set up your preferences</p>
      </div>
    </div>
  </div>
) 