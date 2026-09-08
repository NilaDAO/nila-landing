import { motion } from "framer-motion";
import { Lock, Plus, ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { HealthRing, PillarBreakdown, FundTabBar, FundConstraints, Section, StepLabel, computeHealthScore, computeLiveFinancialIndicators } from "./shared.jsx";
import { computeGovernanceIndicators, getFundMeta } from "./data.js";

const STAGES = ["Land prep", "Germination", "Vegetative", "Flowering", "Harvest-ready", "Harvested"];

const STRESS_COLORS = {
  "Drought":       "#ef4444",
  "Pest pressure": "#f97316",
  "Waterlogging":  "#3b82f6",
};

function LoanCard({ loan, isLocked, wallet }) {
  const c = loan.cultivation;
  const dimText  = "var(--color-text-soft)";
  const bodyText = "var(--color-text-soft)";
  const accent   = "var(--color-accent)";

  const harvestFormatted = c?.harvestDate
    ? new Date(c.harvestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const impliedRevenue = c?.yieldEst != null && c?.loanCropArea != null && c?.cropPriceEst != null
    ? Math.round(c.yieldEst * c.loanCropArea * c.cropPriceEst)
    : null;

  return (
    <div
      className="rounded-2xl mb-3 overflow-hidden relative"
      style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold" style={{ color: bodyText }}>
            {isLocked ? "••••" : (c?.crop ?? loan.fund?.slice(0, 8) ?? "Loan")}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: dimText }}>
              {isLocked ? "••••" : `${loan.amount != null ? loan.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "—"} USDT`}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: "rgba(82,183,136,0.15)", color: "#52B788", border: "1px solid rgba(82,183,136,0.3)" }}
            >
              {isLocked ? "••" : `${loan.rateBP != null ? (loan.rateBP / 100).toFixed(1) : "—"}%`}
            </span>
          </div>
        </div>

        {/* Stage progress strip */}
        <div className="mb-3">
          <div className="flex items-center gap-0">
            {STAGES.map((stage, i) => {
              const isCurrent = c?.stageIndex === i;
              const isPast    = c?.stageIndex > i;
              const dotColor  = isCurrent ? accent : isPast ? "rgba(82,183,136,0.5)" : "rgba(255,255,255,0.15)";
              const lineColor = isPast || isCurrent ? "rgba(82,183,136,0.3)" : "rgba(255,255,255,0.08)";
              return (
                <div key={stage} className="flex items-center" style={{ flex: i < STAGES.length - 1 ? "1" : "none" }}>
                  <div
                    title={stage}
                    style={{
                      width: isCurrent ? 10 : 7, height: isCurrent ? 10 : 7,
                      borderRadius: "50%",
                      backgroundColor: isLocked ? "rgba(255,255,255,0.12)" : dotColor,
                      flexShrink: 0,
                      boxShadow: isCurrent && !isLocked ? `0 0 6px ${accent}` : "none",
                      transition: "background-color 0.3s",
                    }}
                  />
                  {i < STAGES.length - 1 && (
                    <div style={{ flex: 1, height: 1, backgroundColor: isLocked ? "rgba(255,255,255,0.06)" : lineColor }} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-1">
            <span className="text-[10px]" style={{ color: dimText }}>
              {isLocked ? "••••••" : (c?.stage ?? "—")}
            </span>
          </div>
        </div>

        {/* Stress flags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {isLocked
            ? <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: dimText }}>••••</span>
            : c?.stressFlags?.length > 0
              ? c.stressFlags.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: `${STRESS_COLORS[f] ?? "#94a3b8"}22`, color: STRESS_COLORS[f] ?? "#94a3b8", border: `1px solid ${STRESS_COLORS[f] ?? "#94a3b8"}44` }}
                  >
                    {f}
                  </span>
                ))
              : <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "rgba(82,183,136,0.12)", color: "#52B788", border: "1px solid rgba(82,183,136,0.3)" }}>No stress</span>
          }
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <p style={{ color: dimText }}>Harvest</p>
            <p style={{ color: bodyText }}>{isLocked ? "••••" : harvestFormatted}</p>
          </div>
          <div>
            <p style={{ color: dimText }}>Yield est.</p>
            <p style={{ color: bodyText }}>
              {isLocked ? "••••" : c?.yieldEst != null
                ? `${c.yieldEst.toLocaleString("en-IN")} kg/ac`
                : "—"}
            </p>
            {!isLocked && c?.yieldBenchmark != null && (
              <p style={{ color: "var(--color-text-soft)", fontSize: 9 }}>bmark {c.yieldBenchmark.toLocaleString("en-IN")}</p>
            )}
          </div>
          <div>
            <p style={{ color: dimText }}>Revenue est.</p>
            <p style={{ color: bodyText }}>
              {isLocked ? "••••" : impliedRevenue != null
                ? `~₹${impliedRevenue.toLocaleString("en-IN")}`
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(15,23,42,0.4)" }}
        >
          <Lock className="h-5 w-5" style={{ color: "rgba(255,255,255,0.4)" }} />
          <p className="text-xs font-semibold" style={{ color: "var(--color-text-soft)" }}>
            {wallet ? "Min. 50 USDT (or nIN holder) to unlock" : "Connect wallet to unlock"}
          </p>
        </div>
      )}
    </div>
  );
}

export function HealthSection({ union, wallet, onInvest, stepRef, onReady, investment, loans = [] }) {
  const [loansOpen, setLoansOpen] = useState(false);
  const [activeFundIdx, setActiveFundIdx] = useState(null); // null = "All"
  const hasAlloc = union.allocation && union.allocation.length > 0;
  const isLocked = !wallet || (wallet.usdt < 50 && !wallet.ninUser);
  const isInvested = !!investment;

  const funds = union.funds ?? [];
  const selectedFund = activeFundIdx != null ? funds[activeFundIdx] ?? null : null;

  // ── Filter loans by selected fund ──────────────────────────────────────────
  const filteredLoans = useMemo(() => {
    if (!selectedFund) return loans; // "All" — show everything
    const fundKey = selectedFund.loanType;
    return loans.filter((l) => {
      if (l.fund && fundKey) {
        return l.fund.toLowerCase() === fundKey.toLowerCase();
      }
      return false;
    });
  }, [loans, selectedFund]);

  // ── Portfolio-level metrics derived from loan cultivation stubs ─────────────
  const loansWithCultivation = filteredLoans.filter((l) => l.cultivation != null);
  const totalLoanValue = filteredLoans.reduce((s, l) => s + (l.amount ?? 0), 0);

  // Total estimated harvest revenue (INR) across all loans with complete data
  const totalRevenueINR = loansWithCultivation.reduce((s, l) => {
    const c = l.cultivation;
    if (c.yieldEst != null && c.loanCropArea != null && c.cropPriceEst != null) {
      return s + c.yieldEst * c.loanCropArea * c.cropPriceEst;
    }
    return s;
  }, 0);

  // Portfolio revenue score: estimated revenue / (loan value × fxRate) → ratio vs 1.5× threshold
  const fxRate = union.fxRate?.rateFloat ?? union.funds?.[0]?.fxRate?.rateFloat ?? 83;
  const totalLoanINR = totalLoanValue * fxRate;
  const revenueRatio = totalLoanINR > 0 ? totalRevenueINR / totalLoanINR : null;
  const portfolioRevenueScore = revenueRatio != null
    ? Math.round(Math.min(revenueRatio / 1.5, 1) * 10)
    : null;
  const portfolioRevenueDisplay = revenueRatio != null
    ? `${revenueRatio.toFixed(2)}× (₹${Math.round(totalRevenueINR).toLocaleString("en-IN", { maximumFractionDigits: 0 })})`
    : loansWithCultivation.length > 0 ? "Partial data" : null;

  // Crop stress score
  const loansWithStressData = loansWithCultivation.filter((l) => Array.isArray(l.cultivation.stressFlags));
  const stressedCount = loansWithStressData.filter((l) => l.cultivation.stressFlags.length > 0).length;
  const cropStressScore = loansWithStressData.length > 0
    ? Math.round((1 - stressedCount / loansWithStressData.length) * 8)
    : null;
  const cropStressDisplay = loansWithStressData.length > 0
    ? stressedCount === 0 ? "No stress detected" : `${stressedCount} / ${loansWithStressData.length} loans affected`
    : null;

  // ── Build live financial indicators — scoped to selected fund ──────────────
  const liveBase = computeLiveFinancialIndicators(union, selectedFund);

  // Certification pillar subtitle
  const certIndicators = union.indicators?.certification ?? {};
  const totalUpliftINR = Object.entries(certIndicators).reduce((s, [key, d]) => {
    if (key === "certCoverage") return s;
    return s + (d.value?.upliftINR ?? 0);
  }, 0);
  const certSubtitle = totalUpliftINR > 0
    ? `~₹${totalUpliftINR.toLocaleString("en-IN", { maximumFractionDigits: 0 })} est. premium uplift`
    : "No certificates yet";

  // Mini ring for Active loans header
  const loansRingColor = (cropStressScore != null && stressedCount === 0 && revenueRatio != null && revenueRatio >= 1.0)
    ? "#52B788"
    : (cropStressScore ?? 0) >= 5 ? "#D4A017"
    : filteredLoans.length > 0 ? "#ef4444"
    : "rgba(255,255,255,0.2)";
  const loansRingFill = filteredLoans.length > 0
    ? (cropStressScore != null ? cropStressScore / 8 * 0.5 : 0.2)
      + (portfolioRevenueScore != null ? portfolioRevenueScore / 10 * 0.5 : 0)
    : 0.15;
  const loansRingCirc = 2 * Math.PI * 11;

  const financialIndicators = {
    ...union.indicators?.financial,
    ...liveBase,
    ...((union._live || selectedFund) && {
      portfolioRevenue: {
        value: portfolioRevenueDisplay,
        score: portfolioRevenueScore,
        maxScore: 10,
      },
      cropStress: {
        value: cropStressDisplay,
        score: cropStressScore,
        maxScore: 8,
      },
    }),
  };

  // ── Governance — computed from hardcoded founding timestamp ─────────────────
  const governanceIndicators = computeGovernanceIndicators(union.id, union.indicators?.governance);

  // ── Health score ────────────────────────────────────────────────────────────
  // Union-wide aggregate score on "All"; fund-level financial + union-wide other pillars on specific fund.
  const displayHealthScore = computeHealthScore(union, financialIndicators, governanceIndicators);

  // ── Fund tab label for the Financials pillar ───────────────────────────────
  const financialsPillarTitle = selectedFund
    ? `Financials — ${getFundMeta(selectedFund.loanType).label}`
    : "Financials";

  return (
    <Section id="health" onReady={onReady}>
      <div ref={stepRef}>
        <StepLabel label="Step 2 — Fund health" />

        {/* Health score ring */}
        <div
          className="flex items-center gap-5 rounded-3xl p-5 mb-4"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <HealthRing score={displayHealthScore} locked={isLocked} size={72} />
          <div className="flex-1 min-w-0">
            <p className="text-xs" style={{ color: "var(--color-text-soft)" }}>
              {isLocked
                ? (wallet ? "Min. 50 USDT (or nIN holder) required to unlock" : "Connect wallet to unlock full report")
                : "Health score"}
            </p>
            {!isLocked && (
              <p className="text-2xl font-bold mt-1" style={{ color: displayHealthScore == null ? "#D4A017" : "var(--color-text-on-dark)" }}>
                {displayHealthScore ?? "—"}
                {displayHealthScore != null && (
                  <span className="text-sm font-normal ml-1" style={{ color: "var(--color-text-soft)" }}>/100</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* ── Fund tabs ──────────────────────────────────────────────────── */}
        <FundTabBar
          funds={funds}
          activeFundIdx={activeFundIdx}
          onSelect={setActiveFundIdx}
        />

        {/* Fund constraints — only when a specific fund is selected */}
        <FundConstraints fund={selectedFund} />

        {/* ── Pillar indicator breakdown ─────────────────────────────────── */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-soft)" }}>
            Health indicators
          </p>

          <PillarBreakdown
            title={financialsPillarTitle}
            indicators={financialIndicators ?? {}}
            locked={isLocked}
            defaultOpen={true}
          />
          <PillarBreakdown
            title="Geo / Climate Risk"
            indicators={union.indicators?.geoClimate ?? {}}
            locked={isLocked}
          />
          <PillarBreakdown
            title="Governance"
            indicators={governanceIndicators}
            locked={isLocked}
          />
          <PillarBreakdown
            title="Certifications"
            subtitle={certSubtitle}
            indicators={certIndicators}
            locked={isLocked}
          />
        </div>

        {/* Allocation bars */}
        {hasAlloc && (
          <div
            className="rounded-3xl p-5 mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-soft)" }}>
              Fund allocation
            </p>
            {union.allocation.map(({ label, pct }) => (
              <div key={label} className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--color-text-soft)" }}>{label}</span>
                  <span style={{ color: "var(--color-accent)" }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: "var(--color-accent)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active loans — collapsible */}
        <div
          className="rounded-2xl mb-5 overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Summary header / toggle */}
          <button
            className="w-full flex items-center gap-3 px-4 py-3 text-left"
            onClick={() => setLoansOpen((o) => !o)}
          >
            {/* Mini ring — green/amber/red based on stress + revenue */}
            <div className="relative flex-shrink-0" style={{ width: 28, height: 28 }}>
              <svg width={28} height={28} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={14} cy={14} r={11} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3.5} />
                <circle cx={14} cy={14} r={11} fill="none" stroke={loansRingColor} strokeWidth={3.5}
                  strokeLinecap="round" strokeDasharray={loansRingCirc}
                  strokeDashoffset={loansRingCirc * (1 - loansRingFill)}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span style={{ fontSize: 7, fontWeight: 700, color: loansRingColor, lineHeight: 1 }}>
                  {filteredLoans.length > 0 ? filteredLoans.length : "—"}
                </span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: "var(--color-text-soft)" }}>
                Active loans{selectedFund ? ` — ${getFundMeta(selectedFund.loanType).label}` : ""}
              </p>
              {filteredLoans.length > 0 && (
                <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-soft)" }}>
                  {isLocked ? "•••• — connect wallet to unlock"
                    : [
                        totalRevenueINR > 0 && `~₹${Math.round(totalRevenueINR).toLocaleString("en-IN", { maximumFractionDigits: 0 })} est. revenue`,
                        stressedCount > 0 && `${stressedCount} stressed`,
                        stressedCount === 0 && loansWithStressData.length > 0 && "no stress",
                      ].filter(Boolean).join("  ·  ")
                  }
                </p>
              )}
            </div>

            <ChevronDown
              className="flex-shrink-0 transition-transform"
              style={{ width: 14, height: 14, color: "rgba(255,255,255,0.3)", transform: loansOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {/* Expanded loan cards */}
          {loansOpen && (
            <div className="px-3 pb-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="pt-3">
                {filteredLoans.length > 0
                  ? filteredLoans.map((loan, i) => (
                      <LoanCard key={loan.id ?? i} loan={loan} isLocked={isLocked} wallet={wallet} />
                    ))
                  : <p className="text-xs py-2 px-1" style={{ color: "var(--color-text-soft)" }}>No active loans{selectedFund ? " for this fund" : ""} yet.</p>
                }
              </div>
            </div>
          )}
        </div>

        {/* CTAs */}
        {wallet && union.status === "active" && isInvested && (
          <button
            onClick={onInvest}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all"
            style={{ backgroundColor: "var(--color-accent)", color: "#0f172a" }}
          >
            <Plus className="h-4 w-4" /> Add more
          </button>
        )}
        {wallet && union.status === "active" && !isInvested && (
          <button
            onClick={onInvest}
            className="w-full rounded-2xl py-4 text-sm font-semibold transition-all"
            style={{ backgroundColor: "var(--color-accent)", color: "#0f172a" }}
          >
            Invest in this union →
          </button>
        )}
        {wallet && union.status !== "active" && (
          <p className="text-center text-sm py-2" style={{ color: "var(--color-text-soft)" }}>
            This union is not yet open for investment.
          </p>
        )}
        {!wallet && (
          <p className="text-center text-xs py-2" style={{ color: "var(--color-text-soft)" }}>
            Connect your wallet (top right) to invest.
          </p>
        )}
      </div>
    </Section>
  );
}
