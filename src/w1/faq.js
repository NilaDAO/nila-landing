// FAQ answers (docs/W1_FAQ_answers.md, 11 Nov 2026; three lines corrected by Carst's go). Edit text here.
export const FAQ = [
  [
    "What does Nila offer?",
    "A year plan for every field a farmer works, and the money and services to carry it out. She plans the three seasons with her union. At sowing, tractor work by the acre and seed come as vouchers, and the cash part of her crop advance comes from the union members' own savings. Both are paid back from the harvest the plan expects."
  ],
  [
    "What is nUSD, and where does the yield come from?",
    "nUSD is a dollar position on Stellar, still in development. The dollars guarantee the vouchers in farmers' year plans: tractor work by the acre and seed at sowing, paid back from the harvest. The return is the interest on those vouchers, earned in rupees and paid out in dollars. The target is 3–5% a year, not guaranteed. Check that taking part is legal where you live."
  ],
  [
    "What is a crop plan?",
    "Her year on one page: the crop on each field in each season (Kuruvai, Samba, summer), what it costs, what it should bring in, and which services she needs when. An AI agent writes the first draft. Its context: her answers in the app; 8 years of satellite record per field, gathered by remote sensing (what grew when, and whether the soil is tired from the same crop again and again); the season's weather outlook (NOAA); the district crop calendar; reference prices per crop; and the state's agronomy tables (TNAU). The amounts follow fixed rules in the code, not the AI. She changes it with her union leader, and her choice stands."
  ],
  [
    "Who are the unions and the members?",
    "Self-help groups and farmer producer organisations in Tamil Nadu, with about 2,000 members, about 90% of them women (their own figures). The group admits its members, holds their savings and decides who gets a crop advance; Nila does not. It also runs collective growing programmes and balances supply to demand, so not every member grows the same crop. On-chain so far: 50 live land titles, and 39 of 39 closed crop advances repaid in full, with no defaults."
  ],
  [
    "What is a voucher?",
    "A slip on the farmer's phone that pays for one service from her union: so many acres of work with the union's machines, seed the union bought, or space in the union's storage. She uses it instead of paying cash and repays it when her harvest pays back the crop advance. For now a voucher pays only for the union's own services; contracts with outside machine owners and seed shops are in the pipeline. It cannot be passed on to someone else and pays only for the work in her plan."
  ],
  [
    "What is a standing-crop record?",
    "The record of one planned crop on her land: the crop, the field, the season and the harvest the plan expects. A crop advance can only be drawn against it, inside that crop's sowing window. It is tied to her land title: the title's number is part of the record. It is a record, not an investment."
  ],
  [
    "How does a buyer lock a harvest?",
    "On the harvest board, which is not live yet. The buyer picks a time window and a place, chooses what to buy and how much, and confirms the quality conditions, based on the farms' benchmarks. It pays a deposit, which is locked in a smart contract, and the union is notified. The union is responsible for delivering the produce at the right time and place. When the buyer accepts the delivery, it pays the rest; if it does not, the deposit is returned."
  ],
  [
    "Where does funding go?",
    "Into the services in a farmer's year plan, not into cash. Since November 2026, the cash part of a crop advance comes only from the union members' own savings. Outside money only guarantees vouchers (tractor work by the acre, seed), which are paid back from the harvest."
  ],
  [
    "How do I verify independently?",
    "Read it from the chains yourself. The audit page lists every contract on Polygon (the first seasons) and Stellar (since 6 November 2026), with the block it was read at and a link to the explorer. facts.md has the same in plain text, with prompts for handing it to any AI and asking what does not add up. The contract code is public: nila-soroban on GitHub."
  ]
];
