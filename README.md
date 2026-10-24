# Slugger (NEO) v0.6.2 — Phase 2: Mystery Crates & Nested Rarity

This release builds on v0.6 Phase 1. It preserves the economy trim and tabbed menus, adds the Phase 2 mystery crate/discovery/rarity systems, and includes defensive handling for a rare PvP combat-update crash reported on iPhone.

## Package layout
- `docs/` — complete GitHub Pages site. Upload its **contents** into the repository's top-level `docs/` folder.
- `cloudflare-worker/` — reference copy only; no Worker deployment is required for this release.
- `QUICK_START.txt`, `CHANGELOG_V0.6.2.txt`, `PHASE_PLAN.txt` — instructions and release scope.

## Publish
1. Extract the package.
2. Upload the contents of `docs/` to your existing repository's top-level `docs/` directory (avoid creating `docs/docs/`).
3. Commit to `main`; leave Pages configured as `main` → `/docs`.
4. Reload the website. Fully close and reopen the installed iOS PWA if it serves stale files.

The TURN endpoint is preserved at `https://slugger-turn-ice.tholloway540.workers.dev/ice-servers`. No Metered credentials, Firebase keys, or other secrets are included.

## Phase 2 highlights
- 38 crate variants, each with procedurally generated SVG art.
- Owned/discovered-only crate collection, family-specific nested rarity rolls, rarity-aware gear stats, and particle opening effects.
- Crate reveal state fix, plus defensive sanitization for malformed projectile/enemy data to address the reported rare PvP runtime error.
- Expanded searchable/sortable equipment stats across all current item categories.

## Validation note
JavaScript syntax, CSS parsing, ZIP integrity, and simulated browser smoke tests passed. Live two-client PeerJS/Firebase multiplayer testing remains outstanding.
