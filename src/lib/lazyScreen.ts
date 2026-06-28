import { lazy, type ComponentType, type LazyExoticComponent } from "react";

/* Code-split screens that survive a stale PWA deploy.
 *
 * A lazy chunk can go missing or wedge after a deploy: the page was loaded from
 * an older build (old chunk hashes), the service worker version then flips, and
 * the old `Screen-[hash].js` is gone from cache. Netlify's SPA rewrite answers
 * the request with index.html (200, text/html), which under COEP:require-corp
 * makes the dynamic import() hang instead of resolving — so the top-level
 * Suspense fallback ("Načítám tvůj postup…") stays up forever and a plain reload
 * doesn't help (the stale SW is still in control). See issue #5.
 *
 * We bound the import with a timeout so a hang becomes a rejection, retry once
 * for a transient blip, and let a persistent failure propagate. The thrown error
 * reaches ErrorBoundary, whose "Načíst znovu" drops the stale SW + caches and
 * reloads onto the fresh build — the recovery a normal reload can't do. */

const IMPORT_TIMEOUT_MS = 12_000;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("chunk load timed out")),
      ms,
    );
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyScreen<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(() =>
    withTimeout(factory(), IMPORT_TIMEOUT_MS).catch(() =>
      // one quiet retry covers a transient network blip; a second failure
      // propagates to ErrorBoundary, which offers the SW-clearing recovery.
      withTimeout(factory(), IMPORT_TIMEOUT_MS),
    ),
  );
}
