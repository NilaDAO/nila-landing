# Nila.land — Section Documentation
## AboutNila, ThreePanels, Globe & InvestorFAQ
*For coworker reference — February 2026*

---

## Page position (in scroll order)

```
...
4.  AboutNila          ← scroll-jacking sticky section with card belt
5.  ThreePanels        ← invest section (3 cards)
6.  WireGlobe          ← banner globe with country data
7.  InvestorFAQ        ← accordion FAQ
8.  Footer
```

Rendered in `App.jsx` lines 129–132. The dark backgrounds merge naturally between sections without dividers.

---

## 0. ABOUT NILA — `src/components/sections/AboutNila.jsx`

### Purpose
Scroll-jacking storytelling section that explains what Nila is. As the user scrolls, crop token cards slide from a conveyor belt into a stack while paragraphs fade in on the left. After all cards stack, a "Crop tokens → Loan → Yield" flow diagram is revealed.

### Props
None — self-contained.

### Section id
`#opportunity`

### Scroll mechanism
- Outer div: `height: 700vh` (7 scroll phases = 6 cards + 1 loan reveal phase).
- Inner content: `position: sticky; top: 0; height: 100vh` — pins the viewport while scroll drives the animation.
- Uses Framer Motion `useScroll` + `useTransform` to map `scrollYProgress` (0→1) to card positions and paragraph opacity.

### TOKENS array (6 cards)

| # | Crop | Image | ID | Has paragraph? |
|---|------|-------|----|----------------|
| 0 | Paddy | `/paddy.png` | #TN-0041 | Yes — what Nila is |
| 1 | Sugarcane | `/sugarcane.png` | #TN-0042 | Yes — enforcement problem |
| 2 | Groundnut | `/groundnuts.png` | #TN-0043 | Yes — on-chain solution |
| 3 | Millet | `/millets.png` | #TN-0044 | Yes — the result |
| 4 | Paddy | `/paddy.png` | #TN-0045 | No — visual weight |
| 5 | Cassava | `/cassave.png` | #TN-0046 | No — visual weight |

### Card animation flow
1. Card 0 starts already stacked (top-left at `STACK_X=24, STACK_Y=80`).
2. Cards 1–5 start on a horizontal conveyor belt at `BELT_Y = STACK_Y + 80`.
3. As the user scrolls, each card slides left and hops up into the stack, with each card offset by `STACK_OFFSET = 8px` vertically.
4. A thin horizontal "belt surface line" is drawn below the belt position.

### Paragraph behaviour
- 4 paragraphs (cards 0–3 only) appear on the left side (desktop) or top (mobile).
- Each fades in as its corresponding card lands on the stack.
- On mobile: only the active paragraph is shown (`display: block`), others are hidden.

### Loan reveal (final scroll phase)
After all 6 cards are stacked, a flow diagram fades in below the stack:
```
Food tokens → 💵 Loan disbursed → 📈 5–8% APY
```
- Gold divider line separates the stack from the reveal.
- Label: "Crop tokens → diversified collateral" (uppercase, gold).
- Three icons connected by arrows: stacked token bars, dollar coin, yield coin.
- The right panel shifts down 30px to make room.

### Responsive scaling
- The card panel assumes a fixed width of 480px.
- On smaller screens, a `scale()` transform shrinks the entire panel to fit, with the wrapper height adjusted proportionally (`520 * scale`).
- Text side: `md:w-[45%]`, card side: `md:w-[55%]`.
- On mobile, layout stacks vertically (text on top, cards below).

### Styling
- Background: `var(--color-primary)` (dark green, same as ThreePanels).
- Card bg: `#1e293b` (slate-800) with white/10 border.
- Each card has a thin colored accent bar at top matching the crop.
- 48px grid texture overlay at 4% opacity (consistent with other sections).

### Important architectural note
- `overflow-x: hidden` must NOT be set on `<html>` — it breaks `position: sticky`. Only set on `<body>`.
- The 700vh height is **desktop only by design** — the sticky scroll-jacking is intentional.

---

## 1. THREE PANELS — `src/components/sections/ThreePanels.jsx`

