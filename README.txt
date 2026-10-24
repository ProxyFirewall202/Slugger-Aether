SLUGGER (NEO) v0.6.6.1 — COMPLETE PACKAGE

PUBLISH TO GITHUB PAGES
1. Extract this ZIP.
2. Upload the contents of docs/ into your existing top-level docs/ folder in the GitHub repository. Do not create docs/docs/.
3. Keep GitHub Pages configured to branch main, folder /docs.
4. Commit/push and wait for deployment to finish.
5. On iPhone, fully close and reopen the installed PWA to refresh cached files.

BACKEND
No Cloudflare Worker, Firebase, TURN, or Metered configuration changes are required for this game-only release. Existing endpoints and secrets are preserved.

RELEASE HIGHLIGHTS
- Distinct procedural SVG art and animated presentation for equipment throughout the loadout, stats, set tracker, and loot reveal screens.
- Animated armor shell plates wrap the player while leaving the eyes exposed.
- Five-piece set passives and themed set-special attacks are active.
- Weapon identity affects projectile piercing, speed, size and explosive impact behaviour.
- End-of-run timer and damage-dealt stats fixed.
- Loot reveal screens display the equipment art, Warp icon, and per-box Warp amount. The final summary totals Warp correctly.
- Ten tiers remain displayed with Roman numerals; Lucky, Standard and Unlucky outcomes remain.

TESTING
All project JavaScript files were syntax-checked and package paths were checked. Real browser/device and live two-peer 1v1 testing are still recommended before considering multiplayer parity fully verified.

HOTFIX NOTE v0.6.6.1
This release fixes the Deploy here button triggering a maximum call stack error. It was caused by recursive function wrappers in the unique-gear module. The new package passes a simulated browser deployment test. No backend changes are required.
