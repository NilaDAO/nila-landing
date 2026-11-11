# W4 /how — frame (draft for Carst, 10 Nov 2026)

Three parts, one per reader. The three cards on the home page "Sow in season" section become the three doors:
Impact, Technical, Climate. Each part opens on /how at its own tab or anchor (`/how#impact`, `#technical`, `#climate`).

Rule for every part: a sentence stays only if it rests on something we can show (facts.md, the code, a named source,
a named person). What we do not have yet is said as such, in the part itself.

**No repeat of the home page.** What Nila is (year plan, vouchers, the union lends and decides, buyers, nUSD) is told
on the home page. /how assumes the reader has it and only goes one level deeper: evidence (impact), mechanism
(technical), direction (climate).

---

## 1. Impact — read like an impact funder

What an impact funder asks, in order, and what answers it.

| Question | Answer from | Status |
|---|---|---|
| Who is she? | One real member, named with permission: plot size, crops, household, what she borrowed before Nila and from whom | **Need:** consent + interview (union leader) |
| What did she get, season by season? | Her row in the loan tape: amounts, dates, repaid | Have (facts.md / loan-tape.csv) |
| How many like her? | ~2,000 members, 3 unions, ~60 financed since Dec 2025, 39 repaid, 0 defaults | Have; "~60" to re-check against facts.md |
| Is it women? | ~90 % women members | Have (Canonical) — re-check per union |
| What does it cost her? | Interest / fee per season vs. the moneylender or MFI rate she had | **Need:** local rate with source |
| What changed for her? | Income or yield before/after | **Do not have.** Say so; name when we will (first full year plan, 2026–27) |

Show the bad number: what we cannot measure yet (income change) is a row, not a footnote.

## 2. Technical — what the chain and the AI actually do for her

One flow, left to right, each step with the thing it replaces and where it lives. Not what a voucher or a crop plan
is (home page), but what makes it hold: who signs, what is on which chain, what the AI may and may not decide.

| Step | Replaces | Where | Status |
|---|---|---|---|
| Land title from a point + satellite shape | Survey, paper records she may not hold | `land_title` (Stellar, temporary) / NilaLandTitle (Polygon) | Live |
| AI draft of the year plan | An agent's guess, or no plan | nila-sensing plan engine (Sonnet 5.5, code checks), 8-yr field history | In app; numbers from rules, AI explains |
| Food token per planned crop | — (new) the record a share is drawn against | FoodToken (Polygon), attested to Stellar | Live |
| Vouchers for tractor hours / seed | Cash that leaks to other needs | fund_core, machinery | Live on Stellar since 6 Nov |
| Satellite season dates | A field visit, or nothing | nila-sensing phenology; on-chain EOS write | **Off until O6** — say so |
| Union multisig 2-of-3, trust 3-of-5 | One person holding the keys | Stellar native accounts | Live |
| Public audit | "Trust us" | /audit, facts.md, contract ids | Live |

Satellite section (built) sits here.

## 3. Climate — turning the ship

The claim to tell: land worked season after season with no rest or cover loses yield; a year plan with rotation,
green manure and no bare soil stops the slide and, over years, brings it back.

| Piece | Answer from | Status |
|---|---|---|
| "About 5 seasons left before the land is depleted" | **Needs a source** (soil organic carbon trend for Tamil Nadu delta / district, ICAR, TNAU, or our own 8-yr NDVI record). Without one it does not go on the page | **Need** |
| What the plan changes on the land | Rotation over 3 seasons, green manure as its own crop share (repaid with the next crop), no bare soil in summer — the rules, not the plan idea itself | Have (LOAN_RULES, decided 4–5 Nov) |
| How we will know it works | Same field, satellite vegetation index season by season, from the 8-year baseline | Can show baseline per field; trend after plans run |
| What we cannot say yet | That yields have recovered. First year plans run 2026–27 | Say it plainly |
| Carbon / methane claims | None until measured | Leave out |

The board's yield curve goes; in its place one real field's 8-year vegetation record, with the line where the plan starts.