### Purpose
Three-card section answering *earn / track / contribute*. This is the primary investment pitch.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `onOpenUnions` | `() => void` | Fires when "Browse unions" is clicked — triggers the unions page slide-in |

### Cards (defined in `PANELS` array)

| # | Label | Content | Action |
|---|-------|---------|--------|
| 1 | TRACK | Headline: "Full supply-chain visibility." | `view-portfolio` — Phase 2 hook (`data-phase="2"`) |
| 2 | CONTRIBUTE | Headline: "Pick your goals." + 5 SDG icons | `browse-unions` — calls `onOpenUnions` |
| 3 | EARN | Big stat: "5–8%" + sub-line "target APY · paid in USDt · FX rate dependent" | `view-rates` — Phase 2 hook |

### Behaviour
- **Layout:** `md:grid-cols-3`, stacked on mobile.
- **Hover:** card lifts (`-translate-y-1.5`), top border turns accent gold.
- **SDG icons** (CONTRIBUTE card only): 5 icons at 32px, greyscale. On hover each expands to 64px and saturates. Icons live in `/public/sdg/sdg-01.jpg` through `sdg-17.jpg`.
- **Animation:** Framer Motion staggered fade-in (0.1s delay per card).
- **Section id:** `#invest` — used for nav scroll links.

### Styling notes
- Background: `var(--color-primary)` (the dark green).
- Card bg: `rgba(255,255,255,0.04)` with subtle box shadow.
- Subtle 48px grid texture overlay at 4% opacity.

---

## 2. GLOBE — `src/components/sections/globe.jsx`

### Purpose
Interactive 3D globe (via `react-globe.gl`) showing South/Southeast Asian countries with farmer cooperative data and financial metrics. Rendered in **banner mode** on the landing page.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `banner` | `boolean` | `false` | Banner mode: full-width, non-interactive camera (auto-rotate on mobile), wave divider at bottom. Non-banner: square, centered, user-controlled camera. |

### Data source
`/public/tex/custom_updated.geojson` — GeoJSON FeatureCollection with 11 countries (India, Nepal, Thailand, Vietnam, Cambodia, Malaysia, Indonesia, Philippines, Sri Lanka, Bangladesh, Bhutan).

### GeoJSON properties per country

**Organisational:**
| Property | Description |
|----------|-------------|
| `cs` | Number of farmer cooperatives |
| `po` | Number of producer organisations |
| `shg_i` | Total Ag-SHGs (self-help groups) |
| `shg_f` | Female Ag-SHGs (subset of `shg_i`) |
| `fpop` | Farmer population |
| `ratio_pop_fpop` | Farmer pop as % of total population |
| `source` | Data source citation (organisational data) |

**Financial:**
| Property | Type | Description |
|----------|------|-------------|
| `aum_total_usd` | number | Total AUM held by farmer coops, SHGs, POs, and ag banks combined (USD) |
| `credit_annual_usd` | number | Annual credit disbursed to farmers (USD) |
| `aum_per_group_usd` | number | Derived: `aum_total / (cs + po + shg_i)` — average assets per group |
| `credit_per_farmer_usd` | number | Derived: `credit_annual / fpop` — average annual credit per farmer |
| `credit_gap_pct` | number | % of farmers without access to formal institutional credit (15–85%) |
| `credit_need_per_farmer_usd` | number | Estimated annual credit need per farmer (USD) |
| `aum_sources` | string | Detailed financial data sources per country |

### Info panel (country card)
Appears when a country polygon is clicked. Positioned bottom-center on mobile, top-left on desktop. Scrollable (`max-h-[70vh]`).

**Organisational section:**
- Farmer Pop: `226,000,000 (43.5%)`
- Coops: `800,000` · POs: `10,000`
- Ag-SHGs: `900,000` · Female: `750,000 (83%)`

**Financial section** (below divider, amber "FINANCIAL" heading):
- Total AUM, Annual Credit, AUM/Group, Credit/Farmer, Credit Need/Farmer
- All formatted by `fmtUsd()` — e.g. `$201.8B`, `$39.2B`, `$118K`
- **Credit Gap** — highlighted red box at bottom with large bold percentage
- Sources — small text at bottom with per-country citation

