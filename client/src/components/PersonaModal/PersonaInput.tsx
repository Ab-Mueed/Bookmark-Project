import React from "react"
import { Input } from "../ui/Input"

interface PersonaInputProps {
  persona: string
  setPersona: (v: string) => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

export const PersonaInput: React.FC<PersonaInputProps> = ({ persona, setPersona, onKeyPress }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Your Persona
    </label>
    <Input
      value={persona}
      onChange={(e) => setPersona(e.target.value)}
      onKeyPress={onKeyPress}
      placeholder="e.g., Software developer interested in React and AI"
      autoFocus
    />
  </div>
) 