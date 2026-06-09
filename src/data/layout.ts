/* Czech QWERTZ layout + 10-finger map.
 *
 * We match typed input by the *produced character* (the user's OS must be set
 * to Czech), and we render our own on-screen keyboard from this table. Each
 * physical key declares the character it produces at each shift level so we can
 * highlight the right key + finger and tell the learner whether Shift is needed.
 *
 * Finger zones are the standard touch-typing assignment by visual column.
 * NOTE: punctuation/AltGr/dead-key details (§ ú ) ; ´ ˇ and AltGr symbols) are
 * best-effort and flagged for verification against a real Czech keyboard. */

export type Finger =
  | "l-pinky"
  | "l-ring"
  | "l-middle"
  | "l-index"
  | "r-index"
  | "r-middle"
  | "r-ring"
  | "r-pinky"
  | "thumb";

export type Hand = "left" | "right";

export interface KeyDef {
  /** KeyboardEvent.code, for reference / physical highlighting */
  code: string;
  /** char produced without modifiers */
  base: string;
  /** char produced with Shift (optional) */
  shift?: string;
  finger: Finger;
  /** visual width unit (1 = standard key) */
  w?: number;
  /** dead key (produces a combining diacritic, composes with next letter) */
  dead?: boolean;
  /** small caption under the glyph (e.g. "command", "Alt Gr") */
  label?: string;
}

export type KeyRow = KeyDef[];

/** Which physical machine a learner is on — picks the modifier-row chrome. */
export type Platform = "mac" | "pc";

/* The alphanumeric block is identical on every platform (it's the Czech QWERTZ
 * character layout). Only the bottom modifier row changes between Mac and PC,
 * so we keep these four rows shared and append a platform-specific row below. */
// prettier-ignore
export const MAIN_ROWS: KeyRow[] = [
  // number / diacritic row
  [
    { code: "Backquote", base: ";", shift: "°", finger: "l-pinky" },
    { code: "Digit1", base: "+", shift: "1", finger: "l-pinky" },
    { code: "Digit2", base: "ě", shift: "2", finger: "l-ring" },
    { code: "Digit3", base: "š", shift: "3", finger: "l-middle" },
    { code: "Digit4", base: "č", shift: "4", finger: "l-index" },
    { code: "Digit5", base: "ř", shift: "5", finger: "l-index" },
    { code: "Digit6", base: "ž", shift: "6", finger: "r-index" },
    { code: "Digit7", base: "ý", shift: "7", finger: "r-index" },
    { code: "Digit8", base: "á", shift: "8", finger: "r-middle" },
    { code: "Digit9", base: "í", shift: "9", finger: "r-ring" },
    { code: "Digit0", base: "é", shift: "0", finger: "r-pinky" },
    { code: "Minus", base: "=", shift: "%", finger: "r-pinky" },
    { code: "Equal", base: "´", shift: "ˇ", finger: "r-pinky", dead: true },
    { code: "Backspace", base: "⌫", finger: "r-pinky", w: 1.6 },
  ],
  // top row
  [
    { code: "Tab", base: "⇥", finger: "l-pinky", w: 1.5 },
    { code: "KeyQ", base: "q", shift: "Q", finger: "l-pinky" },
    { code: "KeyW", base: "w", shift: "W", finger: "l-ring" },
    { code: "KeyE", base: "e", shift: "E", finger: "l-middle" },
    { code: "KeyR", base: "r", shift: "R", finger: "l-index" },
    { code: "KeyT", base: "t", shift: "T", finger: "l-index" },
    { code: "KeyY", base: "z", shift: "Z", finger: "r-index" },
    { code: "KeyU", base: "u", shift: "U", finger: "r-index" },
    { code: "KeyI", base: "i", shift: "I", finger: "r-middle" },
    { code: "KeyO", base: "o", shift: "O", finger: "r-ring" },
    { code: "KeyP", base: "p", shift: "P", finger: "r-pinky" },
    { code: "BracketLeft", base: "ú", shift: "/", finger: "r-pinky" },
    { code: "BracketRight", base: ")", shift: "(", finger: "r-pinky" },
  ],
  // home row
  [
    { code: "CapsLock", base: "⇪", finger: "l-pinky", w: 1.8 },
    { code: "KeyA", base: "a", shift: "A", finger: "l-pinky" },
    { code: "KeyS", base: "s", shift: "S", finger: "l-ring" },
    { code: "KeyD", base: "d", shift: "D", finger: "l-middle" },
    { code: "KeyF", base: "f", shift: "F", finger: "l-index" },
    { code: "KeyG", base: "g", shift: "G", finger: "l-index" },
    { code: "KeyH", base: "h", shift: "H", finger: "r-index" },
    { code: "KeyJ", base: "j", shift: "J", finger: "r-index" },
    { code: "KeyK", base: "k", shift: "K", finger: "r-middle" },
    { code: "KeyL", base: "l", shift: "L", finger: "r-ring" },
    { code: "Semicolon", base: "ů", shift: '"', finger: "r-pinky" },
    { code: "Quote", base: "§", shift: "!", finger: "r-pinky" },
    { code: "Enter", base: "⏎", finger: "r-pinky", w: 1.7 },
  ],
  // bottom row
  [
    { code: "ShiftLeft", base: "⇧", finger: "l-pinky", w: 2.3 },
    { code: "KeyZ", base: "y", shift: "Y", finger: "l-pinky" },
    { code: "KeyX", base: "x", shift: "X", finger: "l-ring" },
    { code: "KeyC", base: "c", shift: "C", finger: "l-middle" },
    { code: "KeyV", base: "v", shift: "V", finger: "l-index" },
    { code: "KeyB", base: "b", shift: "B", finger: "l-index" },
    { code: "KeyN", base: "n", shift: "N", finger: "r-index" },
    { code: "KeyM", base: "m", shift: "M", finger: "r-index" },
    { code: "Comma", base: ",", shift: "?", finger: "r-middle" },
    { code: "Period", base: ".", shift: ":", finger: "r-ring" },
    { code: "Slash", base: "-", shift: "_", finger: "r-pinky" },
    { code: "ShiftRight", base: "⇧", finger: "r-pinky", w: 2.3 },
  ],
];

