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

export const MASTERY = 0.9; // accuracy that marks a lesson "ready for next"

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

/**
 * How many distinct days were practiced in a calendar year (default: this one).
 *
 * Deliberately cumulative, not a consecutive "streak": the count only ever
 * grows, so a missed day never resets it and never becomes a guilt signal.
 * That's the brand's positively-motivating stance, not Duolingo loss-aversion.
 */
export function practiceDaysInYear(
  days: readonly string[],
  year: number = new Date().getFullYear(),
): number {
  const prefix = `${year}-`;
  return new Set(days.filter((d) => d.startsWith(prefix))).size;
}

/** Local calendar day as an ISO `YYYY-MM-DD` string. */
export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
