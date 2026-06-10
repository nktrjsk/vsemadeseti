import { charInfo, FINGER_HAND, type Hand } from "./layout";
import { filterByChars, PHRASES, SENTENCES, WORDS } from "./words";
import type { Lesson } from "./curriculum";

/* Random exercise generator.
 *
 * Every call produces fresh content (Math.random) — replaying a lesson gives a
 * new drill. A lesson builds up to four phases:
 *   new    -> random groups from this lesson's new keys (skipped in reviews)
 *   mix    -> groups from all learned keys, weighted toward new + weak keys
 *             (reviews get a double-length mix instead of a "new" phase)
 *   words  -> real Czech words once the learned set yields enough of them
 *   phrase -> calm sentences/phrases when the key set allows
 *
 * Group construction is constraint-guided, not pure random: no character three
 * times in a row, no identical neighbouring groups, every focus key appears on
 * each line, and a soft preference for alternating hands inside a group. All
 * constraints degrade gracefully on tiny pools (a one-key lesson can only
 * repeat that key). */

export interface DrillStep {
  kind: "new" | "mix" | "words" | "phrase";
  label: string;
  text: string;
}

export interface GeneratorOptions {
  /** each group gets a random length 1..maxGroupLen */
  maxGroupLen: number;
  /** lines per phase (drill-length preset) */
  linesPerPhase: number;
  /** keys with a poor hit/miss ratio — boosted in the mix phase */
  weakKeys?: readonly string[];
  /** prefer alternating hands/fingers inside groups (default true) */
  alternateHands?: boolean;
}

export interface RandomGroupOptions {
  maxGroupLen: number;
  lines: number;
  /** keys guaranteed to appear at least once on every line (large sets rotate) */
  focus?: readonly string[];
  /** randomly capitalize groups (Shift practice) */
  caps?: boolean;
  /** practiced Shift hand — capitals fall only on the opposite hand's letters */
  shiftHand?: Hand;
  /** prefer alternating hands/fingers inside groups (default true) */
  alternateHands?: boolean;
  /** relative pick weight per character (default uniform) */
  weight?: (c: string) => number;
}

const LINE_TARGET = 30; // chars per line incl. spaces — fits a row without wrap
const ALTERNATE_P = 0.7; // soft preference for switching hands inside a group
const CAPS_P = 0.6; // chance a group starts uppercase in caps lessons
const MAX_FOCUS_PER_LINE = 6; // larger focus sets rotate across lines instead

