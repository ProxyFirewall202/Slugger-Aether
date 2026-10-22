SLUGGER NEO v0.5.3 — MOBILE CONTROLS RELEASE

START HERE
Open START_HERE.txt for the publishing checklist.

PACKAGE LAYOUT
- docs/: the public GitHub Pages website; publish the contents to your repository’s top-level docs/ folder.
- cloudflare-worker/: server-side TURN endpoint source and setup documentation; do not upload it into the public docs/ folder.
- BEGINNER_GUIDE.txt: mobile controls, publishing, and testing guide.

WHAT’S NEW IN v0.5.3
- Auto-detected touch controls on phones/tablets: virtual movement joystick, hold-to-shoot with nearest-target auto-aim, Special, and unlocked-element cycling.
- Responsive mobile layout and safe-area spacing for iOS.
- PC keyboard/mouse controls remain available, and the mobile overlay stays hidden on desktop pointer devices.
- Existing modular source and TURN Worker endpoint are preserved.

PUBLISHING
GitHub Pages should use branch main /docs. Publish all updated contents of docs/ together, including css/, js/, icons/, manifest.webmanifest, and index.html. Preserve the synchronous JS load order; do not add async/defer.

TURN
The existing endpoint remains configured in docs/js/06-turn-peer-lifecycle.js. Normal game updates do not require changing Cloudflare Worker secrets.
