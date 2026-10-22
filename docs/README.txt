SLUGGER NEO v0.5.2 — GITHUB PAGES /docs SOURCE

This folder is the website source for GitHub Pages. Put docs/ at the top level of your repository, then choose branch main /docs in Settings > Pages.

FILES
- index.html: page structure, PWA metadata, dependency references and ordered JS loading
- css/styles.css: extracted original CSS rules (unchanged)
- js/: 11 ordered classic JavaScript files split by subsystem
- manifest.webmanifest and icons/: PWA assets

TURN
The permanent Worker endpoint is already configured in js/06-turn-peer-lifecycle.js:
https://slugger-turn-ice.tholloway540.workers.dev/ice-servers
The Metered API key remains a Cloudflare Worker Secret and is not in the public site.

PUBLISHING UPDATES
For a modular release, publish the updated docs/ contents (all changed JS/CSS assets as well as index.html). Do not publish only index.html if any linked JS/CSS files have changed. Preserve the TURN_CREDENTIALS_ENDPOINT constant in js/06-turn-peer-lifecycle.js. Ordinary game updates do not require changing Worker secrets.

LOAD ORDER
index.html loads js/01 through js/11 synchronously as classic scripts. Do not add async/defer or reorder them; existing inline handlers and the shared global scope depend on this order.
