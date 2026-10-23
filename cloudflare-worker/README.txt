Slugger NEO v0.5.4.3 Cloudflare Worker — reference copy

This Worker source is included for backup/reference only in the v0.6 Phase 1 complete package. Phase 1 does not change any Worker endpoints or server-side behavior. If your current slugger-turn-ice Worker is already working with v0.5.4.3, DO NOT redeploy this Worker for v0.6 Phase 1.

Worker endpoint used by the game:
https://slugger-turn-ice.tholloway540.workers.dev/ice-servers

Keep these Production settings and secrets in your existing Cloudflare Worker:
- METERED_DOMAIN (variable)
- ALLOWED_ORIGINS (variable)
- METERED_CREDENTIAL_API_KEY (secret)
- FIREBASE_SERVICE_ACCOUNT_JSON (secret)

Never upload these secret values to GitHub or paste them into HTML. For account creation/sign-in setup instructions, see the root README.txt. If the Worker is broken or hasn't yet been deployed with v0.5.4.3 username registration routes, consult your existing deployment notes before changing it; this v0.6 phase doesn't require a Worker update.
