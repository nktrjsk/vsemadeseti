import { filterByChars, PHRASES, SENTENCES, WORDS } from "./words";

/* The 7-stage Czech QWERTZ curriculum.
 *
 * Each lesson introduces newKeys and is built from steps:
 *   isolate  -> repeated single keys ("f f f j j j")
 *   combine  -> bigrams/short nonsense from learned keys
 *   words    -> real Czech words using only learned keys (when enough exist)
 *   phrase   -> a calm phrase/sentence (later stages)
 * Content is generated deterministically (no Math.random) so lessons are
 * stable across sessions. */

export interface Lesson {
  id: string;
  stageId: string;
  index: number; // global order
  title: string;
  /** new characters taught in this lesson (lowercase base form) */
  newKeys: string[];
  /** all characters available to draw drill content from, by this lesson */
  cumulativeKeys: string[];
  /** whether this lesson is about capitals (Shift) */
  caps?: boolean;
  /** whether this lesson covers digits (Shift on the diacritic row) */
  digits?: boolean;
}

export interface Stage {
  id: string;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

// --- raw stage/lesson definitions (new keys per lesson) --------------------

interface RawLesson {
  title: string;
  keys: string[];
  caps?: boolean;
  digits?: boolean;
}
interface RawStage {
  id: string;
  title: string;
  subtitle: string;
  lessons: RawLesson[];
}

const RAW: RawStage[] = [
  {
    id: "home",
    title: "Základní řada",
    subtitle: "Domovská řada — odsud vychází všechno",
    lessons: [
      { title: "f, j — kotvy", keys: ["f", "j"] },
      { title: "d, k", keys: ["d", "k"] },
      { title: "s, l", keys: ["s", "l"] },
      { title: "a, ů", keys: ["a", "ů"] },
      { title: "g, h", keys: ["g", "h"] },
      { title: "Domovská řada celá", keys: [] },
    ],
  },
  {
    id: "letters",
    title: "Horní a dolní řada",
    subtitle: "Doplníme zbylá písmena",
    lessons: [
      { title: "e, i", keys: ["e", "i"] },
      { title: "r, u", keys: ["r", "u"] },
      { title: "t, z", keys: ["t", "z"] },
      { title: "o, p", keys: ["o", "p"] },
      { title: "w, q", keys: ["w", "q"] },
      { title: "v, m", keys: ["v", "m"] },
      { title: "c, n", keys: ["c", "n"] },
      { title: "x, y", keys: ["x", "y"] },
      { title: "b — poslední", keys: ["b"] },
      { title: "Všechna písmena", keys: [] },
    ],
  },
  {
    id: "caps",
    title: "Velká písmena",
    subtitle: "Shift a velká písmena",
    lessons: [
      { title: "Shift levou rukou", keys: [], caps: true },
      { title: "Shift pravou rukou", keys: [], caps: true },
      { title: "Věty s velkými písmeny", keys: [], caps: true },
    ],
  },
  {
    id: "diacritics",
    title: "Diakritika",
    subtitle: "Řada ě š č ř ž ý á í é",
    lessons: [
      { title: "á, í, é", keys: ["á", "í", "é"] },
      { title: "ě, š, č", keys: ["ě", "š", "č"] },
      { title: "ř, ž, ý", keys: ["ř", "ž", "ý"] },
      { title: "Diakritika dohromady", keys: [] },
    ],
  },
  {
    id: "digits",
    title: "Číslice",
    subtitle: "Shift + horní řada",
    lessons: [
      { title: "1, 2, 3, 4, 5", keys: ["1", "2", "3", "4", "5"], digits: true },
      { title: "6, 7, 8, 9, 0", keys: ["6", "7", "8", "9", "0"], digits: true },
      { title: "Čísla dohromady", keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"], digits: true },
    ],
  },
  {
    id: "deadkeys",
    title: "Mrtvé klávesy",
    subtitle: "Háček a čárka — ó ť ň ď ú",
    lessons: [
      { title: "ú, ó", keys: ["ú", "ó"] },
      { title: "ť, ň, ď", keys: ["ť", "ň", "ď"] },
    ],
  },
  {
    id: "punct",
    title: "Interpunkce",
    subtitle: "Tečka, čárka a další znaky",
    lessons: [
      { title: "Tečka a čárka", keys: [".", ","] },
      { title: "Otazník a vykřičník", keys: ["?", "!"], caps: true },
      { title: "Pomlčka a závorky", keys: ["-", "(", ")"] },
      { title: "Volné psaní vět", keys: [] },
    ],
  },
];

// --- build cumulative lessons ----------------------------------------------

function buildStages(): Stage[] {
  const cumulative: string[] = [];
  let globalIndex = 0;
  return RAW.map((rs) => {
    const lessons: Lesson[] = rs.lessons.map((rl) => {
      for (const k of rl.keys) if (!cumulative.includes(k)) cumulative.push(k);
      return {
        id: `${rs.id}-${globalIndex}`,
        stageId: rs.id,
        index: globalIndex++,
        title: rl.title,
        newKeys: rl.keys,
        cumulativeKeys: [...cumulative],
        caps: rl.caps,
        digits: rl.digits,
      };
    });
    return { id: rs.id, title: rs.title, subtitle: rs.subtitle, lessons };
  });
}

export const STAGES: Stage[] = buildStages();
export const LESSONS: Lesson[] = STAGES.flatMap((s) => s.lessons);
export const TOTAL_LESSONS = LESSONS.length;

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
export function stageOf(lesson: Lesson): Stage {
  return STAGES.find((s) => s.id === lesson.stageId)!;
}

// --- content generation ------------------------------------------------------

export interface DrillStep {
  kind: "isolate" | "combine" | "words" | "phrase";
  label: string;
  text: string;
}

// simple deterministic pseudo-shuffle based on a seed (no Math.random)
function seededPick<T>(arr: T[], count: number, seed: number): T[] {
  if (arr.length === 0) return [];
  const out: T[] = [];
  let s = seed % arr.length;
  for (let i = 0; i < count; i++) {
    s = (s * 31 + 7) % arr.length;
    out.push(arr[s]);
  }
  return out;
}

function chunk(parts: string[], perLine = 8): string {
  const lines: string[] = [];
  for (let i = 0; i < parts.length; i += perLine) {
    lines.push(parts.slice(i, i + perLine).join(" "));
  }
  return lines.join("\n");
}

export function buildSteps(lesson: Lesson): DrillStep[] {
  const steps: DrillStep[] = [];
  const seed = lesson.index + 1;
  const learned = new Set(lesson.cumulativeKeys);
  const focus = lesson.newKeys.length ? lesson.newKeys : lesson.cumulativeKeys.slice(-4);

  // 1) isolate (skip for pure "review" lessons with no new keys unless first)
  if (lesson.newKeys.length) {
    const iso = focus.map((k) => `${k}${k}${k}`).join(" ");
    steps.push({ kind: "isolate", label: "Jednotlivé klávesy", text: iso });
  }

  // 2) combine — bigrams from focus + a couple of anchors
  const anchors = ["f", "j", "d", "k", "a", "l"].filter((c) => learned.has(c));
  const pool = [...new Set([...focus, ...anchors])];
  const bigrams: string[] = [];
  for (let i = 0; i < pool.length; i++) {
    for (let j = 0; j < pool.length; j++) {
      if (i !== j) bigrams.push(pool[i] + pool[j]);
    }
  }
  if (bigrams.length) {
    steps.push({
      kind: "combine",
      label: "Spojení",
      text: chunk(seededPick(bigrams, 24, seed)),
    });
  }

  // 3) words — real Czech words using only learned keys
  const words = filterByChars(WORDS, learned);
  if (words.length >= 6) {
    let chosen = seededPick(words, 18, seed + 3);
    if (lesson.caps) chosen = chosen.map(capitalize);
    steps.push({ kind: "words", label: "Slova", text: chunk(chosen, 6) });
  }

  // 4) phrase / sentence — later stages
  const phrasePool = filterByChars(PHRASES, learned);
  const sentencePool = filterByChars(
    SENTENCES.map((s) => (lesson.caps || lesson.stageId === "punct" ? s : s.toLowerCase())),
    new Set([...learned, ...(lesson.caps ? capitals(learned) : [])]),
  );
  const phraseText =
    sentencePool.length > 0
      ? seededPick(sentencePool, 2, seed + 5).join("\n")
      : phrasePool.length > 0
        ? seededPick(phrasePool, 3, seed + 5).join("\n")
        : "";
  if (phraseText) {
    steps.push({ kind: "phrase", label: "Věty", text: phraseText });
  }

  // guarantee at least one step
  if (steps.length === 0) {
    steps.push({
      kind: "combine",
      label: "Procvičení",
      text: chunk(seededPick([...learned].map((k) => k + k), 18, seed)),
    });
  }
  return steps;
}

function capitalize(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}
function capitals(set: Set<string>): string[] {
  return [...set].map((c) => c.toUpperCase());
}
