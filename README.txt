Slugger (NEO) v0.6.0.3 — Phase 1 Runtime Freeze Hotfix
=====================================================

ROOT CAUSE FOUND
The spirit-slug drone firing path still called rk(S.eq.p), an obsolete reinforcement-rank multiplier removed in Phase 1. When an awakened spirit slug was equipped and acquired a target, the first drone shot could throw ReferenceError: rk is not defined. Since this happened inside requestAnimationFrame without a catch/final scheduling path, the loop stopped and the game appeared frozen.

WHAT CHANGED
- Removed the obsolete rk multiplier from spirit-slug drone damage; Phase 1 removed reinforcement ranks, so drone damage now uses the normal weapon/equipment damage factor only.
- Added a top-level runtime guard around the main animation loop. Unexpected runtime errors now pause the game and show a diagnostic message/stack instead of silently stopping the loop. The error is also logged to the browser console as [Slugger runtime fault — v0.6.0.3].
- Bumped CSS/JS cache-busting identifiers to v0.6.0.3-hotfix.
- Preserved v0.6 Phase 1 economy, crate/loadout menus, account/social code, mobile controls, and TURN endpoint.
- No Cloudflare Worker update is required.

DEPLOY
1. Extract the Docs ZIP or open docs/ inside the complete ZIP.
2. Upload the CONTENTS of docs/ into the existing repository's top-level docs/ folder on main, replacing the files in place.
3. Keep index.html, manifest.webmanifest, css/, js/, and icons/ together.
4. Commit and keep GitHub Pages set to main /docs.
5. Fully reload the page; close and reopen the installed iOS PWA after publishing.

TEST
- Start a single-player run with an awakened Spirit Slug equipped. Wait for it to acquire enemies and fire.
- Confirm the run continues and the spirit slug shoots normally.
- If any other unexpected runtime error occurs, the game should pause and show the actual diagnostic instead of remaining frozen. Capture that message for the next hotfix.
- Also test a normal run without a spirit slug, the hub tabs, and 1v1 if available.

TURN ENDPOINT (preserved)
https://slugger-turn-ice.tholloway540.workers.dev/ice-servers
