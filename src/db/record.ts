import { evolu, type KeyStatId } from "./evolu";
import { isoDay } from "../lib/progress";
import type { RunSummary } from "../components/TypingArea";

export interface KeyStatRowFull {
  id: KeyStatId;
  char: string;
  hits: number;
  misses: number;
}

/* Persist a completed run: the attempt, today's practice day, and per-key
 * tallies (for weak-key drills). Local-first — writes go to the local SQLite. */
export function recordAttempt(
  lessonId: string,
  summary: RunSummary,
  existingKeyStats: readonly KeyStatRowFull[],
  existingDays: readonly string[],
): void {
  const now = new Date();

  evolu.insert("lessonAttempt", {
    lessonId,
    accuracy: summary.accuracy,
    cpm: Math.round(summary.cpm),
    errors: summary.errors,
    durationMs: Math.round(summary.durationMs),
    completedAt: now.toISOString(),
  });

  const day = isoDay(now);
  if (!existingDays.includes(day)) {
    evolu.insert("practiceDay", { day });
  }

  // "\n" (Enter) is persisted too; weak-key drills filter whitespace out
  for (const [char, t] of summary.keyTally) {
    if (!char) continue;
    const existing = existingKeyStats.find((k) => k.char === char);
    if (existing) {
      evolu.update("keyStat", {
        id: existing.id,
        hits: existing.hits + t.hits,
        misses: existing.misses + t.misses,
      });
    } else {
      evolu.insert("keyStat", { char, hits: t.hits, misses: t.misses });
    }
  }
}
