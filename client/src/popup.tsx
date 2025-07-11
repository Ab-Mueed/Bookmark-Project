import { createRoot } from "react-dom/client"
import { PopupDashboard } from "./components/Popup/PopupDashboard"
import "./index.css"

const container = document.getElementById("popup-root")
if (container) {
  const root = createRoot(container)
  root.render(<PopupDashboard />)
} 