# vsemadeseti — Product Spec

A **local-first, positively-motivating touch-typing trainer** for Czech (QWERTZ),
for all ages, self-paced. Polished, calm visuals. Inspired by nedatluj.cz but
explicitly **not competitive** — progress is measured against your own past self,
never against others.

## North star
Every decision is checked against: **positively motivating, not competitive.**
No leaderboards, no ranks, no percentiles, no punishing red. Encouragement and
personal growth over scores.

---

## Foundations
| Decision | Choice |
|---|---|
| Keyboard layout | **Czech QWERTZ** primary (diacritic number row ěščřžýáíé, dead keys ´ ˇ, Z/Y swapped). English/QWERTY later. |
| Platform | **Web app / PWA** (offline via Evolu local SQLite/OPFS). Tauri wrapper is a trivial future option, not MVP. |
| Audience | Adults, teens, **and** children — self-directed, single-user, no classroom. |
| Stack | **React 19 + Vite + TypeScript**, `@evolu/react`, Tailwind, Framer Motion, Radix/shadcn primitives. |
| UI language | Czech (primary). |

## Learning model
- **Soft-suggested path:** nothing is locked. The recommended next lesson is
  highlighted; everything stays reachable and replayable.
- **Error handling = a setting.** Default: **block-until-correct** (gentle nudge on
  the right key/finger, no harsh red, no mid-drill error tally). Toggle: flow-through.
- **Content arc per key set:** isolate (`f f f`) → combine (`fj jf`) → real Czech
  words using only learned keys → short calm phrase/sentence. Needs a curated Czech
  corpus filtered by "keys learned so far."
- **Metrics are informational only:** accuracy + CPM (úhozy/min, Czech convention).
  Never targets, never compared to anyone. Growth framing ("lepší než minule").

## Curriculum sequencing (7 stages, ~30–45 lessons)
1. Home row (incl. `ů`)
2. Top + bottom letter rows
3. Capitals (Shift)
4. Diacritic row `ěščřžýáíé`
5. Digits (Shift + number row)
6. Dead keys `´ ˇ` → `ó ť ä` …
7. Punctuation / symbols

## Typing screen
- Scaffolding is **a setting**, defaulting to **full**: on-screen QWERTZ, keys
  tinted by finger zone, next key gently pulses, small hands hint ("use left index").
  Each element can be dialed down as the learner improves.

## Modes (beyond the structured course)
- Structured course (the path)
- **Targeted weak-key drills** — auto-generated from most-missed keys (mistakes → care, not punishment)
- **Free / custom-text practice** — type a provided passage or paste your own (song, poem, notes); no gating, no score
- **Relaxed playground** — open canvas with finger guides, zero tracking

## Motivation & feel
- **Gentle consistency nudge:** "you've shown up N days," warm, no guilt, no
  penalty for breaking, instant resume. No fire-emoji loss-aversion.
- **Sound:** subtle, on by default, toggleable — soft keypress tick, warm chime at
  lesson end, quiet (non-buzzer) "try again" cue. Volume control. Respects
  reduced-motion/quiet preferences.
- **Mascot:** deferred. Build neutral; revisit "if" needed in a later design pass.
  (If ever added: original calm character, NOT an owl — taken by nedatluj/Duolingo.)

## Visual identity
- Calm & friendly, all-ages: soft warm neutrals + one accent, generous whitespace,
  rounded shapes, gentle motion. Polished to adults, approachable to kids.
- **Course screen = calm/elegant visual journey path** (soft meandering path, gentle
  station nodes grouped by the 7 stages, soft-highlight on the suggested next lesson).
  Deliberately NOT cartoonish/gamified.

## Accessibility & theming (all in MVP)
- **Color-blind-safe finger coding** (distinguish zones by pattern/label/shape, not
  hue alone) — correctness, not cosmetics.
- Dark / light / system themes.
- Adjustable text size (drill + UI).
- Optional dyslexia-friendly font for drill text (typing font must render Czech
  diacritics cleanly either way).

## First run
Warm welcome (1 screen) → posture + home-row F/J bumps → lesson 1. Experienced
typists can jump ahead via the soft path. No placement test.

## Local-first storage (Evolu)
- 100% local by default, **no account/email ever**.
- Optional sync/backup via generated **recovery phrase (mnemonic)** to carry progress
  across devices. Off by default.
- Suggested persisted data: per-lesson attempt records (accuracy, CPM, errors,
  timestamp), per-key aggregate error counts (for weak-key drills), settings,
  consistency days, current path position. Keystroke-level data stays ephemeral.

---

## Open / deferred
- English QWERTY + other layouts (engine should stay layout-agnostic).
- Tauri desktop wrapper.
- Mascot/character.
- Authoring the full Czech corpus (word lists + calm sentences per key set).
