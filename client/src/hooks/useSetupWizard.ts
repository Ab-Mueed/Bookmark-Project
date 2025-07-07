import { useState } from "react"
import type { UserSettings } from "../types"

export const useSetupWizard = (onComplete: (settings: UserSettings) => void) => {
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

  const handleBack = () => {
    if (step === 2) setStep(1)
  }

  return {
    step,
    setStep,
    persona,
    setPersona,
    structure,
    setStructure,
    handleNext,
    handleComplete,
    handleBack
  }
} 