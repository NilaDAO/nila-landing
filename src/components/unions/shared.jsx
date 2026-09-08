import { motion } from "framer-motion";
import { Lock, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import { getFundMeta } from "./data.js";

// ─── Health Score Ring ────────────────────────────────────────────────────────
export function scoreToCategory(score) {
  if (score == null) return { label: "—",    level: "—",    color: "#D4A017" };  // onboarding — gold dash
  if (score >= 80)   return { label: "Low",  level: "Low",  color: "#52B788" };
  if (score >= 60)   return { label: "Med",  level: "Med",  color: "#D4A017" };
  return               { label: "High", level: "High", color: "#ef4444" };
}

// `showCategory` — show risk label instead of numeric score (used in UnionCard)
export function HealthRing({ score, locked = false, size = 72, showCategory = false }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  // null score (onboarding): show a thin 15% arc in gold to signal "pending"
  const fill = locked ? 0.35 : (score != null ? score / 100 : 0.15);
  const color = score == null ? "#D4A017" : score >= 80 ? "#52B788" : score >= 60 ? "#D4A017" : "#ef4444";
  const { level: catLevel, color: catColor } = scoreToCategory(score);

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={locked ? "rgba(255,255,255,0.2)" : color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - fill)}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {locked
          ? <Lock className="h-4 w-4" style={{ color: "rgba(255,255,255,0.3)" }} />
          : showCategory
            ? <span style={{ fontSize: 10, fontWeight: 700, color: catColor, lineHeight: 1.2, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span>{catLevel}</span>
                <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>risk</span>
              </span>
            : <span className="text-sm font-bold" style={{ color }}>{score}</span>
        }
      </div>
      {locked && (
        <div
          className="absolute inset-0 rounded-full"
          style={{ backdropFilter: "blur(3px)", backgroundColor: "rgba(15,23,42,0.15)" }}
        />
      )}
    </div>
  );
}

// ─── Indicator config — single source of truth for display variant per key ────
export const INDICATOR_CONFIG = {
  // Financial
  firstLossRatio:    { label: "First-loss ratio",      pillar: "financial",  display: "info", description: "Junior (union) capital divided by senior (investor) capital — shown for transparency but not scored. A high ratio on a seeding fund simply means few investors have joined yet, not that the fund is risky. Walk-away deterrence is assessed separately via collateral indicators. The ratio becomes meaningful once the senior pool is substantial and track record is established." },
  bucketThreshold:   { label: "Bucket threshold",      pillar: "financial",  display: "bar",  description: "The WAD ratio a union leader actively targets over time — lower means tighter lending discipline and a smaller default buffer required per loan bucket. This is a forward-looking indicator: a steadily declining threshold signals improving repayment culture and governance. Lower is better; full marks at ≤10%, zero at ≥80%." },
  reserveBuffer:     { label: "Reserve buffer",        pillar: "financial",  display: "bar",  description: "Rainy-day reserve as a share of total junior deposits. A reserve equal to junior capital scores full marks (15 pts). No reserve scores 0. This buffer is the first line of defence against unexpected defaults before the junior tranche is touched." },
  insuranceCoverage: { label: "Insurance coverage",    pillar: "financial",  display: "bar",  description: "% of loans covered by crop or weather insurance (on-chain attestation)." },
  portfolioRevenue:  { label: "Portfolio revenue",     pillar: "financial",  display: "bar",  description: "Total estimated harvest revenue across active loans relative to total loan value deployed. A ratio above 1.0× means the crop harvest is expected to comfortably cover repayments. Scored 0–10 pts: full marks when estimated revenue exceeds 150% of total loans outstanding." },
  cropStress:        { label: "Crop stress",           pillar: "financial",  display: "bar",  description: "Proportion of active loans with at least one stress flag (drought, pest pressure, waterlogging). Lower is better — zero stress scores full marks (8 pts), 100% stressed scores 0. Stress signals are attested per loan and updated seasonally." },
  foodTokenCollateral:{ label: "Food token collateral", pillar: "financial",  display: "tag",  description: "Loans collateralised with harvest-backed food tokens. Each token represents a verifiable claim on a future crop batch, making default walk-away significantly more costly for the borrower. Not yet operational." },
  landTitleCollateral:{ label: "Land title collateral", pillar: "financial",  display: "tag",  description: "Loans collateralised with on-chain land title tokens. Provides hard asset backing and the strongest walk-away deterrent — forfeiting land is a far higher social and economic cost than forfeiting a crop. Not yet operational." },
  // Geo / Climate
  climateRisk:       { label: "Climate / drought risk",pillar: "geoClimate", display: "bar",  description: "Regional rainfall variance and drought index. Lower risk = higher score." },
  waterManagement:   { label: "Water source",          pillar: "geoClimate", display: "tag",  description: "Primary irrigation method. Canal > Borewell > Rainfed in risk profile." },
  geographicSpread:  { label: "Geo. spread",           pillar: "geoClimate", display: "bar",  description: "Member farm distribution across sub-districts. Higher spread = lower correlated risk." },
  cropDiversification:{ label: "Crop diversification", pillar: "geoClimate", display: "tag",  description: "Distinct crop types in portfolio. Monoculture increases systemic risk." },
  cropRotation:      { label: "Crop rotation",         pillar: "geoClimate", display: "tag",  description: "Season-over-season rotation reduces soil depletion and weather dependency." },
  bufferCropping:    { label: "Buffer / intercropping",pillar: "geoClimate", display: "bar",  description: "Presence of buffer crop practices alongside primary crops." },
  seedQuality:       { label: "Seed quality",          pillar: "geoClimate", display: "bar",  description: "Certified vs. saved seeds. Certified seeds signal yield stability." },
  yieldBenchmark:    { label: "Yield vs. benchmark",   pillar: "geoClimate", display: "bar",  description: "Actual member yield relative to regional benchmark (%)." },
  profitPerProperty: { label: "Profit per property",   pillar: "geoClimate", display: "bar",  description: "Average net margin per member farm — indicator of debt-service capacity." },
  typicalFundNeed:   { label: "Typical fund need",     pillar: "geoClimate", display: "info", description: "Average loan size relative to crop cycle cost. Informational only." },
  // Governance
  onChainAge:        { label: "On-chain track record", pillar: "governance", display: "info", description: "Time since the union was registered on-chain. Informational — scoring is based on seasons completed." },
  leaderCount:       { label: "KYC'd leaders",         pillar: "governance", display: "bar",  description: "Number of KYC-verified leaders managing the union on-chain. 1 point per leader, up to 3 — ensuring no single point of failure in fund governance." },
  auditStatus:       { label: "Audit status",          pillar: "governance", display: "tag",  description: "Level of financial verification: Third-party, Self-reported, or Pending." },
  seasons:           { label: "Seasons completed",     pillar: "governance", display: "bar",  description: "Number of 4-month crop seasons since the union went on-chain (Tamil Nadu cycle: Feb–May, Jun–Sep, Oct–Jan). Each season validates repayment discipline." },
  // Certifications
  certCoverage:      { label: "Member coverage",      pillar: "certification", display: "bar",  description: "Share of union members holding at least one certificate (Fair Trade, Organic, PDO, etc.). Broader coverage means a larger portion of the fund's underlying crop can be sold at premium prices, directly improving loan repayment capacity. Full marks (10 pts) at 100% coverage." },
  certFairTrade:     { label: "Fair Trade",            pillar: "certification", display: "cert", premiumPct: 0.20, description: "Fairtrade-certified farms command a minimum price floor plus a Social Premium (currently $0.50/kg for some crops). This premium is paid directly to the union and can be reinvested in community infrastructure or reserve buffers. Benchmark: +20% average uplift on crop sale price." },
  certPremiumQuality:{ label: "Premium Quality",      pillar: "certification", display: "cert", premiumPct: 0.15, description: "Independently graded premium-quality produce fetches higher per-unit prices from export and specialty buyers. Grade certification removes the buyer's quality discount, improving net farm margin. Benchmark: +15% average uplift." },
  certPDO:           { label: "PDO / GI",             pillar: "certification", display: "cert", premiumPct: 0.30, description: "Protected Designation of Origin (PDO) or Geographical Indication (GI) locks exclusive market access to a specific region. This creates a durable price moat — certified farms in a PDO zone cannot be undercut by cheaper substitutes. Benchmark: +30% average uplift, highest of all certificate types." },
  certSustainability:{ label: "Sustainability",       pillar: "certification", display: "cert", premiumPct: 0.10, description: "SAN / Rainforest Alliance or equivalent sustainability scheme. Buyers under corporate ESG commitments pay a programme premium for certified supply. Lower uplift than organic but easier to achieve at scale. Benchmark: +10% average uplift." },
  certOrganic:       { label: "Organic",              pillar: "certification", display: "cert", premiumPct: 0.45, description: "Certified organic produce commands the highest market premium of any certificate type, reflecting the cost of chemical-free farming and third-party inspection. Particularly strong for sesame, spices, and pulses in export markets. Benchmark: +45% average uplift on non-organic market price." },
};

// Tag color maps for categorical indicators
const WATER_COLORS = { Canal: "#52B788", Borewell: "#D4A017", Rainfed: "#ef4444" };
const AUDIT_COLORS = { "Third-party": "#52B788", "Self-reported": "#D4A017", Pending: "#94a3b8" };

const COLLATERAL_COLORS = { Active: "#52B788", "Not operational": "#94a3b8" };

function tagColor(key, value) {
  if (key === "waterManagement")     return WATER_COLORS[value]      ?? "#94a3b8";
  if (key === "auditStatus")         return AUDIT_COLORS[value]      ?? "#94a3b8";
  if (key === "foodTokenCollateral") return COLLATERAL_COLORS[value] ?? "#94a3b8";
  if (key === "landTitleCollateral") return COLLATERAL_COLORS[value] ?? "#94a3b8";
  return "var(--color-accent)";
}

// ─── Single indicator row ──────────────────────────────────────────────────────
function IndicatorRow({ indicatorKey, data, locked }) {
  const [open, setOpen] = useState(false);
  const cfg = INDICATOR_CONFIG[indicatorKey];
  if (!cfg) return null;

  const { label, display, description, maxScore } = cfg;
  const val   = data?.value ?? null;
  const score = data?.score ?? null;
  const max   = data?.maxScore ?? maxScore ?? null;

  const dimText  = "var(--color-text-soft)";
  const bodyText = "var(--color-text-soft)";

  // Shared description drawer
  const descDrawer = open && description && (
    <div className="pt-1 pb-1.5">
      <p className="text-[11px] leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
        {description}
      </p>
    </div>
  );

  // Score bar (display === "bar")
  if (display === "bar") {
    const pct = locked ? 0 : (score != null && max ? Math.min(score / max, 1) : 0);
    const barColor = pct >= 0.75 ? "#52B788" : pct >= 0.45 ? "#D4A017" : pct > 0 ? "#ef4444" : "rgba(255,255,255,0.12)";
    const scoreLabel = locked ? "••" : score != null ? `${score}/${max}` : max != null ? `—/${max}` : "—";

    return (
      <div>
        <button className="w-full flex items-center gap-3 py-1.5 text-left" onClick={() => setOpen((o) => !o)}>
          <span className="text-xs w-36 flex-shrink-0" style={{ color: open ? bodyText : dimText }}>{label}</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: barColor }}
              initial={{ width: 0 }}
              animate={{ width: `${pct * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="text-[11px] font-mono w-10 text-right flex-shrink-0" style={{ color: dimText }}>
            {scoreLabel}
          </span>
        </button>
        {descDrawer}
      </div>
    );
  }

  // Tag chips (display === "tag")
  if (display === "tag") {
    const items = locked ? null : Array.isArray(val) ? val : val != null ? [String(val)] : null;
    return (
      <div>
        <button className="w-full flex items-center gap-3 py-1.5 min-w-0 text-left" onClick={() => setOpen((o) => !o)}>
          <span className="text-xs w-36 flex-shrink-0" style={{ color: open ? bodyText : dimText }}>{label}</span>
          <div className="flex flex-wrap gap-1 min-w-0">
            {items
              ? items.map((v) => (
                  <span
                    key={v}
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: `${tagColor(indicatorKey, v)}22`, color: tagColor(indicatorKey, v), border: `1px solid ${tagColor(indicatorKey, v)}44` }}
                  >
                    {v}
                  </span>
                ))
              : <span className="text-xs" style={{ color: dimText }}>{locked ? "••••" : "—"}</span>
            }
          </div>
        </button>
        {descDrawer}
      </div>
    );
  }

  // Certificate row (display === "cert")
  // val shape: { count: number, upliftINR: number } | null
  if (display === "cert") {
    const count     = locked ? null : (val?.count ?? null);
    const uplift    = locked ? null : (val?.upliftINR ?? null);
    const hasHolders = count != null && count > 0;
    const certColor  = hasHolders ? "#52B788" : "rgba(255,255,255,0.2)";
    const CERT_ICONS = {
      certFairTrade:     "⚖️",
      certPremiumQuality:"🏅",
      certPDO:           "📍",
      certSustainability:"🌿",
      certOrganic:       "🌱",
    };
    const icon = CERT_ICONS[indicatorKey] ?? "🎖️";
    return (
      <div>
        <button className="w-full flex items-center gap-3 py-1.5 text-left" onClick={() => setOpen((o) => !o)}>
          <span className="text-xs w-36 flex-shrink-0 flex items-center gap-1.5" style={{ color: open ? bodyText : dimText }}>
            <span style={{ fontSize: 11 }}>{icon}</span>
            {label}
          </span>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {locked ? (
              <span className="text-xs" style={{ color: dimText }}>••••</span>
            ) : (
              <>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: hasHolders ? "rgba(82,183,136,0.12)" : "rgba(255,255,255,0.05)",
                    color: certColor,
                    border: `1px solid ${hasHolders ? "rgba(82,183,136,0.3)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  {count != null ? `${count} farms` : "—"}
                </span>
                {uplift != null && uplift > 0 && (
                  <span className="text-[10px] font-mono truncate" style={{ color: "var(--color-text-soft)" }}>
                    ~₹{uplift.toLocaleString("en-IN", { maximumFractionDigits: 0 })} uplift
                  </span>
                )}
              </>
            )}
          </div>
        </button>
        {descDrawer}
      </div>
    );
  }

  // Info row — label + value, no scoring (display === "info")
  const displayVal = locked ? "••••" : val != null ? String(val) : "—";
  return (
    <div>
      <button className="w-full flex items-center gap-3 py-1.5 text-left" onClick={() => setOpen((o) => !o)}>
        <span className="text-xs w-36 flex-shrink-0" style={{ color: open ? bodyText : dimText }}>{label}</span>
        <span className="text-xs" style={{ color: bodyText }}>{displayVal}</span>
      </button>
      {descDrawer}
    </div>
  );
}

