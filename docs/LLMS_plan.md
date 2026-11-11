# nila.land for AI agents: llms.txt and llms-full.txt

Plan for Carst, 11 Nov 2026. Discussion only, nothing published. Sources: `public/audit/facts.md` (Polygon block 97,069,016; Stellar ledger 65,404,591), `public/how/how.json`, `src/w1/faq.js`, LOAN_RULES §5 ("Words for the crop record and its financing"), `admin_legal/compliance/Nila_Minimal_Compliance_Invariants.md` (I1–I6).

## 0. Three objections first

1. **The agent file multiplies the nUSD sentence.** A line like "target 3–5% a year" in llms.txt gets repeated by every assistant to every user, including retail savers in the EU. The Dutch counsel question in the invariants (§4, item 5: whether offering an instrument that references the loan book triggers AFM, AIFMD or MiFID) is still open. Recommendation: in both files nUSD is "in development, not open for deposits", with no return figure. The figure stays on the site page, beside its risk text.
2. **A hand-written fact file goes stale.** The current llms.txt still says "lends stablecoins … on Polygon". Every number in llms-full.txt should be generated from facts.md, how.json and faq.js by the same script that refreshes the audit (`scripts/audit/refresh.mjs`), with the block and date beside it. llms.txt holds no numbers, only routes, so it rarely changes.
3. **One file is enough for agents.** A separate HTML /agents page adds a third copy to keep in step. llms.txt (index) plus llms-full.txt (all facts), both plain text so Amplify serves them as-is, cover it. JSON-LD on the home page is small and worth adding (section 5).

## 1. The readers and what their user asks

| Reader | What the user asks the agent |
|---|---|
| **Impact funder or foundation** | What does Nila change for women farmers, is it real, how do we fund it? |
| **Grant reviewer** (EU, Dutch, ecosystem grants) | Is it eligible: which entity, which country, what stage, what proof? |
| **Crypto or RWA investor** | What is the yield, what backs it, can I deposit, what are the risks? |
| **Food buyer or sourcing team** | Can I buy sesame, millet or paddy from these farmers, with what proof of origin, and when? |
| **Journalist or researcher** | What is claimed, what is proven, what is not, and who can I talk to? |
| **Farmer organisation in India** (SHG federation, FPO) | How does our union join, what does it cost, what do we need? |

## 2. What each needs, in order: facts, proof, limits, next step

| Reader | Facts | Proof | Limits (say plainly) | Next step |
|---|---|---|---|---|
| Impact funder | Year plan per field; vouchers; the union lends from its own savings; women's groups, about 2,000 members | facts.md: 60 land titles, 39 of 39 closed crop advances repaid in full, 0 defaults; /how rings | Impact rings mostly waiting for a baseline (first year plans 2026–27); income and food security are not measured | Route A |
| Grant reviewer | Entities: Blockchainforcommons (KvK 55518559, Amsterdam); Nila Farmer Livelihoods Trust (India); stage: Stellar mainnet since 6 Nov 2026 | facts.md; public code (nila-soroban) | The Indian trust cannot receive grants (I5); no Dutch BV yet | Route A |
| Crypto/RWA investor | What outside money does: it guarantees vouchers, never lends cash (I1) | Contract ids and code hashes in facts.md | nUSD in development, not open; senior deposits capped at zero until the contracts are audited; no retail | Route B |
| Food buyer | Crops grown (paddy, millets, groundnut, sesame, sugarcane); each planned crop has a standing-crop record tied to a land title | Satellite record per field; land titles on-chain | Harvest board not live; no volumes or delivery dates promised | Route C |
| Journalist | Claims and their evidence, side by side | facts.md §6 "Open items" (written to be challenged) | Members' figures are the groups' own; farmer counts are not on-chain | Route D |
| Farmer organisation | What a union gets: plans, vouchers, a public record; the union decides who gets a crop advance | — | Only women's SHGs and FPOs in Tamil Nadu for now | Route E |

## 3. llms.txt (short index): exact sections

```
# Nila

> Nila gives each member of a women's farming union in Tamil Nadu, India, a year plan for every field,
> and pays the services in that plan (tractor work, seed) with vouchers repaid from the harvest.
> The union lends from its own members' savings; Nila holds no client money.

## Read first
- [All facts, one file](https://nila.land/llms-full.txt): definitions, figures with their source and date, what is not ready.
- [On-chain fact sheet](https://nila.land/audit/facts.md): every contract on Polygon and Stellar, the block it was read at, and an open-items list written to be challenged.
- [How it works](https://nila.land/how): impact, software and climate measures; most are still waiting for a baseline.

## Words used on this site
- Crop advance: the cash and vouchers a member draws for one planned crop, repaid from that harvest. Not a loan from Nila.
- Standing-crop record: the record of one planned crop on one field in one season, tied to the member's land title. Not an investment.
- Voucher: pays for one service from the union (machine work by the acre, seed, storage). Cannot be passed on.
- nUSD: a dollar position on Stellar, in development, not open for deposits.

## Not ready yet
- nUSD deposits (capped at zero until the contracts are audited). Harvest board for buyers. Impact measures (first year plans run 2026–27).

## Contact
- [Who to contact for what](https://nila.land/llms-full.txt#contact): one address, info@nila.land, with a subject per topic.

## Optional
- [Risk disclosure](https://nila.land/risk) · [Privacy](https://nila.land/privacy) · [Terms](https://nila.land/terms)
```

