SLUGGER NEO v0.5.3.1 — MOBILE CONTROLS HOTFIX

START HERE
Open START_HERE.txt for the publishing checklist.

PACKAGE LAYOUT
- docs/: the public GitHub Pages website; publish its contents to your repository’s top-level docs/ folder.
- cloudflare-worker/: server-side TURN endpoint source and setup documentation; do not upload it into the public docs/ folder.
- BEGINNER_GUIDE.txt: mobile controls, publishing, and testing guide.

WHAT’S NEW IN v0.5.3.1
- Hide touch controls on the hub, wave selection, auth screens, pause/summary screens and non-playing PvP phases.
- Improved device detection so full-size desktop PCs don't show touch controls merely because a browser reports touch points.
- Fix mobile hold-to-shoot so compatibility mouse events do not cancel the touch-held state.
- Align projectile origins with the displayed weapon muzzle.
- Slightly reduce mobile control sizes.

PUBLISHING
GitHub Pages should use branch main /docs. Publish all updated contents of docs/ together, including css/, js/, icons/, manifest.webmanifest, and index.html. The HTML adds a v0.5.3.1 cache-buster to CSS/JS paths so devices don't keep running stale modules. Preserve the synchronous JS load order; do not add async/defer.

TURN
The existing endpoint remains configured in docs/js/06-turn-peer-lifecycle.js. Normal game updates do not require changing Cloudflare Worker secrets.
