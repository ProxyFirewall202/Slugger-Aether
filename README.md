Slugger NEO v0.5.4.3 — Complete Release Package

THIS PACKAGE CONTAINS
- docs/                 Website files to publish to GitHub Pages main /docs
- cloudflare-worker/    Worker source and detailed Worker instructions
- README.txt            Main guide (this file)
- QUICK_START.txt       Short checklist
- CHANGELOG_V0.5.4.3.txt Release summary

WHAT V0.5.4.3 DOES
The initial screen has separate Sign in and Create account buttons. Sign in only works for existing usernames. Create account registers a new username, reserves its case-normalized name, makes the first Firestore profile and a stable Friend ID, then signs the player in.

IMPORTANT: THIS RELEASE NEEDS A ONE-TIME WORKER UPDATE
The game has a new endpoint dependency: POST /username-register. Your existing Worker must be updated once or the Create account button will return 404. No new secret/variable is required; preserve your current Metered and Firebase secrets.

DEPLOY IN THIS ORDER
1. CLOUDFLARE: Go to https://dash.cloudflare.com/ > Workers & Pages > slugger-turn-ice > Edit code. Replace the code with cloudflare-worker/worker.js and Save and deploy. Preserve existing Production variables/secrets. See cloudflare-worker/README.txt.
2. GITHUB PAGES: Upload the contents of docs/ to your repository's top-level docs/ folder on the main branch. Keep the existing Pages source set to main /docs. Do not upload cloudflare-worker/ into docs/.
3. TEST: Open https://slugger-turn-ice.tholloway540.workers.dev/health and check usernameLoginSetupStatus is "ready". Then reload the game and create an unused username (3–20 characters). Sign out and sign back in, then try creating the same username twice to confirm duplicates are rejected.

EXISTING SERVICES PRESERVED
- Metered TURN endpoint: https://slugger-turn-ice.tholloway540.workers.dev/ice-servers
- Username sign-in endpoint: https://slugger-turn-ice.tholloway540.workers.dev/username-token
- New username registration endpoint: https://slugger-turn-ice.tholloway540.workers.dev/username-register

SECURITY
The username-only account design is intentionally not protected by a password. Anyone who knows the username can access that account. Do not use it for private or sensitive data. Never publish FIREBASE_SERVICE_ACCOUNT_JSON, the private key, or Metered credentials. Keep cloudflare-worker/ out of the public docs/ website.
