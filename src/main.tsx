import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { applyDom, getSettings } from "./ui/settings";

// apply theme / text-size / dyslexia attributes before first paint
applyDom(getSettings());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
