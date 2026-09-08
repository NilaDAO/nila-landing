# Nila.land — Investor Landing Page
## Design SOP & Copy Specification v1.0
*For Claude Code implementation — February 2026*

---

## 1. BRIEF & INTENT

This is a **Phase 1 redesign** of nila.land. The page is a single-scroll investor-focused landing page. The primary goal is to communicate the investment opportunity clearly and drive two actions: **Connect Wallet** and/or **Request the Information Memorandum**. Phase 2 (wallet integration and invest flow) is out of scope here.

The tone is: *institutional but human. Credible but accessible. Impact-driven but commercially sharp.*

Design references:
- **eif.org/flagship-initiatives/investeu/overview** — clean European institutional layout, generous whitespace, vertical wave/curved SVG section dividers, restrained color use
- **panteracapital.com** — premium dark-mode crypto investor aesthetic, bold numbers, minimal nav, confident headlines

---

## 2. COLOR SYSTEM

> ⚠️ **Action required from Carst:** Please confirm hex codes from the current nila.land page. The palette below is a best-fit inference from the brand identity (agricultural + blockchain + Dutch social enterprise). Replace with exact values once confirmed.

### Inferred Primary Palette

| Token | Name | Hex | Use |
|-------|------|-----|-----|
| `--color-primary` | Deep Field Green | `#1B4332` | Hero background, nav bg, section accents |
| `--color-primary-mid` | Mid Green | `#2D6A4F` | Hover states, dividers, subtle backgrounds |
| `--color-primary-light` | Leaf Green | `#52B788` | Highlights, icon accents, borders |
| `--color-accent` | Harvest Gold | `#D4A017` | Primary CTA button, key numbers, wave accent |
| `--color-accent-hover` | Deep Gold | `#B8860B` | CTA hover |
| `--color-bg-light` | Warm White | `#F9F6F0` | Main page background (non-hero sections) |
| `--color-bg-section` | Pale Sage | `#EEF4EE` | Alternating section backgrounds |
| `--color-text-primary` | Near Black | `#1A1A1A` | Body text on light |
| `--color-text-secondary` | Warm Gray | `#6B7280` | Subtext, captions |
| `--color-text-on-dark` | Off White | `#F3EFE7` | Text on green backgrounds |
| `--color-border` | Light Gray | `#E5E7EB` | Cards, dividers |

### Dark Hero Variant (optional, Pantera-inspired)
If Carst prefers a dark hero: replace `--color-primary` hero bg with `#0D1F17` (near-black green), adjust text to `#E8F5E9`.

---

## 3. TYPOGRAPHY

Use **Inter** (Google Fonts). Load weights: 300, 400, 500, 600, 700.

```css
--font-sans: 'Plex-Regular', Plex-Bold, system-ui, -apple-system, sans-serif;

--text-hero:   clamp(2.5rem, 5vw, 4.5rem);  /* Hero H1 */
--text-h2:     clamp(1.75rem, 3vw, 2.75rem); /* Section titles */
--text-h3:     clamp(1.25rem, 2vw, 1.5rem);  /* Card titles */
--text-body:   1rem;                          /* 16px base */
--text-small:  0.875rem;                      /* 14px captions */
--text-stat:   clamp(2rem, 4vw, 3.5rem);      /* Big numbers */

--leading-tight:  1.15;
--leading-normal: 1.6;
--leading-loose:  1.8;

--tracking-wide:  0.05em;   /* Uppercase labels */
--tracking-tightest: -0.03em; /* Big headlines */
```

---

## 4. LAYOUT & SPACING

- **Max content width:** 1200px, centered
- **Section padding:** `6rem 2rem` desktop; `3.5rem 1.25rem` mobile
- **Grid:** 12-column CSS grid, simplify to 2–3 column flex for most content blocks
- **Border radius:** `0.75rem` cards, `0.5rem` buttons, `1.5rem` pill chips
- **Box shadow:** `0 4px 24px rgba(0,0,0,0.08)` for cards

---

## 5. NAVIGATION

```
[NILA.LAND logo — wordmark, left]          [About | Technology | Impact | Docs]   [Connect Wallet — CTA button]
```

