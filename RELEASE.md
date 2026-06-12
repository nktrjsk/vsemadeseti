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

- [ ] Name and domain settled; Netlify deploy target chosen and **rollback verified to
      actually work** (publish an old deploy, confirm it serves)
- [ ] **Netlify auto-publish on push to main turned OFF** — so `npm run release` is the
      sole path to prod (one-time; required for the tag-only deploy model above)
- [x] License chosen — MIT (`LICENSE` present)
- [ ] Privacy posture written down (one sentence is enough — e.g. "100% local, no
      account, no data leaves the device unless you opt into recovery-phrase sync")
- [ ] Install / onboarding path tested by someone who isn't you
- [ ] Error reporting wired (L1+) — even a minimal client-side error logger
- [ ] Analytics baseline captured before announcing, if any
- [ ] "Good enough" bar defined as a finite checklist — launch when it's empty, not
      when it feels done
- [ ] Soft-launch first: one small community / friend group before any broad announcement
