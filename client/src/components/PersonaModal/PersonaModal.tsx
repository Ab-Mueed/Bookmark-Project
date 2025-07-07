"use client"

import React from "react"
import { Modal } from "../ui/Modal"
import { PersonaModalHeader } from "./PersonaModalHeader"
import { PersonaInput } from "./PersonaInput"
import { PersonaModalActions } from "./PersonaModalActions"
import { usePersonaModal } from "../../hooks/usePersonaModal"

interface PersonaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (persona: string) => void
  initialPersona?: string
}

export const PersonaModal: React.FC<PersonaModalProps> = ({ isOpen, onClose, onSave, initialPersona = "" }) => {
  const {
    persona,
    setPersona,
    handleSave,
    handleKeyPress
  } = usePersonaModal(initialPersona, onSave, onClose)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Your Persona">
      <div className="space-y-4">
        <PersonaModalHeader />
        <PersonaInput persona={persona} setPersona={setPersona} onKeyPress={handleKeyPress} />
        <PersonaModalActions onSave={handleSave} onClose={onClose} disableSave={!persona.trim()} />
      </div>
    </Modal>
  )
}
