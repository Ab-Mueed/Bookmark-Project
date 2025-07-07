import React from "react"
import { Button } from "../ui/Button"

interface SetupWizardStructureStepProps {
  structure: "flattened" | "nested"
  setStructure: (v: "flattened" | "nested") => void
  onBack: () => void
  onComplete: () => void
}

export const SetupWizardStructureStep: React.FC<SetupWizardStructureStepProps> = ({
  structure,
  setStructure,
  onBack,
  onComplete
}) => (
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
            onChange={() => setStructure("nested")}
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
            onChange={() => setStructure("flattened")}
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
      <Button variant="ghost" onClick={onBack} className="text-sm py-2">
        Back
      </Button>
      <Button onClick={onComplete} className="text-sm py-2">Complete Setup</Button>
    </div>
  </div>
) 