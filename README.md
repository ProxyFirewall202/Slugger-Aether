Slugger (NEO) v0.6 — Phase 1 Release Package
============================================

This is Phase 1 ONLY of v0.6, built from the v0.5.4.3 modular game. Phase 2 (expanded/discovered crate families and nested rarity/VFX) and Phase 3 (unique per-item animated SVG behaviours, animated shell armour, and online-friend toasts) are intentionally NOT included yet.

PACKAGE CONTENTS
- docs/                         GitHub Pages website, ready for main /docs
- cloudflare-worker/             Current v0.5.4.3 Worker source, included for reference/backup
- README.txt and README.md        This guide
- QUICK_START.txt                 Short deployment checklist
- CHANGELOG_V0.6_PHASE1.txt       What changed in Phase 1
- PHASE_PLAN.txt                  Phase boundaries and deferred work

WHAT CHANGED IN PHASE 1
- Removed Cells, Purified Warp, weapon-level progression, and reinforcement ranks/mechanics from the current economy and combat calculations. Existing obsolete save fields are stripped during save normalization. No refunds are issued.
- Remaining Warp, Protons, Keys, Fusion Keys, Souls, checkpoints, upgrades, equipment, crate counts, and duplicate inventory are preserved as applicable.
- Removed obsolete Purified Warp/Cells crate rewards and old reinforcement/weapon upgrade actions.
- Crate Decryption is now three sub-tabs: Crates & Decryption, Key Crafting Terminal, and Quantum Forge. The owned collection only lists crate types the player owns (including the currently opening crate); the drop-rate popup is also limited to owned crates. Basic purchase buttons remain available so a player can buy their first Wood/Iron crate.
- Loadout is now split into Equip Slot Grid, Weapon Stats & DPS Rankings, and Sets & Progress. Owned gear is grouped by weapons, shields, armor, boosts/charms, and spirit slugs. Equipment slots, gear cards, weapon rankings, and set pieces render SVG item previews.
- The 1v1 upgrade status/timer has its own flow-positioned strip instead of competing with the top HUD, reducing overlap with currency displays.
- Existing mobile controls, account/login/social code, save ownership separation, and the configured Metered TURN Worker endpoint are preserved.

VISUAL SCOPE NOTE
The Phase 1 item and crate previews are procedural SVG illustrations, tinted by category/set/element. The full unique SVG design/animation treatment for every item/crate and custom crate opening effects belong to the deferred Phase 2/3 work.

DEPLOY TO GITHUB PAGES
1. Extract the package.
2. Open docs/.
3. Upload the CONTENTS of docs/ into your repository's existing top-level docs/ folder on the main branch, replacing the previous release files. Keep the css/, js/, and icons/ folders together with index.html and manifest.webmanifest.
4. Commit to main and keep GitHub Pages set to main /docs.
5. Reload the game on desktop and mobile. If testing an installed PWA, fully close and reopen it after deployment.

CLOUDFLARE WORKER
Phase 1 does not change the Worker API. Do NOT redeploy cloudflare-worker/ for this release. It is included in the complete package only as a reference/backup. Your current Worker URL and Metered/Firebase secrets remain unchanged:
https://slugger-turn-ice.tholloway540.workers.dev/ice-servers

VALIDATION
All 12 JavaScript modules pass Node syntax validation, as does the combined script. Static checks confirm all local asset references resolve, retired economy symbols are no longer used in active logic, CSS parses without errors, and the Worker URL is preserved. This environment did not complete a headless Chromium smoke test, so full browser and real two-player validation must still be done after publishing.

SAFETY / ACCOUNT NOTE
Username-only accounts remain passwordless under the existing design; anyone who knows a username may access that account. Never publish your Firebase service-account JSON/private key, Metered credentials, or Cloudflare secrets.