### USD formatting (`fmtUsd`)
```
>= 1B  →  $X.XB
>= 1M  →  $X.XM
>= 1K  →  $XK
< 1K   →  $X,XXX
```

### Camera behaviour
- **Banner mode desktop:** Fixed camera at `(150, -5, 0)`, FOV 40, no user controls.
- **Banner mode mobile:** Camera at `(310, -5, 0)`, east-west rotation enabled, slow auto-rotate (0.1), no zoom, vertical angle locked.
- **Non-banner:** Centered on lat 23 / lng 100 (Southeast Asia), auto-rotate, full user controls.

### Interaction
- **Hover:** polygon border goes white, auto-rotate pauses.
- **Click polygon:** opens info panel for that country.
- **Click globe background:** closes info panel.

### HTML marker
A single `+` icon marker is placed at the Mother Teresa Union coordinates (`11.878858, 78.964963` — Tamil Nadu). Currently logs to console on click (Phase 2: link to union detail).

### Mobile considerations
- Canvas sized via `document.documentElement.clientWidth` (not `window.innerWidth`) to avoid width inflation from overflow.
- Container has `maxWidth: 100vw` + `overflowX: hidden` to prevent layout-breaking horizontal scroll.
- Wave divider SVG at bottom blends into the next section using `var(--color-bg-light)`.

---

## 3. INVESTOR FAQ — `src/components/sections/InvestorFAQ.jsx`

### Purpose
Accordion FAQ section addressing investor concerns about capital safety, returns, and contract mechanics.

### Props
None — self-contained with internal `openIndex` state.

### Layout
Two-column on desktop (`md:flex-row`), stacked on mobile:
- **Left (1/3):** "FAQ" label in `var(--color-primary-light)`.
- **Right (2/3):** Accordion with 8 items.

### FAQ items

| # | Question | Key point |
|---|----------|-----------|
| 1 | What does Nila actually do? | Infrastructure, not intermediary — capital goes direct to union smart contract |
| 2 | Does Nila ever hold my money? | No — deposit goes to union-owned contract, not Nila account |
| 3 | How is my investment protected? | 3 layers: direct contract, receivables assignment, 10% first-loss reserve |
| 4 | Can I withdraw early? | 2-week minimum hold, rolling withdrawals subject to facility liquidity |
| 5 | What return can I expect? | Fixed coupon from farmer repayments, displaces 24–60% p.a. informal credit |
| 6 | Who benefits — and by how much? | 900 members lose 18,700–25,900 INR/farmer/year to intermediaries |
| 7 | How do repayments reach me? | Oracle-triggered automatic settlement from union contract to wallet |
| 8 | How do I verify? | On-chain on Polygon — PolyScan links, no trust in Nila required |

### Accordion component — `src/components/accordion.jsx`

| Prop | Type | Description |
|------|------|-------------|
| `items` | `{ title, content }[]` | Array of FAQ entries |
| `openIndex` | `number \| null` | Currently expanded item index |
| `handleItemClick` | `(index) => void` | Toggle callback |
| `itemClassName` | `string` | Optional extra CSS classes |

- One item open at a time (toggle behaviour in `InvestorFAQ`).
- Chevron rotates on open/close.
- ARIA attributes: `aria-expanded`, `aria-controls`.
- Card style: `bg-slate-400`, rounded-3xl, box shadow.

### Styling
- Section background: `var(--color-bg-light)`.
- Section id: `#faq`.
- Framer Motion fade-in on scroll.

---

## File reference

```
src/
  components/
    sections/
      AboutNila.jsx      — scroll-jacking sticky section with card belt + loan reveal
      ThreePanels.jsx    — 3 investment cards (earn/track/contribute)
      globe.jsx          — interactive 3D globe + country data panel
      InvestorFAQ.jsx    — FAQ accordion section
    accordion.jsx        — reusable accordion component
public/
  tex/
    custom_updated.geojson  — 11 countries, org + financial data
  sdg/
    sdg-01.jpg ... sdg-17.jpg  — UN SDG icons
  paddy.png, sugarcane.png,    — crop token card images
  groundnuts.png, millets.png,
  cassave.png
```
