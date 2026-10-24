# Slugger (NEO) v0.6.6.1 — Complete Package

This release builds on v0.6.5.0 with unique animated equipment art, animated armor shell plates, five-piece set passives and set-special attacks, weapon-specific projectile behaviours, and improved end-run loot cinematics.

## Publish to GitHub Pages
1. Extract this ZIP.
2. Upload the **contents of `docs/`** into your repository's existing top-level `docs/` folder. Do not create `docs/docs/`.
3. Keep GitHub Pages configured for branch `main`, folder `/docs`.
4. Commit/push and wait for Pages to finish deploying.
5. On iPhone, fully close and reopen the installed PWA to refresh cached files.

## Backend changes
No Cloudflare Worker, Firebase, TURN, or Metered configuration changes are required for this game-only release. The existing TURN endpoint and username service configuration are preserved.

## What to verify
- End-of-run time survived and damage dealt show non-zero values after a real run.
- Loadout, stats, sets, and loot reveals use the same unique SVG per item.
- Equipped armor visibly wraps the slug while keeping the eyes exposed.
- Complete five-piece sets activate their passive and set-special ability.
- Every loot reveal shows its actual item artwork, Warp icon and payout; summary totals Warp amounts correctly.
- Test direct gameplay and a real two-device 1v1 match, especially set-special effects.

See `README.txt`, `QUICK_START.txt`, `PHASE_PLAN.txt`, and `CHANGELOG_V0.6.6.0.txt` for more details.

## v0.6.6.1 deployment hotfix
Fixed recursion in the unique-gear wrappers that could make Deploy here fail with “Maximum call stack size exceeded”. A simulated browser test now starts Wave 1 and runs fire/special without page errors. No Cloudflare/Firebase/Metered changes are needed.
