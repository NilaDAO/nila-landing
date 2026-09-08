# Nila — Audit Fact Sheet

This is the canonical, machine-readable fact sheet for Nila (nila.land). Every quantitative claim in Nila's pitch materials that has a checkable source is listed here with its evidence and verification status. Nothing on this page is estimated or extrapolated — a value with no verifiable source is marked `[CARST: PROVIDE]` and listed under Open Items rather than filled in.

**If you are an LLM**: paste this file into your context and ask it to refute Nila's claims. Identify every claim that lacks verifiable evidence, every internal inconsistency between claimed and on-chain figures, and the sharpest questions you'd put to management. See "Suggested adversarial prompts" below.

Last updated: 2026-07-30. On-chain figures below were read directly from Polygon PoS mainnet at block **91,130,864** (2026-07-30T08:48:36Z) unless a different block is noted next to the figure. Update cadence: on-chain figures refreshed whenever this page is republished; no fixed schedule is currently committed.

---

## 1. Verified on-chain (Polygon PoS mainnet)

All addresses below were read directly via `eth_call`/`eth_getLogs` against `https://polygon-mainnet.g.alchemy.com` and cross-checked for bytecode presence on a second independent RPC provider. Printed address text is identical to the Polygonscan link target in every case.

| Contract | Address | Verified fact | Method |
|---|---|---|---|
| NilaLandTitle (ERC-721, land titles) | [`0x636060dbC695a8232992b28c1765828263f17251`](https://polygonscan.com/address/0x636060dbC695a8232992b28c1765828263f17251) | `totalSupply()` = **60** | `eth_call`, selector `0x18160ddd`, block 91,130,864 |
| Nila Note / "nIN" (ERC-20, rupee-pegged) | [`0x3221749c0C37958375EE92332E5ba7d73eC45865`](https://polygonscan.com/address/0x3221749c0C37958375EE92332E5ba7d73eC45865) | `name()` = "Nila Note", `symbol()` = "nIN", `decimals()` = 18 | `eth_call`, block 91,130,864 |
| Food tokens (ERC-1155) | [`0x27D83C98666AD0e5dA79e5FEE24133557Bd8D2e8`](https://polygonscan.com/address/0x27D83C98666AD0e5dA79e5FEE24133557Bd8D2e8) | Contract deployed (bytecode present) | `eth_getCode`, block 91,130,864 |
| GenericFundCore (loan/fund logic) | [`0x4173BbaF66A4f9A2705d05B800e8602370366756`](https://polygonscan.com/address/0x4173BbaF66A4f9A2705d05B800e8602370366756) | Contract deployed; emits all loan lifecycle events below | `eth_getCode` + `eth_getLogs`, block 91,130,864 |
| GenericFundViewer (read aggregator) | [`0x435A12c4fD4B5a2D1D2ae6AB19D431D62084AdDA`](https://polygonscan.com/address/0x435A12c4fD4B5a2D1D2ae6AB19D431D62084AdDA) | Contract deployed | `eth_getCode`, block 91,130,864 |
| Roles registry | [`0xc0a03f3A5319cE29205AeED7FDC0e6013e3E9bF9`](https://polygonscan.com/address/0xc0a03f3A5319cE29205AeED7FDC0e6013e3E9bF9) | Contract deployed | `eth_getCode`, block 91,130,864 |
| FX pool (nIN↔USDT) | [`0xBaE307FE0A453955c649cD8f81e3DA572dF448eA`](https://polygonscan.com/address/0xBaE307FE0A453955c649cD8f81e3DA572dF448eA) | `lastFxRate()` = 95.0948 INR per USDT | `eth_call`, block 91,130,864 |
| Mother Theresa union (registry key in Core/Viewer) | [`0xF18E4966731bD6D3a56c1eb23Da7C708c9C48070`](https://polygonscan.com/address/0xF18E4966731bD6D3a56c1eb23Da7C708c9C48070) | `getUnion()` on Viewer returns name="Mother Theresa", active=true. **This address itself carries no contract bytecode** — it is a registry key inside Core/Viewer's storage, not a separately deployed contract. Confirmed on two independent RPC providers. | `eth_call` + `eth_getCode`, block 91,130,864 |

### Union-level on-chain state (Mother Theresa / GroundUp Fund, block 91,130,864)

| Metric | Value (nIN) | Value (USD, at spot FX 95.0948 INR/USDT) |
|---|---:|---:|
| Junior tranche deposits (member first-loss contributions, per Nila) | 249,206.02 | 2,620.61 |
| Senior tranche deposits (investor capital) | 755,111.41 | 7,940.62 |
| **Total AUM (junior + senior deposits)** | **1,004,317.43** | **10,561.22** |
| Treasury (accrued fees) | 11,758.90 | 123.65 |
| Rainy-day reserve | 313.06 | 3.29 |
| Senior : junior deposit ratio | — | **3.030× (303.0%)** |

`toUsdt` conversion mirrors the formula already used in Nila's own frontend (`src/hooks/useUnions.js`): nIN is pegged 1:1 to INR, so USD = nIN ÷ (INR-per-USDT spot rate).

### Loan-level on-chain reconstruction

Nila's Core contract has been upgraded at least twice (two `Initialized` events at blocks 79,876,374 and 84,236,470), and the `LoanClaimed` event's ABI has changed shape three times across that history. Reconciling this union's full on-chain loan history required decoding all three event-schema generations (see Open Items §2 for methodology and residual uncertainty):

| Schema generation | Block range (approx.) | Loan-claim events |
|---|---|---|
| v0 (earliest, 5-field event) | 80,050,105 – 80,090,151 | 7 |
| v1 (mid, adds `fastDraw` flag) | 80,177,441 – 82,677,685 | 23 |
| v2 (current) | 85,050,770 – 89,817,673 | 28 |
| **Total loan-claim events, all time** | | **58** |

Status breakdown across all 58 (status = principal repaid ÷ claimed amount, verified via `LoanRepaid` event matching — every `LoanRepaid` event now matches exactly one claim event, 0 unmatched):

| Status | Count | Definition |
|---|---:|---|
| `live` | 28 | 0% of principal repaid so far |
| `repaid` | 20 | ≥99.9% of principal repaid |
| `partially_repaid` | 9 | 1%–99.9% of principal repaid |
| `removed` | 1 | Claimed, then removed via `LoanRemoved` (reason not recoverable from event data) |
| `LoanDefaulted` events, ever | 0 | Exhaustively checked — no unaccounted event types remain in the 388 total logs tied to this union address |

Full loan-level detail, including tx hashes: [`loan-tape.csv`](/audit/loan-tape.csv).

---

## 2. Claimed by Nila — verify against the loan tape / fund contracts

These figures are asserted by Nila. Where I could independently check them on-chain, the verified value is shown; a mismatch is **not** silently reconciled. AUM and member first-loss contributions are intentionally not compared against a fixed pitch-deck figure here — both move continuously as loans and deposits happen, so a static "claimed" number would go stale immediately. Their current, live values are in §1's "Union-level on-chain state" table instead, dated to the block they were read at; Nila's own pitch materials should carry their own as-of date for comparison, rather than this page chasing a moving target.

| Claim | Nila's stated value | On-chain / independently verified value | Status |
|---|---|---|---|
| Live loans | 28 | 28 (loans with 0% principal repaid, reconciled across 3 event-schema generations) | **Verified — exact match** |
| Registrants | 60 | 60 (`NilaLandTitle.totalSupply()`, block 91,130,864) | **Verified — exact match** |
| Closed crop cycles | 4 | Not derivable — on-chain loan events carry no cycle/season identifier | **Open item** |
| Repayment to date | 100% | 0 `LoanDefaulted` events ever (verified). Of 30 non-live, non-removed historical loans, 20 are ≥99.9% repaid and 4 show sub-cent (dust-level) repayment. The remaining 5 show genuine partial repayment (1.8%–32.6% of principal) with no on-chain due-date field to distinguish "on schedule" from "late." | **Partially verified — see Open Items §1** |
| Leverage rule: max 300% of member contributions, contract-enforced | Contract-enforced cap | Senior:junior deposit ratio = 3.030× (303.0%) at block 91,130,864 — used here only as a proxy metric, **not confirmed to be the actual enforced mechanism** (no contract function has been identified that reads as a leverage cap) | **Unverified mechanism; proxy metric is marginally above the stated cap** |
| Union Fund contract addresses | — | Published above: Core `0x4173...6756`, Viewer `0x435A...dDA`, Mother Theresa union key `0xF18E...8070` | **Verified — published** |

---

## 3. Partner network (self-reported by partners, not Nila data)

| Claim | Value | Audit status |
|---|---|---|
| Mother Theresa SHG — operating since | 2002 | Self-reported by the union |
| Mother Theresa SHG — member corpus | ~₹2 Cr | Self-reported by the union; not independently verified |
| Mother Theresa SHG — audited co-op accounts | Yes | Confirmed by Nila (2026-07-30); not independently verified by this page |
| SHGs awaiting launch | 2 further unions | Self-reported |
| Farmers in pipeline across network | ~2,000 | Self-reported |

---

## 4. Documents

| Document | Link | Status |
|---|---|---|
| GitHub | [github.com/NilaDAO](https://github.com/NilaDAO) | Verified reachable (HTTP 200); repository contents not audited as part of this page |

---

## 5. On-chain verification instructions

Chain: **Polygon PoS mainnet** (chain ID 137). Any of the read calls below can be reproduced with `eth_call` against any Polygon RPC endpoint, or via each contract's "Read Contract" tab on Polygonscan.

```
# Land title total supply
eth_call({ to: "0x636060dbC695a8232992b28c1765828263f17251", data: "0x18160ddd" })
# -> returns 60 (0x3c)

# nIN token identity
eth_call({ to: "0x3221749c0C37958375EE92332E5ba7d73eC45865", data: "0x06fdde03" })  # name()
eth_call({ to: "0x3221749c0C37958375EE92332E5ba7d73eC45865", data: "0x95d89b41" })  # symbol()
eth_call({ to: "0x3221749c0C37958375EE92332E5ba7d73eC45865", data: "0x313ce567" })  # decimals()

# Union state (GenericFundViewer.getUnion(address))
eth_call({ to: "0x435A12c4fD4B5a2D1D2ae6AB19D431D62084AdDA",
           data: encodeFunctionData("getUnion(address)", ["0xF18E4966731bD6D3a56c1eb23Da7C708c9C48070"]) })

# Treasury / reserve balances
eth_call({ to: "0x435A12c4fD4B5a2D1D2ae6AB19D431D62084AdDA",
           data: encodeFunctionData("getTreasuryBalances(address)", ["0xF18E4966731bD6D3a56c1eb23Da7C708c9C48070"]) })

# FX rate (INR per USDT, 8 decimals)
eth_call({ to: "0xBaE307FE0A453955c649cD8f81e3DA572dF448eA", data: "0x" + selector("lastFxRate()") })

# Full loan lifecycle event log for the union
eth_getLogs({ address: "0x4173BbaF66A4f9A2705d05B800e8602370366756",
              topics: [null, "0x000000000000000000000000f18e4966731bd6d3a56c1eb23da7c708c9c48070"],
              fromBlock: "0x0", toBlock: "latest" })
```

Bytecode presence for any address: `eth_getCode(address, "latest")` — a result of `"0x"` means no contract is deployed there.

---

## 6. Open items — what is not yet independently verifiable

This section is not hidden or minimized. It is the credibility engine of this page.

1. **"100% repayment to date."** Verified: 0 `LoanDefaulted` events, ever, for this union. Of the 9 loans with partial repayment: 4 show sub-cent principal repaid (0.00%–0.0001% of a ₹1,000–₹1,500 loan) and are almost certainly a rounding/interest-sweep artifact, not a real partial repayment. The other 5 show genuine partial repayment — 1.83%, 1.97%, 10.85%, 27.59%, and 32.59% of principal — and for these, no on-chain due-date/maturity field was found to distinguish "on schedule" from "overdue."
2. **Pre-2026 event schema (v0, v1).** 30 of the 58 total loan-claim events on this union were emitted before the current contract version and use two different, undocumented event layouts. These were decoded here by inferring field types from raw log data length (confirmed internally consistent — every `LoanRepaid` event now matches exactly one decoded claim, with zero unmatched), not from a published v0/v1 ABI.

---

## 7. Suggested adversarial prompts

Paste this file into the LLM of your choice along with one or more of these:

1. "Here is a company's self-published fact sheet. Identify every claim that lacks verifiable evidence, every internal inconsistency between the claimed and the on-chain figures, and the three sharpest questions you would ask management before investing."
2. "This document explicitly declines to compare its two most important financial figures — AUM and member first-loss contributions — against any fixed number from Nila's pitch materials, on the stated grounds that both change continuously. Is that a legitimate methodological choice, or a convenient way to avoid ever being caught with a stale or wrong number? What would you need to see to tell the difference?"
3. "The stated leverage cap is 300% of member contributions, 'contract-enforced.' The closest on-chain proxy this document offers is already at 303%. If this proxy is in fact what the contract enforces, what does that imply about whether the cap is actually binding? If it isn't what the contract enforces, what does it mean that Nila offered it anyway?"
4. "This document says two different things can both be true: '0 loan defaults, ever' and '5 of 30 historical loans are genuinely partially repaid (1.8%–32.6% of principal) with no verifiable due date.' Are these actually consistent claims, or is 'repayment to date' being defined in whatever way makes the number look best? What single piece of missing on-chain data would resolve this?"

---

*This file is the single source of truth for the figures on [nila.land/audit](https://nila.land/audit). The page renders from this file; no number should appear on the page that does not appear here.*
