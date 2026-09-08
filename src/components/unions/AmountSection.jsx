import { useState } from "react";
import { AlertCircle, Info } from "lucide-react";
import { Section, StepLabel } from "./shared.jsx";

const QUICK = [50, 100, 250, 500];

export function AmountSection({ union, wallet, onInvest, stepRef, onReady, useNin }) {
  const hasUsdc = (wallet.usdc ?? 0) >= 50;
  const hasUsdt = (wallet.usdt ?? 0) >= 50;
  const [sourceToken, setSourceToken] = useState(useNin ? "NIN" : hasUsdt ? "USDT" : "USDC");
  const [amount, setAmount] = useState("");
  const [spreadEvenly, setSpreadEvenly] = useState(true);
  const [manualPct, setManualPct] = useState(() =>
    union.allocation.length ? union.allocation.map((a) => ({ ...a })) : []
  );
  const [validationError, setValidationError] = useState(null);

  const sourceBalance = sourceToken === "NIN" ? (wallet.nin ?? 0)
    : sourceToken === "USDT" ? wallet.usdt : (wallet.usdc ?? 0);
  const parsed = parseFloat(amount);
  const maxAllowed = useNin
    ? sourceBalance
    : Math.min(sourceBalance, union.maxInvest ?? sourceBalance);
  const isValid = !isNaN(parsed) && parsed >= 50 && parsed <= maxAllowed;
  const manualSum = manualPct.reduce((s, a) => s + a.pct, 0);
  const manualValid = spreadEvenly || manualSum === 100;

  const handleInvest = () => {
    if (!isValid)     { setValidationError(`Amount must be between 50 and ${maxAllowed} ${sourceToken}.`); return; }
    if (!manualValid) { setValidationError("Allocation must sum to 100%."); return; }
    setValidationError(null);
    onInvest({ amount: parsed, sourceToken, allocation: spreadEvenly ? "spread" : manualPct });
  };

  return (
    <Section id="amount" onReady={onReady}>
      <div ref={stepRef}>
        <StepLabel label="Step 4 — Set amount" />
        <h2 className="mb-6 text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--color-text-on-dark)", letterSpacing: "-0.02em" }}>
          How much to invest?
        </h2>

        {/* Amount input */}
        <div className="rounded-3xl p-5 mb-4"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

          {/* Token toggle — hidden when using NIN from wallet */}
          {!useNin && hasUsdc && hasUsdt && (
            <div className="flex gap-2 mb-4">
              {["USDT", "USDC"].map((t) => (
                <button key={t} onClick={() => { setSourceToken(t); setAmount(""); setValidationError(null); }}
                  className="flex-1 rounded-xl py-2 text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: sourceToken === t ? "var(--color-accent)" : "rgba(255,255,255,0.06)",
                    color: sourceToken === t ? "#0f172a" : "var(--color-text-soft)",
                    border: sourceToken === t ? "none" : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {t} ({t === "USDT" ? wallet.usdt : wallet.usdc})
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mb-3">
            <span className="text-lg font-bold" style={{ color: "var(--color-text-soft)" }}>{sourceToken}</span>
            <input
              type="number" min={50} max={maxAllowed}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setValidationError(null); }}
              placeholder="0"
              className="flex-1 bg-transparent text-2xl sm:text-3xl font-bold outline-none"
              style={{ color: "var(--color-text-on-dark)", caretColor: "var(--color-accent)" }}
            />
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--color-text-soft)" }}>
            Min 50 {sourceToken} · Available: {sourceBalance} {sourceToken}
            {sourceToken === "USDC" && <span style={{ color: "rgba(212,160,23,0.7)" }}> — auto-swaps to USDT</span>}
            {sourceToken === "NIN" && <span style={{ color: "rgba(212,160,23,0.7)" }}> — deposited directly</span>}
          </p>
          {!useNin && union.maxInvest != null && (
            <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-3"
              style={{ backgroundColor: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.3)" }}>
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: "#D4A017" }} />
              <p className="text-xs leading-snug" style={{ color: "rgba(212,160,23,0.9)" }}>
                Direct union investments are capped at <strong>{union.maxInvest} USDT</strong> per investor. To invest more, consider the Nila Index.
              </p>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {[...QUICK, "MAX"].map((v) => {
              const val = v === "MAX" ? String(maxAllowed) : String(v);
              return (
                <button key={v} onClick={() => { setAmount(val); setValidationError(null); }}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: amount === val ? "var(--color-accent)" : "rgba(255,255,255,0.07)",
                    color: amount === val ? "#0f172a" : "var(--color-text-soft)",
                    border: amount === val ? "none" : "1px solid rgba(255,255,255,0.09)",
                  }}
                >{v}</button>
              );
            })}
          </div>
        </div>

        {/* Fund allocation — only if union has allocation data */}
        {union.allocation.length > 0 && (
          <div className="rounded-3xl p-5 mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-on-dark)" }}>Spread evenly</p>
              <button
                onClick={() => setSpreadEvenly(!spreadEvenly)}
                className="relative w-10 h-6 rounded-full transition-all flex-shrink-0"
                style={{ backgroundColor: spreadEvenly ? "var(--color-accent)" : "rgba(255,255,255,0.12)" }}
              >
                <div className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all"
                  style={{ left: spreadEvenly ? "calc(100% - 20px)" : "4px" }} />
              </button>
            </div>
            {!spreadEvenly && manualPct.map((alloc, i) => (
              <div key={alloc.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "var(--color-text-soft)" }}>{alloc.label}</span>
                  <span style={{ color: manualSum === 100 ? "var(--color-accent)" : "#ef4444" }}>
                    {alloc.pct}%{isValid ? ` (${((parsed * alloc.pct) / 100).toFixed(0)} USDT)` : ""}
                  </span>
                </div>
                <input type="range" min={0} max={100} value={alloc.pct}
                  onChange={(e) => {
                    const next = [...manualPct];
                    next[i] = { ...next[i], pct: Number(e.target.value) };
                    setManualPct(next);
                  }}
                  className="w-full accent-yellow-500"
                />
              </div>
            ))}
            {!spreadEvenly && (
              <div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(manualSum, 100)}%`, backgroundColor: manualSum === 100 ? "var(--color-accent)" : "#ef4444" }} />
                </div>
                <p className="text-xs mt-1 text-right" style={{ color: manualSum === 100 ? "var(--color-accent)" : "#ef4444" }}>
                  {manualSum}% / 100%
                </p>
              </div>
            )}
          </div>
        )}

        {validationError && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#ef4444" }} />
            <p className="text-sm" style={{ color: "#fca5a5" }}>{validationError}</p>
          </div>
        )}

        <button onClick={handleInvest} disabled={!isValid || !manualValid}
          className="w-full rounded-2xl py-4 text-sm font-semibold transition-all"
          style={
            isValid && manualValid
              ? { backgroundColor: "var(--color-accent)", color: "#0f172a", cursor: "pointer" }
              : { backgroundColor: "rgba(255,255,255,0.05)", color: "var(--color-text-soft)", cursor: "not-allowed", border: "1px solid rgba(255,255,255,0.07)" }
          }
        >
          Invest {isValid ? `${parsed} ${sourceToken}` : ""} →
        </button>
      </div>
    </Section>
  );
}
