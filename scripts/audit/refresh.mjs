#!/usr/bin/env node
// Refresh the public audit (nila.land/audit) from both chains. Read-only: no keys, no transactions.
//
//   npm run audit            read Polygon + Stellar, write public/audit/{snapshot.json, loan-tape.csv, facts.md}
//   npm run audit -- --dry   read and print, write nothing
//
// facts.md: only the blocks between <!-- gen:NAME --> and <!-- /gen:NAME --> are rewritten; the prose around them
// is Carst's and stays. When a figure changes, re-read §2 (claims) and §7 (changes) by hand.
// Endpoints: POLYGON_RPC / STELLAR_RPC override config.json. Cadence and deploy: scripts/audit/README.md.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ethers } from "ethers";
import { rpc as srpc, xdr, Contract as SContract, TransactionBuilder, Networks, Address, scValToNative, BASE_FEE } from "@stellar/stellar-sdk";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT = path.join(ROOT, "public/audit");
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, "config.json"), "utf8"));
const STATE_FILE = path.join(HERE, "state.json");
const DRY = process.argv.includes("--dry");

const log = (...a) => console.log("[audit]", ...a);
const fmt = (n, d = 2) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const nin = (v) => Number(ethers.formatUnits(v, 18));
const day = (ts) => new Date(Number(ts) * 1000).toISOString().slice(0, 10);
const abi = (f) => { const a = JSON.parse(fs.readFileSync(path.join(ROOT, `src/components/ABI/${f}.json`), "utf8")); return a.abi || a; };
const short = (a) => `${a.slice(0, 6)}…${a.slice(-4)}`;

