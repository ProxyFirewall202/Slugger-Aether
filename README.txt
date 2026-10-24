SLUGGER (NEO) v0.6.4.0 — SUB-PHASE 2
Ten Tiers & Loot Outcomes

GITHUB PAGES DEPLOYMENT
1. Use the separate Docs ZIP and upload its contents into your existing top-level docs/ folder in the GitHub repository. Do not create docs/docs/.
2. Keep GitHub Pages configured to branch main, folder /docs.
3. Commit changes and let the Pages deployment finish.
4. On iPhone, fully close the installed PWA and reopen it. If old files persist, refresh the site or remove/re-add the Home Screen app after deployment.

No Cloudflare Worker or Firebase changes are required for this release. The existing TURN endpoint and account configuration are preserved.

WHAT CHANGED
- Strict 10-tier progression aligned with waves 1–10; each loot box, set and equipment item displays its tier.
- Equipment Stats filter lists every tier from 1 through 10.
- Loot box opening outcomes: Lucky 5%, Standard 80%, Unlucky 15%.
- Lucky awards twice the standard Warp payout and 2–3 distinct items from that box's set. Standard pays normal Warp and one set item, with a gradually increasing Warp-only chance as the set fills out. Unlucky pays half Warp and no items.
- Warp payouts scale down with collection progress, reaching 20% of the initial payout once all five items from that box's set are collected.
- Legacy rarity grades and saved grade fields are retired.

PACKAGE CONTENTS
- docs/: GitHub Pages site.
- cloudflare-worker/: reference worker files from the previous release; no update required.
- QUICK_START.txt, CHANGELOG_V0.6.4.0_SUBPHASE2.txt, PHASE_PLAN.txt.

VALIDATION
All 13 JS modules pass syntax checks. Chromium simulated checks passed for the 30-set/150-item registry, 31 loot-box entries, 10-tier labels/filter, and 5%/80%/15% outcomes. Full live two-peer testing remains necessary.

ANTI-GRIND
Random enemy loot-box drop chance scales with the specific box set's collection progress (7% base, down to 1.4% at a complete set). Guaranteed wave/boss milestone boxes stay guaranteed. Opening Warp rewards scale down to 20% at full set collection.


Version 0.6.5.0 adds Roman numeral tiers, tier-scaled Warp rewards, owned-only loot box display, and full-screen run-end loot cinematics. See CHANGELOG_V0.6.5.0.txt.
