"use client"

import type React from "react"
import { SetupWizard } from "./SetupWizard"
import { PreviewCategories } from "./PreviewCategories"
import { usePopupDashboardState } from "../hooks/usePopupDashboardState"
import { usePopupCategorization } from "../hooks/usePopupCategorization"
import { PopupHeader } from "./PopupHeader"
import { PopupStats } from "./PopupStats"
import { PopupActions } from "./PopupActions"
import { PopupInfo } from "./PopupInfo"

export const PopupDashboard: React.FC = () => {
  const {
    settings,
    isLoading,
    setIsLoading,
    categorizedCount,
    uncategorizedCount,
    showSettings,
    setShowSettings,
    loadData,
    handleSetupComplete
  } = usePopupDashboardState()

  const {
    previewOpen,
    previewBookmarks,
    handleCategorizeBookmarks,
    handleAcceptPreview,
    handleDenyPreview
  } = usePopupCategorization(settings, setIsLoading, loadData)

  const handleOpenDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") })
  }

  if (!settings) {
    return (
      <div className="w-80 h-96 liquid-gradient-secondary rounded-sm">
        <SetupWizard onComplete={handleSetupComplete} />
      </div>
    )
  }

  if (showSettings) {
    return (
      <div className="w-80 h-96 liquid-gradient-secondary rounded-sm">
        <SetupWizard onComplete={handleSetupComplete} />
      </div>
    )
  }

  return (
    <div className="w-80 h-96 liquid-gradient-secondary rounded-sm">
      <PopupHeader persona={settings.persona} onSettingsClick={() => setShowSettings(true)} />
      <div className="p-4 space-y-4">
        <PopupStats categorizedCount={categorizedCount} uncategorizedCount={uncategorizedCount} />
        <PopupActions
          isLoading={isLoading}
          uncategorizedCount={uncategorizedCount}
          onCategorize={handleCategorizeBookmarks}
          onOpenDashboard={handleOpenDashboard}
          disableCategorize={isLoading || uncategorizedCount === 0}
        />
        <PopupInfo structure={settings.structure} />
        <PreviewCategories
          isOpen={previewOpen}
          onAccept={handleAcceptPreview}
          onDeny={handleDenyPreview}
          categorizedBookmarks={previewBookmarks}
        />
      </div>
    </div>
  )
} 