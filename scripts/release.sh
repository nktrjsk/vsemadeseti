#!/usr/bin/env bash
#
# One-command release for vsemadeseti (see RELEASE.md / personal release playbook).
#
#   gate  →  cut (version + changelog + tag)  →  ship (build + Netlify deploy)
#
# This script is the ONLY thing that deploys to production. Netlify auto-publish
# on push to main must be OFF, so prod only changes when a release is cut here.
#
# Versioning: CalVer  YYYY.MM[.PATCH]  — first release of a month is YYYY.MM,
# subsequent ones in the same month get .1, .2, …  Tags are prefixed with `v`.
#
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

say()  { printf '\n\033[1;36m▸ %s\033[0m\n' "$*"; }
die()  { printf '\n\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# ── Preflight ────────────────────────────────────────────────────────────────
[ "$(git rev-parse --abbrev-ref HEAD)" = "main" ] || die "Not on main. Releases are cut from main only."
git diff --quiet && git diff --cached --quiet || die "Working tree is dirty. Commit or stash first."
say "Fetching tags & checking main is up to date"
git fetch --quiet origin main --tags
LOCAL=$(git rev-parse @); REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "$LOCAL")
[ "$LOCAL" = "$REMOTE" ] || die "Local main differs from origin/main. Pull/push first."

# ── Trigger ──────────────────────────────────────────────────────────────────
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
RANGE=${LAST_TAG:+$LAST_TAG..HEAD}
say "Changes since ${LAST_TAG:-the beginning}:"
LOG=$(git log ${RANGE:-} --oneline)
[ -n "$LOG" ] || die "No new commits since ${LAST_TAG:-start}. Nothing to release."
echo "$LOG"

# ── Compute CalVer version ───────────────────────────────────────────────────
BASE=$(date +%Y.%m)                      # e.g. 2026.06
MAXP=-1
while IFS= read -r t; do
  [ -n "$t" ] || continue
  suffix="${t#v$BASE}"                   # "" for v2026.06, ".3" for v2026.06.3
  if [ -z "$suffix" ]; then p=0; else p="${suffix#.}"; fi
  [[ "$p" =~ ^[0-9]+$ ]] && (( p > MAXP )) && MAXP=$p
done < <(git tag -l "v$BASE" "v$BASE.*")
if (( MAXP < 0 )); then VERSION="$BASE"; else VERSION="$BASE.$((MAXP+1))"; fi
TAG="v$VERSION"
say "New version: $TAG"

# ── Gate ─────────────────────────────────────────────────────────────────────
say "Gate: type-check + production build"
npm run build
say "Build green. Smoke-test the bundle before continuing:"
echo "    npm run preview   # then run the smoke list in RELEASE.md against it"
read -r -p $'\nDid the smoke list pass on the built bundle? [y/N] ' ok
[ "$ok" = "y" ] || [ "$ok" = "Y" ] || die "Smoke list not confirmed — release blocked."

# ── Cut: changelog ───────────────────────────────────────────────────────────
DATE=$(date +%Y-%m-%d)
say "Opening CHANGELOG.md — write user-meaningful notes (not commit messages)"
TMP_NOTES=$(printf '## %s — %s\n\n%s\n' "$VERSION" "$DATE" "$(echo "$LOG" | sed 's/^/- /')")
HEADER=$'# Changelog\n\nAll notable changes, newest first. Source of truth; user-facing notes are distilled from this.\n'
if [ -f CHANGELOG.md ]; then BODY=$(tail -n +"$(($(grep -n '^## ' CHANGELOG.md | head -1 | cut -d: -f1 || echo 5)))" CHANGELOG.md 2>/dev/null || echo ""); else BODY=""; fi
printf '%s\n%s\n\n%s\n' "$HEADER" "$TMP_NOTES" "$BODY" > CHANGELOG.md
"${EDITOR:-vi}" CHANGELOG.md
git diff --quiet CHANGELOG.md && die "CHANGELOG.md unchanged — aborting (edit it to confirm the entry)."

# ── Cut: version bump + commit + annotated tag ───────────────────────────────
say "Bumping package.json to $VERSION"
node -e "const f='package.json',p=require('./'+f);p.version='$VERSION';require('fs').writeFileSync(f,JSON.stringify(p,null,2)+'\n')"
git add package.json CHANGELOG.md
git commit -m "release: $VERSION"
git tag -a "$TAG" -m "Release $VERSION"
say "Tagged $TAG"

# ── Ship ─────────────────────────────────────────────────────────────────────
say "Pushing main + tag"
git push origin main
git push origin "$TAG"
say "Deploying to Netlify production (this build's dist/)"
npx --yes netlify-cli deploy --prod --dir=dist
say "Shipped $TAG."

# ── Verify / Listen ──────────────────────────────────────────────────────────
cat <<EOF

Next:
  • VERIFY on production — run the golden-path smoke item on the live site,
    including the installed/offline PWA path.
  • Rollback if needed: Netlify deploy history → publish the previous good deploy.
  • LISTEN for 24h (L1 window) before starting new work.
  • Announce: in-app "what's new" + a GitHub release on $TAG, distilled from CHANGELOG.md.
EOF
