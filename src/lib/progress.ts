import { LESSONS, type Lesson } from "../data/curriculum";

/* Pure helpers over the raw Evolu rows. */

export interface AttemptRow {
  lessonId: string;
  accuracy: number;
  cpm: number;
}
export interface KeyStatRow {
  char: string;
  hits: number;
  misses: number;
}

const MASTERY = 0.9; // accuracy that marks a lesson "ready for next"

/** lessonId -> best accuracy seen */
export function bestAccuracyByLesson(attempts: readonly AttemptRow[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const a of attempts) {
    m.set(a.lessonId, Math.max(m.get(a.lessonId) ?? 0, a.accuracy));
  }
  return m;
}

export function isCompleted(lessonId: string, best: Map<string, number>): boolean {
  return (best.get(lessonId) ?? 0) >= MASTERY;
}

/** The soft-suggested next lesson: first not-yet-mastered in order. */
export function suggestedLesson(best: Map<string, number>): Lesson {
  return LESSONS.find((l) => !isCompleted(l.id, best)) ?? LESSONS[LESSONS.length - 1];
}

export function completedCount(best: Map<string, number>): number {
  return LESSONS.filter((l) => isCompleted(l.id, best)).length;
}

/** Top weak keys by miss rate (min sample). */
export function weakKeys(stats: readonly KeyStatRow[], limit = 8): string[] {
  return stats
    .map((s) => ({
      char: s.char,
      total: s.hits + s.misses,
      rate: s.hits + s.misses > 0 ? s.misses / (s.hits + s.misses) : 0,
    }))
    .filter((s) => s.total >= 4 && s.rate > 0.08 && s.char.trim() !== "")
    .sort((a, b) => b.rate - a.rate)
    .slice(0, limit)
    .map((s) => s.char);
}

/** Consistency streak in days, counting back from today (local). */
export function streak(days: readonly string[]): number {
  const set = new Set(days);
  let n = 0;
  const d = new Date();
  // allow "today not yet practiced" to not break the streak: start from today,
  // but if today missing, start from yesterday.
  if (!set.has(isoDay(d))) d.setDate(d.getDate() - 1);
  while (set.has(isoDay(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
