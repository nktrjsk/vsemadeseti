import type { Hand } from "./layout";

/* The 7-stage Czech QWERTZ curriculum: lesson/stage definitions and the
 * cumulative key sets. Drill content is produced from these definitions by
 * data/generator.ts (random, fresh on every attempt). */

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
  /** which Shift hand is practiced — capitals fall on the opposite hand's letters */
  shiftHand?: Hand;
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
  shiftHand?: Hand;
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
      { title: "Shift levou rukou", keys: [], caps: true, shiftHand: "left" },
      { title: "Shift pravou rukou", keys: [], caps: true, shiftHand: "right" },
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
    title: "Háčky a čárky",
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
        shiftHand: rl.shiftHand,
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
