import { useSetupWizard } from "../hooks/useSetupWizard"
import { SetupWizardHeader } from "./SetupWizardHeader"
import { SetupWizardPersonaStep } from "./SetupWizardPersonaStep"
import { SetupWizardStructureStep } from "./SetupWizardStructureStep"
import type { UserSettings } from "../types"

interface SetupWizardProps {
  onComplete: (settings: UserSettings) => void
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const {
    step,
    persona,
    setPersona,
    structure,
    setStructure,
    handleNext,
    handleComplete,
    handleBack
  } = useSetupWizard(onComplete)

  return (
    <div className="h-full liquid-gradient-secondary overflow-y-auto">
      <SetupWizardHeader />
      {step === 1 && (
        <SetupWizardPersonaStep
          persona={persona}
          setPersona={setPersona}
          onNext={handleNext}
        />
      )}
      {step === 2 && (
        <SetupWizardStructureStep
          structure={structure}
          setStructure={setStructure}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