// ───────────────────────────── Polygon ─────────────────────────────
async function readPolygon(state) {
  const P = CFG.polygon, C = P.contracts, U = P.union;
  const p = new ethers.JsonRpcProvider(process.env.POLYGON_RPC || P.rpc, 137, { staticNetwork: true });
  const head = await p.getBlock((await p.getBlockNumber()) - 10); // a few blocks back: load-balanced RPCs lag per node
  const at = { blockTag: head.number };
  const erc = ["function totalSupply() view returns (uint256)", "function name() view returns (string)", "function symbol() view returns (string)", "function decimals() view returns (uint8)"];
  const land = new ethers.Contract(C.landTitle, erc, p);
  const ninT = new ethers.Contract(C.nin, erc, p);
  const core = new ethers.Contract(C.core, abi("genericFundCore"), p);
  const viewer = new ethers.Contract(C.viewer, abi("genericFundViewer"), p);
  const fx = new ethers.Contract(C.fxPool, abi("NilaFxPool"), p);

  const code = {};
  for (const [k, a] of Object.entries(C)) code[k] = (await p.getCode(a, head.number)) !== "0x";
  const union = await viewer.getUnion(U, at);
  const fundType = union.fundTypes[0];
  const [jr, sr] = [await viewer.getFundTotalsByTranche(0, U, fundType, at), await viewer.getFundTotalsByTranche(1, U, fundType, at)];
  const jm = await core.getJuniorMarket(U, fundType, at);
  const sm = await core.getSeniorMarket(U, at);
  const v = {
    block: head.number, time: new Date(head.timestamp * 1000).toISOString().replace(".000", ""),
    code,
    landTitles: Number(await land.totalSupply(at)),
    nin: { name: await ninT.name(at), symbol: await ninT.symbol(at), decimals: Number(await ninT.decimals(at)), supply: nin(await ninT.totalSupply(at)) },
    fx: { last: Number(await fx.lastFxRate(at)) / 1e8, obs: Number(await fx.lastObsRate(at)) / 1e8, twap: Number(await fx.twapRate(at)) / 1e8 },
    union: { name: union.name, active: union.active, fund: ethers.decodeBytes32String(fundType), fundId: union.fundIds[0] },
    juniorDeposits: nin(jr.totalDeposits), seniorDeposits: nin(sr.totalDeposits),
    borrows: nin(await core.unionBorrowsAgg(U, at)),
    juniorCash: nin(jm.cash ?? jm[0]), seniorCash: nin(sm.cash ?? sm[0]),
    treasury: nin(await core.unionTreasury(U, at)), rainy: nin(await core.unionRainyDay(U, at)),
    claimable: nin(await core.unionClaimable(U, at)), juniorPending: nin(await core.juniorPendingPrincipal(U, fundType, at)),
    treasuryFeeBP: Number(await core.treasuryFeeBP(at)), rainyFeeBP: Number(await core.rainyFeeBP(at)),
  };

  // Loan events since the last scan (no new Polygon loans are expected: wind-down, LOAN_RULES "Existing Polygon loans").
  const topicUnion = ethers.zeroPadValue(U, 32);
  const ev = {};
  for (const n of ["LoanClaimed", "LoanRepaid", "LoanRemoved", "LoanDefaulted"]) ev[core.interface.getEvent(n).topicHash] = n;
  const found = [];
  for (let from = state.polygon.lastScannedBlock + 1; from <= head.number; from += P.logChunk + 1) {
    const to = Math.min(from + P.logChunk, head.number);
    const logs = await p.getLogs({ address: C.core, topics: [Object.keys(ev), topicUnion], fromBlock: from, toBlock: to });
    for (const l of logs) found.push({ name: ev[l.topics[0]], loanId: l.topics[2], block: l.blockNumber, tx: l.transactionHash, data: core.interface.parseLog(l) });
    if ((to - state.polygon.lastScannedBlock) % 200000 < P.logChunk) log(`polygon logs scanned to ${to}`);
  }
  for (const f of found) f.date = day((await p.getBlock(f.block)).timestamp);
  v.events = found;

  // Every loan in the tape (+ any newly claimed) read from storage.
  const tape = readTape();
  for (const f of found.filter((e) => e.name === "LoanClaimed")) {
    const short = "0x" + f.loanId.slice(2).replace(/^0+/, "").padStart(8, "0");
    if (!tape.rows.find((r) => r.loan_id === short)) tape.rows.push({ loan_id: short, union: v.union.name, fund_type: `${v.union.fund} (${v.union.fundId})`, origination_date: f.date, origination_tx_hash: f.tx, _new: true });
  }
  for (const r of tape.rows) {
    const id = ethers.zeroPadValue(r.loan_id, 32);
    const l = await core.loans(U, id, at);
    const b = await viewer.getBorrowerInfo(U, id, at);
    r._borrower = l.borrower;
    r._principal = nin(l.principal);
    const status = l.principal === 0n ? (r.status === "removed" ? "removed" : "removed") : l.defaulted ? "defaulted" : l.liquidated ? "repaid" : "live";
    r.status = status;
    if (r._new) { r.amount_inr = fmt(r._principal).replace(/,/g, ""); r.rate_pct = (Number(l.rateBP) / 100).toFixed(2); }
    if (status !== "removed") {
      r.pct_principal_repaid = l.principal ? ((Number(l.principalPaid) / Number(l.principal)) * 100).toFixed(2) : "0.00";
      r.principal_repaid_inr = nin(l.principalPaid).toFixed(2);
      r.interest_paid_inr = nin(l.interestPaid).toFixed(2);
      r.outstanding_incl_interest_inr = status === "live" ? nin(b.outstanding).toFixed(2) : "0.00";
      r.maturity_date_onchain = Number(l.maturityTs) ? day(l.maturityTs) : "";
      r._maturityTs = Number(l.maturityTs);
      r._created = Number(l.drawdownTs || l.createTs);
    }
    const rep = found.filter((e) => e.name === "LoanRepaid" && e.loanId === id).pop();
    if (rep) { r.repayment_date = rep.date; r.last_repayment_tx_hash = rep.tx; }
  }
  v.tape = tape;
  return v;
}

function readTape() {
  const f = path.join(HERE, "loan-tape.csv"); // input list of loan ids; not published (Carst, 11 Nov)
  const [head, ...lines] = fs.readFileSync(f, "utf8").trim().split("\n");
  const cols = head.split(",");
  return { cols, rows: lines.map((l) => Object.fromEntries(l.split(",").map((x, i) => [cols[i], x]))) };
}
function writeTape(t) {
  const body = [t.cols.join(","), ...t.rows.map((r) => t.cols.map((c) => r[c] ?? "").join(","))].join("\n") + "\n";
  fs.writeFileSync(path.join(HERE, "loan-tape.csv"), body);
}

