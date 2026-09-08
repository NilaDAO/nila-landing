# Nila.land — Investor Landing Page
## Design SOP v2.0 — Aave-style, simplified
*For Claude Code implementation — February 2026*

---

## 1. BRIEF

Single-scroll page. Aave.com is the design reference — dark mode, live numbers, three action panels, connect wallet as the primary verb. Minimal copy. Maximum clarity.

The page answers one question: **what do I earn, how is it secured, and what does my capital do?**

---

## 2. PAGE STRUCTURE (full scroll)

```
1.  NAV
2.  HERO
3.  ABOUT NILA  (replaces "The Opportunity")
4.  THREE PANELS  (Earn / Track / Contribute)
5.  FAQ
6.  FOOTER
```

That's it. No timeline. No metrics bar. Those live in the app and the IM.

---

## 3. COLOR & TYPE, NAV and HERO ARE ALL GOOD!!!
Carry over the Nila palette from SOP v1 (confirm hex codes with Carst).
Dark mode throughout — `#0D1F17` near-black green as page background.
Accent: `--color-accent` harvest gold for live numbers, CTA buttons, highlights.
Type: Inter. Same scale as v1.

---

## 4. NAV

```
[NILA.LAND]                          [About  Docs]    [Connect Wallet →]
```

Fixed. Minimal. Two nav links max. CTA button always visible.
On mobile: hamburger, full-screen overlay.


## 6. ABOUT NILA

**Layout:** Below hero, dark section, left-aligned text block, max-width 640px.
No header label. No chip. Just the text — it should feel like a straight answer to "what is this?"

**Copy:**

> Nila is a yield instrument backed by real agricultural loans to farmers in Tamil Nadu, India. Loans are collateralised by satellite-verified crop tokens and enforced by smart contract.

> Agricultural lending to producer collectives is well-established in South Asia. What fails is enforcement at distance. Crop volumes are unverifiable. Side-selling is undetectable. Agreements are verbal, documentation is absent, and any lender without extensive local operations is flying blind.

> Nila's goal is to prove that rules-based on-chain contracts create the structure that previously required officers to be present. Pre-harvest disbursement is tied to verified crop events. Settlement requires dual confirmation. Default triggers automatically. The enforcement layer is in the code, not in a headcount.

> The result: farmers earn more, traders get verifiable supply, and investors receive a structured, senior-secured yield instrument — with full on-chain transparency.

**No comparison cards. No tables. Just the four paragraphs.**

---

## 7. THREE PANELS — Earn / Track / Contribute

**Layout:** Three equal-width cards in a horizontal row (stack vertically on mobile).
Dark card background, slightly lighter than page bg — `rgba(255,255,255,0.04)`.
Gold top border on the active/hovered card. Subtle box shadow.

---

### Panel 1 — EARN

**Label (uppercase, small):** `EARN`

**Big number (live or indicative):**
```
5–8%
```
*Style: `--text-stat`, `--color-accent`, weight 700*

**Unit line beneath number:**
```
target APY  ·  paid in USDt
```

**Body:**
> Deposit USDt and earn yield from real agricultural loans. EURc and ARC support coming soon — giving European and INR-native investors a natural currency match.

**Link:**
```
View current rates →
```

---

### Panel 2 — TRACK

**Label:** `TRACK`

**Big line:**
```
Full supply-chain
visibility.
```
*Style: `--text-h2`, white, weight 600*

**Body:**
> Every loan in your portfolio is traceable to a specific crop, union, and harvest season. Satellite verification, Food Token collateral, and repayment status — all on-chain, all auditable by you at any time.

**Link:**
```
View a live portfolio →
```

---

### Panel 3 — CONTRIBUTE

**Label:** `CONTRIBUTE`

**Big line:**
```
Pick your union.
Pick your goals.
```
*Style: `--text-h2`, white, weight 600*

**Body:**
> Choose which farmer union your capital supports. Align with UN Sustainable Development Goals. Move between funds and unions as your priorities shift. Your capital, your mandate.

**Link:**
```
Browse unions →
```

---

## 8. FINAL CTA

**Layout:** Centered, dark section, generous padding.

**H2:**
```
Ready to deploy capital?
```

**CTA row:**
```
[  Connect Wallet  ]    [  Request Information Memorandum  ]
```

**Beneath:**
```
carst@blockchainforcommons.com
```

---

## 9. FOOTER

Dark. Minimal. Two rows.

**Row 1:**
```
Nila.land BV  ·  Amsterdam + Chennai  ·  pwa.nila.land  ·  carst@blockchainforcommons.com
```

**Row 2:**
```
© 2026 Nila.land BV  ·  This page does not constitute a public offering. For qualified investors only.
```

---

## 10. WAVE DIVIDERS

Use the SVG wave from SOP v1 between the Hero and About Nila sections only.
One wave. Not on every section break — the dark-on-dark transitions read cleanly without them.

---

## 11. PHASE 2 HOOKS

```html
<button data-action="connect-wallet" data-phase="2">Connect Wallet</button>
<button data-action="request-im">Request Information Memorandum</button>
<a data-action="view-rates" data-phase="2">View current rates →</a>
<a data-action="view-portfolio" data-phase="2">View a live portfolio →</a>
<a data-action="browse-unions" data-phase="2">Browse unions →</a>
```

All Phase 2 links open a "Coming soon — join the waitlist" modal in Phase 1.

---

## 12. WHAT'S REMOVED FROM v1

- Metrics bar
- How It Works (4-step)
- Technology section
- Impact section
- The Numbers / financial terms
- Trust & Track Record timeline
- FAQ accordion

All of this lives in the Information Memorandum. The landing page gets out of the way.

---

*v2.0 · February 2026 · Replaces Nila_Investor_Landing_Page_SOP.md*
