import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { applyDom, getSettings } from "./ui/settings";
import { installErrorLog } from "./lib/errlog";

// capture uncaught errors into the local-only diagnostics log (Settings)
installErrorLog();

// apply theme / text-size / dyslexia attributes before first paint
applyDom(getSettings());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
