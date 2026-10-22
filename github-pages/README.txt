Slugger NEO PWA — publish-only after one-time TURN setup

This folder contains index.html, manifest.webmanifest and icons/. There is no turn-config.json; the stable Worker endpoint is configured once in the HTML constant TURN_CREDENTIALS_ENDPOINT.

ONE-TIME BEFORE FIRST PUBLISH
1. Deploy the Cloudflare Worker using ../cloudflare-worker/README.txt.
2. Edit index.html once: replace the placeholder value of TURN_CREDENTIALS_ENDPOINT with the exact deployed Worker URL ending in /ice-servers.
3. Upload the contents of this folder to your GitHub Pages publish root.

FUTURE GAME UPDATES
For normal game updates, publish the updated index.html (and any assets that changed). Keep TURN_CREDENTIALS_ENDPOINT intact. No separate config file or Metered API key edit is needed for each release. The Metered API key remains a Cloudflare Worker Secret.

If future updates are made by an assistant, provide this configured index.html as the source and ask that TURN_CREDENTIALS_ENDPOINT be preserved verbatim.
