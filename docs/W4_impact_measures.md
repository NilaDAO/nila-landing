# W4 Impact — what each measure is, whether we can measure it, and the chart that fits

Draft for Carst, 10 Nov 2026. Discussion only: no UI change. The five-measure version (`a631340`) is reverted; the code now shows the rings test and four cards. Numbers come from `public/audit/facts.md` (Polygon block 97,069,016, Stellar ledger 65,404,591) or the named source.

What we have to measure with:
- **On-chain:** crop shares (amount, status), the fund (member savings and outside money), land titles (count only; no name or gender on-chain).
- **The field record (nila-sensing):** per field zone, about 8 years of crop cycles from satellite: crop, start and end of season, label quality (`plan/record_view.py`). It records **which seasons were cropped, not how many kg**. The yield in the record (`llm_expected_yield_kg_acre`) is an LLM estimate from the imagery, not a weighed harvest.
- **Not recorded anywhere:** weighed harvest, household income, sale price, who holds a title (name or gender), any member survey.

## The measures

| Measure | What it says | Data | Measurable | Chart |
|---|---|---|---|---|
| **Food: harvest per hectare** (SDG 2.3.1) | More food from the same fields | The field record's yield estimate for the season (LLM on the season's own satellite imagery, `llm_expected_yield_kg_acre`); baseline: the same estimate for the same fields' past seasons | **Yes, as an estimate, from 2026–27**, if (1) it is taken from the season's imagery near harvest, not the plan's figure at sowing; (2) the baseline is the same method on the same fields, not a district average; (3) it is labelled "estimated from satellite" | Per crop: index against the fields' own baseline, bars in the crop colours |
| **Food: seasons cropped** (alongside) | Fields that carry a crop in more seasons than before (cropping intensity) | Field record: cycles per zone per season, 8 years | **Baseline now; the effect after 2026–27** | **Bullet bars, one row per season** (Kuruvai, Samba, summer): the bar = % of financed area that carried a crop that season this year; a tick on the bar = the same fields' average over their 8 years before the first plan. Headline above: seasons cropped per year (cropped area summed over the 3 seasons ÷ financed area), baseline → this year. Rule: a zone counts as cropped in a season when the field record has a cycle starting in that season with a trusted label; a perennial (sugarcane, coconut) counts in every season it stands. Area-weighted, 0.05-acre zones and smaller left out (as in the plan) |
| **Income** (SDG 2.3.2) | A household income she can live on | Baseline: NSO SAS 77th round, Tamil Nadu agricultural household, ₹11,924 a month (2018–19, not inflation-adjusted). Members: no data | **No.** Needs her income before and after: union books or a survey | A number with "not measured yet". Two bars with one empty bar reads as a result |
| **Women's land** (SDG 5.a, 2X) | Land titles in a woman's own name | Titles: 60 on Polygon. Names and gender are only in the union's member list | **Only as union-reported**, labelled so | One stat: "X of 60 titles" |
| **Independence** | How much of the fund is the members' own money | Polygon GroundUp Fund: ₹2,42,600.54 members' savings of ₹10,08,315.02, 24.06% | **Yes, now, on-chain.** On Stellar it would read 100% today only because no outside money is in yet | One bar split in two: own savings, outside money |
| **Repaid** | Crop shares come back | 39 of 39 closed shares repaid in full, 0 defaults; 18 still running with no due date on-chain | **Yes, closed shares only** (facts.md §6.1) | A figure line, not a ring: a ring at 100% hides the 18 running |
| **Her voice** (60 Decibels style) | She says her life is better | Nothing; no survey exists | **No**, until a survey is built and run | One stat, later |
| **Society: land kept in farming** (new) | Financed land stays farmed while land around it goes out of farming | Field record: fallow seasons and dropped seasons per field over 8 years. State context: a Tamil Nadu land-use source, not yet found | **The history yes; "at risk in x years" no**: that is a prediction and needs a rule first | Line per year: TN net sown area (state source) + financed fields' cropped seasons |
| **Market** (new) | How the food reaches buyers, at what price | W2 harvest board not live. Leaders set a local price per crop (`crop_calendar.set_price`); no sale price is recorded | **No** until sales run through W2 | Later: price per crop against the mandi, bars |

## Doubts

1. **Food: estimate checked on the ground.** The satellite estimate is checked against what the unions see on the ground, which state satellite schemes lack (YES-TECH gaps against crop cuts, Maharashtra). Open: show that difference on the page, per crop and season?
2. **Society and Climate share one signal.** "No bare soil in the dry months" (Climate) and "the summer season is cropped" (seasons cropped, Society) are the same satellite count. Proposed line: Society and Food = whether the land is farmed and how often; Climate = the condition of the soil and vegetation on farmed land.
3. **"At risk of going out of farming"** needs a rule before it is published (for example: two or more fallow seasons in the last three years, or the third season dropped for good). Without one, say only what happened, not what will.
4. **The Tamil Nadu land-loss source** (net sown area and current fallows, for example the state Season and Crop Report) is not found or verified yet.
5. **Six of the nine rows show nothing today.** Show them as "not measured yet" rows, or show only the measured ones and list the rest as "what we will publish and when"?