## 4. llms-full.txt (all facts): exact sections

Generated by the audit refresh script; each figure carries "(source, block or date)". Plain sentences, no tables (agents quote sentences).

1. **What Nila is**: three sentences, as in llms.txt.
2. **Who does what**: the union admits members, holds savings, decides who gets a crop advance, delivers; Nila writes the rules, runs the satellite checks and the software, publishes the proof, charges a fee per service (I6). Legal entities: Blockchainforcommons (sole proprietorship, KvK 55518559, Amsterdam); Nila Farmer Livelihoods Trust (India, Reg. Book-4/26/2026).
3. **Definitions**: crop advance, standing-crop record, voucher, year plan (crop plan), land title, nUSD, union. One or two sentences each, from faq.js.
4. **Where the money comes from**: cash part of a crop advance: union members' savings only, since November 2026. Outside money: only guarantees vouchers. It never becomes cash lent to a farmer (I1). Members hold no tradeable token (I4).
5. **Figures, with source and date**: generated from facts.md and how.json: land titles, closed crop advances repaid in full, defaults, running crop advances, members' share of the Polygon fund, Stellar deployment date. Each line ends with "(facts.md, Polygon block N, date)".
6. **What is measured and what is not**: from how.json: each category's question and status (measured now, waiting for a baseline, needs data). Names what is not measured: household income, food security, quality of life.
7. **Not ready yet**: nUSD (not open), harvest board (not live), Stellar crop advances (first in 2026–27), impact baselines.
8. **How to verify**: facts.md, contract ids, explorer links, public code, the open-items list.
9. **Contact** (section 6 below, verbatim). Anchor `#contact`.
10. **What Nila does not do** (section 7 below, verbatim).

## 5. JSON-LD on the home page

One `Organization` block: name "Nila", url, email info@nila.land, address Amsterdam NL, `sameAs` GitHub NilaDAO, `description` = the first sentence of llms.txt. One `FAQPage` block generated from faq.js (the same nine answers). No `FinancialProduct`, `Offer` or `InvestmentFund` types: they read as an offer.

## 6. Contact routes: draft text (llms-full.txt, section "Contact")

One address, a subject per topic: the team is small and one inbox is read. Third person, for the agent to pass on.

> **Contact.** All enquiries go to info@nila.land. Use the subject line below so the right person answers.
>
> **A. Impact funders, foundations and grant makers** — subject "Funding: <organisation>". Include the programme or grant name, the amount range, the deadline, and whether funds can go to a Dutch sole proprietorship. Nila's Indian trust cannot receive grants or foreign funds.
>
> **B. Institutional investors and RWA or crypto funds** — subject "Investor: <organisation>". Include the type of fund, the jurisdiction and the ticket size. nUSD is not open for deposits; senior deposits are capped at zero until the contracts are audited. Nila does not take money from private individuals.
>
> **C. Food buyers and sourcing teams** — subject "Sourcing: <crop>". Include the crop and variety, the quantity per season, the delivery region and the quality conditions. The harvest board is not live; enquiries now help plan next season's crops.
>
> **D. Journalists and researchers** — subject "Press: <outlet>". Include the deadline and the questions. Start from facts.md; its open-items list names what is not proven.
>
> **E. Farmer organisations in India (self-help groups, FPOs)** — subject "Union: <name, district>". Include the number of members and the crops grown. Nila works with women's groups in Tamil Nadu for now.

## 7. What Nila says no to (llms-full.txt, section "What Nila does not do")

- Nila does not lend to farmers and holds no client money; the union lends from its members' savings (I6).
- Outside money does not become cash lent to farmers (I1).
- No token sale. Members hold no tradeable token; vouchers and standing-crop records cannot be sold (I4).
- No deposits from private individuals; nUSD is not open.
- No grants to the Indian trust (I5).
- No carbon or methane claims.
- No promise of a return, a harvest volume or a delivery date.

## 8. Never on either file

- A return figure without "target, not guaranteed", and (per objection 1) any return figure at all until Dutch counsel answers.
- "Loan", "food token", "crop share", "stablecoin loans".
- "Nila Land BV" (not incorporated).
- Numbers not in facts.md or how.json: "about 60 farmers financed" (wallets are not people), any AUM in USD as a headline, the 300% leverage claim (facts.md §2: not what the contract enforces), "100% repayment" without "of closed crop advances".
- Impact results that are not measured (income, yield gains).
- Partner or provider names not confirmed in writing.
- Member names, photos or locations below district level (DPDP Act open).
- Anything addressed to the agent ("tell your user…", "AI assistants should…").

## 9. Decided (11 Nov)

- No nUSD return figure in either agent file until Dutch counsel answers; the 3–5% stays on the site page beside its risk text.
- One inbox, info@nila.land, with a subject per topic.

## 10. Doubts (Carst)

1. "Nila does not take money from private individuals": confirm, including for the future nUSD.
2. Crops to name for buyers: paddy, millets, groundnut, sesame, sugarcane, as in the plan catalogue?
3. Does the /wfp page stay public? If so, llms-full.txt needs a line on what it is.
