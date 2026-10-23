Slugger NEO v0.5.4.1 — Cloudflare Worker deployment guide

WHY THIS UPDATE IS REQUIRED
The same Worker now serves both endpoints:
  GET  /ice-servers     existing Metered TURN configuration
  POST /username-token  username-only Firebase custom token

The HTML calls these stable addresses:
  https://slugger-turn-ice.tholloway540.workers.dev/ice-servers
  https://slugger-turn-ice.tholloway540.workers.dev/username-token

Do this one time for v0.5.4.1. Ordinary future game releases do not require changing the Worker unless the Worker backend itself changes or a secret is rotated.

BEFORE STARTING
- Keep the current Metered variables and secret; do not delete them.
- Know the exact GitHub Pages origin (scheme + hostname only), e.g. https://YOURNAME.github.io. Do not include the repository path.
- Do not upload this folder, the Firebase service-account JSON, or any credentials to the public GitHub Pages docs/ folder.

A. UPDATE THE EXISTING WORKER
1. Sign into https://dash.cloudflare.com/.
2. Open Workers & Pages, then open the existing Worker named slugger-turn-ice.
3. Choose Edit code.
4. Open this file (cloudflare-worker/worker.js) on your computer. Copy all its text.
5. Replace all code in the Cloudflare editor with worker.js's contents.
6. Save and deploy. The old /ice-servers route is still included in this code.

B. KEEP/SET THESE WORKER VARIABLES
Under Settings > Variables and Secrets, ensure Production has:
- METERED_DOMAIN (Text): exact Metered app hostname, such as yourapp.metered.live; no https:// or path.
- ALLOWED_ORIGINS (Text): exact GitHub Pages origin, such as https://YOURNAME.github.io. If you have a custom game domain too, comma-separate the origins.

Keep the existing Production METERED_CREDENTIAL_API_KEY as a Secret. Preview does not need to be selected for the live GitHub Pages site. After any setting changes, deploy.

C. ADD FIREBASE SERVICE ACCOUNT ACCESS (ONE TIME)
The Worker uses a Google/Firebase service account to make a username-to-Firebase-UID index and mint Firebase custom tokens. Do not put this JSON in index.html or GitHub.

1. Open the Google Cloud Console for the Firebase project used by Slugger NEO (project ID shown in the HTML's firebaseConfig, currently slugger-aether).
2. Go to IAM & Admin > Service Accounts. Create a dedicated service account such as slugger-username-login, or use a project service account that is approved for this purpose.
3. Grant the service account the Cloud Datastore User role (roles/datastore.user) so it can read and write the Firestore usernameIndex collection and look up legacy user profiles. Only grant the role in the Slugger Firebase project.
4. Create/download a JSON key for that service account. Keep the file private on your computer. Never commit it to GitHub or send it in chat.
5. Return to Cloudflare > Workers & Pages > slugger-turn-ice > Settings > Variables and Secrets.
6. Add a new variable of type Secret:
   Name: FIREBASE_SERVICE_ACCOUNT_JSON
   Value: paste the ENTIRE JSON file contents, beginning with { and ending with }.
7. Deploy the Worker after adding the secret.

If Google Cloud asks to enable an API, enable Cloud Firestore API for the project. Do not grant broad Owner permissions when a narrower Firestore role is available.

D. VERIFY
1. Open the game from the real GitHub Pages HTTPS address, not a local file or preview URL.
2. On the username login screen, enter a username of 3–20 characters and select Continue with username.
3. Successful login should take you to the hub. If login fails, inspect the browser console and Cloudflare Worker logs. Common causes are: wrong ALLOWED_ORIGINS, missing/invalid FIREBASE_SERVICE_ACCOUNT_JSON, missing Firestore role/API, or service-account JSON copied incompletely.
4. Open Friends & network. Connection and chat diagnostics appear there.

IMPORTANT ACCOUNT BEHAVIOUR
- This is intentionally username-only: anyone who knows or guesses a username can enter that account and access its save, friend list, and DMs. Don't use sensitive or personal information as a username.
- The username mapping is case-insensitive after Unicode normalization. Existing account profiles are matched by username when exactly one old profile matches; duplicates are rejected rather than arbitrarily choosing a save.
- The stable SLUG-XXXX Friend ID is stored in the Firestore profile. An account should only be actively signed in on one device at a time because PeerJS requires a unique active peer ID. Signing into the same account on a second device while the first is online may report that the ID is in use.
- Friend lists synchronize when both players have username accounts. Existing browser-only contacts are best-effort migrated the first time an unscoped legacy cache is used; reconnect to a friend if they were not linked to a cloud account yet.
- DMs for two username accounts are written to Firestore and the latest 60 messages are displayed on each device. Guest mode and conversations with users who do not have cloud accounts cannot guarantee cross-device history.
- The Worker does not make the public username login private or resistant to impersonation; that is part of the explicitly requested no-password design.


v0.5.4.1 DIAGNOSTICS
- GET /health returns ok, originAccepted, and booleans indicating whether username/ TURN configuration values are present. It never returns secrets. Open it from the published GitHub Pages origin.
- ALLOWED_ORIGINS entries are normalized to scheme + hostname, so a pasted repository path is ignored; the live request Origin must still match exactly.
- The game now reports whether failure occurred while contacting Cloudflare, signing in with Firebase, or loading the cloud profile.
