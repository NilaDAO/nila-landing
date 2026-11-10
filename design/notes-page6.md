
---

OPEN · NILA.LAND
- Services delivered (₹): the figure is blank; read it from the ledger (vouchers redeemed) before launch. '58 crop plans financed' assumes the 58 loan records map one-to-one to plans: check.
- Yield curve is illustrative: replace with real union yields per acre (harvest weights per plot) and the satellite record once there are enough seasons. Until then it stays labelled.
- Wording: if 'loans' is dropped for legal reasons, 'repay' / 'repaid from the harvest' in the hero and Finance panel needs the same check.
- Privy and Circle evidence: which links exist today (test transactions, integration status, contacts)? Nothing is linked until it can be shown.
- FAQ answers to write, incl. 'How does money move in India?' (short, plain) and 'How do I verify independently?' (audit, season ledger, nila-soroban, contract ids, Privy/Circle status).
- Team links: which GitHub and LinkedIn profiles to show; Anand's public footprint.
- Shared package name, repo and who builds it (a Claude Code step after the PWA steps?). nila-landing is not in git yet: put it in a private repo first; remove .env files from the folder.
- Globe: keep three.js (heavy) or a static image on mobile?
- Crop images for sesame and black gram (only paddy, cane, groundnut, millet, cassava exist).
- AI inputs: confirm the list (esp. 'service rates' as an input for input cost, and whether market/buyer prices feed the draft; today buyer/mill is added in the edit step). Say which model drafts the plan if asked.
- Satellite stats: '95% of crop seasons detected' is the internal cycle-detector result; publish a short method note (sample size, region, period) or drop the number. '8 years' assumes Sentinel-2 history per field.
- Satellite image and vegetation lines are sample data; swap in a real field (with the member's consent) before launch. Privacy: no member names or exact field locations on the public site without consent.
- nUSD, public target yield (Carst's call, 16 Oct): get counsel (X35) on showing a target yield publicly for a USD-named token (MiCA bans interest on e-money and asset-referenced tokens; a published return counts as public solicitation in the EU, US and India). Who issues nUSD (the trust cannot hold virtual assets)?
- nUSD yield source: vouchers are an interest-free in-kind advance (3 Oct decision). Say where the 3–5% comes from (voucher fee, trade margin at harvest?) before reviewers ask.
- 'Uncorrelated': true for crypto prices, not for weather; El Niño and monsoon risk sit in the same book. The wording is scoped to crypto markets on purpose.
- Allowlist: who approves, which KYC provider, and how the list is checked (Soroban contract or server)?
- Trust card 'Structure': the trust holding the contract keys is the 3 Oct decision; since 5 Oct trusts may not hold virtual assets. Confirm who holds the keys before this goes live.
- '100% traceable' holds only for lots whose land title, plan and satellite confirmation are all on-chain; harvest weights and delivery are not on-chain yet. Check before launch.
- No real people or real crops on the site yet: get photos or short video from Mother Theresa Union (with consent) for the year section and the products.
- Protocol fee: which swaps carry a fee, how big, and who receives it (trust, union, protocol treasury)? Funders will ask; check that a fee on voucher swaps fits the agri-services (not lending) position in India.
- Voucher amounts per type (seed, machinery hours, trees): read from the ledger; the bars are sample until then.
- Which certificates exist per lot today (origin from the land title, satellite-confirmed season)? Only list what can be shown.
- 'Collective farm protocol': keep out of the hero for now (land-pooling connotation; families already fear land-record exposure); used in the impact layer as 'collective farming'.
- Funder logos: get the official files and written OK from SCF and the MIT grant body (Dutch government; the Province of North Holland only distributes it) before the 'Backed by' row goes live.
- 'Use our assets on Stellar': land titles, food tokens and vouchers are non-transferable; the card offers them as readable/verifiable data, only nUSD as a holdable position. Confirm with the Stellar TAD.
W2 OPEN
- Crop rules: cane to the mill (FRP/SAP), paddy MSP floor; price source (Agmarknet / e-NAM); no 'Organic' / 'Fair trade'; varieties from the unions.
- Bid step and reserve per crop; displaced-bid priority; minimum quantity.
- Tune in the pilot: advance 15%, band +15%/half, cap 40%, lock-now +2 steps, close rhythm. Watch bids per lot (3+), lock-now share, mid-round vs close price.
- Crop failure: advance refunded by the union, or union credit risk?
- Storage factor, quality check, fee per crop/facility, which unions store.
- Generated data; not TN seasons (Kuruvai Sep-Oct, Samba Jan-Feb).
- Rail: live site uses USDT on Polygon; nUSD is planned on Stellar.
- Legal: physical delivery, non-transferable, outside SEBI derivative rules (counsel).


---

NILA.LAND LANDING (16 Oct 2026, v9)
WHAT NILA IS
- The core is the year-long crop plan and the link from that plan to finance and services. Each member plans her year with her union; seed, tractor hours and trees arrive as vouchers when the plan needs them, sized to the harvest it expects, repaid from that harvest.
- Because the plan comes first: buyers know what is coming (predictability), soils get a rotation (regenerating), the household keeps its own cash (livelihood), and finance is just in time and affordable, not a loan she cannot repay.
DESIGN
- Carst's section layout from the nila-landing repo (navbar with 'Meet the unions', hero with grid texture and live chip, waves between sections, metrics, the crop plan, the yield story, panels, globe, FAQ, footer).
- Built only from the shared PWA components (page 2): Button 44/12 (one primary per screen, accent #D4CF5A), Icon button, Segmented control, Chip, List row, Label/value row, Text input, Card (ink, radius 24, shadow), Info note, Text styles. Landing adds one Display style (64/40 px, 700) for page titles; section titles use the Hero number style (32/700).
- Dark grounds only: ink #121212 and #1E2738 (gradients), waves between them. No light bands, no amber.
PROOF, LOW-KEY
- Metrics each link to the audit; under them one info note with the repayment split and buttons: Open the audit, facts.md, Loan tape (CSV). Footer column 'Audit': fact sheet, facts.md, season ledger (CSV), code (nila-soroban). FAQ: 'How do I verify independently?'. No compliance section.
PAGES
- W2 harvests: list rows → #lot (fields and record, lock a purchase) → #locked. The buyer locks quantity and price; the purchase happens at delivery.
- W3 unions: as now (meet the unions → fund health → terms → amount → transaction, withdraw).
- /audit, legal, globe stay; /wfp dropped.
STACK
- Vite + React; shared component and token package with the PWA (pre-built, tokens as CSS variables; the PWA is CRA + Tailwind 3, the landing Vite + Tailwind 4).
V4 (16 OCT)
- No 'loans' on the site. Metrics: crop plans financed, services delivered as vouchers (₹), land titles, seasons. Season ledger (CSV) replaces the loan tape: one row per plan (union, crop, acres, services value, harvest, settled at harvest). Funder yield is not shown on the home page.
- Crop plan section: one sample member's year (fields × 12 months, Kuruvai / Samba / Summer), crop bars, voucher dots at sowing, harvest diamonds open to buyers, rotation (black gram after paddy, green manure), sugarcane and border trees.
- Yield story (W1b) replaces the crop-card belt: line chart drawn on scroll. Season by season (dashed, muted) keeps falling; with a year plan (solid, white) it stabilises (predictable), rises (regeneration), passes the start (community, SHG). One axis (index, first season = 100), direct labels and legend, hover tooltip, table view. Marked 'Illustrative'.
- Accent #D4CF5A only on the single primary button; gold only for harvest markers. Everything else white or muted. 48px grid texture back on every section (opacity 0.04).
- Footer: Nila Farmer Livelihoods Trust, Reg. Book-4/26/2026, PAN AAFTN4490C.
V5 (16 OCT)
- Grounds near-black: page #0A0A0A, alternate sections #0E1014 (waves between them), footer ink. Cards stay ink #121212 with a 1px #1C1F26 edge so they read on black. No navy sections.
- AI-guided crop plan: inputs shown as three cards → AI draft. From her: 3 app questions (role on the land, cattle she feeds, months she needs cash). From space (Sentinel-1/2): 8-year crop record per field, season cycles and sowing dates, water (rain, wells, flooding). From the region: district crop calendars, water and hydrology limits, service rates. Output: crop per field per season (3 seasons), input cost, expected profit, services to book. Note: the draft is a proposal; she changes it with her leader, adds a buyer or mill, agrees it in June.
- One member's year: plan bars per field with a satellite vegetation-index line under each (solid = observed up to today, dashed = expected from the plan), 'Today' marker.
- New satellite section: Sentinel-2 vegetation view (10 m pixels, greyscale, field outlines = land titles), segmented True colour / Vegetation / Radar, stats 5 days · 8 years · 95% seasons detected, and four uses: land title, crop plan, food token confirmation, soil and trees on record.
V6 (16 OCT)
- Invest is invite only: W3 opens on 'Meet the unions' (public list) plus a gate card. Connect wallet → allowlisted (#open: the union invest flow as before, plus an nUSD 'notify me' card) or not (#denied: write to info@nila.land; wallets are added after KYC). No public request form.
- nUSD on W1: in development on Stellar; USDC → nUSD → vouchers; public target 3–5% a year, not guaranteed; vouchers are the only use of funds.
- W2 harvests board: see note 'W2 · HARVESTS' (current spec only).


---

nila.land


---

W2 · HARVESTS (current spec, 19 Oct)
Model: competitive contract farming, close to the mandi tender and e-NAM, gamified. Desktop only; W2m shows a notice.
- One crop and variety per board (paddy Ponni, Seeraga samba, sesame, groundnut, millet, black gram). Sugarcane = mill contract, not traded. On-chain labels (Rotation, No-burn) trade as their own pair (gold chips), not certificates.
- Columns = delivery weeks, rows = Rs/qtl. Reserve = her plan cost (above MSP): dashed line, full width; every week starts there.
- Per week: 'open' chip at the price now (qty with no bid, take any part); 'outbid' chip one step up (qty held by the lowest bids); 'full' when all is bid; dashed 'stored' chip for grain from a union with storage, offered later from plan cost + storage fee. Pay as bid.
- Price line: past rounds, then each week's price now (step line through chip centres). NOW line dashed.
- Supply bars: sold in past rounds / has a bid / no bid yet / stored (also counted in its harvest week; accepted).
- Storage window = shelf life (WDRA: paddy 9 months, others 6, cane 0) x facility (warehouse 1.0, union storeroom 0.5). A stored pool is one lot: a quintal bid in any week leaves all weeks.
- Every bid carries a 15% advance, paid only on win into her food-token loan (prepaid vouchers), which she repays to the union; deducted at delivery. Price band: more than 15% above contract at delivery, she gets half. Max 40% of a round per buyer. Union accepts within 24h.
- Close rhythm: daily in the last 3 weeks, weekly to about 3 months, monthly beyond; a bid in the last 5 minutes adds 5. Lock now: open qty at price now + 2 steps, at once.
- States (paddy): #wallet (connect; MetaMask live, WalletConnect and Coinbase soon, as on the live unions page), #connected (address, USDT balance, Buy USD, Disconnect), #bid (chip click: side sheet, column highlighted, open/outbid split, advance in USDT, Place bid / Lock now), #placing (USDT approval, place bid, ledger), #placed, #mine (your bids: leading / outbid + Raise; contracts: accepted / waiting). #lot and #locked = lot page.
- Build note: Play treats href="#x" as an in-page scroll, so every state change is a click handler (onClick sets the screen state), not a hash link.
- Naming: 'buyer' (who takes delivery), never 'trader'. Keeping speculators out is done by rules: physical delivery, contracts that cannot be resold, business check (GST / FSSAI) - to decide.
- Copy is minimal (20 Oct): one-line intro, short legend, banner = close + advance; rules live in the FAQ / lot page.
