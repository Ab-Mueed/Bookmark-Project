import React from "react"
import { Input } from "../ui/Input"
import { Button } from "../ui/Button"

interface SetupWizardPersonaStepProps {
  persona: string
  setPersona: (v: string) => void
  onNext: () => void
}

export const SetupWizardPersonaStep: React.FC<SetupWizardPersonaStepProps> = ({ persona, setPersona, onNext }) => (
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
      <Button onClick={onNext} disabled={!persona.trim()} className="text-sm py-2">
        Next
      </Button>
    </div>
  </div>
) 