// ───────────────────────────── Stellar ─────────────────────────────
async function readStellar() {
  const S = CFG.stellar;
  const s = new srpc.Server(process.env.STELLAR_RPC || S.rpc);
  const ledger = await s.getLatestLedger();
  const contracts = {};
  for (const [name, id] of Object.entries(S.contracts)) {
    try {
      const e = await s.getContractData(id, xdr.ScVal.scvLedgerKeyContractInstance(), srpc.Durability.Persistent);
      const ex = e.val.contractData.val.instance.executable;
      const isWasm = ex.type === "contractExecutableWasm";
      contracts[name] = { id, exists: true, wasm: isWasm ? ex.wasmHash.toString("hex") : null, asset: ex.type === "contractExecutableStellarAsset", lastModified: e.lastModifiedLedgerSeq };
    } catch (err) {
      contracts[name] = { id, exists: false, error: String(err.message || err).slice(0, 120) };
    }
  }
  const acct = await s.getAccount(S.defaultUnion);
  const call = async (id, fn, ...args) => {
    const tx = new TransactionBuilder(acct, { fee: BASE_FEE, networkPassphrase: Networks.PUBLIC }).addOperation(new SContract(id).call(fn, ...args)).setTimeout(30).build();
    const r = await s.simulateTransaction(tx);
    if (srpc.Api.isSimulationError(r)) throw new Error(`${fn}: ${r.error}`);
    return scValToNative(r.result.retval);
  };
  const u = new Address(S.defaultUnion).toScVal();
  const core = S.contracts.fund_core;
  const scale = 10 ** S.nin.decimals;
  const book = await call(core, "union_book", u);
  const jm = await call(core, "get_junior_market", u);
  const sm = await call(core, "get_senior_market", u);
  const asset = await (await fetch(`${S.horizon}/assets?asset_code=${S.nin.code}&asset_issuer=${S.nin.issuer}`)).json();
  const a = asset._embedded?.records?.[0];
  const closed = await (await fetch(`${S.horizon}/ledgers/${ledger.sequence}`)).json().catch(() => ({}));
  return {
    ledger: ledger.sequence, time: closed.closed_at || null, contracts,
    union: {
      account: S.defaultUnion, exists: await call(core, "union_exists", u),
      borrows: Number(book.borrows) / scale, treasury: Number(book.treasury) / scale, rainy: Number(book.rainy) / scale,
      earmark: Number(book.earmark) / scale, onHold: Number(book.on_hold),
      juniorCash: Number(jm.cash) / scale, juniorBorrows: Number(jm.total_borrows) / scale,
      seniorCash: Number(sm.cash) / scale, seniorBorrows: Number(sm.total_borrows) / scale,
    },
    nin: a ? { holders: a.accounts?.authorized ?? null, inAccounts: Number(a.balances?.authorized ?? 0), inContracts: Number(a.contracts_amount ?? 0) } : { holders: 0, inAccounts: 0, inContracts: 0 },
  };
}

