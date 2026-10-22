SLUGGER NEO v0.5.3 — GITHUB PAGES /docs SOURCE

RELEASE NOTES
This release adds touch-first mobile controls and responsive mobile UI to the v0.5.2 modular baseline. PC keyboard/mouse controls are retained. No intentional changes were made to core gameplay balance, PvP rules, save structure, or networking protocols.

PUBLISHING
Put this docs/ folder at the top level of your existing repository, then choose branch main /docs in Settings > Pages. If docs/ already exists, replace its contents with the contents of this release’s docs/ folder, preserving all subfolders.

FILES
- index.html: page markup, PWA metadata, touch-control markup, external dependencies and ordered script loading
- css/styles.css: desktop styles plus responsive mobile and touch-control styling
- js/: 12 ordered classic JavaScript files split by subsystem
- manifest.webmanifest and icons/: PWA assets

TURN
The permanent Worker endpoint is already configured in js/06-turn-peer-lifecycle.js:
https://slugger-turn-ice.tholloway540.workers.dev/ice-servers
The Metered API key remains a Cloudflare Worker Secret and is not in the public site.

PUBLISHING UPDATES
Publish the updated docs/ contents (all changed JS/CSS assets as well as index.html). Do not publish only index.html if linked JS/CSS files have changed. Preserve TURN_CREDENTIALS_ENDPOINT in js/06-turn-peer-lifecycle.js. Ordinary game updates do not require changing Worker secrets.

LOAD ORDER
index.html loads js/01 through js/12 synchronously as classic scripts. Module 11 initializes touch controls before module 12 starts the main loop. Do not add async/defer or reorder scripts; inline handlers and shared global declarations depend on this order.

MOBILE CONTROLS
On touch-first devices, controls appear during active gameplay. The left virtual joystick controls movement; hold SHOOT for continuous nearest-enemy auto-aim fire; tap SPECIAL for the equipped special; use ‹ / › to cycle unlocked elements. Hide/Show controls saves the preference in that browser. The original keyboard and mouse controls remain available on PC. See MOBILE_CONTROLS.txt for details.