- **Position:** Fixed top, transparent initially → blur + light border on scroll
- **Logo:** Wordmark in `--color-text-on-dark` (or dark version on light bg after scroll)
- **Nav links:** 4 items max, `--color-text-secondary`, hover `--color-primary`
- **CTA button:** Filled `--color-accent`, white text, 40px height, rounded
- **Mobile:** Hamburger menu, full-screen nav overlay

**Implementation note:** Use `backdrop-filter: blur(12px)` + `background: rgba(249,246,240,0.85)` for scrolled state.

---

## 6. SECTION ARCHITECTURE (page scroll order)

```
1.  HERO
2.  WAVE DIVIDER → METRICS BAR
3.  THE OPPORTUNITY
4.  WAVE DIVIDER (inverted)
5.  HOW IT WORKS
6.  TECHNOLOGY DIFFERENTIATOR
7.  IMPACT THESIS
8.  THE NUMBERS (financial terms)
9.  TRUST & TRACK RECORD
10. INVESTOR FAQ (accordion)
11. FINAL CTA
12. FOOTER
```

---

## 7. THE VERTICAL WAVE ELEMENT (EIF-style)

This is the signature design detail from eif.org. It is an SVG path that creates an organic curved transition between sections — not a simple diagonal, but a slow, wide sine-wave curve that flows across the full page width.

### Implementation

```html
<!-- Wave flowing from dark section to light section -->
<div class="wave-divider wave-divider--dark-to-light">
  <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
          fill="#F9F6F0"/>
  </svg>
</div>

<!-- Wave flowing from light section to dark/green section -->
<div class="wave-divider wave-divider--light-to-dark">
  <svg viewBox="0 0 1440 80" preserveAspectRatio="none"
       xmlns="http://www.w3.org/2000/svg">
    <path d="M0,40 C360,0 1080,80 1440,40 L1440,0 L0,0 Z"
          fill="#1B4332"/>
  </svg>
</div>
```

```css
.wave-divider {
  line-height: 0;
  overflow: hidden;
  margin: 0;
  padding: 0;
}
.wave-divider svg {
  display: block;
  width: 100%;
  height: 80px;
}
/* Optional: on small screens reduce height */
@media (max-width: 768px) {
  .wave-divider svg { height: 48px; }
}
```

**Usage rule:** Place wave dividers at every transition between the green/dark sections and the light/white sections. Always match the `fill` color to the *destination* section background.

---

## 8. SECTION COPY & DESIGN SPECS

---

### SECTION 1: HERO

**Layout:** Full viewport height (`100dvh`). Green background (`--color-primary`). Left-aligned content block (max-width 680px), right side: subtle field/satellite imagery or animated particle field.

**Badge/chip (above headline):**
```
● LIVE  ·  Tamil Nadu, India  ·  100% Repayment Track Record
```
*Style: small uppercase pill, `--color-accent` dot, `--color-text-on-dark` text, semi-transparent border*

**H1 headline:**
```
Agricultural Finance,
On-Chain.
```
*Style: `--text-hero`, `--color-text-on-dark`, `--tracking-tightest`, weight 700, line height 1.1*

**Subheadline:**
```
Nila.land converts satellite-verified crop harvests into
on-chain collateral — funding women smallholder farmers
in India at institutional terms. We're raising a
€1.5M senior debt facility. Target return: 5–8% p.a.
```
*Style: `--text-h3`, weight 400, `--color-text-on-dark` at 80% opacity, `--leading-loose`*

**CTAs (horizontal row):**
```
[  Connect Wallet  ]    [  Request Information Memorandum →  ]
```
- Primary: filled `--color-accent`, dark text, 48px height, bold
- Secondary: outlined in `--color-text-on-dark` at 40%, text `--color-text-on-dark`

**Footnote text beneath CTAs:**
```
Dutch BV structure · Netherlands law security · 5-year tenor · Q2 2026 first close
```
*Style: `--text-small`, muted, separated by ` · `*

**Right side visual (desktop only):**
Option A: Looping satellite timelapse (subtle, desaturated green tone to match palette)
Option B: Abstract SVG network graph (nodes = farmers, edges = loans, minimal animation)
Option C: High-quality photograph of Tamil Nadu farmland, overlaid with subtle grid/data overlay

---

### SECTION 2: METRICS BAR (immediately after wave divider)

**Layout:** Full-width horizontal strip, `--color-bg-section` background, `1rem` vertical padding.

**4 stats in a row:**

