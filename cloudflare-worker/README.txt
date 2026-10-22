Slugger NEO — Cloudflare Worker for TURN ICE configuration

PURPOSE
This Worker keeps the Metered credential-scoped API key in a server-side Cloudflare Secret. The published game calls this Worker for ICE server configuration. The public game HTML contains only the Worker URL, not the Metered API key.

ONE-TIME SETUP
1. In Cloudflare, open Workers & Pages and create a Worker named `slugger-turn-ice`.
2. Deploy `worker.js` (or deploy from this folder with Wrangler).
3. Set these Worker variables:
   - METERED_DOMAIN = the exact app hostname shown in Metered Developers, e.g. yourapp.metered.live
   - ALLOWED_ORIGINS = your GitHub Pages origin, e.g. https://yourusername.github.io (origin only, no path). Add your custom domain origin too if needed, comma-separated.
4. Add a Worker Secret named `METERED_CREDENTIAL_API_KEY` using the API key for your active Metered TURN credential. Do not use the account-wide Metered Secret Key.
5. Deploy the Worker, then copy its exact endpoint URL ending in `/ice-servers`, Your current endpoint is `https://slugger-turn-ice.tholloway540.workers.dev/ice-servers`.
6. In `docs/index.html`, the `TURN_CREDENTIALS_ENDPOINT` constant is already set to the current deployed endpoint. This is the one-time URL wiring step. Keep that URL stable and preserve the constant in future game builds.
7. Put the `docs/` folder at the repository top level and set GitHub Pages to branch `main` / folder `/docs`. The folder intentionally contains NO turn-config.json; the endpoint is defined directly in index.html.

AFTER SETUP
For routine game-code updates: publish the new index.html. No separate config JSON is required. Keep the Worker URL constant unchanged in future versions. The Metered API key stays in Cloudflare and does not need to be re-entered for ordinary game updates.

Only update the Worker Secret if you deliberately rotate/revoke the Metered credential or it is compromised. If you change the Worker URL or your GitHub Pages origin, you must update the endpoint constant or ALLOWED_ORIGINS respectively. Browser clients necessarily receive TURN username/password data returned by Metered so WebRTC can authenticate; this does not expose the Metered API key.

SECURITY
A TURN credential password was previously posted in chat; revoke/delete that credential and use a new one. Do not commit a Metered key or account secret to the repository. CORS restricts normal browser access by Origin, but it is not authentication against scripts/curl; consider Cloudflare rate limits and monitor the Metered quota.
