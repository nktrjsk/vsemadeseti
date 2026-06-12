---
name: Všema deseti
description: Calm, warm, local-first Czech touch-typing trainer — encouraging, never competitive
colors:
  sage: "#5b8a72"
  sage-deep: "#426a56"
  sage-whisper: "#e4efe7"
  gentle-ochre: "#c9b977"
  warm-paper: "#faf7f2"
  warm-paper-soft: "#f3eee6"
  surface-white: "#ffffff"
  surface-warm: "#f7f3ec"
  border-sand: "#e7ded1"
  ink-umber: "#2e2a24"
  ink-soft: "#6f675c"
  ink-faint: "#a39a8c"
typography:
  drill:
    fontFamily: "Lexend, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 400
    lineHeight: 1.4
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 600
    lineHeight: 1.3
rounded:
  sm: "8px"
  md: "12px"
  lg: "18px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.sage}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.65rem 1.2rem"
  button-soft:
    backgroundColor: "{colors.sage-whisper}"
    textColor: "{colors.sage-deep}"
    rounded: "{rounded.md}"
    padding: "0.65rem 1.2rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.md}"
    padding: "0.65rem 1.2rem"
  card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
  pill:
    backgroundColor: "{colors.surface-warm}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.7rem"
  pill-good:
    backgroundColor: "{colors.sage-whisper}"
    textColor: "{colors.sage-deep}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.7rem"
---

# Design System: Všema deseti

## 1. Overview

**Creative North Star: "Tichá pracovna" (The Quiet Study)**

A sunlit writing desk: warm paper neutrals, one living sage accent, and nothing competing for your attention while you practice. Every surface exists to make typing practice feel like sitting down at a calm, well-kept desk — generous whitespace, rounded shapes, gentle motion, subtle sound. The interface behaves like a patient teacher seated beside you: it points to the right key, it never raises its voice, and when you stumble it leans in with care instead of a red mark.

This system explicitly rejects the competitive-trainer aesthetic: no leaderboards, no ranks, no punishing red, no fire-emoji streak anxiety, no cartoonish game-board gamification. It is polished enough for an adult and unintimidating for a child — the two audiences share one register, and the register is calm.

All theming is driven by CSS custom properties on `[data-theme]` (light and dark), `[data-textsize]` (16 / 18 / 20.5 px root), and `[data-dyslexia]` (OpenDyslexic swap). Components must consume the variables (`var(--accent)`, `var(--surface)`, …), never the raw hex, so every screen inherits all three axes for free.

**Key Characteristics:**
- Warm paper neutrals with a single sage accent; the accent marks action and growth, nothing else
- Soft geometry everywhere: 12px buttons, 18px cards, full-round pills and toggles
- Two-layer ambient shadows — depth like paper resting on a desk, never floating UI
- One sans family (Inter) for all UI; Lexend reserved for the drill text learners actually type
- Gentle motion (120–400ms ease), fully disabled under `prefers-reduced-motion`

## 2. Colors

A restrained warm-neutral palette where sage green is the only voice and a muted ochre is the only "correction" — the palette literally cannot scold.

