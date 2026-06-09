import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "../ui/primitives";

/* Shows a gentle toast when the service worker has a new version ready, instead
 * of reloading silently. The learner chooses when to refresh — no lost typing. */

export function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow)",
        borderRadius: 12,
        padding: "0.7rem 0.9rem",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span style={{ color: "var(--text)" }}>Je dostupná nová verze.</span>
      <Button variant="soft" onClick={() => void updateServiceWorker(true)}>
        Načíst
      </Button>
      <Button variant="ghost" onClick={() => setNeedRefresh(false)}>
        Později
      </Button>
    </div>
  );
}
