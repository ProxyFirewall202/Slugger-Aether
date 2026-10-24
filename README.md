# Slugger (NEO) v0.6.3.0 — Sub-phase 1: Set Registry & Economy Foundation

This is **only Sub-phase 1** of the v0.6 expansion. It builds the foundation for the 30-set catalogue and a Warp + Loot Box economy. Do not treat later phases as implemented yet.

## Included

- 30 sets from the supplied catalogue, each with five registered equipment pieces: Weapon, Shield, Armor, Charm, and Spirit Slug (150 item definitions total).
- Set metadata includes tier/wave/theme, the specified passive bonus, active special name/description, associated Loot Box, and set colour.
- 31 active Loot Box entries: the 30 catalogue-linked box types plus the Ironclad starter box (Scrap Loot Box is the Garden Pests box).
- Starter boxes are called **Scrap Loot Box** and **Ironclad Loot Box**.
- Currency-only progression fields for Protons, Keys, Fusion Keys, Souls, Cells and Purified Warp are stripped during save normalisation without refunds. Weapon-level and reinforcement-rank fields are discarded too.
- Legacy crate counts are mapped into the new Loot Box families where a mapping exists. The one-time migration is persisted in the save.
- Existing account/cloud/social/TURN URL, mobile controls, and the Phase 1/2 menus are preserved.

## Deliberately not in this sub-phase

- Lucky / Standard / Unlucky outcome rolls and collection-scaled drop odds.
- Full unique SVGs and animated weapon/shield behaviours.
- Animated armour shell plates and atmospheric wave backgrounds.
- Friend online toasts and the final multiplayer parity pass.

Set bonuses and specials are registered and visible in the set tracker as metadata, but their new individual combat implementations are reserved for the later gear/behaviour sub-phase. Gear images are still category-based previews at this stage; the unique item visual system is also later work.

## Publish on GitHub Pages

1. Extract the archive.
2. Upload the **contents of `docs/`** to the existing top-level `docs/` folder of the `main` branch, replacing the previous published game files. Do not create `docs/docs/`.
3. Keep `index.html`, `manifest.webmanifest`, `css/`, `js/`, and `icons/` together.
4. Commit and wait for GitHub Pages to deploy. Keep Pages set to `main` → `/docs`.

**No Cloudflare Worker redeployment is required** for this sub-phase. `cloudflare-worker/` is included as a reference copy only; do not upload it to GitHub Pages or redeploy it for this release. The existing TURN endpoint remains `https://slugger-turn-ice.tholloway540.workers.dev/ice-servers`.

## Validation summary

- Parsed catalogue check: 30 sets, 150 item definitions, 5 distinct slot types per set, and every set/box/item name matches the supplied catalogue.
- Registry smoke test: 31 active loot boxes, 3 associated boxes for each wave/tier, and currency-field migration check.
- All 13 JavaScript files and a concatenated script pass Node syntax validation.
- Full Chromium startup dump could not complete in this environment; live browser and two-client runtime testing remain necessary.