/* Bottom (modifier) row — platform-specific chrome. Only the Space key produces
 * a character; the modifiers are shown for spatial familiarity and are never
 * highlighted as targets, so they all sit on the neutral "thumb" zone. */
// prettier-ignore
const MAC_BOTTOM: KeyRow = [
  { code: "Fn",           base: "fn", finger: "thumb", w: 1 },
  { code: "ControlLeft",  base: "⌃", label: "control", finger: "thumb", w: 1.25 },
  { code: "AltLeft",      base: "⌥", label: "option",  finger: "thumb", w: 1.25 },
  { code: "MetaLeft",     base: "⌘", label: "command", finger: "thumb", w: 1.4 },
  { code: "Space",        base: " ", finger: "thumb", w: 5.5 },
  { code: "MetaRight",    base: "⌘", label: "command", finger: "thumb", w: 1.4 },
  { code: "AltRight",     base: "⌥", label: "option",  finger: "thumb", w: 1.25 },
  { code: "ControlRight", base: "⌃", label: "control", finger: "thumb", w: 1.25 },
];

// prettier-ignore
const PC_BOTTOM: KeyRow = [
  { code: "ControlLeft",  base: "Ctrl",  finger: "thumb", w: 1.7 },
  { code: "MetaLeft",     base: "❖", label: "super", finger: "thumb", w: 1.3 },
  { code: "AltLeft",      base: "Alt",   finger: "thumb", w: 1.3 },
  { code: "Space",        base: " ",     finger: "thumb", w: 6 },
  { code: "AltRight",     base: "Alt",   label: "Gr",   finger: "thumb", w: 1.3 },
  { code: "ContextMenu",  base: "☰", label: "menu", finger: "thumb", w: 1.3 },
  { code: "ControlRight", base: "Ctrl",  finger: "thumb", w: 1.7 },
];

/** Full keyboard rows for a given platform: shared block + its modifier row. */
export function rowsFor(platform: Platform): KeyRow[] {
  return [...MAIN_ROWS, platform === "mac" ? MAC_BOTTOM : PC_BOTTOM];
}

/* For character lookup the modifier row is irrelevant except for Space, which is
 * the same key on both platforms — so we map chars from the shared block + Space. */
export const ALL_KEYS: KeyDef[] = [...MAIN_ROWS.flat(), MAC_BOTTOM[4]];

export interface CharInfo {
  key: KeyDef;
  needsShift: boolean;
  finger: Finger;
}

/** Map a producible character -> how to type it (which key, shift?). */
const CHAR_MAP = new Map<string, CharInfo>();
for (const key of ALL_KEYS) {
  if (key.base && key.base.length === 1 && !CHAR_MAP.has(key.base)) {
    CHAR_MAP.set(key.base, { key, needsShift: false, finger: key.finger });
  }
  if (key.shift && key.shift.length === 1 && !CHAR_MAP.has(key.shift)) {
    CHAR_MAP.set(key.shift, { key, needsShift: true, finger: key.finger });
  }
}

export function charInfo(ch: string): CharInfo | undefined {
  if (ch === " ") return CHAR_MAP.get(" ");
  return CHAR_MAP.get(ch);
}

export const FINGER_HAND: Record<Finger, Hand> = {
  "l-pinky": "left",
  "l-ring": "left",
  "l-middle": "left",
  "l-index": "left",
  "r-index": "right",
  "r-middle": "right",
  "r-ring": "right",
  "r-pinky": "right",
  thumb: "left",
};

export const FINGER_LABEL_CS: Record<Finger, string> = {
  "l-pinky": "levý malíček",
  "l-ring": "levý prsteníček",
  "l-middle": "levý prostředníček",
  "l-index": "levý ukazováček",
  "r-index": "pravý ukazováček",
  "r-middle": "pravý prostředníček",
  "r-ring": "pravý prsteníček",
  "r-pinky": "pravý malíček",
  thumb: "palec",
};
