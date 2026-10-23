Slugger (NEO) v0.6.0.1 — Phase 1 Hotfix
======================================

PURPOSE
This is a targeted hotfix for v0.6 Phase 1. It fixes a JavaScript ReferenceError on the username sign-in screen: `FK is not defined`.

ROOT CAUSE
During the v0.6 Phase 1 refactor, the legacy storage-key constants `FK` (friend cache) and `PK` (PeerJS Friend ID) were removed from their original hub file but not re-declared where the networking module uses them. The networking module now declares both constants before any networking or account actions use them.

WHAT CHANGED
- Defined `FK='slugger_neo_friends_v1'` and `PK='slugger_neo_peerid'` in the networking module.
- Updated CSS/JS cache-busting query strings to v0.6.0.1-hotfix so browsers fetch the fixed files.
- No intentional gameplay, UI design, economy, save migration, Firebase, or Worker behaviour changes.
- Existing TURN endpoint is preserved.

DEPLOY TO GITHUB PAGES
1. Extract the Docs ZIP, or use the `docs/` folder in this complete package.
2. Upload the CONTENTS of `docs/` into the existing top-level `docs/` folder in the GitHub repository on `main`, replacing the previous files.
3. Keep `index.html`, `manifest.webmanifest`, `css/`, `js/`, and `icons/` together.
4. Commit changes and leave GitHub Pages set to `main` / `docs`.
5. Reload the website. For the installed iOS PWA, fully close and reopen it after deployment.

CLOUDFLARE
No Worker update is required. This fix is in the game’s client-side JavaScript only. The `cloudflare-worker/` folder in the complete archive is a reference/backup; do not upload it into the public docs folder or redeploy it for this hotfix.
The existing TURN endpoint remains:
https://slugger-turn-ice.tholloway540.workers.dev/ice-servers

VALIDATION
- All 12 JavaScript modules pass `node --check`.
- Combined JavaScript syntax passes `node --check`.
- The `FK` and `PK` declarations each occur once.
- All local CSS, script, manifest, and icon references resolve.
- PWA manifest JSON parses successfully.
- No live browser/Firebase/PeerJS end-to-end test was possible here; verify username sign-in after deployment.

SECURITY
Never publish Firebase service-account JSON, private keys, Metered credentials, or Cloudflare secrets. Username-only accounts remain passwordless under the current design.
