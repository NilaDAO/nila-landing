# nila.land redesign — lane plan (`t1/landing/redesign`)

Started 2026-11-10. Spec: `dev/nila-design` page 6 (`screens.json` W1–W4, `boards/Land*.dc.html`, `shots/Land*.png`, `notes/page-landing.md`). Baseline: tag `pre-redesign-2026-11-10` (folder snapshot,
not verified against the live Amplify bundle). Local repo only: no remote, no push, no deploy (Carst uploads `dist/`).

## Rules for this lane

- Scope (Carst, 10 Nov): W1 + W1 mobile first; the old 'Meet the unions' pages stay as they are (W3 not built).
- Boards are the spec for layout and copy; copy verbatim. Colours and sizes from `nila-design/tokens.json`
  (CSS variables on `.w1`) and the boards' own inline styles. Dark grounds only (#0A0A0A / #0E1014, cards #121212 + 1px #1C1F26).
- One primary button per screen (accent #D4CF5A); gold only for harvest markers.
- No 'loans' in public copy (v4). Numbers only from the on-chain reconciliation / audit — never from the boards
  (board figures are sample).
- New pages ship behind a flag: build with `VITE_REDESIGN=1` to switch; `npm run dev` + `/?w1` previews. Without the flag the
  build is the old home (W1 is a lazy chunk that never loads).
- W1 sections are **generated** from the boards: `scripts/w1/regen.sh` (board2jsx.py + post.py) → `src/w1/desktop|mobile`.
  After a design change: re-export nila-design page 6, run regen, never hand-edit the generated sections.
  Hand-written: `Home.jsx` (switch at 900 px, globe, anchors), `links.jsx` (where every link goes), `MobileMenu.jsx`, `LandTitles.jsx`.
- Every claim to outsiders passes `product/specs/Nila_DeFi_Leg_Definition_v1.md` §8 and the compliance invariants.

## Steps

| # | Step | Board | Notes |
|---|---|---|---|
| S0 | Lane setup: git, backup, page 6 into nila-design, plan | — | done 2026-11-10 |
| S1 | ~~Tokens → `@theme`; base components~~ skipped for W1: sections generated from the boards (Carst, 10 Nov: W1 first). Shared components still open for later pages: (Button, IconButton, Segmented, Chip, ListRow, LabelValue, TextInput, Card, InfoNote, text styles + Display 64/40) in `src/ui/` | Comp 1–18 (page 2) | built locally, extractable to the shared package later (open) |
| S2 | W1 home + W1 mobile, all 17 sections | W1 | **done 2026-11-10**, behind the flag. Rendered at 1440 / 1024 / 390: height within 1 % of the boards, no horizontal scroll. Land titles live from Polygon; other metrics are board figures |
| S3 | W4 `/how`: inputs → AI draft, one member's year with vegetation lines, satellite section, yield story (illustrative, labelled) | W4 | sample data stays labelled |
| S4 | ~~W3~~ — old 'Meet the unions' pages kept (Carst, 10 Nov) | — | |
| S5 | W2 `/harvests`: board + lot page, desktop; W2m notice on mobile | W2 | no bidding contract or backend exists — static/read-only until decided |
| S6 | Routes and cleanup: drop `/wfp`, keep `/audit` and legal, sitemap/llms.txt, remove `.env` from folder | — | |
| S7 | Visual check 1440 + 390 against the boards; `npm run build`; hand `dist/` to Carst | all | |

## Open points that block going live (from `nila-design/notes/page-landing.md`)

- **nUSD public target yield 3–5 %** (W1, W3): counsel (X35) first; issuer of nUSD undecided. Build hidden.
- **Metrics**: services delivered (₹) blank; '58 crop plans financed' needs the 1:1 check against loan records.
- **'95 % of seasons detected', '8 years'**: method note or drop.
- **Funder logos** (SCF, MIT): official files + written OK.
- **Trust card 'Structure'**: who holds the contract keys.
- **Allowlist** (W3): who approves, KYC provider, contract or server check.
- **W2**: crop rules, bid step/reserve, legal (physical delivery, SEBI), rail (USDT Polygon now, nUSD later).
- Real photos / field (with consent); sesame and black-gram images; FAQ answers; team links.

## W1 — open before the flag is switched (Carst)

- **Lock in a harvest** (hero primary + buyers card) is shown disabled until W2 exists (Carst, 10 Nov).
- **Links with no target yet** (inert, listed in `src/w1/links.jsx` PENDING): *Harvests* (W2 not built); *Read more* on the SCF news bar; *Build with Nila* → "Coming soon" chip (no other services use Nila tokens yet, Carst 10 Nov);
  all nine FAQ questions (the board has no answers — answers are an open point).
- **Check access** opens the old unions page (W3 not built, as decided).
- **Season ledger (CSV)** links to the old `loan-tape.csv` until the season ledger exists.
- **Metrics**: 58 / ₹ — / 4 are board figures, not read live. 58 = all loan IDs in facts.md incl. 1 removed.
- **nUSD card (3–5 % target)** is on W1 as designed — counsel (X35) must clear it before the flag goes on.
- **Globe** (`src/w1/W1Globe.jsx`, 10 Nov): camera, canvas size, start position and fixed tilt copied from the old globe
  (Carst). globe.gl forces its orbit target to the centre, so the camera is turned by hand: drag east–west on desktop
  and mobile, old auto-rotate speed. Tap picks the smallest data country under the pointer (Nepal over India). The 11 data
  countries are tappable; all other countries (Natural Earth 110m, `public/tex/world_110m.geojson`) are faint outlines.
  Ink country card, India open by default. WebGL failure → band hidden.
- **Mobile menu** is not on the board; built from the List row look. Design to confirm.
- 'Backed by' row shows SCF and MIT names (logos need written OK, see above).

## Next steps (Carst, 10 Nov)

| # | Step | Notes |
|---|---|---|
| S8 | **Audit on two chains** (`/audit`, `facts.md`) | Add a Stellar mainnet section: the 10 contract ids + nIN / USDC SACs from `handoffs/mainnet_contracts.env` (deployed 6 Nov), each linked to stellar.expert and read at a ledger. Members are still on Polygon: state "no crop shares on Stellar yet" until the move. Refresh the Polygon figures (last read 10 Oct, block 95,279,281). Footer "© 2026 Nila.land BV" → Blockchainforcommons (entity rule). Write a generator script (`scripts/audit/`) instead of hand edits: Polygon via eth_call/getLogs (as facts.md §5), Stellar via Soroban RPC for state and Horizon for history (RPC keeps ~7 days). |
| S9 | **Season ledger (CSV)** | One row per crop plan: union, crop, acres, services value, harvest, settled at harvest. Chain gives the money side (loans, vouchers, food tokens, windows); crop / acres / harvest come from nila-sensing (plan engine, satellite EOS). Polygon loans carry no season id (facts.md l.81): map loan → food token → crop window. Same generator as S8. |
| S10 | **W4 how it works** | Carst: board copy too fuzzy; only the satellite section is good. `/how` built with the satellite section first (`src/w4/`, hand-owned, copy checked against nila-sensing 10 Nov: 8-yr lookback = code default, S1 12 d, cloud gate 30 %; "95 %" and "every five days" dropped). Next: AI plan, member year, yield story — new copy first. |
| S11 | **FAQ** | Drafts in `docs/W1_FAQ_draft.md`, Carst verifies one by one. |
