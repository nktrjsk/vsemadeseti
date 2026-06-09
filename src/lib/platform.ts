import type { Platform } from "../data/layout";

/* Auto-detect the OS family so the on-screen keyboard shows the modifier row
 * (command/option vs ctrl/alt/super) that matches the learner's real keyboard. */

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "pc";
  const n = navigator as Navigator & { userAgentData?: { platform?: string } };
  const hint = `${n.userAgentData?.platform ?? ""} ${n.platform ?? ""} ${n.userAgent ?? ""}`.toLowerCase();
  // iPadOS 13+ reports as "MacIntel"; treat every Apple device as Mac chrome.
  if (/mac|iphone|ipad|ipod/.test(hint)) return "mac";
  return "pc";
}

export type KeyboardLayout = "auto" | Platform;

/** Resolve the stored preference ("auto" | "mac" | "pc") to a concrete platform. */
export function resolveKeyboardPlatform(layout: KeyboardLayout): Platform {
  return layout === "auto" ? detectPlatform() : layout;
}
