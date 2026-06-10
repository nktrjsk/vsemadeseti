import { useSyncExternalStore } from "react";
import type { KeyboardLayout } from "../lib/platform";

/* Device-local preferences. Not synced (they're per-device choices). */

export type Theme = "system" | "light" | "dark";
export type TextSize = "normal" | "large" | "larger";
export type ErrorMode = "block" | "flow";
export type DrillLength = "short" | "normal" | "long";

/** Lines per drill phase for each length preset. */
export const DRILL_LINES: Record<DrillLength, number> = {
  short: 1,
  normal: 2,
  long: 4,
};

export interface Scaffold {
  keyboard: boolean;
  fingerColors: boolean;
  nextKey: boolean;
  hands: boolean;
}

export interface Settings {
  theme: Theme;
  textSize: TextSize;
  dyslexia: boolean;
  sound: boolean;
  volume: number; // 0..1
  errorMode: ErrorMode;
  keyboardLayout: KeyboardLayout;
  scaffold: Scaffold;
  onboarded: boolean;
  /** longest random drill group; each group is 1..maxGroupLen chars */
  maxGroupLen: number;
  /** require pressing Enter at the end of each drill row */
  enterAtEol: boolean;
  drillLength: DrillLength;
  /** prefer alternating hands/fingers inside groups (off = pure random) */
  handAlternation: boolean;
}

const DEFAULTS: Settings = {
  theme: "system",
  textSize: "normal",
  dyslexia: false,
  sound: true,
  volume: 0.5,
  errorMode: "block",
  keyboardLayout: "auto",
  scaffold: { keyboard: true, fingerColors: true, nextKey: true, hands: true },
  onboarded: false,
  maxGroupLen: 4,
  enterAtEol: true,
  drillLength: "normal",
  handAlternation: true,
};

const KEY = "vsemadeseti.settings";

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...DEFAULTS,
      ...parsed,
      scaffold: { ...DEFAULTS.scaffold, ...(parsed.scaffold ?? {}) },
    };
  } catch {
    return DEFAULTS;
  }
}

let current = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getSettings(): Settings {
  return current;
}

export function setSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch };
  localStorage.setItem(KEY, JSON.stringify(current));
  applyDom(current);
  emit();
}

export function setScaffold(patch: Partial<Scaffold>): void {
  setSettings({ scaffold: { ...current.scaffold, ...patch } });
}

export function applyDom(s: Settings): void {
  const root = document.documentElement;
  const theme =
    s.theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : s.theme;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-textsize", s.textSize);
  root.setAttribute("data-dyslexia", s.dyslexia ? "on" : "off");
}

// react to OS theme changes while in "system" mode
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (current.theme === "system") applyDom(current);
});

export function useSettings(): Settings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSettings,
  );
}
