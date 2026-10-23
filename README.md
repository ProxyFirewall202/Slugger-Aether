# Slugger (NEO) v0.6.0.1 — Phase 1 Hotfix

This release fixes the v0.6 Phase 1 login regression `FK is not defined`.

## Root cause
The modular refactor removed the old `FK` (friend-cache storage key) and `PK` (PeerJS Friend ID storage key) constants from the hub module, but networking code still used them. Both constants are now declared in `js/06-turn-peer-lifecycle.js`, before app startup can invoke them.

## Deploy
Upload the **contents** of `docs/` into the repository's existing top-level `docs/` folder on `main`. Keep the CSS, JS, icons, index and manifest together. No Cloudflare Worker update is required.

The existing TURN endpoint is unchanged: `https://slugger-turn-ice.tholloway540.workers.dev/ice-servers`.

## Validation
All 12 modules and their combined script pass Node syntax checks. Local assets resolve and the manifest parses. Full live sign-in validation still needs to happen after deployment.
