# Release — vsemadeseti

- **Layer**: L1 (free public users)
- **Versioning**: CalVer (`YYYY.MM.PATCH` — e.g. `2026.06`, then `2026.06.1`)
- **Staleness cap**: 3 weeks (never let main sit unshipped longer)
- **Release command**: `npm run release` (`scripts/release.sh`) — the **only** thing
  that deploys to prod: gate → version + changelog + tag → build → Netlify deploy.
- **Deploy target / rollback**: Netlify, deployed by the release script via
  `netlify-cli` from the locally-built `dist/`. **Netlify auto-publish on push to main
  must stay OFF** (Site config → Build & deploy) so prod only changes on a cut tag.
  Rollback via the Netlify deploy history ("Publish deploy" on the previous good build).
- **Announce channels**: in-app "what's new" + GitHub release notes (distilled from
  `CHANGELOG.md`, never written independently)
- **Listen window**: 24h after deploy — watch for breakage/feedback before new work.

## Smoke list (run on prod-like build before tag; golden path again on prod after deploy)

Run against the actual built bundle (`npm run build && npm run preview`), installed,
including offline — not the dev server.

1. **Cesta** — open the course path, start the suggested lesson, type a full drill to
   completion, get the warm end-of-lesson summary/chime  ← **golden path**
2. **First run** — fresh storage (new browser profile / cleared data): welcome →
   home-row F/J bumps → lesson 1 flows without errors
3. **Progress persists** — finish a lesson, reload: progress + path position survive
   (Evolu / OPFS)
4. **Doladit** — a weak-key drill generates from most-missed keys and is typable
5. **Volné psaní** — paste custom text and type it; no score, no gating
6. **Dead keys** — `´`+o → `ó` and `ˇ`+c → `č` register as correct (the `beforeinput`
   composition path)
7. **Settings** — toggle theme (dark/light), scaffolding level, and sound; changes
   apply and persist across reload
8. **PWA offline** — load once, go offline, reload: app boots and a lesson works fully
   offline (confirms COOP/COEP headers + SQLite WASM precache)

A failed item **blocks** the release — fix or descope, never waive.

## Launch checklist (first public release only — delete this section once empty)

- [x] Name and domain settled — custom domain `vsemadeseti.cz` (migrated
      2026-06-26 from the original `vsemadeseti.netlify.app`). PWA installs and all
      local-first data pin to the origin, so the new domain is a fresh origin —
      see the origin-migration note below.
      **Rollback verified** 2026-06-12: published the previous deploy, confirmed prod
      served the old bundle, restored the current one.
- [x] **Git-triggered builds turned OFF** (`stop_builds`, 2026-06-12) — pushes to main
      no longer touch Netlify at all; `npm run release` (CLI deploy) is the sole path
      to prod. Note: this also disables deploy previews — flip the toggle back in
      Site config → Build & deploy if previews are ever wanted.
- [x] License chosen — MIT (`LICENSE` present)
- [x] Privacy posture written down — README "Privacy" section: 100 % local, no
      account, no servers, no analytics, no third-party requests (all fonts
      self-hosted as of 2026-06-12); recovery phrase is for the user's own
      device moves only
- [ ] Install / onboarding path tested by someone who isn't you
- [x] Error reporting wired — local-only error log (`src/lib/errlog.ts`): uncaught
      errors/rejections → localStorage ring buffer; Settings → Diagnostika has a
      "copy report" action for pasting into a GitHub issue. Zero network, so the
      privacy posture stays intact.
- [x] Analytics — none, by design (privacy is the feature); decided 2026-06-12
- [x] "Good enough" bar defined — see the finite list below; launch when it's empty,
      not when it feels done
- [ ] Soft-launch first: one small community / friend group before any broad announcement

### Good enough to launch (finite — launch when this is empty)

Explicitly **not** blocking (deferred in SPEC.md): other layouts, Tauri wrapper,
mascot, the full Czech corpus, live cross-device sync.

- [ ] Full smoke list (above) passes on a prod-like build, incl. installed/offline PWA
- [x] Layout verified against CLDR keyboard data (2026-06-12) — Windows matches
      exactly incl. dead-key compositions; macOS functionally identical for every
      taught char (details in the `src/data/layout.ts` header note)
- [x] Every lesson generates valid, typable content — `npm run check:content`
      samples 30k+ drills across all lessons × settings combos; wired into the
      release gate (2026-06-12)
- [ ] One read-through of all user-facing Czech copy (quiet-warm voice, genderless,
      no self-reassurance)
- [ ] Onboarding tested by someone who isn't you (= the checklist item above)
- [ ] Launch note drafted: in-app "what's new" + GitHub release text, distilled
      from the first CHANGELOG entry
