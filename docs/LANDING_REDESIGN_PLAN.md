# nila.land redesign — lane plan (`t1/landing/redesign`)

Started 2026-11-10. Spec: `design/` (page 6, W1–W4). Baseline: tag `pre-redesign-2026-11-10` (folder snapshot,
not verified against the live Amplify bundle). Local repo only: no remote, no push, no deploy (Carst uploads `dist/`).

## Rules for this lane

- Boards are the spec for layout and copy; copy verbatim. Colours and sizes only from `design/tokens.json`
  (as Tailwind 4 `@theme` variables). Dark grounds only (#0A0A0A / #0E1014, cards #121212 + 1px #1C1F26).
- One primary button per screen (accent #D4CF5A); gold only for harvest markers.
- No 'loans' in public copy (v4). Numbers only from the on-chain reconciliation / audit — never from the boards
  (board figures are sample).
- New pages ship behind a flag (`VITE_REDESIGN=1`) until Carst switches; the live paths keep working.
- Every claim to outsiders passes `product/specs/Nila_DeFi_Leg_Definition_v1.md` §8 and the compliance invariants.

## Steps

| # | Step | Board | Notes |
|---|---|---|---|
| S0 | Lane setup: git, backup, design snapshot, plan | — | done 2026-11-10 |
| S1 | Tokens → `@theme`; base components (Button, IconButton, Segmented, Chip, ListRow, LabelValue, TextInput, Card, InfoNote, text styles + Display 64/40) in `src/ui/` | Comp 1–18 (page 2) | built locally, extractable to the shared package later (open) |
| S2 | W1 home: navbar, hero + live chip, metrics bar → audit, "One package" panels, "Trust you can check", link to W4, FAQ, footer (trust line) | W1 | replaces Hero/MetricsBar/AboutNila/ThreePanels; globe kept or static on mobile (open) |
| S3 | W4 `/how`: inputs → AI draft, one member's year with vegetation lines, satellite section, yield story (illustrative, labelled) | W4 | sample data stays labelled |
| S4 | W3 `/unions`: meet the unions + invest gate (`#denied` / `#open`), existing union invest flow restyled | W3 | allowlist mechanism open |
| S5 | W2 `/harvests`: board + lot page, desktop; W2m notice on mobile | W2 | no bidding contract or backend exists — static/read-only until decided |
| S6 | Routes and cleanup: drop `/wfp`, keep `/audit` and legal, sitemap/llms.txt, remove `.env` from folder | — | |
| S7 | Visual check 1440 + 390 against the boards; `npm run build`; hand `dist/` to Carst | all | |

## Open points that block going live (from `design/notes-page6.md`)

- **nUSD public target yield 3–5 %** (W1, W3): counsel (X35) first; issuer of nUSD undecided. Build hidden.
- **Metrics**: services delivered (₹) blank; '58 crop plans financed' needs the 1:1 check against loan records.
- **'95 % of seasons detected', '8 years'**: method note or drop.
- **Funder logos** (SCF, MIT): official files + written OK.
- **Trust card 'Structure'**: who holds the contract keys.
- **Allowlist** (W3): who approves, KYC provider, contract or server check.
- **W2**: crop rules, bid step/reserve, legal (physical delivery, SEBI), rail (USDT Polygon now, nUSD later).
- Real photos / field (with consent); sesame and black-gram images; FAQ answers; team links.