### Primary
- **Sage** (#5b8a72): the single accent. Primary buttons, the suggested next lesson, progress fills, the pulsing next-key highlight, positive states (`--good` is the same value — success is not a separate louder color). Dark theme lifts it to #7fb295.
- **Deep Sage** (#426a56): text on sage-whisper surfaces; the accent's own ink. Dark theme: #9cc8ae.
- **Sage Whisper** (#e4efe7): tinted fill for soft buttons, selected pills, and text selection. Dark theme: #2a3a31.

### Secondary
- **Gentle Ochre** (#c9b977): the "try again" cue. Warm, candle-like, deliberately un-alarming. This is the entire error vocabulary — there is no red anywhere in the system. Dark theme: #d8c989.

### Neutral
- **Warm Paper** (#faf7f2): the body background. Dark theme: #1a1816.
- **Warm Paper Soft** (#f3eee6): recessed zones and quiet panels. Dark: #211e1b.
- **Surface White** (#ffffff): cards and raised surfaces. Dark: #24211d.
- **Surface Warm** (#f7f3ec): second-layer surfaces — segmented-control tracks, pill fills, progress troughs. Dark: #2b2723.
- **Border Sand** (#e7ded1): 1px hairlines on cards and inputs. Dark: #38332d.
- **Ink Umber** (#2e2a24): primary text, a warm near-black. Dark: #efe9e0.
- **Ink Soft** (#6f675c): secondary text, ghost buttons. Dark: #b6ac9e.
- **Ink Faint** (#a39a8c): tertiary hints and inactive path nodes only — never body copy. Dark: #7c7468.

Finger-zone hues (a fixed 9-color pastel family in `src/lib/finger.ts`, e.g. l-index #e4f0d6/#6aa64a, r-ring #fadcdc/#d36a6a) are functional coding for the on-screen keyboard, not brand colors. They never appear outside finger/keyboard contexts.

### Named Rules
**The Patient Teacher Rule.** Errors are gentle ochre (#c9b977), never red. There is no harsh failure color in the system and none may be introduced — a wrong key gets a warm nudge toward the right one, not an alarm.

**The One Voice Rule.** Sage is the only accent and carries ≤10% of any screen. If a second accent seems needed, the layout is wrong, not the palette.

**The Shape-Before-Hue Rule.** Finger zones always pair their hue with a shape badge (◆ ▲ ● ■ ▬) and a Czech label. Hue alone never carries meaning — this is correctness, not decoration.

## 3. Typography

**UI Font:** Inter (with ui-sans-serif, system-ui fallback)
**Drill Font:** Lexend (with Inter fallback) — `--font-type`, used only for text the learner types
**Accessibility Font:** OpenDyslexic (self-hosted woff, regular + bold) — replaces both stacks under `[data-dyslexia="on"]`, with +0.03em letter-spacing and +0.06em word-spacing

**Character:** One quiet, highly legible sans carries the whole UI; Lexend's open, even rhythm is reserved for drill text so the letters being learned are the most readable thing on screen. Both stacks render Czech diacritics (ěščřžýáíé) cleanly — that is non-negotiable for any font swap.

### Hierarchy
Fixed rem scale, no fluid clamp — this is product UI viewed at consistent sizes. The root font-size (16 / 18 / 20.5 px) is the user's text-size control; everything scales through rem.

- **Drill** (400, 2.6–3rem, Lexend): the practice text itself. The largest thing on any screen, by design.
- **Headline** (700, 1.6–1.9rem): screen titles ("Tvá cesta psaní", "Nastavení"). One per screen.
- **Title** (600, 1.05–1.5rem): card and stage headings, lesson titles, the end-of-drill encouragement line.
- **Body** (400, 1rem, line-height ~1.55): copy and descriptions. Color Ink Umber, never fainter than Ink Soft.
- **Label** (600, 0.78–0.9rem): buttons, pills, segmented options, metadata. Settings section headers add uppercase + 0.06em tracking in Ink Faint — the one sanctioned small-caps use.

### Named Rules
**The Biggest-Thing Rule.** Drill text outranks every heading. If any UI element is visually louder than the text being practiced, shrink the element, not the drill.

## 4. Elevation

A hybrid: tonal layering does the everyday work (Warm Paper → Surface Warm → Surface White, three warm steps), and one shared ambient shadow token expresses "resting on the desk." Depth is paper-like and diffuse, never a floating material.

### Shadow Vocabulary
- **Ambient** (`box-shadow: 0 1px 2px rgba(46, 42, 36, 0.04), 0 8px 24px rgba(46, 42, 36, 0.06)` — the `--shadow` token; dark theme swaps to black-based equivalents): cards, primary buttons, the selected segment of a segmented control. The only shadow in the system.

### Named Rules
**The One Shadow Rule.** Every elevated element uses `var(--shadow)`. No bespoke shadows, no darker hover shadows, no glows. If something needs more separation, use the tonal ladder or a Border Sand hairline.

## 5. Components

All primitives live in `src/ui/primitives.tsx` and consume theme variables only. Reuse them; extend them in place rather than forking styles per screen.

### Buttons
- **Shape:** softly rounded (12px), borderless, 600 weight, 1rem.
- **Primary:** Sage fill, white text, ambient shadow, `padding: 0.65rem 1.2rem`.
- **Soft:** Sage Whisper fill, Deep Sage text — the default for secondary and stepper actions.
- **Ghost:** transparent, Ink Soft text — tertiary/navigation actions.
- **Hover / Active:** 120ms transform + 180ms background ease. **Disabled:** opacity 0.45, cursor default — never a new color.

### Chips
- **Pill:** full-round (999px), Label type. Neutral tone: Surface Warm + Ink Soft. Good tone: Sage Whisper + Deep Sage.

### Cards / Containers
- **Corner Style:** generously rounded (18px).
- **Background:** Surface White over Warm Paper.
- **Shadow Strategy:** Ambient (see Elevation) plus a 1px Border Sand hairline — both, always.
- **Internal Padding:** 1.25rem.

### Inputs / Fields
- **Toggle:** full-round 46×26px switch, Sage when on, Border Sand when off, white thumb, 180ms ease, proper `role="switch"` + `aria-checked`.
- **Segmented:** Surface Warm track (10px radius), selected segment lifts to Surface White with ambient shadow and Deep Sage text.
- **Stepper:** soft −/+ buttons with Czech `aria-label`s ("Méně"/"Více") around a 700-weight value.
- **Focus (everything):** 2px Sage outline, 2px offset, 6px radius — the global `:focus-visible` ring. Never remove it, never restyle it per component.

### Navigation
- **Progress:** 8px full-round trough in Surface Warm, Sage fill, 400ms width ease, proper `role="progressbar"` ARIA values.

### The Calm Trail (signature)
The course path (`CoursePath.tsx`) is the brand's heart: a soft meandering trail of lesson nodes grouped into 7 stages, the suggested next lesson softly highlighted (sage, gentle pulse), completed nodes quietly sage-tinted, future nodes in Ink Faint but always clickable. It must read as a calm walk, never a game board or a candy-colored map.

### On-screen Keyboard (signature)
QWERTZ keys tinted by finger-zone pastels with shape badges, the next key pulsing gently in Sage with white glyph. Scaffolding is a setting: every layer (keyboard, tints, hands hint) can be dialed down independently as the learner improves.

## 6. Do's and Don'ts

### Do:
- **Do** consume CSS variables (`var(--accent)`, `var(--surface)`, `var(--text)`) for every color so light/dark themes, text sizes, and dyslexia mode work everywhere automatically.
- **Do** use Gentle Ochre (#c9b977) for every "try again" moment, with a nudge toward the correct key/finger.
- **Do** keep metrics informational: accuracy and CPM framed against the learner's own past ("lepší než minule"), in Body/Label type, never as a giant hero number.
- **Do** ship every animation with a `prefers-reduced-motion` path (the global kill-switch exists; don't bypass it with JS-driven motion — gate Framer Motion on the media query).
- **Do** keep contrast honest: body text in Ink Umber (#2e2a24) on warm surfaces; Ink Faint is for hints only.
- **Do** write all UI copy in warm, simple Czech.

### Don't:
- **Don't** introduce red, error badges, mid-drill error tallies, or any "punishing red" — the spec bans it by name.
- **Don't** add leaderboards, ranks, percentiles, streak fire, countdown timers, or any competitive/loss-aversion mechanic — "positively motivating, not competitive" is the north star.
- **Don't** go cartoonish or game-like: no mascots (explicitly deferred; never an owl), no candy gradients, no confetti storms. Celebration is a warm chime and a kind sentence.
- **Don't** let hue alone carry meaning — finger zones keep their shape badges and labels (The Shape-Before-Hue Rule).
- **Don't** invent new shadows, accent colors, or per-screen button styles; the system has one shadow, one accent, and shared primitives.
- **Don't** use fluid clamp() type or display fonts in UI labels — fixed rem scale, Inter for UI, Lexend only for drill text.
- **Don't** hardcode hex values in components (the finger-zone table in `finger.ts` is the one sanctioned exception).
