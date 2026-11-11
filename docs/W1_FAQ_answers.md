# W1 FAQ: answers (11 Nov 2026)

> Superseded 11 Nov: the live answers are in `src/w1/faq.js` (reviewed one by one with Carst). This file is the draft.

For Carst to mark OK. Figures: `/audit/facts.md`, Polygon block 97,069,016 (10 Nov 2026), unless named. Words (11 Nov): standing-crop record (was food token), crop advance (was crop share); never "loans". Rules: no promise beyond "target, not guaranteed", compliance invariants I1–I6.

---

**What does Nila offer?**

A year plan for every field a farmer works, and the money and services to carry it out. She plans the three seasons with her union. At sowing, tractor hours and seed come as vouchers, and the cash part of her crop advance comes from the union members' own savings. Both are paid back from the harvest the plan expects.

**What is nUSD, and where does the yield come from?**

nUSD is a dollar position on Stellar, still in development. The dollars pay for the vouchers in farmers' year plans: tractor hours and seed at sowing, paid back from the harvest. The return is the interest on those vouchers, earned in rupees and paid out in dollars. The target is 3–5% a year, not guaranteed. The interest on a crop advance is capped at 12.5% in the contract code, and deposits stay capped at zero until the contracts are audited.

**What is a crop plan?**

Her year on one page: the crop on each field in each season (Kuruvai, Samba, summer), what it costs, what it should bring in, and which services she needs when. The first draft comes from her answers in the app, 8 years of satellite record of her fields and the district crop calendar; the amounts follow fixed rules in the code. She changes it with her union leader, and her choice stands. No field is left bare in the dry months.

**Who are the unions and the members?**

Women's self-help groups and farmer producer organisations in Tamil Nadu, with about 2,000 members, about 90% of them women (their own figures). The group admits its members, holds their savings and decides who gets a crop advance; Nila does not. On-chain so far: 60 land titles, and 39 of 39 closed crop advances repaid in full, with no defaults.

**What is a voucher?**

A slip on the farmer's phone that pays for one service: so many tractor hours, or this seed. She shows it to the machine owner or the seed shop instead of paying cash. The owner gets part of the price at the job and the rest when her harvest pays back the crop advance. It cannot be passed on to someone else and pays only for the work in her plan.

**What is a standing-crop record?** (board question: 'What is a food token?')

The record of one planned crop on her land: the crop, the field, the season and the harvest the plan expects. A crop advance can only be drawn against it, inside that crop's sowing window, and the satellite confirms the season. It cannot be sold or transferred. It is a record, not an investment.

**How does a buyer lock a harvest?**

With the harvest board. It is not live yet.

**Where does funding go?**

Into the services in a farmer's year plan, not into cash. The cash part of a crop advance comes only from the union members' own savings. Outside money pays only for vouchers (tractor hours, seed) and is paid back from the harvest. Nila earns a fee per service, not interest.

**How do I verify independently?**

Read it from the chains yourself. The audit page lists every contract on Polygon (the first seasons) and Stellar (since 6 November 2026), with the block it was read at and a link to the explorer. facts.md has the same in plain text, with prompts for handing it to any AI and asking what does not add up. A CSV has one row per crop advance. The contract code is public: nila-soroban on GitHub.

---

## Doubts

0. The W1 board's FAQ question still says 'food token'; rename it on the board to 'What is a standing-crop record?'.

1. **Spread on senior money:** left out. Compliance invariant I1 says Nila earns fees, not the carry; a spread on senior money would be the carry. "A fee per service" is in the answer.
2. **"Cash only from members' savings"** is the rule on Stellar (LOAN_RULES, 23 Oct). The Polygon fund behind the 39 repaid crop shares was 76% outside money, so a careful reader can set the two side by side. Add "since November 2026" to that sentence?
3. **Standing-crop record "cannot be sold or transferred":** true once the Polygon transfer hook (D4) is live; check it is deployed before publishing.
4. **About 2,000 members, 90% women:** the groups' own figures, not checked by us.
