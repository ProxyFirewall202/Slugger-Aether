SLUGGER (NEO) v0.6.6.2 — UNIQUE EQUIPMENT ART HOTFIX

START HERE
- QUICK_START.txt has the publishing steps.
- CHANGELOG_V0.6.6.2.txt explains the art changes and validation.
- docs/ contains the GitHub Pages site.
- cloudflare-worker/ is a reference copy and does not need deployment for this update.

PUBLISH TO GITHUB PAGES
1. Extract the release ZIP.
2. Open docs/ in the extracted folder.
3. Upload the CONTENTS of docs/ to your existing top-level docs/ directory on the main branch, replacing the previous game files. Do NOT create docs/docs/.
4. Keep index.html, css/, js/, icons/ and manifest.webmanifest together.
5. Commit to main and keep GitHub Pages set to main -> /docs.
6. Reload the site; fully close and reopen the installed iOS PWA if it shows cached content.

NO BACKEND CHANGE
No Cloudflare Worker redeploy, Firebase edit, Metered credential change or TURN endpoint change is needed. The existing endpoint is preserved:
https://slugger-turn-ice.tholloway540.workers.dev/ice-servers

TESTING NOTE
The catalogue SVGs and JS syntax passed local automated tests. This build still needs a live PC/iPhone gameplay smoke-test, especially for the in-run armor shell and the PvP loot sequence.
