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
| S3 | ~~W4 `/how` as on the board~~ replaced by S10 (ring diagram, board W4b) | W4 | done 2026-11-11, see S10 |
| S4 | ~~W3~~ — old 'Meet the unions' pages kept (Carst, 10 Nov) | — | |
| S5 | W2 `/harvests`: board + lot page, desktop; W2m notice on mobile | W2 | no bidding contract or backend exists — static/read-only until decided |
| S6 | Routes and cleanup: drop `/wfp`, keep `/audit` and legal, sitemap/llms.txt, remove `.env` from folder | — | `/audit` (10 Nov) and `/privacy` `/terms` `/risk` (11 Nov, `src/w1/Legal.jsx`) in the W1 style; rest open |
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

- **Lock in a harvest** (hero primary, with arrow, + buyers card), *Harvests*, *Build with Nila* and *View a live field* show the red "Coming soon" toast (`src/w1/ComingSoonChip.jsx`, above the slide-in pages) until W2 / a live field view exist.
- **FAQ** answered (11 Nov): accordion `src/w1/FaqList.jsx`, text in `src/w1/faq.js` (from `docs/W1_FAQ_answers.md`, three claims corrected: no "fee per service", no satellite confirming the season, food token "tied to her land title" since FoodToken has no transfer lock).
- **Check access** opens the old unions page (W3 not built, as decided).
- Footer link renamed **Loan tape (CSV)** (11 Nov); the season ledger (S9) does not exist yet. Footer tagline: "for credit unions in Tamil Nadu".
- **Metrics**: 58 / ₹ — / 4 are board figures, not read live. 58 = all loan IDs in facts.md incl. 1 removed.
- **nUSD card (3–5 % target)** is on W1 as designed — counsel (X35) must clear it before the flag goes on.
- **Globe** (`src/w1/W1Globe.jsx`, 10 Nov): camera, canvas size, start position and fixed tilt copied from the old globe
  (Carst). globe.gl forces its orbit target to the centre, so the camera is turned by hand: drag east–west on desktop
  and mobile, old auto-rotate speed. Tap picks the smallest data country under the pointer (Nepal over India). The 11 data
  countries are tappable; all other countries (Natural Earth 110m, `public/tex/world_110m.geojson`) are faint outlines.
  Ink country card, India open by default. WebGL failure → band hidden.
- **Mobile menu** is not on the board; built from the List row look. Design to confirm.
- 'Backed by' row: SCF and "Dutch government · innovation grant" (no MIT, Carst 11 Nov); logos need written OK.
- **nUSD stack**: layers named *Crypto yield* / nUSD / *Treasury yield*; opened by default on touch screens.

## Next steps (Carst, 10 Nov)

| # | Step | Notes |
|---|---|---|
| S8 | **Audit on two chains** (`/audit`, `facts.md`) | Add a Stellar mainnet section: the 10 contract ids + nIN / USDC SACs from `handoffs/mainnet_contracts.env` (deployed 6 Nov), each linked to stellar.expert and read at a ledger. Members are still on Polygon: state "no crop shares on Stellar yet" until the move. Refresh the Polygon figures (last read 10 Oct, block 95,279,281). Footer "© 2026 Nila.land BV" → Blockchainforcommons (entity rule). Write a generator script (`scripts/audit/`) instead of hand edits: Polygon via eth_call/getLogs (as facts.md §5), Stellar via Soroban RPC for state and Horizon for history (RPC keeps ~7 days). |
| S9 | **Season ledger (CSV)** | One row per crop plan: union, crop, acres, services value, harvest, settled at harvest. Chain gives the money side (loans, vouchers, food tokens, windows); crop / acres / harvest come from nila-sensing (plan engine, satellite EOS). Polygon loans carry no season id (facts.md l.81): map loan → food token → crop window. Same generator as S8. |
| S10 | **W4 how it works** | **Done 2026-11-11** (`c1190b4`, `c8339e9`): one ring diagram, board W4b v1837 (`docs/W4b_rings_board.dc.html`, prompts `handoffs/Claude_Code_Prompt_W4_Rings*.md`). Tabs Impact / Software-guided / Climate, 14 categories; copy in `public/how/how.json` (edit there); live rings from `/audit/snapshot.json` (`src/w4/howData.js`); one svg that never remounts; categories without data blurred "Waiting for a baseline measure"; segmented ring for Land leaving farming; single rings thicker. Satellite section (`DSat`/`MSat`) under Software-guided. Shots: `docs/shots-w4b/`. Open: sharper questions (Carst), Years left / Turning the tide need neighbouring fields, 1950–51 land-use figures to check against table 1. |
| S11 | **FAQ** | **Done 2026-11-11** (`c0cc1b5`), see W1 list above. Still to confirm: "about 2,000 members, about 90% women" (unions' own figures). |
| S12 | **Legal pages** | **Done 2026-11-11**: W1 style; entities Blockchainforcommons (KvK 55518559) + Nila Farmer Livelihoods Trust, no BV; dated 11 Nov 2026; no Information Memorandum (the site has no forms); Risk rewritten to Stellar / USDC / crop shares / 14-day unbond / loss order (LOAN_RULES), 3–5 % nUSD target. The old site still has the IM form and shares this text: release with the redesign. Counsel to review. |

## Before release (11 Nov)

- Human checks: Tamil saying (Anand or a union leader); 1950–51 land-use figures (table 1); unions' member figures.
- Root docs: `NILA_STATE_OF_THE_ART.md` §1.1 and `Nila_Canonical_Descriptions.md` still say 28 live loans (18 since 8 Nov, `/audit`).
- Release is the executive's: `VITE_REDESIGN=1 npm run build`, zip the contents of `dist/`, upload to Amplify `d108zfeejs7ppp`; Cloudflare untouched.