function randInt(n: number): number {
  return Math.floor(Math.random() * n);
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function handOf(ch: string): Hand | null {
  const info = charInfo(ch.toLowerCase());
  return info ? FINGER_HAND[info.finger] : null;
}

function fingerOf(ch: string) {
  return charInfo(ch.toLowerCase())?.finger ?? null;
}

function isLetter(c: string): boolean {
  return c.toLowerCase() !== c.toUpperCase();
}

/** Czech QWERTZ can't type every uppercase letter via Shift (Ů, Á, …) —
 * only capitalize when the uppercase form is actually on the keyboard. */
function canUppercase(c: string): boolean {
  return isLetter(c) && charInfo(c.toUpperCase()) !== undefined;
}

// --- weighted character pool -------------------------------------------------

interface Pool {
  chars: string[];
  weights: number[];
  total: number;
}

function makePool(chars: readonly string[], weight: (c: string) => number): Pool {
  const unique = [...new Set(chars)];
  const weights = unique.map((c) => Math.max(0.01, weight(c)));
  return { chars: unique, weights, total: weights.reduce((a, b) => a + b, 0) };
}

function sample(pool: Pool): string {
  let r = Math.random() * pool.total;
  for (let i = 0; i < pool.chars.length; i++) {
    r -= pool.weights[i];
    if (r < 0) return pool.chars[i];
  }
  return pool.chars[pool.chars.length - 1];
}

// --- group / line construction -----------------------------------------------

/** Next char for a group: never a 3-run; with `alternate`, usually lands on
 * the other hand (or at least another finger). Off = pure weighted random. */
function pickChar(pool: Pool, group: string, alternate: boolean): string {
  const lastTwoSame =
    group.length >= 2 && group[group.length - 1] === group[group.length - 2];
  const banned = lastTwoSame ? group[group.length - 1] : null;
  const prevHand = group.length ? handOf(group[group.length - 1]) : null;

  if (alternate && prevHand && Math.random() < ALTERNATE_P) {
    for (let i = 0; i < 8; i++) {
      const ch = sample(pool);
      if (ch !== banned && handOf(ch) !== prevHand) return ch;
    }
    // one-hand pool (e.g. "á í é"): at least alternate fingers within the hand
    const prevFinger = fingerOf(group[group.length - 1]);
    for (let i = 0; i < 8; i++) {
      const ch = sample(pool);
      if (ch !== banned && fingerOf(ch) !== prevFinger) return ch;
    }
  }
  for (let i = 0; i < 12; i++) {
    const ch = sample(pool);
    if (ch !== banned) return ch;
  }
  return sample(pool); // single-char pool: the run constraint cannot hold
}

function makeGroup(pool: Pool, len: number, prev: string | null, alternate: boolean): string {
  for (let attempt = 0; ; attempt++) {
    let g = "";
    while (g.length < len) g += pickChar(pool, g, alternate);
    if (g !== prev || attempt >= 4 || pool.chars.length < 2) return g;
  }
}

/** Make sure every focus key appears somewhere on the line. */
function ensureFocus(groups: string[], focus: readonly string[]): void {
  for (let guard = 0; guard < 6; guard++) {
    const joined = groups.join("");
    const missing = focus.filter((k) => !joined.includes(k));
    if (missing.length === 0) return;
    for (const k of missing) {
      const gi = randInt(groups.length);
      const g = groups[gi];
      const ci = randInt(g.length);
      groups[gi] = g.slice(0, ci) + k + g.slice(ci + 1);
    }
  }
}

/** Uppercase one char of the group. Hand-specific Shift lessons capitalize a
 * letter typed by the *other* hand, so the practiced hand presses Shift. */
function capitalizeGroup(g: string, shiftHand?: Hand): string {
  const eligible: number[] = [];
  for (let i = 0; i < g.length; i++) {
    if (canUppercase(g[i]) && (!shiftHand || handOf(g[i]) !== shiftHand)) eligible.push(i);
  }
  if (eligible.length === 0) return g;
  // without a hand constraint prefer the group start (reads like a word)
  const i = !shiftHand ? eligible[0] : eligible[randInt(eligible.length)];
  return g.slice(0, i) + g[i].toUpperCase() + g.slice(i + 1);
}

function makeLine(pool: Pool, opts: RandomGroupOptions, focus: readonly string[]): string {
  // a one-key pool can only repeat that key — keep its groups short ("fff")
  const maxLen = pool.chars.length === 1 ? Math.min(3, opts.maxGroupLen) : opts.maxGroupLen;
  const groups: string[] = [];
  let length = 0;
  while (length < LINE_TARGET) {
    const len = 1 + randInt(Math.max(1, maxLen));
    const g = makeGroup(pool, len, groups[groups.length - 1] ?? null, opts.alternateHands !== false);
    groups.push(g);
    length += g.length + 1;
  }
  if (focus.length) ensureFocus(groups, focus);
  if (opts.caps) {
    for (let i = 0; i < groups.length; i++) {
      if (Math.random() < CAPS_P) groups[i] = capitalizeGroup(groups[i], opts.shiftHand);
    }
  }
  return groups.join(" ");
}

/** Random drill block: `lines` lines of space-separated groups. */
export function randomGroups(chars: readonly string[], opts: RandomGroupOptions): string {
  if (chars.length === 0) return "";
  const pool = makePool(chars, opts.weight ?? (() => 1));
  const lineCount = Math.max(1, opts.lines);

  // small focus sets are guaranteed on every line; large ones (e.g. the
  // 10-digit review) rotate across lines so no single line gets crammed
  const focus = opts.focus ?? [];
  let focusFor: (i: number) => readonly string[];
  if (focus.length <= MAX_FOCUS_PER_LINE) {
    focusFor = () => focus;
  } else {
    const rotated = shuffle([...focus]);
    const per = Math.min(MAX_FOCUS_PER_LINE, Math.ceil(rotated.length / lineCount));
    focusFor = (i) => Array.from({ length: per }, (_, k) => rotated[(i * per + k) % rotated.length]);
  }

  const lines: string[] = [];
  for (let i = 0; i < lineCount; i++) lines.push(makeLine(pool, opts, focusFor(i)));
  return lines.join("\n");
}

// --- word / sentence blocks ----------------------------------------------------

function capitalize(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function wordsBlock(
  words: readonly string[],
  lines: number,
  caps: boolean,
  shiftHand?: Hand,
): string {
  const out: string[] = [];
  let bag = shuffle([...new Set(words)]);
  let bi = 0;
  for (let li = 0; li < lines; li++) {
    const lineWords: string[] = [];
    let len = 0;
    while (len < LINE_TARGET) {
      if (bi >= bag.length) {
        const last = bag[bag.length - 1];
        bag = shuffle(bag);
        if (bag.length > 1 && bag[0] === last) [bag[0], bag[1]] = [bag[1], bag[0]];
        bi = 0;
      }
      const w = bag[bi++];
      // hand-specific Shift lessons capitalize only opposite-hand initials;
      // skip initials whose uppercase isn't typeable via Shift (ú, ů, …)
      const capitalizable =
        caps &&
        canUppercase(w.charAt(0)) &&
        (!shiftHand || handOf(w.charAt(0)) !== shiftHand);
      lineWords.push(capitalizable ? capitalize(w) : w);
      len += w.length + 1;
    }
    out.push(lineWords.join(" "));
  }
  return out.join("\n");
}

const PUNCT_CHARS = new Set([".", ",", "!", "?", ";", ":", "(", ")", "-", "–", "—", "…", '"']);

/** Drop punctuation the learner hasn't met yet, keeping the sentence typeable. */
function stripUnlearnedPunct(s: string, learned: ReadonlySet<string>): string {
  return [...s]
    .filter((c) => !PUNCT_CHARS.has(c) || learned.has(c))
    .join("")
    .replace(/ {2,}/g, " ")
    .trim();
}

// --- lesson assembly -----------------------------------------------------------

export function buildSteps(lesson: Lesson, opts: GeneratorOptions): DrillStep[] {
  const steps: DrillStep[] = [];
  const learned = new Set(lesson.cumulativeKeys);
  const newKeys = lesson.newKeys;
  const newSet = new Set(newKeys);
  const weak = new Set(opts.weakKeys ?? []);
  const isReview = newKeys.length === 0;
  const lines = Math.max(1, opts.linesPerPhase);
  const maxGroupLen = Math.min(8, Math.max(1, Math.round(opts.maxGroupLen)));
  const caps = !!lesson.caps;

  // 1) new keys only (reviews skip this and get a longer mix instead)
  if (!isReview) {
    let text = randomGroups(newKeys, {
      maxGroupLen,
      lines,
      focus: newKeys,
      caps,
      shiftHand: lesson.shiftHand,
      alternateHands: opts.alternateHands,
    });
    // home row = brand-new fingers: open with a classic repetition warm-up
    if (lesson.stageId === "home") {
      const warm: string[] = [];
      for (let len = 0, i = 0; len < LINE_TARGET; i++) {
        warm.push(newKeys[i % newKeys.length].repeat(3));
        len += 4;
      }
      text = `${warm.join(" ")}\n${text}`;
    }
    steps.push({ kind: "new", label: "Nové klávesy", text });
  }

  // 2) all learned keys, weighted toward new + weak keys
  if (lesson.cumulativeKeys.length > 0) {
    steps.push({
      kind: "mix",
      label: "Procvičení",
      text: randomGroups(lesson.cumulativeKeys, {
        maxGroupLen,
        lines: isReview ? lines * 2 : lines,
        focus: newKeys,
        caps,
        shiftHand: lesson.shiftHand,
        alternateHands: opts.alternateHands,
        weight: (c) => 1 + (newSet.has(c) ? 2 : 0) + (weak.has(c) ? 2 : 0),
      }),
    });
  }

  // 3) real Czech words, once the learned set yields enough of them
  const words = filterByChars(WORDS, learned);
  if (words.length >= 6) {
    steps.push({
      kind: "words",
      label: "Slova",
      text: wordsBlock(words, lines, caps, lesson.shiftHand),
    });
  }

  // 4) calm sentences/phrases when the key set allows (bonus phase);
  // punctuation the learner hasn't met yet is stripped, not disqualifying
  let sentencePool = filterByChars(
    (caps || lesson.stageId === "punct" ? [...SENTENCES] : SENTENCES.map((s) => s.toLowerCase())).map(
      (s) => stripUnlearnedPunct(s, learned),
    ),
    learned,
  ).filter((s) => [...s].every((c) => c === " " || charInfo(c) !== undefined));
  if (lesson.shiftHand) {
    // only sentences whose capitals are typed by the other hand fit the lesson
    sentencePool = sentencePool.filter((s) =>
      [...s].every((c) => c === c.toLowerCase() || handOf(c) !== lesson.shiftHand),
    );
  }
  const phrasePool = filterByChars(PHRASES, learned);
  const count = Math.min(Math.max(1, lines), 4);
  const phraseText =
    sentencePool.length > 0
      ? shuffle([...sentencePool]).slice(0, count).join("\n")
      : phrasePool.length > 0
        ? shuffle([...phrasePool]).slice(0, count).join("\n")
        : "";
  if (phraseText) {
    steps.push({ kind: "phrase", label: "Věty", text: phraseText });
  }

  // guarantee at least one step (defensive — every lesson has cumulative keys)
  if (steps.length === 0) {
    steps.push({
      kind: "mix",
      label: "Procvičení",
      text: randomGroups([...learned], { maxGroupLen, lines }),
    });
  }
  return steps;
}
