SLUGGER (NEO) v0.6.2 — PHASE 2: MYSTERY CRATES & NESTED RARITY

This release is built from the v0.6.0.4 Phase 1 build. Phase 1 economy cleanup and menu structure are preserved. Phase 2 implements crate families/discovery, nested rarity, crate visuals/opening effects, expanded equipment stats and resilience for a rare PvP runtime crash. Phase 3 remains deferred.

WHAT'S IN THIS PACKAGE
- docs/: complete GitHub Pages site. Upload its CONTENTS into your repository's top-level docs/ folder.
- cloudflare-worker/: reference copy of the existing Worker source and its README. It is unchanged for this release; do not redeploy it for Phase 2.
- QUICK_START.txt: concise publish instructions.
- CHANGELOG_V0.6.2.txt: release changes.
- PHASE_PLAN.txt: completed/deferred scope.

PUBLISH TO GITHUB PAGES
1. Extract the archive.
2. Open the docs/ folder.
3. Upload every item INSIDE docs/ to the top level of the docs/ folder in your existing GitHub repository. Do not create docs/docs/.
4. Commit the changes to main.
5. Keep GitHub Pages set to main -> /docs.
6. Hard-reload the site. For the installed iOS PWA, close it fully and reopen it.

NO CLOUDFLARE WORKER CHANGE IS REQUIRED FOR THIS RELEASE.
The Metered TURN endpoint remains:
https://slugger-turn-ice.tholloway540.workers.dev/ice-servers
The Worker directory in this package is a reference/backup copy only. No Metered credentials or Firebase service-account secrets are included.

PHASE 2 CONTENT
- 38 specialized crate types with set/category filters and nested Common, Uncommon, Rare, and Legendary rarity rolls.
- Only owned or discovered crates are listed in the crate collection and discovered drop-rate view. Basic Wood and Iron purchase options remain available.
- Procedural crate SVG previews and type-specific particle/opening effects.
- Rarity-aware equipment stats and expanded sorting/filtering for weapons, shields, armor, charms/boosts, and Spirit Slugs.
- Crate reveal transaction fix: save normalization no longer causes the reveal timer to abort, and the rolled rarity is passed to the reveal state.
- Defensive combat/network data sanitation for projectile hit history and enemy snapshots to reduce recurrence of the reported rare 1v1 crash.

VALIDATION
All 12 JavaScript modules and the combined script pass syntax checks. CSS parsing reports no parse errors. Simulated browser smoke tests cover game boot, crate discovery filtering, crate reveal completion/rarity, equipment stats filters, all 38 SVG variants, drop-table coverage, a malformed PvP projectile payload, and a short simulated run. This is not a live two-device PeerJS/Firebase test; perform a real multiplayer run before treating the release as fully verified.
