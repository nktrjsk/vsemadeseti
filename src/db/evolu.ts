import {
  createEvolu,
  FiniteNumber,
  getOrThrow,
  id,
  type InferType,
  NonEmptyString1000,
  NonNegativeInt,
  SimpleName,
} from "@evolu/common";
import { createUseEvolu } from "@evolu/react";
import { evoluReactWebDeps } from "@evolu/react-web";

/* Learning progress lives here (syncable via recovery phrase). Device-only
 * preferences (theme, sound, scaffolding) live in localStorage instead — see
 * ui/settings.ts. We start fully local: transports:[] = no network at all. */

const LessonAttemptId = id("LessonAttempt");
type LessonAttemptId = InferType<typeof LessonAttemptId>;

const KeyStatId = id("KeyStat");
type KeyStatId = InferType<typeof KeyStatId>;

const PracticeDayId = id("PracticeDay");
type PracticeDayId = InferType<typeof PracticeDayId>;

const Schema = {
  lessonAttempt: {
    id: LessonAttemptId,
    lessonId: NonEmptyString1000,
    accuracy: FiniteNumber, // 0..1
    cpm: FiniteNumber,
    errors: NonNegativeInt,
    durationMs: NonNegativeInt,
    completedAt: NonEmptyString1000, // ISO date string
  },
  keyStat: {
    id: KeyStatId,
    char: NonEmptyString1000,
    hits: NonNegativeInt,
    misses: NonNegativeInt,
  },
  practiceDay: {
    id: PracticeDayId,
    day: NonEmptyString1000, // YYYY-MM-DD
  },
};

export const evolu = createEvolu(evoluReactWebDeps)(Schema, {
  name: getOrThrow(SimpleName.from("vsemadeseti")),
  transports: [], // local-only by default; cross-device sync is opt-in later
});

export const useEvolu = createUseEvolu(evolu);

// --- Queries ---------------------------------------------------------------

export const attemptsQuery = evolu.createQuery((db) =>
  db.selectFrom("lessonAttempt").selectAll().orderBy("completedAt", "desc"),
);

export const keyStatsQuery = evolu.createQuery((db) =>
  db.selectFrom("keyStat").selectAll(),
);

export const practiceDaysQuery = evolu.createQuery((db) =>
  db.selectFrom("practiceDay").selectAll().orderBy("day", "desc"),
);

export type { LessonAttemptId, KeyStatId, PracticeDayId };
