import { useSyncExternalStore } from "react";

/* Minimal hash router — keeps deps lean and works offline in a PWA.
 * Routes:  #/            -> course path
 *          #/lesson/:id  -> typing screen for a course lesson
 *          #/practice    -> free / custom text
 *          #/playground  -> relaxed playground
 *          #/weak        -> targeted weak-key drill
 *          #/settings     -> settings
 *          #/welcome     -> onboarding */

export function navigate(path: string): void {
  if (location.hash !== "#" + path) location.hash = path;
  else window.dispatchEvent(new HashChangeEvent("hashchange"));
}

function currentHash(): string {
  return location.hash.replace(/^#/, "") || "/";
}

export function useRoute(): string {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("hashchange", cb);
      return () => window.removeEventListener("hashchange", cb);
    },
    currentHash,
  );
}

export function parseRoute(path: string): { name: string; param?: string } {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "course" };
  if (parts[0] === "lesson") return { name: "lesson", param: parts[1] };
  return { name: parts[0] };
}
