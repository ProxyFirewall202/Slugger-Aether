# Slugger (NEO) v0.6.6.2 — Unique Equipment Art Hotfix

This hotfix addresses the repetitive equipment art shown in the v0.6.6.1 screenshots. All 184 weapons, shields, armor pieces, charms/boosts and Spirit Slugs now use item-specific silhouette geometry and animated structural accents, driven by the equipment catalogue's names and descriptions.

## Deploy
Upload the **contents** of `docs/` to your existing top-level GitHub Pages `docs/` directory on `main` (avoid `docs/docs/`). See `QUICK_START.txt` for the exact steps.

No Cloudflare Worker, Firebase, Metered or TURN change is required. The existing TURN endpoint is preserved.

## Validation
- 184 generated SVGs; all parse and load as images.
- SVG geometry uniqueness check passes across all five equipment types, independent of item label/colour/animation.
- All local JavaScript modules and the combined script pass syntax checks; browser render has no page errors.
- PeerJS CDN was blocked in the isolated test environment, so live PvP networking was not tested here.