| Stat | Label |
|------|-------|
| **100%** | Principal Repayment |
| **3** | Crop Seasons Completed |
| **40** | Women Farmers, Stage 1 |
| **€1.5M** | Target Facility Size |

*Style: number in `--text-stat` + `--color-primary`, label in `--text-small` + `--color-text-secondary`, centered, separated by thin `--color-border` vertical lines*

---

### SECTION 3: THE OPPORTUNITY

**Layout:** Two columns — left text block, right: a simple comparison card (before/after informal vs Nila.land credit costs).

**Section label (uppercase chip):**
```
THE OPPORTUNITY
```

**H2:**
```
A €120–240K annual value
extraction — now redirected
to farmers and investors.
```

**Body paragraphs:**

> Tamil Nadu's 6.1 million smallholder farm households are shut out of formal credit — not because they're poor credit risks, but because they lack the documents that Indian banking requires: formal land titles, bank accounts, and male guarantors. The result is a structural extraction of value at 36–75% effective annual cost, captured by moneylenders and advance traders.

> For 900 farmers working two acres each, that value leakage reaches ₹1.08–2.16 crore annually — roughly €120,000–240,000. This is not a subsidy gap. It is existing value currently captured by rent-seeking intermediaries. A properly structured debt facility, deployed through verified community lending infrastructure, converts that extraction simultaneously into farmer income and investor return.

> Nila.land is building the technology and legal infrastructure that makes this trade possible. We do not compete with existing community finance institutions — we amplify the best-performing one already present: the Mother Theresa Farmers Union, a 100% women-run Self-Help Group providing credit at 12% per annum, versus the 36–75% charged by informal alternatives.

**Right card — visual comparison:**
```
┌─────────────────────────────────┐
│  Without Nila.land              │
│  Informal credit cost: 36–75%   │
│  Payment delay: 7–30 days       │
│  Land title required: Yes       │
│  Male guarantor required: Yes   │
├─────────────────────────────────┤
│  With Nila.land          ✓ ✓ ✓  │
│  Credit rate: 12% p.a.          │
│  Payment settlement: same day   │
│  Land title: proof-of-use only  │
│  Male guarantor: not required   │
└─────────────────────────────────┘
```
*Style: dark green background (`--color-primary`), white text, split by a horizontal rule with subtle label. Rounded card, slight shadow.*

---

### SECTION 4: HOW IT WORKS

**Layout:** Light background (`--color-bg-light`). 4-step horizontal process (desktop), vertical stack (mobile).

**H2:**
```
From satellite to settlement
in three crop seasons.
```

**4 Steps:**

**Step 1 — Verify**
*Icon: satellite dish / sensor*
> A farmer stands anywhere in their field and submits a single GPS point via the Nila PWA. Our remote-sensing stack — nine Sentinel-2 multispectral indices, cloud-penetrating SAR radar, and 2.5m super-resolution — confirms crop presence and growth stage. No paperwork. Under 120 seconds.

**Step 2 — Tokenise**
*Icon: token / hexagon*
> When verification confirms crop presence, a Food Token is minted on the Polygon blockchain — an ERC-1155 token representing a verified, physical crop batch. This becomes the on-chain collateral for a pre-harvest loan. Immutable. Independently auditable. Tamper-proof.

**Step 3 — Lend**
*Icon: arrow + coin*
> The Mother Theresa Farmers Union extends credit at 12–16% p.a. against the verified Food Token collateral. Milestone-based disbursement ties loan release to verified crop events — seeds, planting, harvest — reducing information risk and aligning incentives at every stage.

**Step 4 — Settle**
*Icon: checkmark / dual key*
> On verified delivery, dual confirmation — oracle verification AND trader sign-off — triggers automated on-chain payment settlement. Same day. No price penalties. No waiting for Mandi payment cycles. The cycle of advance-trader dependency is broken.

*Style: numbered steps with large step numbers (`--color-primary-light` at low opacity), icon in `--color-accent`, heading in `--color-primary`, body in `--color-text-secondary`*

---

### SECTION 5: TECHNOLOGY DIFFERENTIATOR

**Layout:** Dark green background (`--color-primary`). Text-heavy left column, right column: technical spec table / visual stack diagram.

**H2:**
```
Verification infrastructure
built for the monsoon season.
```

**Body:**