// ───────────────────────────── facts.md blocks ─────────────────────────────
function blocks(pg, st, prev) {
  const P = CFG.polygon, S = CFG.stellar, C = P.contracts;
  const link = (a) => `[\`${a}\`](${P.explorer}${a})`;
  const slink = (id) => `[\`${id}\`](${S.explorer}${id})`;
  const usd = (x) => fmt(x / pg.fx.last);
  const aum = pg.juniorDeposits + pg.seniorDeposits;
  const rows = pg.tape.rows;
  const by = (s) => rows.filter((r) => r.status === s);
  const sum = (rs, k) => rs.reduce((t, r) => t + Number(r[k] || r._principal || 0), 0);
  const live = by("live"), repaid = by("repaid"), removed = by("removed"), defaulted = by("defaulted");
  const nowS = Date.parse(pg.time) / 1000;
  const ages = live.map((r) => Math.round((nowS - r._created) / 86400)).filter((x) => x > 0).sort((a, b) => a - b);
  const oldest = live.reduce((o, r) => (!o || r._created < o._created ? r : o), null);
  const borrowersAll = new Set(rows.filter((r) => r._borrower && r._borrower !== ethers.ZeroAddress).map((r) => r._borrower.toLowerCase()));
  const borrowersLive = new Set(live.map((r) => r._borrower.toLowerCase()));
  const small = repaid.filter((r) => r._principal <= 1500);
  const lastRepaid = prev.polygon.lastRepaid, lastClaimed = prev.polygon.lastClaimed;
  const st0 = (k) => st.contracts[k];

  return {
    header: `Last updated: ${pg.time.slice(0, 10)} (generated by \`scripts/audit/refresh.mjs\`). Polygon figures were read at block **${pg.block.toLocaleString("en-US")}** (${pg.time}); Stellar figures at ledger **${st.ledger.toLocaleString("en-US")}**${st.time ? ` (${st.time})` : ""}. Previous snapshot: Polygon block ${prev.polygon.block.toLocaleString("en-US")} (${prev.polygon.date}) — see §7 for what changed.`,

    "polygon-contracts": [
      "| Contract | Address | Verified fact | Method |",
      "|---|---|---|---|",
      `| NilaLandTitle (ERC-721, land titles) | ${link(C.landTitle)} | \`totalSupply()\` = **${pg.landTitles}** | \`eth_call\`, selector \`0x18160ddd\` |`,
      `| Nila Note / "nIN" (ERC-20, rupee-pegged) | ${link(C.nin)} | \`name()\` = "${pg.nin.name}", \`symbol()\` = "${pg.nin.symbol}", \`decimals()\` = ${pg.nin.decimals}, \`totalSupply()\` = ${fmt(pg.nin.supply)}. This is the token \`GenericFundCore.nin()\` returns. | \`eth_call\` |`,
      `| Food tokens (ERC-1155) | ${link(C.foodToken)} | Contract deployed (bytecode ${pg.code.foodToken ? "present" : "**missing**"}) | \`eth_getCode\` |`,
      `| GenericFundCore (loan/fund logic) | ${link(C.core)} | Contract deployed; holds the loan structs and emits all loan lifecycle events below. | \`eth_getCode\` + \`eth_getLogs\` + \`eth_call\` |`,
      `| GenericFundViewer (read aggregator) | ${link(C.viewer)} | Contract deployed | \`eth_getCode\` |`,
      `| Roles registry | ${link(C.roles)} | Contract deployed | \`eth_getCode\` |`,
      `| FX pool (nIN↔USDT) | ${link(C.fxPool)} | \`lastFxRate()\` = ${pg.fx.last.toFixed(4)} INR per USDT; \`lastObsRate()\` = ${pg.fx.obs.toFixed(4)}; \`twapRate()\` = ${pg.fx.twap.toFixed(4)} | \`eth_call\` |`,
      `| ${pg.union.name} union (registry key in Core/Viewer) | ${link(P.union)} | \`getUnion()\` on Viewer returns name="${pg.union.name}", active=${pg.union.active}, fund "${pg.union.fund}" (id ${pg.union.fundId}). This address is a registry key inside Core/Viewer storage, not a deployed contract. | \`eth_call\` + \`eth_getCode\` |`,
    ].join("\n"),

    "polygon-union": [
      `| Metric | Value (nIN) | Value (USD at \`lastFxRate\` ${pg.fx.last.toFixed(4)}) |`,
      "|---|---:|---:|",
      `| Junior tranche deposits (member first-loss contributions, per Nila) | ${fmt(pg.juniorDeposits)} | ${usd(pg.juniorDeposits)} |`,
      `| Senior tranche deposits (investor capital) | ${fmt(pg.seniorDeposits)} | ${usd(pg.seniorDeposits)} |`,
      `| **Total AUM (junior + senior deposits)** | **${fmt(aum)}** | **${usd(aum)}** |`,
      `| Outstanding loan principal (\`unionBorrowsAgg\`) | ${fmt(pg.borrows)} | ${usd(pg.borrows)} |`,
      `| Idle cash (junior ${fmt(pg.juniorCash)} + senior ${fmt(pg.seniorCash)}) | ${fmt(pg.juniorCash + pg.seniorCash)} | ${usd(pg.juniorCash + pg.seniorCash)} |`,
      `| Treasury (accrued fees) | ${fmt(pg.treasury)} | ${usd(pg.treasury)} |`,
      `| Rainy-day reserve | ${fmt(pg.rainy)} | ${usd(pg.rainy)} |`,
      `| Claimable by withdrawing junior investors (\`unionClaimable\`) | ${fmt(pg.claimable)} | ${usd(pg.claimable)} |`,
      `| Junior principal pending unbond (\`juniorPendingPrincipal\`) | ${fmt(pg.juniorPending)} | ${usd(pg.juniorPending)} |`,
      `| Senior : junior deposit ratio | — | **${(pg.seniorDeposits / pg.juniorDeposits).toFixed(3)}× (${((pg.seniorDeposits / pg.juniorDeposits) * 100).toFixed(1)}%)** |`,
      "",
      `Fee configuration: \`treasuryFeeBP\` = ${pg.treasuryFeeBP} (${pg.treasuryFeeBP / 100}%), \`rainyFeeBP\` = ${pg.rainyFeeBP} (${pg.rainyFeeBP / 100}%).`,
      "",
      `USD conversion mirrors Nila's own frontend: nIN is pegged 1:1 to INR, USD = nIN ÷ \`lastFxRate\`. At the more recent \`lastObsRate\` (${pg.fx.obs.toFixed(4)}) total AUM is $${fmt(aum / pg.fx.obs, 0)}.`,
    ].join("\n"),

    "polygon-loans": [
      "| Status | Count | Principal (₹) | Definition |",
      "|---|---:|---:|---|",
      `| \`live\` | ${live.length} | ${fmt(live.reduce((t, r) => t + r._principal, 0))} | \`liquidated = false\`, \`defaulted = false\`. Contract-computed outstanding incl. accrued interest: **₹${fmt(sum(live, "outstanding_incl_interest_inr"))}** |`,
      `| \`repaid\` | ${repaid.length} | ${fmt(repaid.reduce((t, r) => t + r._principal, 0))} | \`liquidated = true\`, \`defaulted = false\`, \`principalPaid = principal\` |`,
      `| \`removed\` | ${removed.length} | — | Claimed, then removed via \`LoanRemoved\`; loan struct is empty |`,
      `| \`defaulted\` | **${defaulted.length}** | ${defaulted.length ? fmt(defaulted.reduce((t, r) => t + r._principal, 0)) : "—"} | \`defaulted = true\` |`,
      `| **Total loan IDs** | **${rows.length}** | ${fmt([...live, ...repaid, ...defaulted].reduce((t, r) => t + r._principal, 0))} originated (excl. removed) | |`,
      "",
      "Other on-chain facts:",
      `1. Last \`LoanRepaid\` (loan close): block ${lastRepaid.block.toLocaleString("en-US")}, **${lastRepaid.date}**. Last new loan (\`LoanClaimed\`): block ${lastClaimed.block.toLocaleString("en-US")}, **${lastClaimed.date}**.`,
      `2. \`maturityTs\` is set on ${live.filter((r) => r._maturityTs).length} of the ${live.length} live loans${live.some((r) => !r._maturityTs) ? " — the others carry no due date on-chain" : ""}.`,
      ages.length ? `3. Live-loan age at snapshot: oldest ${ages[ages.length - 1]} days (${day(oldest._created)}), median ~${ages[Math.floor(ages.length / 2)]} days.` : "3. No live loans.",
      `4. Distinct borrower addresses: ${borrowersAll.size} across all loans (${borrowersLive.size} on live loans).`,
      `5. ${small.length} of the ${repaid.length} repaid loans are ≤ ₹1,500 (₹${fmt(small.reduce((t, r) => t + r._principal, 0), 0)} in total).`,
      "",
      "Machine-readable snapshot of every figure on this page, including every loan with its tx hashes: [`snapshot.json`](/audit/snapshot.json).",
    ].join("\n"),

    stellar: [
      `Deployed on ${S.deployedOn} from the public tag \`${S.tag}\` of [nila-soroban](https://github.com/NilaDAO/nila-soroban). Each contract below was read at ledger ${st.ledger.toLocaleString("en-US")}: its on-chain instance exists and runs the WASM hash shown (compare with a build of the tag), or is a Stellar asset contract.`,
      "",
      "| Contract | Id | Verified fact |",
      "|---|---|---|",
      ...Object.entries(st.contracts).map(([n, c]) => `| ${n} | ${slink(c.id)} | ${c.exists ? (c.asset ? "Stellar asset contract (SAC)" : `instance live, WASM \`${c.wasm.slice(0, 12)}…\``) : `**not found** (${c.error})`} |`),
      "",
      `Union state on Stellar, read from \`fund_core\` for the first union account ([\`${short(st.union.account)}\`](${S.accountExplorer}${st.union.account})): union known = ${st.union.exists}, cash lent out = ${fmt(st.union.borrows)} nIN, member savings in the pool = ${fmt(st.union.juniorCash)} nIN, senior cash = ${fmt(st.union.seniorCash)} nIN, treasury = ${fmt(st.union.treasury)} nIN, crop shares past their payback date = ${st.union.onHold}.`,
      "",
      `nIN on Stellar (Horizon asset stats): ${st.nin.holders ?? 0} holder accounts, ${fmt(st.nin.inAccounts)} nIN in accounts, ${fmt(st.nin.inContracts)} nIN in contracts.`,
      "",
      "Reproduce: Soroban RPC `getLedgerEntries` on each contract's instance key; `simulateTransaction` of `fund_core.union_book(union)`, `get_junior_market(union)`, `get_senior_market(union)`; Horizon `/assets?asset_code=nIN&asset_issuer=" + S.nin.issuer + "`. Soroban RPC keeps events for about 7 days, so history is read through Horizon.",
    ].join("\n"),
  };
}

