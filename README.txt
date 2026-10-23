Slugger (NEO) v0.6.0.2 — Phase 1 Menu Transition Hotfix
======================================================

ROOT CAUSE
The v0.6 modular split inadvertently omitted the shared HTML escaping helper `esc()` that existed in the previous combined game file. The signed-in hub builds a “Sign out (username)” button using esc(); the resulting ReferenceError interrupted menu HTML rendering after the hub overlay was shown, leaving a blank gradient.

WHAT CHANGED
- Restored the shared `esc()` helper in the first-loaded core/save/auth module.
- Made hub rendering defensive: invalid tabs are normalized, renderer failures fall back to the Deploys menu or a visible recovery panel.
- Changed the login-to-menu transition to render the hub before hiding the auth modal. If rendering fails, sign-in remains visible with a useful message.
- Bumped every local CSS and JS cache-busting identifier to `v=0.6.0.2-hotfix`, preventing mixed cached module versions.
- No economy, crate, loadout, Firebase API, Worker, or TURN behaviour was intentionally changed.

DEPLOY TO GITHUB PAGES
1. Extract the Docs ZIP, or open `docs/` in the complete archive.
2. Upload the CONTENTS of `docs/` into the existing top-level `docs/` folder in the GitHub repository on `main`, replacing the files in place.
3. Keep `index.html`, `manifest.webmanifest`, `css/`, `js/`, and `icons/` together.
4. Commit changes; leave GitHub Pages set to `main` / `docs`.
5. Fully reload the website. For the installed iOS PWA, close it completely and reopen it after deployment.

CLOUDFLARE
No Worker update is required. This hotfix is client-side only. Existing TURN endpoint preserved:
https://slugger-turn-ice.tholloway540.workers.dev/ice-servers

TEST AFTER DEPLOYMENT
- Auto sign-in with an existing account should reach the hub.
- Incognito/manual sign-in should reach the hub.
- Guest mode should still reach the hub.
- If another menu module fails, the game should show recovery information instead of a blank gradient.

If it still fails, capture the exact on-screen message and browser console error (F12 -> Console on desktop). Never share Firebase service-account JSON or private keys.
