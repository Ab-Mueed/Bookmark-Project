import { useState } from "react"

export const usePersonaModal = (initialPersona: string, onSave: (persona: string) => void, onClose: () => void) => {
  const [persona, setPersona] = useState(initialPersona)

  const handleSave = () => {
    if (persona.trim()) {
      onSave(persona.trim())
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    }
  }

  return {
    persona,
    setPersona,
    handleSave,
    handleKeyPress
  }
} 