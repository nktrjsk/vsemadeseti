/**
 * Local-only error log (the L1 "minimal client-side error logger" from
 * RELEASE.md). Uncaught errors and promise rejections land in a small ring
 * buffer in localStorage — nothing is ever sent anywhere. Settings →
 * Diagnostika lets the user copy a plain-text report to paste into a
 * GitHub issue.
 */

const KEY = "vsemadeseti:errlog";
const MAX_ENTRIES = 20;
const MAX_STACK = 2000;

export type ErrEntry = {
  t: string; // ISO timestamp
  kind: "error" | "promise";
  msg: string;
  stack?: string;
};

function read(): ErrEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(list: ErrEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_ENTRIES)));
  } catch {
    // storage full or unavailable — the log is best-effort by design
  }
}

function record(kind: ErrEntry["kind"], msg: string, stack?: string) {
  const list = read();
  const last = list[list.length - 1];
  // collapse repeats (e.g. an error firing every animation frame)
  if (last && last.msg === msg && last.kind === kind) {
    last.t = new Date().toISOString();
    write(list);
    return;
  }
  list.push({
    t: new Date().toISOString(),
    kind,
    msg: String(msg).slice(0, 500),
    stack: stack ? String(stack).slice(0, MAX_STACK) : undefined,
  });
  write(list);
}

/** Call once, before the app renders. Never throws. */
export function installErrorLog() {
  try {
    window.addEventListener("error", (e) => {
      record("error", e.message || "Unknown error", e.error?.stack);
    });
    window.addEventListener("unhandledrejection", (e) => {
      const r: unknown = e.reason;
      const msg =
        r instanceof Error ? r.message : typeof r === "string" ? r : JSON.stringify(r);
      record("promise", msg ?? "Unhandled rejection", r instanceof Error ? r.stack : undefined);
    });
  } catch {
    // never let the logger itself break the app
  }
}

export function getErrorLog(): ErrEntry[] {
  return read();
}

export function clearErrorLog() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Plain-text report for pasting into a GitHub issue. */
export function formatDiagnostics(): string {
  const lines = [
    "Všema deseti — diagnostika",
    `verze: ${__APP_VERSION__}`,
    `prohlížeč: ${navigator.userAgent}`,
    `čas: ${new Date().toISOString()}`,
    "---",
  ];
  const log = read();
  if (log.length === 0) {
    lines.push("(žádné zaznamenané chyby)");
  } else {
    for (const e of log) {
      lines.push(`[${e.t}] ${e.kind}: ${e.msg}`);
      if (e.stack) lines.push(e.stack);
    }
  }
  return lines.join("\n");
}
