# vsemadeseti

A calm, **local-first** touch-typing trainer for **Czech (QWERTZ)** — for all ages,
self-paced. **Positively motivating, not competitive:** no leaderboards, no ranks,
no punishing red. Progress is measured against your own past self.

See [`SPEC.md`](./SPEC.md) for the full product decisions.

## Stack

- **React 19 + Vite + TypeScript**
- **[Evolu](https://www.evolu.dev) 7** — local-first SQLite (OPFS) in the browser;
  data is local by default (`transports: []`), portable via a recovery phrase.
- **Tailwind v4** (design tokens) + a little **Framer Motion**
- Zero backend. Installable PWA, works offline.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run typecheck
```

## How it works

- **Curriculum** (`src/data/curriculum.ts`) — 7 stages, ~32 lessons, built from
  per-key drills → bigrams → real Czech words → calm phrases. Content is generated
  deterministically and filtered to keys learned so far.
- **Layout** (`src/data/layout.ts`) — the Czech QWERTZ key map + 10-finger
  assignment. Input is matched on the *produced character*; the on-screen keyboard
  is rendered from this table.
- **Typing engine** (`src/engine/useTypingSession.ts`) — reads `beforeinput` (not
  raw keydown) so **Czech dead keys compose correctly** (´+o → ó arrives as one
  insertText). Block-on-error or flow-through (a setting).
- **Progress** lives in Evolu (`src/db/`); device preferences (theme, sound,
  scaffolding) live in `localStorage` (`src/ui/settings.ts`).

## Modes

- **Cesta** — the structured course (soft-suggested path; nothing locked)
- **Volné psaní** — type a provided passage or paste your own text
- **Doladit** — targeted drills built from your most-missed keys
- **Hřiště** — relaxed playground with finger guides, zero tracking

## Accessibility

Color-blind-safe finger coding (hue **+** glyph badge), dark/light/system themes,
adjustable text size, and an optional **dyslexia-friendly font** ([OpenDyslexic](https://opendyslexic.org))
that restyles the whole app — self-hosted so it works offline.

## Credits

- **[OpenDyslexic](https://opendyslexic.org)** by Abelardo Gonzalez — self-hosted in
  [`public/fonts/`](./public/fonts) and used for the optional dyslexia-friendly mode.
  Licensed under **CC-BY 3.0** (original fonts © Bitstream); see
  [`public/fonts/OpenDyslexic-LICENSE.txt`](./public/fonts/OpenDyslexic-LICENSE.txt).
- **Inter** and **Lexend** (UI / drill text) — served via Google Fonts, both under the
  SIL Open Font License 1.1.

## Status / not yet done

See the "Open / deferred" section of `SPEC.md` and the notes in code:
live cross-device sync (currently local-only + recovery-phrase restore),
service-worker offline caching, English/other layouts, the full Czech corpus,
and verification of some punctuation/AltGr/dead-key layout details.