> The critical failure point of conventional agricultural lending is information asymmetry: lenders cannot verify what farmers claim about their crops. Most satellite-based solutions use a single NDVI index, which fails in cloud cover and cannot distinguish crop types reliably at smallholder scale.

> Our verification stack is materially different. We combine nine Sentinel-2 multispectral indices at 10-metre resolution with SAR radar from Sentinel-1 — cloud-penetrating data that operates during Tamil Nadu's northeast monsoon when optical satellites go dark. Super-resolution processing brings effective resolution to 2.5 metres, enabling reliable plot-level detection below one hectare. Analysis results are stored on IPFS with content hashes anchored on-chain to each loan ID — creating a tamper-proof audit trail from planting confirmation to harvest readiness.

> For lenders, this translates directly into credit quality: 3–4 weeks advance warning of developing crop failures, real-time portfolio visibility, and milestone-based disbursement that ties loan release to verified events rather than borrower declarations.

**Right column — Technical Stack (minimal table):**

| Layer | Technology |
|-------|-----------|
| Optical sensing | Sentinel-2, 10m → 2.5m SR |
| Radar sensing | Sentinel-1 SAR (cloud-penetrating) |
| Indices | NDVI, NDMI, NBR, NDRE, EVI + 4 more |
| Storage | IPFS + on-chain content hash |
| Blockchain | Polygon L2 (ERC-1155 Food Tokens) |
| Cloud infra | Akash decentralised compute |
| Settlement | Dual-confirmation oracle + trader |

*Style: table with `--color-primary-light` left border, muted text on dark bg*

---

### SECTION 6: IMPACT THESIS

**Layout:** Light background. Three impact cards in a row.

**Section label:** `IMPACT`

**H2:**
```
Three structural barriers removed.
One infrastructure layer.
```

**Card 1 — No Land Title Required**
> Indian banking structurally excludes women who lack formal land title — typically held by male relatives. Our proof-of-use registration system requires only that a farmer stands on their land. We detect land use remotely via satellite. Zero paperwork. Zero male guarantors.

**Card 2 — Same-Day Payment**
> Farmers who cannot afford to wait 7–30 days for official channel payment have no choice but to accept advance trader contracts at 5–15% price penalties. Automated on-chain settlement triggered by verified delivery eliminates this penalty — permanently.

**Card 3 — Open Infrastructure**
> All smart contracts, the progressive web app, and the Food Token standard are open-source and freely replicable. Any Self-Help Group, agricultural cooperative, or development finance institution can adopt the standard. Four union MOUs signed. Combined network capacity: 10,000+ farmers.

*Style: white cards, `--color-primary` heading, `--color-primary-light` top border accent, subtle shadow*

---

### SECTION 7: THE NUMBERS

**Layout:** Dark green section, white text. Structured financial terms overview.

**H2:**
```
The investment case.
```

**Three-column layout:**

**Facility Structure**
- Type: Senior secured debt facility
- Size: €1,500,000
- Tenor: 5 years
- First close: Q2 2026
- Borrower: Nila.land BV (Netherlands)
- Security law: Netherlands

**Returns**
- Target investor return: 5.5–8% p.a.
- Lending rate: 12–16% INR (up to 19.24% via rate steepener)
- Debt service: Interest-only Years 1–2, amortising Years 3–5
- Break-even AUM: $1.0–1.9M (2–3 union partnerships)
- FX hedge: layered INR buffer + ARC stablecoin (on approval)

**Security Package**
- Primary: Assignment of receivables (direct claim on all loan repayments)
- Secondary: Pledge over Nila.land BV shares (Dutch law enforcement)
- First-loss reserve: 10% of AUM per union pool, held in segregated escrow
- On-chain transparency: reserve ratio and portfolio health verifiable at any time

**Below the three columns — one-line disclaimer in small text:**
```
The indicative terms above are subject to final due diligence, legal documentation, and credit committee approval.
Full Information Memorandum available under NDA.
```

---

### SECTION 8: TRUST & TRACK RECORD

**Layout:** Light background. Left: timeline/milestones. Right: key credentials list.

**H2:**
```
100% repayment.
Three seasons.
Zero defaults.
```

