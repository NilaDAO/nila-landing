// Writes public/llms-full.txt (all facts for AI agents) from the same sources as the site: /audit/snapshot.json,
// public/how/how.json and src/w1/faq.js. Plan: docs/LLMS_plan.md. Runs before every build (npm prebuild) and after
// `npm run audit`, so the figures carry the block and date they were read at and never go stale by hand.
// Rules (plan §8, Carst 11 Nov): no nUSD return figure in agent files; no fee claim; "loan" only as the on-chain name.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FAQ } from "../../src/w1/faq.js";
import { PARTNERS } from "../../src/w1/partners.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const snap = read("public/audit/snapshot.json");
const how = read("public/how/how.json");
const crops = fs.existsSync(path.join(ROOT, "public/audit/crops.json")) ? read("public/audit/crops.json") : null;
// Green manures: the soil covers in nila-sensing plan/reference/soil_v1.json (own crop advance, ploughed in, not sold).
const GREEN = new Set(["sunhemp", "dhaincha", "wild_indigo"]);
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const label = (n) => n.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
const months = (ws) => ws.map((w) => (w.first === w.last ? MON[w.first - 1] : `${MON[w.first - 1]}–${MON[w.last - 1]}`)).join(", ");

const day = (t) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const inr = (x) => `₹${Number(x).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const P = snap.polygon, S = snap.stellar;
const pSrc = `facts.md, Polygon block ${P.block.toLocaleString("en-US")}, ${day(P.time)}`;
const sSrc = `facts.md, Stellar ledger ${S.ledger.toLocaleString("en-US")}, ${day(S.time)}`;
const loans = (P.loans || []).filter((l) => l.status !== "removed");
const n = (st) => loans.filter((l) => l.status === st).length;
const repaid = n("repaid"), defaulted = n("defaulted"), live = n("live");
const jr = Number(P.juniorDeposits) || 0, sr = Number(P.seniorDeposits) || 0;
const noTarget = (a) => a.split(/(?<=\.)\s+/).filter((s) => !/\d\s*[–-]\s*\d+%|\d+%\s*a year/.test(s)).join(" ");

const measured = (c) => c.rings.some((r) => r.live || r.value != null);
const howLines = how.tabs.flatMap((t) => [
  `${t.name}: ${t.title}`,
  ...t.categories.map((c) => `- ${c.name}: ${c.question} Status: ${c.status}; ${measured(c) ? "measured now" : "waiting for a baseline or data"}. Source: ${c.source}.`),
  "",
]);

const out = `# Nila: all facts for AI agents

Generated ${day(snap.generated || P.time)} from nila.land's own sources (/audit/snapshot.json, /how, the FAQ). Each figure names its source and the block or ledger it was read at. Short index: https://nila.land/llms.txt

## 1. What Nila is

Nila gives farmers in Tamil Nadu, India, a year plan for every field and the money and services to carry it out, through their own unions. The services in the plan (machine work by the acre, seed, storage) are paid with vouchers, repaid from the harvest. The cash part of a crop advance comes from the union members' own savings.

## 2. Who does what

The union (self-help groups and farmer producer organisations) admits its members, holds their savings, decides who gets a crop advance, and delivers the services and the harvest. Nila writes the rules, runs the satellite checks and the software, and publishes the proof.
Legal entities: Blockchainforcommons, a sole proprietorship registered in the Netherlands (KvK 55518559, Amsterdam); Nila Farmer Livelihoods Trust, India (Reg. Book-4/26/2026). There is no Nila company (BV) yet.

## 3. Words used on this site

- Crop advance: the cash and vouchers a member draws for one planned crop, repaid from that harvest. On-chain and in the audit it is called a loan.
- Standing-crop record: the record of one planned crop on one field in one season, tied to the member's land title. On-chain it is a FoodToken. Not an investment.
- Voucher: pays for one service from the union. Cannot be passed on.
- Year plan (crop plan): the crop on each field in each season, its cost, what it should bring in and the services it needs.
- nUSD: a dollar position on Stellar, in development, not open for deposits.

## 4. Where the money comes from

Since November 2026 the cash part of a crop advance comes only from the union members' own savings. Outside money only guarantees vouchers; it never becomes cash lent to a farmer. Members hold no tradeable token.

## 4b. Crops

