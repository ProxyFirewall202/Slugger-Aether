SLUGGER (NEO) v0.6.0.4 — PHASE 1 CRATE & LOADOUT POLISH

CONTENTS
- docs/: GitHub Pages site content, including index.html, CSS, JS modules, icons and manifest.
- cloudflare-worker/: reference source for the existing Cloudflare Worker. It is included for backup; do not deploy it for this update.
- QUICK_START.txt: quick deployment/testing steps.
- CHANGELOG_V0.6.0.4.txt: changes made in this release.
- PHASE_PLAN.txt: Phase 1/2/3 scope.
- README.md: summary.

DEPLOY TO GITHUB PAGES
1. Download/extract the docs-only ZIP or open this package's docs/ folder.
2. Upload the CONTENTS of docs/ into the existing repository's top-level docs/ folder on branch main, replacing prior game files.
3. Keep index.html, manifest.webmanifest, css/, js/, and icons/ together.
4. Commit changes, then wait for GitHub Pages deployment.
5. Reload the game. If using the installed iPhone app, fully close and reopen it.

WHAT CHANGED
- Crate decryption no longer remains indefinitely in the opening state due to save-object normalisation changing object identity.
- Added a safety completion path for a reveal still in progress after the normal timer.
- Loadout statistics now include every owned equipment category with search/category/tier/equipped filters and metric sorting.
- Full unique per-item SVGs and animations are intentionally deferred to Phase 3 so art and behaviour are built together.

BACKEND
No Cloudflare Worker redeploy or Metered credential edit is needed for v0.6.0.4. The existing TURN endpoint remains in place.

VALIDATION
- All 12 JS modules and their concatenated script pass node --check.
- CSS parses successfully.
- Targeted Node VM test passed: crate state moves from opening (ph=1) to results (ph=2) even when hub/save normalization replaces S.
- Targeted stats-render test passed for weapons, shields, armor, charms and Spirit Slugs. Search/category/tier filter tests passed.
- ZIP integrity checks passed.
- Not verified: complete browser playthrough against live Firebase/PeerJS or live 1v1 network testing.

IMPORTANT
Stats are estimates. Weapon DPS uses base damage, attack interval and pellets. Spirit Slug DPS assumes 10 base player damage. Temporary buffs, element matchups and set bonuses are not included in ranking numbers.
