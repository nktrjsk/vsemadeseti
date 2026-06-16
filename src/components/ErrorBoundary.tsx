import { Component, type ReactNode } from "react";
import { Button } from "../ui/primitives";

/* Last line of defence: if any screen throws during render, React unmounts the
 * whole tree to a blank page — and the user, with no console, has no way back
 * but a hard reload they'll never think to do. This catches that, keeps the
 * page rendered, and offers a one-tap recovery that drops the (possibly stale)
 * service worker + caches and reloads fresh. Local progress lives in OPFS, not
 * Cache Storage, so it is untouched. */

async function clearAndReload() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    // best-effort cleanup — reload regardless so the user is never stuck
  } finally {
    location.reload();
  }
}

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // route into the local-only diagnostics log (see lib/errlog) + the console
    window.dispatchEvent(new ErrorEvent("error", { error, message: String(error) }));
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        role="alert"
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "5rem 1.25rem",
          textAlign: "center",
          fontFamily: "var(--font-sans)",
          color: "var(--text)",
        }}
      >
        <p style={{ fontSize: "1.15rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
          Něco se nepovedlo načíst.
        </p>
        <p style={{ color: "var(--text-soft)", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
          Tvůj postup zůstává uložený v zařízení.
        </p>
        <Button variant="primary" onClick={() => void clearAndReload()}>
          Načíst znovu
        </Button>
      </div>
    );
  }
}
