# W4 /how — categories, the question each answers, and the data that shows it

Draft for Carst, 10 Nov 2026. Discussion only, no UI. One row = one category on the page. **Show** = the data we put on screen, never a sentence alone. Status: **now** (data exists today), **2026–27** (after the first Stellar year), **need** (no data source yet). Figures from `public/audit/facts.md` (Polygon block 97,069,016) unless named. Measure details: `W4_impact_measures.md`.

## 1. Impact — what changes for her and around her

| Category | The question a reader asks | Show (data) | Chart | Status |
|---|---|---|---|---|
| Reach | How many women, where? | Land titles 60 (Polygon); 37 borrower wallets; ~2,000 members in 3 unions, ~90% women (unions' figure, labelled so) | Figure line | now |
| Food | Do her fields grow more food? | Seasons cropped per year on financed fields, baseline → this year; yield per crop estimated from satellite, checked on the ground, against the same fields' past | Bullet bars per season; index bars per crop | baseline now, effect 2026–27 |
| Income | Does she earn enough to live on? | Member household income against NSO SAS 77th round, Tamil Nadu ₹11,924 a month (2018–19) | Two bars once both exist; until then a number + "not measured" | need |
| Women's land | Is the land in her name? | Titles in a woman's own name, of all titles, from the union's member list | One stat, "union-reported" | need (count with unions) |
| Independence | Is it her own money or outside money? | Members' savings ₹2,42,600.54 of ₹10,08,315.02 in the fund, 24.06% | One split bar | now |
| Repaid | Do the crop shares come back? | 39 of 39 closed shares repaid in full, 0 defaults; 18 running with no due date on-chain | Figure line, not a ring | now |
| Her voice | Does she say life is better? | Share of members saying so in a short survey | One stat | need |
| Land kept in farming | Does financed land stay farmed while land around it goes out? | Financed fields' cropped seasons over 8 years; Tamil Nadu net sown area / current fallows from a state source | Line per year: state context + financed fields | history now; state source need |
| Market | Does she get a better price? | Sale price per crop against the mandi price | Bars per crop | need (W2 not live) |

## 2. Technical — what makes it hold

| Category | The question | Show (data) | Chart | Status |
|---|---|---|---|---|
| Land title | Is the land real, and is the title hers? | One field: the leader's point, the satellite shape, the title id and its transaction link; total titles | Map of one field + link | now |
| Year plan | Does the AI decide the money? | One real plan (with consent): which numbers come from fixed rules, which text from the AI | Annotated plan card | now (consent needed) |
| Food token | Is each crop share backed by a planned crop? | Per token: crop, field, sowing window, expected harvest, link | Table of tokens | now: 4 on Polygon; Stellar from 2026–27 |
| Vouchers | Does the money reach seed and tractor work? | Voucher hours issued, redeemed, paid to machine owners (`machinery`, `fund_core`) | Stacked bar: issued / redeemed / paid | Stellar since 6 Nov; first vouchers 2026–27 |
| Who signs | Can one person move the money? | Signer thresholds read live from the accounts: union 2 of 3, trust 3 of 5 | Two small signer diagrams with account links | now |
| Due date from the harvest | How do you know when she must repay? | Live shares with a due date on-chain: 0 of 18 on Polygon (facts.md); the satellite end-of-season date once switched on | Figure + status "off" | off |
| Public audit | Can I check it myself? | Contract ids and code hashes on both chains, loan tape file | Link to /audit | now |

## 3. Climate — the land itself

| Category | The question | Show (data) | Chart | Status |
|---|---|---|---|---|
| Bare soil | Is the soil covered in the dry months? | Share of financed area with a crop or green manure in the summer season, baseline → this year | One bullet bar | baseline now, effect 2026–27 |
| Rotation | Does the same crop repeat field after field? | Share of financed zones with cereal after cereal, baseline → plan | One bullet bar | baseline now |
| Recovery | Is the land getting better? | One real field's vegetation index over 8 years, with the line where the plan starts; later all financed fields against their baseline | Line chart | one field now, trend 2026–27 |
| Seasons the land has left | How long before it is depleted? | No source we trust | Not shown | need |
| Carbon | Do you claim carbon? | Not measured | Not shown, one line says so | — |

## Doubts

1. **One signal on two tabs.** The summer row of Food (seasons cropped) and Climate's bare soil are the same satellite count. Show it once (Climate) and point to it from Impact?
2. **Ground check of the yield estimate:** show the difference on the page, per crop and season, as the proof of ground presence?
3. **Consent:** the field map, the plan card and the vegetation line show one real member's field. Named, or anonymous with the union's consent?
4. **Rows with no data** (Income, Women's land, Her voice, Market, seasons left): show as "not measured yet" rows, or move them into one "what we will publish and when" list?
5. **Tamil Nadu land-loss source** for "Land kept in farming": not found or verified yet.
