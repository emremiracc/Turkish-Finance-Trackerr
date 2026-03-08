import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => console.log("SW registered:", reg))
    .catch((err) => console.log("SW registration failed:", err));
}

createRoot(document.getElementById("root")!).render(<App />);
