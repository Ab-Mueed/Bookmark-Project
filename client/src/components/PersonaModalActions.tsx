import React from "react"
import { Button } from "./ui/Button"

interface PersonaModalActionsProps {
  onSave: () => void
  onClose: () => void
  disableSave: boolean
}

export const PersonaModalActions: React.FC<PersonaModalActionsProps> = ({ onSave, onClose, disableSave }) => (
  <div className="flex space-x-3 pt-4">
    <Button onClick={onSave} disabled={disableSave}>
      Save Persona
    </Button>
    <Button variant="outline" onClick={onClose}>
      Cancel
    </Button>
  </div>
) 