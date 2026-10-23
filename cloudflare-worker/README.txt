Slugger NEO v0.5.4.2 — Cloudflare Worker deployment and login troubleshooting guide

WHY THIS UPDATE IS REQUIRED
The same Worker now serves both endpoints:
  GET  /ice-servers     existing Metered TURN configuration
  POST /username-token  username-only Firebase custom token

The HTML calls these stable addresses:
  https://slugger-turn-ice.tholloway540.workers.dev/ice-servers
  https://slugger-turn-ice.tholloway540.workers.dev/username-token

Do this once for v0.5.4.2. Ordinary future game releases do not require changing the Worker unless the Worker backend itself changes or a secret is rotated.

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
6. Click Add variable (or Add secret, depending on the dashboard view) and set the type to **Secret**. Select Production. Use this exact name:
   FIREBASE_SERVICE_ACCOUNT_JSON
7. Open the downloaded Google Cloud service-account JSON key file in Notepad, press Ctrl+A then Ctrl+C, and paste its entire contents into Value. It must begin with { and end with }. Do not paste the filename, the Firebase web config, just the private_key field, or a redacted copy. Do not put the contents in a plain Text variable.
8. Click Add secret and deploy / Add variable and deploy. Merely opening the form or navigating away does not save the secret.

IMPORTANT: The login screen error “Username service HTTP 503: Firebase service-account JSON is missing or invalid” means the Worker did not receive valid FIREBASE_SERVICE_ACCOUNT_JSON. The username request stops before an account is created. Updating index.html alone cannot fix that server configuration.

If Google Cloud asks to enable an API, enable Cloud Firestore API for the project. Do not grant broad Owner permissions when a narrower Firestore role is available.

D. VERIFY (v0.5.4.2)
1. Open https://slugger-turn-ice.tholloway540.workers.dev/health in a normal browser tab. This endpoint returns only non-secret setup statuses and is safe to view directly.
2. Look at usernameLoginSetupStatus:
   - "ready" means JSON is present and structurally valid; it does not verify Google permissions.
   - "missing" means the FIREBASE_SERVICE_ACCOUNT_JSON Production Secret is not set or is empty.
   - "invalid_json" means the secret value is not valid JSON. Paste the entire downloaded service-account JSON key file directly, without Markdown fences or extra text.
   - "missing_fields" means the JSON needs project_id, client_email, and private_key. You may have pasted the Firebase web config instead of a service-account key.
   - "invalid_private_key" means the private_key isn't a complete PEM key; create a new service-account key if needed and store the entire JSON.
3. If status is "ready" but sign-in still fails, check Google Cloud IAM permissions and make sure Cloud Firestore API is enabled for the same project. Check the Worker Logs for Google OAuth/Firestore errors. Do not paste secrets or logs containing sensitive values into public messages.
4. Open the game from the real GitHub Pages HTTPS address, enter a username of 3–20 characters, and select Continue with username. Successful login should take you to the hub.
5. Open Friends & network. Connection and chat diagnostics appear there.

IMPORTANT ACCOUNT BEHAVIOUR
- This is intentionally username-only: anyone who knows or guesses a username can enter that account and access its save, friend list, and DMs. Don't use sensitive or personal information as a username.
- The username mapping is case-insensitive after Unicode normalization. Existing account profiles are matched by username when exactly one old profile matches; duplicates are rejected rather than arbitrarily choosing a save.
- The stable SLUG-XXXX Friend ID is stored in the Firestore profile. An account should only be actively signed in on one device at a time because PeerJS requires a unique active peer ID. Signing into the same account on a second device while the first is online may report that the ID is in use.
- Friend lists synchronize when both players have username accounts. Existing browser-only contacts are best-effort migrated the first time an unscoped legacy cache is used; reconnect to a friend if they were not linked to a cloud account yet.
- DMs for two username accounts are written to Firestore and the latest 60 messages are displayed on each device. Guest mode and conversations with users who do not have cloud accounts cannot guarantee cross-device history.
- The Worker does not make the public username login private or resistant to impersonation; that is part of the explicitly requested no-password design.


V0.5.4.2 DIAGNOSTICS
- GET /health returns ok, originAccepted, and booleans indicating whether username/ TURN configuration values are present. It never returns secrets. Open it from the published GitHub Pages origin.
- ALLOWED_ORIGINS entries are normalized to scheme + hostname, so a pasted repository path is ignored; the live request Origin must still match exactly.
- The game now reports whether failure occurred while contacting Cloudflare, signing in with Firebase, or loading the cloud profile.


V0.5.4.2 DETAILS
- /health can be opened directly in a browser (no Origin header) and reports only boolean/status fields, never credential values. Cross-origin browser requests from unapproved origins remain blocked.
- /username-token returns precise safe setup statuses for a missing secret, malformed JSON, missing required fields, or an incomplete private-key PEM.
- If the screen still shows the v0.5.4.1 generic error, the Worker hasn't been replaced/deployed with this version yet.
- No username is created when the Worker returns a 503 configuration error. Fix the Cloudflare Secret first, then retry.


QUICK FIX FOR THE EXACT 503 ERROR
If the screen shows: “Username service HTTP 503: Username login is not configured: Firebase service-account JSON is missing or invalid”, do not keep retrying usernames. The Worker rejects the request before it can create or look up the account.

1. In Cloudflare Dashboard, open Workers & Pages > slugger-turn-ice > Settings > Variables and Secrets.
2. Select Production. Look for a SECRET with the exact name FIREBASE_SERVICE_ACCOUNT_JSON (underscores included).
3. If it is missing, create a service-account key in Google Cloud Console for the same project as Firebase (slugger-aether), then add its ENTIRE JSON file contents as that Worker Secret.
4. If it already exists but /health reports invalid_json or missing_fields, edit/update the Secret using the entire JSON key file. Don't use firebaseConfig from the HTML, and don't use the Metered API key.
5. Click the add/update secret and deploy button, wait for deployment to finish, then refresh /health and retry sign-in.

Open this diagnostic URL in a browser after deploying v0.5.4.2 Worker code:
  https://slugger-turn-ice.tholloway540.workers.dev/health
It intentionally reports setup status only and never returns the private key or other secret values. Expected usernameLoginSetupStatus is "ready". “ready” checks shape/required fields but does not prove IAM permissions; if sign-in still fails afterward, inspect Cloudflare Worker logs for Google OAuth/Firestore permission problems.
