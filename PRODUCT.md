# Product

## Register

product

## Users

Self-directed Czech speakers of all ages — adults, teens, and children — learning to touch-type on Czech QWERTZ. Single-user, self-paced, no classroom and no teacher watching. They practice in short sessions at home, often on shared or modest hardware, sometimes offline (the app is a local-first PWA). Children must find it approachable; adults must find it polished, never childish.

## Product Purpose

Všema deseti ("with all ten [fingers]") teaches touch typing for Czech QWERTZ — diacritic row `ěščřžýáíé`, dead keys, Z/Y swap — through a soft-suggested course path, targeted weak-key drills, free practice, and a relaxed playground. Everything is 100% local (Evolu SQLite/OPFS), no account or email ever; optional cross-device sync via a recovery phrase.

Success looks like a learner who keeps showing up because practice feels calm and progress feels personal — accuracy and CPM (úhozy/min) shown as information, framed against their own past self ("lepší než minule"), never as a score to beat anyone with.

## Brand Personality

Calm, warm, encouraging. The interface behaves like a patient teacher: it nudges toward the right key and finger, it never scolds, and it treats mistakes as a signal for care (weak-key drills), not punishment. Polished and quiet to an adult, friendly and unintimidating to a child. The course screen is a calm visual journey, not a game board.

## Anti-references

The north star is **positively motivating, not competitive** — every decision is checked against it:

- **No leaderboards, ranks, or percentiles.** Progress is never compared to others.
- **No punishing red.** Errors get a warm, gentle ochre cue, never an alarm.
- **No Duolingo-style loss-aversion gamification** — no fire-emoji streaks, no guilt for missed days, no penalty for breaking consistency.
- **Not cartoonish or game-like.** Inspired by nedatluj.cz's polish but explicitly rejecting its competitive framing. No mascot (deferred; if ever, an original calm character — not an owl).
- **No dark-pattern engagement mechanics** of any kind: no timers pressuring the learner, no targets imposed on metrics.

## Design Principles

1. **Positively motivating, not competitive.** Metrics are informational, comparisons are only ever to your own past, encouragement over scores.
2. **Calm is the feature.** Generous whitespace, soft motion, subtle sound, nothing flashing or urgent. The interface disappears into the practice.
3. **Mistakes mean care, not punishment.** A missed key becomes a gentle nudge in the moment and a tailored drill later — never a red mark or an error tally mid-drill.
4. **Nothing is locked.** The path suggests; the learner decides. Every lesson stays reachable and replayable, every scaffold (on-screen keyboard, hints) can be dialed down.
5. **Correctness over cosmetics in accessibility.** Finger zones are distinguished by shape and label, never hue alone; themes, text sizes, dyslexia-friendly font, and reduced motion are MVP requirements, not extras.

## Accessibility & Inclusion

Target WCAG 2.1 AA. Concretely committed in the spec and code:

- Color-blind-safe finger coding: each finger zone pairs its hue with a shape badge (◆ ▲ ● ■ ▬) and a Czech label.
- Light / dark / system themes.
- Adjustable text size for drill text and UI (16 / 18 / 20.5 px root).
- Optional dyslexia-friendly font (self-hosted OpenDyslexic, covers Czech diacritics, works offline).
- `prefers-reduced-motion` respected globally; sound is subtle, toggleable, with volume control.
- All-ages readability: UI language is Czech, copy stays simple and warm.
