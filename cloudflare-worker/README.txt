Slugger NEO v0.5.4.3 — Cloudflare Worker setup and account creation

WHAT CHANGED
This Worker retains your existing TURN and username-sign-in routes and adds a separate username-registration route:
  GET  /ice-servers          Retrieves Metered TURN ICE configuration
  GET  /health               Reports safe setup diagnostics
  POST /username-token      Signs in to an existing username account
  POST /username-register   Creates a new username account and returns a Firebase custom token

The fixed game endpoints are:
  https://slugger-turn-ice.tholloway540.workers.dev/ice-servers
  https://slugger-turn-ice.tholloway540.workers.dev/username-token
  https://slugger-turn-ice.tholloway540.workers.dev/username-register

ONE-TIME UPDATE
1. Open https://dash.cloudflare.com/ and choose Workers & Pages > slugger-turn-ice > Edit code.
2. Open this file (worker.js) in a text editor, copy all its contents, replace the editor contents, and click Save and deploy.
3. Preserve all existing Production variables/secrets. No new secret is required by v0.5.4.3:
   - METERED_DOMAIN (Text)
   - ALLOWED_ORIGINS (Text)
   - METERED_CREDENTIAL_API_KEY (Secret)
   - FIREBASE_SERVICE_ACCOUNT_JSON (Secret)
4. Wait for deployment to finish.

The service account should have Cloud Datastore User (roles/datastore.user) in the Firebase project's Google Cloud project. This permits Firestore REST reads/writes to usernameIndex and users. Keep the JSON key private: never paste it in this file, HTML, GitHub Pages, or chat.

HOW THE TWO BUTTONS WORK
- Sign in submits to /username-token. Existing usernames are resolved from the usernameIndex collection, with a legacy users collection lookup for older profiles. An unknown username returns HTTP 404 and the game tells the player to select Create account.
- Create account submits to /username-register. It validates the username (3–20 characters; no slash or control characters), checks the existing username index and legacy accounts, rejects duplicates with HTTP 409, reserves the username index, creates the initial users/{uid} profile with username, usernameLower, a stable SLUG-XXXX Friend ID and an empty friends list, then returns a Firebase custom token.
- After Firebase signs in with the custom token, the game loads that profile, preserves the Friend ID, and loads cloud save/social data.
- Username-only login deliberately has no password. Anyone who knows a username can sign into that account. Do not use this for sensitive/private information.

GITHUB PAGES UPDATE
1. Extract the v0.5.4.3 complete package.
2. Upload the CONTENTS of docs/ into your repository's top-level docs/ folder (main branch). Keep index.html, css/, js/, icons/, and manifest.webmanifest together.
3. Do not upload cloudflare-worker/ or this Worker source into the public docs/ folder.
4. Keep GitHub Pages set to main /docs.

TESTING
1. Open https://slugger-turn-ice.tholloway540.workers.dev/health. usernameLoginSetupStatus should read "ready". This validates the secret's structure only, not all permissions.
2. Publish the updated docs files.
3. Use a new, unused username and press Create account. It should register and enter the hub.
4. Sign out, then Sign in with that username. The Friend ID should remain the same.
5. Try Create account with the same username again. It should return “That username already exists”.
6. Try Sign in with a name that does not exist. It should explain that Create account is needed.

TROUBLESHOOTING
- HTTP 503: check the Worker Secret FIREBASE_SERVICE_ACCOUNT_JSON and its Google Cloud permissions, and check Worker Logs. Never post the private key.
- HTTP 403 Origin not allowed: set ALLOWED_ORIGINS to the exact GitHub Pages origin (scheme and hostname only, e.g. https://yourname.github.io), not the repo path. Multiple origins can be comma-separated.
- HTTP 409: username already exists or a concurrent registration won the race. Try Sign in, or choose another name.
- HTTP 404 on Sign in: username does not exist; use Create account.
- If registration returns HTTP 503 after the index is written, try Sign in once; a subsequent attempt may report the username already exists if the account profile completed. Check the Worker Logs if it does not.

SECURITY / CONFIGURATION NOTES
- No Metered or Firebase secrets are added to the public HTML.
- TURN configuration is unchanged and still uses the existing Metered endpoint.
- No new Cloudflare variable is required.