// ─── Pillar breakdown card (one per pillar) ────────────────────────────────────
export function PillarBreakdown({ title, subtitle, indicators, locked, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  // Sum scored indicators for pillar total
  const scored = Object.entries(indicators).filter(([, d]) => d.maxScore > 0);
  const totalMax   = scored.reduce((s, [, d]) => s + (d.maxScore ?? 0), 0);
  const totalScore = scored.reduce((s, [, d]) => s + (d.score ?? 0), 0);
  const pct = totalMax > 0 && !locked ? totalScore / totalMax : locked ? 0.35 : 0;
  const pillColor = pct >= 0.75 ? "#52B788" : pct >= 0.45 ? "#D4A017" : pct > 0 ? "#ef4444" : "rgba(255,255,255,0.2)";

  return (
    <div
      className="rounded-2xl mb-3 overflow-hidden"
      style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Header / toggle */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        {/* Pillar mini-ring indicator */}
        <div className="relative flex-shrink-0" style={{ width: 32, height: 32 }}>
          <svg width={32} height={32} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={16} cy={16} r={12} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
            <circle
              cx={16} cy={16} r={12}
              fill="none" stroke={pillColor} strokeWidth={4} strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 12}
              strokeDashoffset={2 * Math.PI * 12 * (1 - pct)}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {locked
              ? <Lock style={{ width: 9, height: 9, color: "rgba(255,255,255,0.3)" }} />
              : <span style={{ fontSize: 8, fontWeight: 700, color: pillColor, lineHeight: 1 }}>
                  {totalMax > 0 ? Math.round(pct * 100) : "—"}
                </span>
            }
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold" style={{ color: "var(--color-text-soft)" }}>{title}</p>
          {(subtitle || totalMax > 0) && (
            <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-soft)" }}>
              {locked ? "•••• — unlock to view"
                : subtitle
                  ? subtitle
                  : `${totalScore} / ${totalMax} pts`}
            </p>
          )}
        </div>

        <ChevronDown
          className="flex-shrink-0 transition-transform"
          style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Expanded rows */}
      {open && (
        <div className="px-4 pb-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="pt-2">
            {Object.entries(indicators).map(([key, data]) => (
              <IndicatorRow key={key} indicatorKey={key} data={data} locked={locked} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper — centred, max-w, enters from below ─────────────────────
export function Section({ id, children, onReady }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0, 0.18, 1] }}
      onAnimationComplete={onReady}
      className="flex items-start justify-center py-8 sm:py-16 px-4 sm:px-6"
    >
      <div className="w-full" style={{ maxWidth: "640px" }}>
        {children}
      </div>
    </motion.section>
  );
}

// ─── Fund tab bar ─────────────────────────────────────────────────────────────
// Horizontal scrollable pill row: "All" + one pill per fund.
export function FundTabBar({ funds, activeFundIdx, onSelect }) {
  const scrollRef = useRef(null);
  if (!funds || funds.length <= 1) return null;

  const dimText = "var(--color-text-soft)";

  return (
    <div
      ref={scrollRef}
      className="flex gap-1.5 overflow-x-auto pb-2 mb-4 -mx-1 px-1"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
    >
      {/* "All" pill */}
      <button
        onClick={() => onSelect(null)}
        className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all"
        style={activeFundIdx == null
          ? { backgroundColor: "var(--color-accent)", color: "#0f172a" }
          : { backgroundColor: "rgba(255,255,255,0.06)", color: dimText, border: "1px solid rgba(255,255,255,0.08)" }
        }
      >
        All funds
      </button>

      {funds.map((fund, i) => {
        const meta = getFundMeta(fund.loanType);
        const isActive = activeFundIdx === i;
        // Utilisation-based dot color
        const u = fund.utilisation ?? 0;
        const dotColor = u >= 0.6 ? "#52B788" : u >= 0.3 ? "#D4A017" : u > 0 ? "#ef4444" : "rgba(255,255,255,0.2)";

        return (
          <button
            key={fund.loanType ?? i}
            onClick={() => onSelect(i)}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all"
            style={isActive
              ? { backgroundColor: "var(--color-accent)", color: "#0f172a" }
              : { backgroundColor: "rgba(255,255,255,0.06)", color: dimText, border: "1px solid rgba(255,255,255,0.08)" }
            }
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: isActive ? "#0f172a" : dotColor }}
            />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Fund constraints chip row ────────────────────────────────────────────────
export function FundConstraints({ fund }) {
  if (!fund) return null;
  const meta = getFundMeta(fund.loanType);
  const dimText = "var(--color-text-soft)";

  const chips = [];
  if (meta.description) chips.push(meta.description);
  if (meta.maxTenureMonths) chips.push(`Max ${meta.maxTenureMonths} mo tenure`);
  if (fund.bucketMaxAmount) chips.push(`Max ≤$${fund.bucketMaxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} / loan`);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {chips.map((chip) => (
        <span
          key={chip}
          className="text-[10px] px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", color: dimText, border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

// ─── Health score computation ─────────────────────────────────────────────────
// Sums scored indicators across all 4 pillars and normalises to 0–100.
// `liveFinancial` optionally overrides the financial pillar with live onchain data.
// Null scores count as 0 (unattested = drag on score, not excluded).
function sumPillarIndicators(indicators) {
  return Object.values(indicators).reduce(
    (acc, d) => {
      if ((d.maxScore ?? 0) > 0) {
        acc.score += d.score ?? 0;
        acc.max   += d.maxScore;
      }
      return acc;
    },
    { score: 0, max: 0 }
  );
}

// Computes the live financial indicators that can be derived directly from union data.
// Returns an override map that can be spread into financialIndicators.
// Both HealthSection and UnionCard call this so they compute the same base scores.
//
// `targetFund` — optional: scope to a specific fund object.  When omitted,
// aggregates across all funds (backwards-compatible default for "All" tab).
export function computeLiveFinancialIndicators(union, targetFund) {
  if (!union._live && !targetFund) return {};
  const allFunds = union.funds ?? [];

  // If a specific fund is requested, use it directly.
  // Otherwise aggregate across all funds.
  let juniorDep, seniorDep, bucketThresholdRaw;
  if (targetFund) {
    juniorDep = targetFund.junior?.totalDeposits ?? 0;
    seniorDep = targetFund.senior?.totalDeposits ?? 0;
    bucketThresholdRaw = targetFund.bucketThreshold ?? null;
  } else if (allFunds.length > 0) {
    juniorDep = allFunds.reduce((s, f) => s + (f.junior?.totalDeposits ?? 0), 0);
    seniorDep = allFunds.reduce((s, f) => s + (f.senior?.totalDeposits ?? 0), 0);
    // Weighted-average bucket threshold (weight by senior deposits)
    const totalSenior = seniorDep || 1;
    bucketThresholdRaw = allFunds.reduce((s, f) => s + (f.bucketThreshold ?? 0) * (f.senior?.totalDeposits ?? 0), 0) / totalSenior;
  } else {
    return {};
  }

  const rainyDay  = union.rainyDay ?? 0;

  const firstLossRatioNum = (seniorDep > 0 && juniorDep > 0)
    ? juniorDep / seniorDep
    : null;
  const firstLossDisplay = firstLossRatioNum != null
    ? `${firstLossRatioNum.toFixed(2)}×`
    : seniorDep === 0 && juniorDep > 0 ? "Seeding — no senior yet" : "—";

  const bucketThresholdScore = bucketThresholdRaw != null
    ? Math.round(Math.max(0, Math.min(1, (0.8 - bucketThresholdRaw) / (0.8 - 0.1))) * 20)
    : null;

  const reserveRatio = juniorDep > 0 ? rainyDay / juniorDep : null;
  const reserveScore = reserveRatio != null
    ? Math.round(Math.min(reserveRatio, 1) * 15)
    : null;

  return {
    firstLossRatio: {
      value: firstLossDisplay,
      score: null,
      maxScore: null,
    },
    bucketThreshold: {
      value: bucketThresholdRaw != null ? `${(bucketThresholdRaw * 100).toFixed(1)}%` : null,
      score: bucketThresholdScore,
      maxScore: 20,
    },
    reserveBuffer: {
      value: reserveRatio != null
        ? `${(reserveRatio * 100).toFixed(0)}%  (${rainyDay.toLocaleString(undefined, { maximumFractionDigits: 0 })} USDT)`
        : null,
      score: reserveScore,
      maxScore: 15,
    },
  };
}

export function computeHealthScore(union, liveFinancial = null, liveGovernance = null) {
  const financial    = liveFinancial ?? union.indicators?.financial    ?? {};
  const geoClimate   = union.indicators?.geoClimate   ?? {};
  const governance   = liveGovernance ?? union.indicators?.governance   ?? {};
  const certification = union.indicators?.certification ?? {};

  // If no indicator across any pillar has been attested (all scores null), return null.
  // This renders as gold "—" on onboarding unions rather than a computed 0.
  const allPillars = [financial, geoClimate, governance, certification];
  const hasAnyScore = allPillars.some((pillar) =>
    Object.values(pillar).some((d) => (d.maxScore ?? 0) > 0 && d.score != null)
  );
  if (!hasAnyScore) return null;

  const p1 = sumPillarIndicators(financial);
  const p2 = sumPillarIndicators(geoClimate);
  const p3 = sumPillarIndicators(governance);
  const p4 = sumPillarIndicators(certification);

  const totalScore = p1.score + p2.score + p3.score + p4.score;
  const totalMax   = p1.max   + p2.max   + p3.max   + p4.max;

  if (totalMax === 0) return null;
  return Math.round(totalScore / totalMax * 100);
}

// ─── Step label ───────────────────────────────────────────────────────────────
export function StepLabel({ label }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-primary-light)" }}>
      {label}
    </p>
  );
}