**Stage 1 Timeline (left):**
- **Season 1 (2023–24):** 40 women farmers onboarded, ₹4 lakh deployed at 6% subsidised rate. 100% repayment.
- **Season 2 (2024):** Second cycle. 100% repayment. Social cohesion confirmed.
- **Season 3 (2024–25):** Dynamic rate introduced (6–19.24%). One active loan at steepener rate confirmed demand at 19.24%. 100% principal repayment.
- **Stage 2 (2025–26):** Digital trade finance and shared cropping pilot. Food Tokens live. 20–180 farmers, 4 crop types, 3 seasons.

**Credentials list (right):**
- Dutch BV incorporated, Netherlands — legal enforceability under European law
- Chennai field office — weekly technical and operational training
- Open-source smart contracts and PWA — independently auditable
- 3 additional union MOUs signed — geographic diversification underway
- Smart contract audit commissioned — condition precedent to debt drawdown
- Indian legal counsel engaged — NBFC/FEMA/ECB opinion in progress
- PMFBY crop insurance integration — exploratory, in pipeline

---

### SECTION 9: INVESTOR FAQ (accordion)

**H2:**
```
Common questions.
```

*Accordion component: question as toggle header, answer as expandable body.*

**Q: Who is the borrower and where is it incorporated?**
A: Nila.land BV is incorporated in the Netherlands as a private limited company. All primary security — receivables assignment and share pledge — is governed by Netherlands law, providing investors with enforcement rights under a mature European legal system.

**Q: What is the primary security for the debt facility?**
A: The security package comprises three layers: (1) assignment of receivables — all loan repayments from SHG union pools are assigned directly to lenders; (2) pledge over Nila.land BV shares; (3) a genuine 10% first-loss cash reserve held in segregated escrow per union pool, not accessible without lender consent. All positions are verifiable on-chain in real time.

**Q: How is FX risk managed?**
A: A 2% reserve mechanism is directed to an on-chain FX buffer, triggered by INR/USD deviation from the 90-day moving average. Structurally, the 12–16% INR lending rate is set to absorb moderate depreciation while maintaining EUR debt service coverage. ARC — India's first regulated INR stablecoin on Polygon, currently in RBI regulatory approval — is the long-term structural solution. Full FX sensitivity analysis is included in the financial model provided under NDA.

**Q: What happens if a crop fails?**
A: The oracle detects vegetation anomalies 3–4 weeks before expected harvest loss, enabling proactive intervention. A structured default protocol opens a 3-week repayment window, triggers field officer dispatch, and if unresolved, immutably marks the Food Token as 'failed'. The union's first-loss reserve absorbs individual defaults. Portfolio diversification across four crop types and multiple geographic union pools reduces correlation risk. PMFBY national crop insurance integration provides the structural systemic hedge.

**Q: Is the lending infrastructure regulated in India?**
A: The pilot operates within the established SHG peer-lending framework, which is exempt from NBFC registration at current AUM. Indian legal counsel is engaged to provide a formal opinion on NBFC/FEMA/ECB applicability — required as a condition precedent to first drawdown. This opinion will be provided to all prospective lenders during due diligence.

**Q: What is the minimum investment?**
A: Minimum ticket size and tranche structure will be confirmed in the final term sheet. The facility is structured as a senior secured debt instrument for qualified investors. To receive the full Information Memorandum and term sheet, please connect your wallet or request the IM using the form below.

---

### SECTION 10: FINAL CTA

**Layout:** Green background. Centered. Generous padding.

**H2:**
```
Ready to review
the full opportunity?
```

**Body:**
```
The complete Information Memorandum — including financial model,
Stage 1 performance data, management team, and full term sheet —
is available to qualified investors under NDA.
```

**CTAs (centered row):**
```
[  Connect Wallet  ]    [  Request Information Memorandum  ]
```

**Supporting text beneath:**
```
Or contact Carst directly: carst@blockchainforcommons.com
```

---

### SECTION 11: FOOTER

**Layout:** Very dark green (`#0D1F17`) or near-black. Two rows.

**Row 1 — four columns:**
- **Nila.land BV** | Dutch social enterprise | Amsterdam + Chennai
- **Platform:** pwa.nila.land | Smart contracts: open-source
- **Contact:** carst@blockchainforcommons.com
- **Legal:** This page does not constitute a public offering. For qualified investors only.

**Row 2 — bottom bar:**
```
© 2026 Nila.land BV · All rights reserved · Netherlands Chamber of Commerce
```

---

## 9. COMPONENT LIBRARY NOTES (for Claude Code)

