import React, { useState } from "react"
import { ChromeStorage, STORAGE_KEYS } from "../../utils/chrome-storage"
import { Button } from "./Button"

interface SettingsFormProps {
  onSettingsSaved: () => void
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ onSettingsSaved }) => {
  const [persona, setPersona] = useState("")
  const [structure, setStructure] = useState<"flatten" | "nested">("nested")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await ChromeStorage.set(STORAGE_KEYS.USER_SETTINGS, {
        persona,
        structure,
      })
      onSettingsSaved()
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[500px] w-[400px] bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-900 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Bookmark Categorizer</h1>
            <p className="text-xs text-slate-500">AI-Powered Organization</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-base font-medium text-slate-900">Welcome! Let's get started</h2>
          <p className="text-sm text-slate-600">Tell us about yourself to personalize your bookmark organization</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="persona" className="block text-sm font-medium text-slate-700">
              Your Persona
            </label>
            <div className="relative">
              <textarea
                id="persona"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="e.g., Software Developer, Tech Enthusiast, AI Researcher"
                className="w-full px-3 py-2.5 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors resize-none text-sm"
                rows={3}
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-slate-500">This helps AI understand your interests and categorize bookmarks accordingly</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="structure" className="block text-sm font-medium text-slate-700">
              Preferred Structure
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="structure"
                  value="flatten"
                  checked={structure === "flatten"}
                  onChange={() => setStructure("flatten")}
                  className="accent-slate-900"
                />
                <span className="text-sm text-slate-700">Flatten (one folder per category)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="structure"
                  value="nested"
                  checked={structure === "nested"}
                  onChange={() => setStructure("nested")}
                  className="accent-slate-900"
                />
                <span className="text-sm text-slate-700">Nested folders (categories as subfolders)</span>
              </label>
            </div>
            <p className="text-xs text-slate-500">Choose how your bookmarks are organized in Chrome</p>
          </div>

          <Button 
            type="submit" 
            loading={isLoading} 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 transition-colors"
          >
            {isLoading ? "Setting up..." : "Get Started"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-500">
            Your data stays private and is only used for bookmark categorization
          </p>
        </div>
      </div>
    </div>
  )
} 