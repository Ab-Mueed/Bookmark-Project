"use client"

import type React from "react"
import { useState } from "react"
import { Modal } from "./ui/Modal"
import { Input } from "./ui/Input"
import { Button } from "./ui/Button"

interface PersonaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (persona: string) => void
  initialPersona?: string
}

export const PersonaModal: React.FC<PersonaModalProps> = ({ isOpen, onClose, onSave, initialPersona = "" }) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Your Persona">
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Describe yourself to help categorize bookmarks more accurately. For example: "Software developer interested in
          React and AI" or "Marketing professional focused on digital strategies".
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Persona
          </label>
          <Input
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Software developer interested in React and AI"
            autoFocus
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <Button onClick={handleSave} disabled={!persona.trim()}>
            Save Persona
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
