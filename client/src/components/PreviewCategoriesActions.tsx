import React from "react"
import { Button } from "./ui/Button"

interface PreviewCategoriesActionsProps {
  onAccept: () => void
  onDeny: () => void
}

export const PreviewCategoriesActions: React.FC<PreviewCategoriesActionsProps> = ({ onAccept, onDeny }) => (
  <div className="flex justify-end space-x-2 pt-3">
    <Button variant="outline" onClick={onDeny}>Deny</Button>
    <Button onClick={onAccept}>Accept</Button>
  </div>
) 