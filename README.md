# Slugger (NEO) v0.6.0.2 — Phase 1 Menu Transition Hotfix

This is a client-side hotfix for the v0.6 Phase 1 modular build. It fixes a `ReferenceError` from the missing shared `esc()` HTML-escaping helper that left the signed-in hub as a blank gradient screen.

## Deploy

1. Extract `slugger_neo_v0.6.0.2_phase1_hotfix_docs.zip` or use this archive's `docs/` folder.
2. Upload the **contents** of `docs/` into your existing top-level `docs/` directory in the GitHub repository on `main`.
3. Keep `index.html`, `manifest.webmanifest`, `css/`, `js/`, and `icons/` together.
4. Commit and keep GitHub Pages set to `main` → `/docs`.
5. Fully reload the site; close and reopen the installed iOS PWA after deployment.

## Cloudflare

No Worker redeployment is required. The existing TURN endpoint is preserved in `docs/js/06-turn-peer-lifecycle.js`:

`https://slugger-turn-ice.tholloway540.workers.dev/ice-servers`

## Included fixes

- Restores `esc()` in the first-loaded core module.
- Makes hub rendering resilient to invalid tabs and failing panel renderers.
- Keeps the auth modal visible until the menu is rendered successfully.
- Bumps local asset cache tokens to `v0.6.0.2-hotfix`.
