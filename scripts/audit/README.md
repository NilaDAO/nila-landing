# Audit refresh (`npm run audit`)

Reads Polygon mainnet and Stellar mainnet (read-only, no keys) and rewrites the public audit:

| File | What changes |
|---|---|
| `public/audit/facts.md` | only the `<!-- gen:… -->` blocks: header, §1 Polygon tables, §1b Stellar. §2–§8 stay hand-written |
| `public/audit/loan-tape.csv` | status, repaid, interest, outstanding, maturity and repayment columns per Polygon loan |
| `public/audit/snapshot.json` | every value read, with block / ledger |
| `scripts/audit/state.json` | last scanned Polygon block and last close / claim events (commit it) |

Takes about 30 s. `npm run audit -- --dry` prints the blocks and writes nothing.
Endpoints: public RPCs in `config.json`; override with `POLYGON_RPC=…` / `STELLAR_RPC=…`.

## Routine (weekly or monthly)

1. `npm run audit`
2. `git diff public/audit` — read what moved. If a loan closed, a count changed or a new contract appeared, update the
   hand-written §2 (claims), §6 (open items) and add a §7 entry. Then sync `NILA_STATE_OF_THE_ART.md` §1.1 and
   `Nila_Canonical_Descriptions.md` (number discipline).
3. Commit, `npm run build`, upload `dist/` to Amplify (manual, as always).

Steps 2–3 stay manual: the generator cannot judge whether a claim in the prose still holds, and the site is
deployed by hand.

## Scheduling

`land.nila.audit.plist` runs step 1 every Monday 07:00 on this Mac (launchd) and logs to `scripts/audit/last-run.log`.
Not installed. To install: `cp scripts/audit/land.nila.audit.plist ~/Library/LaunchAgents/ && launchctl load ~/Library/LaunchAgents/land.nila.audit.plist`.
It only refreshes the files; nothing is committed or deployed.

## Later

The season ledger (S9) will be written by the same script: one row per crop plan, money side from the chains, crop /
acres / harvest from nila-sensing.