### Button variants
```css
.btn-primary {
  background: var(--color-accent);
  color: #1A1A1A;
  padding: 0.75rem 1.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  transition: background 0.2s, transform 0.1s;
}
.btn-primary:hover { background: var(--color-accent-hover); transform: translateY(-1px); }

.btn-outline-light {
  border: 1.5px solid rgba(243,239,231,0.4);
  color: var(--color-text-on-dark);
  padding: 0.75rem 1.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  background: transparent;
  transition: border-color 0.2s, background 0.2s;
}
.btn-outline-light:hover { border-color: rgba(243,239,231,0.8); background: rgba(255,255,255,0.06); }
```

### Section label chip
```css
.section-label {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin-bottom: 1rem;
}
```

### Stat number
```css
.stat-number {
  font-size: var(--text-stat);
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -0.03em;
  line-height: 1;
}
.stat-label {
  font-size: var(--text-small);
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}
```

### Card component
```css
.card {
  background: #fff;
  border-radius: 0.75rem;
  padding: 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  border-top: 3px solid var(--color-primary-light);
}
```

---

## 10. ANIMATIONS & INTERACTIONS

- **Hero entrance:** Headline fades up (opacity 0→1, translateY 20px→0) over 0.6s, subhead 0.2s delay, CTAs 0.4s delay. Keep subtle — this is institutional, not a product launch.
- **Scroll-triggered counters:** Metric bar numbers count up when entering viewport (e.g. 0→100%, 0→3, 0→40). Use IntersectionObserver.
- **Wave dividers:** Static SVG, no animation needed.
- **FAQ accordion:** Smooth max-height transition (0→auto) with cubic-bezier easing.
- **Sticky nav:** Transition from transparent to frosted glass on first scroll. `transition: background 0.3s, box-shadow 0.3s`.
- **Cards:** Subtle `transform: translateY(-4px)` + shadow increase on hover.

No autoplay videos. No heavy parallax. Keep page load fast — institutional investors will often open on mobile.

---

## 11. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Key changes |
|-----------|-------|-------------|
| `sm` | 640px | Single column, reduced font sizes |
| `md` | 768px | 2-column grids enabled |
| `lg` | 1024px | Full 3-column, hero split enabled |
| `xl` | 1280px | Max content width kicks in |

Hero on mobile: stack headline + subhead + CTAs vertically; hide right visual; reduce hero to ~85dvh.

---

## 12. PHASE 2 HOOKS (placeholders for wallet integration)

Add these `data-` attributes to CTA buttons so Phase 2 can attach wallet logic without restructuring the DOM:

```html
<button class="btn-primary" data-action="connect-wallet" data-phase="2">
  Connect Wallet
</button>
<button class="btn-outline-light" data-action="request-im">
  Request Information Memorandum
</button>
```

The "Request IM" button in Phase 1 can open a simple modal with a name + email form (no wallet required). This feeds directly into Carst's investor pipeline.

---

## 13. IMPLEMENTATION CHECKLIST FOR CLAUDE CODE

- [ ] Set up CSS custom properties (color tokens, type scale)
- [ ] Build sticky nav component with scroll transition
- [ ] Build hero section with badge chip, headline, sub, CTAs
- [ ] Add wave SVG divider (dark→light)
- [ ] Build metrics bar with scroll-triggered counters
- [ ] Build "The Opportunity" two-column section with comparison card
- [ ] Add wave SVG divider (light→dark)
- [ ] Build "How It Works" 4-step process component
- [ ] Build Technology section (dark bg, technical stack table)
- [ ] Build Impact section (3-card row)
- [ ] Build "The Numbers" section (3-column financial terms)
- [ ] Build Trust & Track Record section (timeline + credentials)
- [ ] Build FAQ accordion
- [ ] Build Final CTA section
- [ ] Build Footer
- [ ] Add Phase 2 data attributes on all CTA buttons
- [ ] Responsive audit: all breakpoints
- [ ] Performance: preload Inter font, lazy-load images, inline critical CSS
- [ ] Confirm hex codes from Carst (current nila.land color palette)

---

*Document prepared from: Nila_Land_Concept_Note_v2.docx, Nila_Debt_Proposal_DFI.docx, Nila_Lender_Critical_Analysis.docx*
*Design references: eif.org/flagship-initiatives/investeu/overview · panteracapital.com*
*Version: 1.0 · February 2026*
