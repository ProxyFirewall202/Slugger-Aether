Slugger NEO PWA — GitHub Pages /docs publish folder

This folder is intended to be the /docs publishing source on the main branch.
Files at this folder's top level:
- index.html
- manifest.webmanifest
- icons/

The Worker endpoint is already configured in index.html:
https://slugger-turn-ice.tholloway540.workers.dev/ice-servers

INITIAL PUBLISH
1. Put this entire docs/ folder at the top level of your GitHub repository.
2. In repository Settings > Pages, choose Deploy from a branch, branch main, folder /docs, then Save.
3. Wait for the deployment to complete.

FUTURE UPDATES
Publish the new game as docs/index.html and preserve the TURN_CREDENTIALS_ENDPOINT constant exactly. No turn-config.json exists and the Metered API key is not in this folder. Keep manifest.webmanifest and icons/ alongside index.html.