${crops ? `Crops a crop advance can be drawn for, with their sowing months on the Stellar crop calendar (crop_calendar, ledger ${crops.stellarLedger.toLocaleString("en-US")}; names from the Polygon FoodToken, block ${crops.polygonBlock.toLocaleString("en-US")}; read ${day(crops.read)}). New crops are added over time.

${crops.crops.filter((c) => c.windows.length && !GREEN.has(c.name)).map((c) => `- ${label(c.name)}: sown ${months(c.windows)}`).join("\n")}

Green manures (their own crop advance, ploughed back into the soil, not sold): ${crops.crops.filter((c) => GREEN.has(c.name)).map((c) => label(c.name).toLowerCase()).join(", ")}.` : "Not read yet (npm run crops)."}

## 5. Figures

- Land titles on-chain: ${P.landTitles} (${pSrc}).
- Closed crop advances (loans) repaid in full: ${repaid} of ${repaid + defaulted}; defaults: ${defaulted} (${pSrc}).
- Crop advances still running on Polygon: ${live} (${pSrc}).
- Members' own savings in the Polygon fund: ${inr(jr)} of ${inr(jr + sr)}, ${Math.round((jr / (jr + sr)) * 100)}% (${pSrc}).
- Stellar mainnet contracts deployed 6 November 2026; crop advances drawn on Stellar so far: ${Number(S.union?.borrows) || 0} (${sSrc}).
- Members: about 2,000 in 3 unions, about 90% women. These are the unions' own figures, not on-chain.

## 6. What is measured and what is not

${howLines.join("\n")}Not measured at all yet: household income, food security, yield gains.

## 7. Not ready yet

nUSD (not open for deposits). The harvest board for buyers (not live). Crop advances on Stellar (the first year plans run in 2026–27). Baselines for most measures in section 6.

## 8. How to verify

- On-chain fact sheet with every contract on Polygon and Stellar, read calls and an open-items list written to be challenged: https://nila.land/audit/facts.txt
- Every value read, per crop advance with tx hashes: https://nila.land/audit/snapshot.json
- Stellar contract code: https://github.com/NilaDAO/nila-soroban

## 9. Questions and answers

${FAQ.map(([q, a]) => `Q: ${q}\nA: ${noTarget(a)}`).join("\n\n")}

## 9b. Integrated with

${PARTNERS.map((p) => `- ${p.name}: ${p.what}: ${p.href}`).join("\n")}

## 10. Contact

All enquiries go to info@nila.land. Use the subject line below so the right person answers.

- Impact funders, foundations and grant makers: subject "Funding: <organisation>". Include the programme or grant name, the amount range, the deadline, and whether funds can go to a Dutch sole proprietorship. Nila's Indian trust cannot receive grants or foreign funds.
- Investors (people, funds, RWA or crypto funds): subject "Investor: <name>". Include who you are, the jurisdiction and the amount you have in mind. nUSD is not open for deposits.
- Food buyers and sourcing teams: subject "Sourcing: <crop>". Include the crop and variety, the quantity per season, the delivery region and the quality conditions. The harvest board is not live; enquiries now help plan next season's crops.
- Journalists and researchers: subject "Press: <outlet>". Include the deadline and the questions. Start from facts.md; its open-items list names what is not proven.
- Farmer organisations in India (self-help groups, FPOs): subject "Union: <name, district>". Include the number of members and the crops grown. Nila works with unions in Tamil Nadu for now.

## 11. What Nila does not do

- Nila does not lend to farmers and holds no client money; the union lends from its members' savings.
- Outside money does not become cash lent to farmers.
- No token sale. Members hold no tradeable token; vouchers and standing-crop records cannot be sold.
- nUSD is not open for deposits.
- No grants to the Indian trust.
- No carbon or methane claims.
- No promise of a return, a harvest volume or a delivery date.
`;

// The fact sheet as .txt too: Amplify's rewrite rule serves .md as the app's index.html (Carst, 12 Nov). The site links
// to facts.txt; facts.md stays the file the audit script writes.
fs.copyFileSync(path.join(ROOT, "public/audit/facts.md"), path.join(ROOT, "public/audit/facts.txt"));
fs.writeFileSync(path.join(ROOT, "public/llms-full.txt"), out);

// llms.txt is hand-written except the partner list between its markers (src/w1/partners.js, Carst 12 Nov).
const short = path.join(ROOT, "public/llms.txt");
fs.writeFileSync(short, fs.readFileSync(short, "utf8").replace(/<!-- partners -->[\s\S]*?<!-- \/partners -->/,
  `<!-- partners -->\n${PARTNERS.map((p) => `- [${p.name}](${p.href}): ${p.what}.`).join("\n")}\n<!-- /partners -->`));
console.log(`[llms] wrote public/llms-full.txt (${out.length} chars, ${pSrc})`);
