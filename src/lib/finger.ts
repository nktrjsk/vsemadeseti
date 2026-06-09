import type { Finger } from "../data/layout";

/* Finger zones are distinguished by HUE *and* a non-color cue (a glyph badge),
 * so color-blind learners can follow finger guidance without relying on hue.
 * The badge is a small shape/letter shown on each key in the typing scaffold. */

export interface FingerStyle {
  /** background tint (light) */
  bg: string;
  /** stronger color for active/next key + legend dot */
  solid: string;
  text: string;
  /** non-color cue shown as a tiny badge on keys */
  badge: string;
  /** short Czech name for legends */
  shortCs: string;
}

export const FINGER_STYLE: Record<Finger, FingerStyle> = {
  "l-pinky": { bg: "#e9e3f5", solid: "#7b61c4", text: "#3a2c63", badge: "◆", shortCs: "L malíček" },
  "l-ring": { bg: "#dfeaf7", solid: "#4f86c6", text: "#23415f", badge: "▲", shortCs: "L prsteníček" },
  "l-middle": { bg: "#dcefe9", solid: "#3f9e8a", text: "#1f4a40", badge: "●", shortCs: "L prostředníček" },
  "l-index": { bg: "#e4f0d6", solid: "#6aa64a", text: "#33491f", badge: "■", shortCs: "L ukazováček" },
  "r-index": { bg: "#fcefcf", solid: "#d6a52e", text: "#5c4513", badge: "■", shortCs: "P ukazováček" },
  "r-middle": { bg: "#fce0cf", solid: "#dd8a4e", text: "#5e3618", badge: "●", shortCs: "P prostředníček" },
  "r-ring": { bg: "#fadcdc", solid: "#d36a6a", text: "#5e2424", badge: "▲", shortCs: "P prsteníček" },
  "r-pinky": { bg: "#f3d9ea", solid: "#c155a0", text: "#561c45", badge: "◆", shortCs: "P malíček" },
  thumb: { bg: "#e6e2dc", solid: "#8a8276", text: "#3a352e", badge: "▬", shortCs: "palec" },
};

export const FINGER_ORDER: Finger[] = [
  "l-pinky",
  "l-ring",
  "l-middle",
  "l-index",
  "r-index",
  "r-middle",
  "r-ring",
  "r-pinky",
];