function patchFacts(md, b) {
  for (const [name, body] of Object.entries(b)) {
    const re = new RegExp(`(<!-- gen:${name} -->\\n)[\\s\\S]*?(\\n<!-- /gen:${name} -->)`);
    if (!re.test(md)) throw new Error(`facts.md has no <!-- gen:${name} --> block`);
    md = md.replace(re, `$1${body}$2`);
  }
  return md;
}

// ───────────────────────────── main ─────────────────────────────
const state = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
log("reading Polygon from block", state.polygon.lastScannedBlock + 1);
const pg = await readPolygon(state);
log(`polygon block ${pg.block}: ${pg.tape.rows.length} loans, ${pg.events.length} new events`);
log("reading Stellar");
const st = await readStellar();
log(`stellar ledger ${st.ledger}: ${Object.values(st.contracts).filter((c) => c.exists).length}/${Object.keys(st.contracts).length} contracts live`);

const lastOf = (n) => pg.events.filter((e) => e.name === n).pop();
const next = structuredClone(state);
next.polygon.lastScannedBlock = pg.block;
if (lastOf("LoanRepaid")) next.polygon.lastRepaid = { block: lastOf("LoanRepaid").block, date: lastOf("LoanRepaid").date };
if (lastOf("LoanClaimed")) next.polygon.lastClaimed = { block: lastOf("LoanClaimed").block, date: lastOf("LoanClaimed").date };
const b = blocks(pg, st, { polygon: { ...state.polygon, lastRepaid: next.polygon.lastRepaid, lastClaimed: next.polygon.lastClaimed } });
next.polygon.block = pg.block;
next.polygon.date = pg.time.slice(0, 10);

const snapshot = {
  generated: new Date().toISOString(), generator: "scripts/audit/refresh.mjs",
  polygon: { ...pg, tape: undefined, events: pg.events.map(({ data, ...e }) => e), loans: pg.tape.rows.map(({ _new, ...r }) => r) },
  stellar: st,
};
const json = JSON.stringify(snapshot, (k, v) => (typeof v === "bigint" ? v.toString() : v), 2);

if (DRY) {
  console.log(b["polygon-union"], "\n\n", b["polygon-loans"], "\n\n", b.stellar);
  log("dry run: nothing written");
} else {
  fs.writeFileSync(path.join(OUT, "snapshot.json"), json + "\n");
  writeTape(pg.tape);
  const f = path.join(OUT, "facts.md");
  fs.writeFileSync(f, patchFacts(fs.readFileSync(f, "utf8"), b));
  fs.writeFileSync(STATE_FILE, JSON.stringify(next, null, 2) + "\n");
  log("wrote public/audit/snapshot.json, facts.md, scripts/audit/loan-tape.csv; state.json updated");
  await import("../llms/build.mjs"); // llms-full.txt carries the new figures too
  log("check by hand: facts.md §2 claims and §7 changes still match the new figures, then build and deploy");
}
