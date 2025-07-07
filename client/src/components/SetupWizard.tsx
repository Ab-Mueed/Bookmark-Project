import type React from "react"
import { useState } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import type { UserSettings } from "../types"

interface SetupWizardProps {
  onComplete: (settings: UserSettings) => void
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1)
  const [persona, setPersona] = useState("")
  const [structure, setStructure] = useState<"flattened" | "nested">("nested")

  const handleNext = () => {
    if (step === 1 && persona.trim()) {
      setStep(2)
    }
  }

  const handleComplete = () => {
    if (persona.trim()) {
      onComplete({
        persona: persona.trim(),
        structure,
        setupCompleted: true,
      })
    }
  }

  return (
    <div className="h-full liquid-gradient-secondary overflow-y-auto">
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

      {step === 1 && (
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-medium text-slate-900 mb-2 text-sm">Step 1: Your Persona</h3>
            <p className="text-xs text-slate-600 mb-3">
              Describe your interests as comma-separated values. This helps categorize bookmarks more accurately.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Your Interests
              </label>
              <Input
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="e.g., React, AI, Marketing, Design, Finance"
                autoFocus
                className="text-sm"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Example: "Software Development, React, TypeScript, AI, Machine Learning"
            </p>
          </div>

          <div className="flex justify-end pt-3">
            <Button onClick={handleNext} disabled={!persona.trim()} className="text-sm py-2">
              Next
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-medium text-slate-900 mb-2 text-sm">Step 2: Category Structure</h3>
            <p className="text-xs text-slate-600 mb-3">Choose how you want your bookmarks to be organized.</p>

            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="structure"
                  value="nested"
                  checked={structure === "nested"}
                  onChange={(e) => setStructure(e.target.value as "nested")}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-slate-900 text-sm">Nested Categories</div>
                  <div className="text-xs text-slate-600">Organize in folders like "Development/Frontend/React"</div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="structure"
                  value="flattened"
                  checked={structure === "flattened"}
                  onChange={(e) => setStructure(e.target.value as "flattened")}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-slate-900 text-sm">Flattened Categories</div>
                  <div className="text-xs text-slate-600">Simple categories like "React", "AI", "Design"</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <Button variant="ghost" onClick={() => setStep(1)} className="text-sm py-2">
              Back
            </Button>
            <Button onClick={handleComplete} className="text-sm py-2">Complete Setup</Button>
          </div>
        </div>
      )}
    </div>
  )
}
