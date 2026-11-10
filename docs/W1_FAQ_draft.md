# W1 FAQ — draft answers for Carst to verify (10 Nov 2026)

Nine questions are verbatim from the W1 board. Answers are drafts: nothing goes on the site until Carst marks each one OK.
Rules applied: no 'loans' on the site (v4, the word is 'crop share' / 'services'), no yield promise beyond the board's
"target, not guaranteed", compliance invariants I1–I6, DeFi §8 (no claim the evidence does not carry), numbers only from
`/audit/facts.md`. Each answer lists what it rests on and what to check.

---

## 1. What does Nila offer?

A year plan for each member of a farming union, and the services that plan needs. She plans her year with her union
(three seasons, crop per field). Seed, tractor hours and trees then arrive as vouchers at the moment the plan needs them,
sized to the harvest the plan expects and paid back from that harvest. Buyers can lock in that harvest ahead of time;
funders back the services. Nila writes the rules, runs the satellite checks and publishes the proof. The union does the
lending and the trading; Nila holds nothing.

*Rests on:* landing note v9 "What Nila is"; I6. *Check:* "buyers can lock in" — W2 is not live; say "will be able to"
until it is.

## 2. What is nUSD, and where does the yield come from?

nUSD is a dollar position on Stellar that is still in development. USDC goes in, nUSD comes out, and the only use of the
money is vouchers: services a member's crop plan has booked. The target is 3–5% a year. It is a target, not a promise.
The return comes from [**open: voucher fee / trade margin at harvest — Carst to decide**]. Nothing is open for
deposits yet; access is invite only, after KYC.

*Rests on:* landing note v6 (nUSD), board copy "In development. Target, not guaranteed." *Blocks:* counsel X35 on
publishing a target yield for a USD-named token (MiCA, public solicitation); the yield source (vouchers are an
interest-free in-kind advance, 3 Oct); who issues nUSD (the trust cannot hold virtual assets). **Do not publish this
answer until those three are closed.**

## 3. What is a crop plan?

Her whole year on one page: which crop on which field in each season (Kuruvai, Samba, summer), what it costs, what it
should bring in and which services she needs when. An AI draft starts it from her answers in the app (her role on the
land, the cattle she feeds, the months she needs cash), the satellite record of her fields and the district crop
calendar. The numbers come from fixed rules; the AI suggests and explains. Then she changes it with her leader, and
her choice wins. No field is left bare in the dry months.

*Rests on:* LOAN_RULES "Nov 7 build choices" N3, "Member review of the crop plan", "No bare soil"; landing note v5.
*Check:* the W4 rewrite may change how much of the AI we describe here.

## 4. Who are the unions and the members?

Three women's self-help-group unions in Tamil Nadu with about 2,000 members, the largest being Mother Theresa in
Sankuraparam. Around 90% of members are women. A union admits its members, holds their savings and decides who gets a
crop share; Nila does not. Since December 2025 about 60 members have had their season financed through the union.

*Rests on:* CLAUDE.md operating context (3 unions / ~2,000 members, corrected 26 Aug); Canonical Descriptions (~90%
women, since Dec 2025, ~60 farmers). *Check:* union names to publish; "about 60" against the current audit.

## 5. What is a voucher?

A claim on one service, not money: so many tractor hours, this seed, these saplings. It is booked in her crop plan,
released when the plan needs it and redeemed with the machine owner or shop. It cannot be sold or sent to someone else,
and it is retired when used. Because the seed never sits in the same wallet as the school fees, a bad month at home
does not become a lost season on the field.

*Rests on:* I4 (non-transferable, redeem-only); "Vouchers are backed, not minted"; Canonical Descriptions impact story 1;
LOAN_RULES "Unused voucher hours". *Check:* LOAN_RULES still says a voucher "is meant to be sellable back to the union
later" — keep "cannot be sold" only if that stays off for now.

## 6. What is a food token?

The on-chain record of a planned crop on her land: one token per crop in her plan, tied to her land title, with the
amount of harvest the plan expects. The union's crop share and vouchers are drawn against it, in that crop's sowing
window. The satellite then confirms the season. It cannot be transferred and it has no market price; it is a record,
not an investment.

*Rests on:* LOAN_RULES "Food token at the draw", "Food token attestation (Nov 7)", "Vouchers vs food tokens"; I4.
*Check:* the old FAQ called food tokens "collateral for investors" — this answer drops that on purpose.

## 7. How does a buyer lock a harvest?

On the harvest board a buyer bids a price per quintal for a delivery week of one crop and variety. The union accepts
within 24 hours. The buyer pays a 15% advance only when the bid wins; the rest is paid at delivery. Contracts are for
physical delivery to a business buyer and cannot be resold. The harvest board is not live yet.

*Rests on:* W2 spec note (19 Oct). *Check:* every number here is "tune in the pilot" (advance 15%, 24 h); legal review of
physical delivery / SEBI is open; the rail (USDT on Polygon now, nUSD later). Shorter option: "Coming with the harvest
board." until W2 ships.

## 8. Where does funding go?

Into services, not into cash loans. The cash part of a member's crop share comes from the union's own member savings.
Outside money pays only for the services in a crop plan (the machine owner's prepayment for tractor hours, seed,
saplings) and is repaid from the harvest. Nila's own income is a fee on the services, not interest.

*Rests on:* I1 (foreign capital never becomes loan principal); LOAN_RULES "Crop share request (L11)": cash is lent from
member money only, senior money pays only the machine prepay. *Check:* "Nila's income is a fee" — I1 says Nila earns
fees, not the carry; confirm before publishing. Senior cap is 0 until the audit (LOAN_RULES "Senior").

## 9. How do I verify independently?

Do not take our word for it. Every figure on this page comes from the public ledgers: Polygon mainnet for the first
seasons, Stellar mainnet since November 2026. The audit page lists every contract with a link to the explorer and the
block it was read at. facts.md is the same in plain text: paste it into any AI and ask it to find what does not add up.
The season ledger (CSV) has one row per crop plan. The contract code is public (nila-soroban on GitHub).

*Rests on:* facts.md's own adversarial-prompt section; DEV_MAP (Stellar mainnet 6 Nov, nila-soroban public).
*Blocks:* the audit must cover Stellar first, and the season ledger must exist (both in progress). Privy/Circle status:
landing note says link nothing until it can be shown — left out.
