import { useState, useRef, useEffect, useMemo } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { Section, StepLabel, computeHealthScore, computeLiveFinancialIndicators } from "./shared.jsx";
import { computeGovernanceIndicators } from "./data.js";

export function TermsSection({ union, wallet, historyByFund, onConfirm, stepRef, onReady }) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [useNin, setUseNin] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const check = () => {
      if (el.scrollHeight - el.scrollTop <= el.clientHeight + 8) setScrolledToBottom(true);
    };
    el.addEventListener("scroll", check);
    check();
    return () => el.removeEventListener("scroll", check);
  }, []);

  // Mean historical rate across all funds
  const meanRate = useMemo(() => {
    if (!historyByFund) return null;
    const allRates = Object.values(historyByFund).flatMap((arr) => arr.map((h) => h.ratePct));
    if (allRates.length === 0) return null;
    return allRates.reduce((s, r) => s + r, 0) / allRates.length;
  }, [historyByFund]);

  // Health score (same computation as HealthRing in UnionCard)
  const healthScore = useMemo(() => {
    const liveFinancial = computeLiveFinancialIndicators(union);
    const liveGovernance = computeGovernanceIndicators(union.id, union.indicators?.governance);
    return computeHealthScore(union, liveFinancial, liveGovernance);
  }, [union]);

  // Management fee = treasury + rainy day (basis points → %)
  const treasuryPct = union.treasuryFeeBP != null ? union.treasuryFeeBP / 100 : null;
  const rainyDayPct = union.rainyFeeBP != null ? union.rainyFeeBP / 100 : null;
  const mgmtFee = treasuryPct != null && rainyDayPct != null
    ? `${(treasuryPct + rainyDayPct).toFixed(2)}% (${+treasuryPct.toFixed(2)} + ${+rainyDayPct.toFixed(2)})`
    : treasuryPct != null ? `${treasuryPct.toFixed(2)}%`
    : "—";

  // Balance line: USDT + USDC
  const balanceParts = [];
  if (wallet.usdt != null) balanceParts.push(`${wallet.usdt} USDT`);
  if (wallet.usdc != null && wallet.usdc > 0) balanceParts.push(`${wallet.usdc} USDC`);
  const balanceDisplay = balanceParts.length > 0 ? balanceParts.join(" + ") : "0 USDT";
  const totalUsd = (wallet.usdt ?? 0) + (wallet.usdc ?? 0);
  const ninBalance = wallet.nin ?? 0;
  const lowBalance = useNin ? ninBalance < 50 : totalUsd < 50;

  const riskWarning = healthScore != null && healthScore < 50;

  const terms = [
    { label: "Union",                  value: union.name },
    { label: "Minimum investment",     value: "50 USDT", warn: true, warnColor: "#ef4444", note: "Maximum investment is currently capped at 50 USDT during early access." },
    { label: "Lock period",            value: "2 weeks + rolling available liquidity" },
    { label: "Expected annual yield (indicative)",  value: meanRate != null ? `${meanRate.toFixed(2)}%` : "—" },
    { label: "Risk rating",            value: healthScore != null ? `${healthScore}/100` : "—", warn: riskWarning, warnColor: "var(--color-accent)" },
    { label: "Management fee",         value: mgmtFee },
    useNin
      ? { label: "NIN balance",        value: `${ninBalance} NIN`, warn: ninBalance < 50, warnColor: "var(--color-accent)" }
      : { label: "Your balance",       value: balanceDisplay, warn: lowBalance, warnColor: "var(--color-accent)" },
  ];

  return (
    <Section id="terms" onReady={onReady}>
      <div ref={stepRef}>
        <StepLabel label="Step 3 — Investment terms" />
        <h2 className="mb-3 text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--color-text-on-dark)", letterSpacing: "-0.02em" }}>
          Review terms
        </h2>
        <p className="mb-5 text-sm" style={{ color: "var(--color-text-soft)" }}>
          Scroll to read all terms before confirming.
        </p>

        <div
          ref={contentRef}
          className="rounded-3xl overflow-y-auto mb-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            maxHeight: "min(320px, 40vh)",
          }}
        >
          {terms.map(({ label, value, warn, warnColor, note }) => {
            const color = warn ? (warnColor ?? "#ef4444") : "var(--color-text-on-dark)";
            return (
              <div key={label} className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="text-sm" style={{ color: "var(--color-text-soft)" }}>{label}</span>
                  <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
                    {warn && <AlertTriangle className="h-3.5 w-3.5" style={{ color }} />}
                    {value}
                  </span>
                </div>
                {note && (
                  <p className="px-5 pb-3 -mt-1 text-[11px] leading-snug" style={{ color: warnColor ?? "#ef4444" }}>
                    {note}
                  </p>
                )}
              </div>
            );
          })}
          {lowBalance && (
            <div className="mx-5 mt-3 mb-1 rounded-xl px-4 py-3 flex items-start gap-2.5"
              style={{ backgroundColor: "rgba(212,166,23,0.08)", border: "1px solid rgba(212,166,23,0.25)" }}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-accent)" }}>
                Minimum deposit is 50 USDT. Top up your wallet with USDT or USDC to continue.
              </p>
            </div>
          )}
          <p className="px-5 py-4 text-xs leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
            Returns are indicative and not guaranteed. Agricultural lending carries crop failure and counterparty risk.
            FX risk between USD and INR is hedged, however this is not a production-ready solution.
            This is not financial advice. Ensure you understand the risks before investing.
          </p>
        </div>

        {/* Use NIN checkbox — only shown when wallet holds NIN */}
        {ninBalance > 0 && (
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4 cursor-pointer select-none"
            style={{
              backgroundColor: useNin ? "rgba(212,166,23,0.08)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${useNin ? "rgba(212,166,23,0.4)" : "rgba(255,255,255,0.08)"}`,
            }}
            onClick={() => setUseNin((v) => !v)}
          >
            <div
              className="h-4 w-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
              style={{
                backgroundColor: useNin ? "var(--color-accent)" : "transparent",
                border: useNin ? "none" : "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {useNin && <Check className="h-3 w-3" style={{ color: "#0f172a" }} />}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-on-dark)" }}>
                Use NIN from my wallet
              </p>
              <p className="text-xs" style={{ color: "var(--color-text-soft)" }}>
                {ninBalance} NIN available — skip USDT conversion
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => onConfirm({ useNin })}
          disabled={!scrolledToBottom || lowBalance}
          className="w-full rounded-2xl py-4 text-sm font-semibold transition-all"
          style={
            scrolledToBottom && !lowBalance
              ? { backgroundColor: "var(--color-accent)", color: "#0f172a", cursor: "pointer" }
              : { backgroundColor: "rgba(255,255,255,0.05)", color: "var(--color-text-soft)", cursor: "not-allowed", border: "1px solid rgba(255,255,255,0.07)" }
          }
        >
          {lowBalance ? "Insufficient balance" : scrolledToBottom ? "Set amount →" : "Scroll to read all terms"}
        </button>
      </div>
    </Section>
  );
}
