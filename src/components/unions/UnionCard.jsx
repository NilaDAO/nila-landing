import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Users, TrendingUp, BarChart2, Info, RotateCcw } from "lucide-react";
import { STATUS_COLORS, computeGovernanceIndicators, getFundMeta } from "./data.js";
import { HealthRing, computeHealthScore, computeLiveFinancialIndicators } from "./shared.jsx";

// ─── Inline tooltip — no library needed ──────────────────────────────────────
function Tip({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center" style={{ verticalAlign: "middle" }}>
      <Info
        className="h-3 w-3 ml-0.5 cursor-pointer flex-shrink-0"
        style={{ color: "var(--color-text-soft)" }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onTouchStart={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
      />
      {open && (
        <span
          className="absolute lowercase z-50 rounded-xl px-3 py-2 text-[11px] leading-snug shadow-xl"
          style={{
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: "200px",
            backgroundColor: "#1e293b",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "var(--color-text-soft)",
            pointerEvents: "none",
          }}
        >
          {text}
          {/* Arrow */}
          <span
            className="absolute "
            style={{
              top: "100%", left: "50%", transform: "translateX(-50%)",
              borderWidth: "5px 5px 0",
              borderStyle: "solid",
              borderColor: "#1e293b transparent transparent",
            }}
          />
        </span>
      )}
    </span>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data }) {
  if (!data || data.length < 2) return (
    <div className="flex items-center justify-center h-full w-full">
      <p className="text-[10px]" style={{ color: "var(--color-text-soft)" }}>no history</p>
    </div>
  );

  const W = 200, H = 72;
  const rates = data.map((d) => d.ratePct);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const range = max - min || 1;
  const pad = 4;

  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = pad + (1 - (d.ratePct - min) / range) * (H - pad * 2);
    return [x, y];
  });

  const polyline = pts.map((p) => p.join(",")).join(" ");
  const area = [
    `M${pts[0][0]},${H}`,
    ...pts.map(([x, y]) => `L${x},${y}`),
    `L${pts[pts.length - 1][0]},${H}`,
    "Z",
  ].join(" ");

  const latest = data[data.length - 1];
  const first  = data[0];
  const delta  = latest.ratePct - first.ratePct;
  const lineColor = delta >= 0 ? "#52B788" : "#ef4444";

  const fmtDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch { return iso; }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1 px-0.5">
        <p className="text-[9px]" style={{ color: "var(--color-text-soft)" }}>
          {fmtDate(first.date)} – {fmtDate(latest.date)}
        </p>
        <p className="text-[9px] font-mono" style={{ color: lineColor }}>
          {delta >= 0 ? "+" : ""}{delta.toFixed(1)}%
        </p>
      </div>

      {/* SVG chart — wrap in a flex:1 div so the svg gets a concrete height
          instead of falling back to its intrinsic ~150px and overflowing */}
      <div style={{ flex: 1, minHeight: 0, width: "100%" }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block", overflow: "hidden" }}>
          <defs>
            <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#spark-fill)" />
          <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
          {/* Last point dot */}
          <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]}
            r="2.5" fill={lineColor} />
        </svg>
      </div>

      {/* Y-axis labels */}
      <div className="flex items-center justify-between px-0.5 mt-0.5">
        <span className="text-[9px] font-mono" style={{ color: "var(--color-text-soft)" }}>
          {min.toFixed(1)}%
        </span>
        <span className="text-[9px] font-mono" style={{ color: "var(--color-text-soft)" }}>
          {max.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ─── APY flip card ────────────────────────────────────────────────────────────
// history === null  → still loading
// history === []    → loaded, no data
// history.length≥2  → ready to chart
function ApyFlipCard({ investorApy, deductions, history }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={(e) => { e.stopPropagation(); setFlipped((v) => !v); }}
      style={{ position: "relative", perspective: "600px", cursor: "pointer" }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d", position: "relative" }}
      >
        {/* ── Front: current APY breakdown ── */}
        <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
          <div className="flex gap-2.5 rounded-xl p-3"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex flex-col justify-between min-w-0">
              <TrendingUp className="h-3.5 w-3.5" style={{ color: "var(--color-accent)" }} />
              <div>
                <p className="text-xl font-bold leading-none" style={{ color: "var(--color-accent)" }}>
                  {investorApy != null ? `${investorApy.toFixed(2)}%` : "—"}
                </p>
                <p className="text-[9px] mt-0.5" style={{ color: "var(--color-text-soft)" }}>
                  investor APY
                  <Tip text="Estimated net annual yield after all deductions: lending rate − treasury − rainy-day reserve − management fee − TDS tax. Indicative only." />
                </p>
              </div>
            </div>
            <div className="w-px self-stretch" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div className="flex flex-col justify-between gap-0.5 flex-1 min-w-0">
              {deductions.map(({ label, value, sign }) => (
                <div key={label} className="flex items-center justify-between gap-1">
                  <span className="text-[9px] truncate" style={{ color: "var(--color-text-soft)" }}>
                    {sign} {label}
                  </span>
                  <span className="text-[9px] font-mono tabular-nums"
                    style={{ color: sign ? "var(--color-text-soft)" : "var(--color-text-on-dark)" }}>
                    {value != null ? `${Number(value).toFixed(2)}%` : "—"}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-end gap-1 mt-1">
                <BarChart2 className="h-2.5 w-2.5" style={{ color: "var(--color-accent)" }} />
                <span className="text-[9px] font-semibold" style={{ color: "var(--color-accent)" }}>
                  rate history
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Back: sparkline history ── */}
        <div style={{
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          position: "absolute",
          inset: 0,
        }}>
          <div className="flex flex-col rounded-xl p-3 h-full"
            style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] uppercase tracking-widest font-semibold"
                style={{ color: "var(--color-text-soft)" }}>
                Rate history
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[9px]" style={{ color: "var(--color-text-soft)" }}>back</span>
                <RotateCcw className="h-2.5 w-2.5" style={{ color: "var(--color-text-soft)" }} />
              </div>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              {history === null ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[10px]" style={{ color: "var(--color-text-soft)" }}>loading…</p>
                </div>
              ) : (
                <Sparkline data={history} />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function UnionCard({ union, isActive, wallet, investments, rateByFund, historyByFund, onSelect, onScrollToHealth }) {
  const s = STATUS_COLORS[union.status];

  return (
    <div
      onClick={() => !isActive && onSelect(union)}
      className="flex-shrink-0 flex flex-col rounded-3xl overflow-hidden"
      style={{
        width: isActive ? "min(640px, calc(100vw - 32px))" : "min(280px, calc(100vw - 64px))",
        opacity: isActive ? 1 : 0.4,
        transform: isActive ? "scale(1)" : "scale(0.97)",
        transition: "opacity 0.35s ease, transform 0.35s ease, width 0.35s ease",
        backgroundColor: "var(--color-primary)",
        border: isActive ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isActive ? "0 16px 48px rgba(0,0,0,0.4)" : "none",
        cursor: isActive ? "default" : "pointer",
      }}
    >
      {/* Hero image */}
      <div style={{
        height: isActive ? "180px" : "110px",
        transition: "height 0.35s ease",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        <img
          src={union.image ?? "/MthTheresa_banner.jpg"}
          alt={union.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--color-accent), transparent)" }} />

      <div className="flex flex-col flex-1 p-6">
        {/* Status + Health ring */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
            {union.status}
          </span>
          <HealthRing score={computeHealthScore(union, { ...union.indicators?.financial, ...computeLiveFinancialIndicators(union) }, computeGovernanceIndicators(union.id, union.indicators?.governance))} locked={!wallet || (wallet.usdt < 50 && !wallet.ninUser)} size={64} showCategory />
        </div>

        <h3 className="mb-1 font-bold leading-tight"
          style={{ color: "var(--color-text-on-dark)", fontSize: isActive ? "1.25rem" : "1rem" }}>
          {union.name}
        </h3>
        <p className="mb-5 text-xs" style={{ color: "var(--color-text-soft)" }}>{union.location}</p>

        {/* Active card: full content */}
        {isActive && (
          <>
            {/* Description */}
            <p className="mb-4 text-xs leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
              {union.description}
            </p>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {/* Left column */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-xl p-2.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Users className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--color-accent)" }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--color-text-on-dark)" }}>
                      {union.members.toLocaleString()}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--color-text-soft)" }}>Members<Tip text="Number of farmers in this union. Each member is eligible to apply for a micro-loan from the fund." /></p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl p-2.5"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <BarChart2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--color-accent)" }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--color-text-on-dark)" }}>
                      {union.totalAum != null ? `$${Number(union.totalAum).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--color-text-soft)" }}>Total AUM<Tip text="Assets Under Management — total USDT deposited across junior and senior tranches of this union's fund." /></p>
                  </div>
                </div>
              </div>

              {/* Right column — investor APY flip card */}
              {(() => {
                const fund0 = union.funds?.[0];
                const fk = fund0?.loanType?.toLowerCase() || fund0?.fundId?.toLowerCase();
                const currentRate = (fk && rateByFund?.[fk]) ?? null;
                const treasuryPct = union.treasuryFeeBP != null ? union.treasuryFeeBP / 100 : null;
                const rainyDayPct = union.rainyFeeBP    != null ? union.rainyFeeBP    / 100 : null;
                const feePct = union.fee ? parseFloat(union.fee) : null;
                const TDS = 1;

                const hasAll = currentRate != null && treasuryPct != null && rainyDayPct != null;
                const investorApy = hasAll
                  ? currentRate - treasuryPct - rainyDayPct - TDS
                  : null;

                const deductions = [
                  { label: "current rate", value: currentRate, sign: "" },
                  { label: "treasury",     value: treasuryPct, sign: "−" },
                  { label: "rainy day",    value: rainyDayPct, sign: "−" },
                  { label: "mgmt fee",     value: feePct,      sign: "−" },
                  { label: "TDS tax",      value: TDS,         sign: "−" },
                ];

                const history = fk ? (historyByFund?.[fk] ?? null) : null;  // null=loading, []=no data

                return (
                  <ApyFlipCard
                    investorApy={investorApy}
                    deductions={deductions}
                    history={history}
                  />
                );
              })()}
            </div>

            {/* Senior capacity — per-fund bars */}
            {(() => {
              const allFunds = union.funds ?? [];
              if (allFunds.length === 0 || !union._live) return null;

              // Only render funds that have enough data for a capacity bar
              const renderableFunds = allFunds.filter((f) => {
                const threshold = f.bucketThreshold;
                const juniorDep = f.junior?.totalDeposits ?? 0;
                return threshold && threshold > 0 && juniorDep > 0;
              });

              if (renderableFunds.length === 0) return null;

              const cfg = union.reserveConfig;
              const fmt = (v) => v >= 1000
                ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`
                : `$${v.toFixed(0)}`;

              const isMulti = renderableFunds.length > 1;

              return (
                <div className="rounded-xl p-3 mb-3"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-soft)" }}>
                      Senior capacity<Tip text="How much more investor (senior) capital each fund can absorb. Capped by the junior-to-senior ratio: senior cannot exceed junior ÷ threshold. The amber segment is a liquidity reserve locked against withdrawals." />
                    </span>
                  </div>

                  <div className={`flex flex-col ${isMulti ? "gap-2.5" : "gap-0"}`}>
                    {renderableFunds.map((fund) => {
                      const juniorDep  = fund.junior?.totalDeposits ?? 0;
                      const seniorDep  = fund.senior?.totalDeposits ?? 0;
                      const threshold  = fund.bucketThreshold;
                      const maxSenior  = juniorDep / threshold;
                      const reserveRequired = cfg?.exists
                        ? Math.max(cfg.safetyFloor ?? 0, seniorDep * (cfg.safetyBP ?? 0) / 10000)
                        : 0;
                      const rawRoom       = Math.max(0, maxSenior - seniorDep);
                      const effectiveRoom = Math.max(0, rawRoom - reserveRequired);
                      const filledPct     = Math.min(100, (seniorDep / maxSenior) * 100);
                      const reservePct    = Math.min(100 - filledPct, (reserveRequired / maxSenior) * 100);
                      const roomPct       = Math.max(0, 100 - filledPct - reservePct);
                      const meta          = getFundMeta(fund.loanType);
                      return (
                        <div key={fund.loanType ?? fund.fundId}>
                          {/* Fund label + room (only show label row for multi-fund) */}
                          {isMulti && (
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-semibold" style={{ color: "var(--color-text-soft)" }}>
                                {meta.label}
                              </span>
                              <span className="text-[9px] font-mono" style={{ color: effectiveRoom > 0 ? "var(--color-accent)" : "#ef4444" }}>
                                {fmt(effectiveRoom)} room
                              </span>
                            </div>
                          )}
                          {!isMulti && (
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-semibold" style={{ color: "var(--color-text-soft)" }}>
                                {meta.label}
                              </span>
                              <span className="text-[10px] font-mono" style={{ color: effectiveRoom > 0 ? "var(--color-accent)" : "#ef4444" }}>
                                {fmt(effectiveRoom)} room ({roomPct.toFixed(0)}%)
                              </span>
                            </div>
                          )}

                          {/* Bar */}
                          <div className={`${isMulti ? "h-1.5" : "h-2"} rounded-full overflow-hidden flex`} style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                            <div style={{ width: `${filledPct}%`, backgroundColor: "#52B788", transition: "width 0.6s ease" }} />
                            {reservePct > 0.5 && (
                              <div style={{ width: `${reservePct}%`, backgroundColor: "rgba(212,166,23,0.55)", transition: "width 0.6s ease" }} />
                            )}
                          </div>

                          {/* Legend — only for single fund or last fund in multi */}
                          {!isMulti && (
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="flex items-center gap-1 text-[9px]" style={{ color: "var(--color-text-soft)" }}>
                                <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: "#52B788" }} />
                                deposited {fmt(seniorDep)}
                              </span>
                              {reserveRequired > 0 && (
                                <span className="flex items-center gap-1 text-[9px]" style={{ color: "var(--color-text-soft)" }}>
                                  <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: "rgba(212,166,23,0.55)" }} />
                                  reserve {fmt(reserveRequired)}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[9px] ml-auto" style={{ color: "var(--color-text-soft)" }}>
                                max {fmt(maxSenior)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Shared legend for multi-fund view */}
                  {isMulti && (
                    <div className="flex items-center gap-3 mt-2 pt-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="flex items-center gap-1 text-[9px]" style={{ color: "var(--color-text-soft)" }}>
                        <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: "#52B788" }} />
                        deposited
                      </span>
                      <span className="flex items-center gap-1 text-[9px]" style={{ color: "var(--color-text-soft)" }}>
                        <span className="inline-block w-2 h-2 rounded-sm" style={{ backgroundColor: "rgba(212,166,23,0.55)" }} />
                        reserve
                      </span>
                      <span className="flex items-center gap-1 text-[9px] ml-auto" style={{ color: "var(--color-text-soft)" }}>
                        empty = room
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Crops */}
            <div className="mb-5 flex flex-wrap gap-1.5">
              {union.crops.map((crop) => (
                <span key={crop} className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--color-text-soft)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {crop}
                </span>
              ))}
            </div>

            {/* Liquidity */}
            <div className="rounded-xl p-3.5 mb-4"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-1"
                style={{ color: "var(--color-text-soft)" }}>
                Liquidity
              </p>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-text-on-dark)" }}>
                Rolling 14-day withdrawal window
              </p>
              <p className="text-[10px] leading-snug" style={{ color: "var(--color-text-soft)" }}>
                Withdraw any time the fund has available liquidity. Requests are processed on a rolling 14-day cycle.
              </p>
            </div>

            {/* SDGs */}
            <div className="mb-6 flex items-end gap-1.5" style={{ height: "56px" }}>
              {union.sdgs.map((n) => (
                <img key={n} src={`/sdg/sdg-${String(n).padStart(2, "0")}.jpg`} alt={`SDG ${n}`}
                  style={{ width: "28px", height: "28px", borderRadius: "5px", objectFit: "cover",
                    filter: "grayscale(60%) brightness(0.8)", opacity: 0.7,
                    transition: "filter 0.25s ease, opacity 0.25s ease, width 0.25s ease, height 0.25s ease",
                    cursor: "default" }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = "grayscale(0%) brightness(1)"; e.currentTarget.style.opacity = "1"; e.currentTarget.style.width = "56px"; e.currentTarget.style.height = "56px"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "grayscale(60%) brightness(0.8)"; e.currentTarget.style.opacity = "0.7"; e.currentTarget.style.width = "28px"; e.currentTarget.style.height = "28px"; }}
                />
              ))}
            </div>

            {/* Scroll-down CTA */}
            <button
              onClick={() => onScrollToHealth(union)}
              className="flex self-center justify-center mt-auto py-2 transition-opacity hover:opacity-70"
              style={{ background: "none", border: "none" }}
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowDown className="h-6 w-6" style={{ color: "var(--color-text-on-dark)" }} />
              </motion.div>
            </button>
          </>
        )}

        {/* Collapsed card: description teaser */}
        {!isActive && (
          <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--color-text-soft)" }}>
            {union.description}
          </p>
        )}
      </div>
    </div>
  );
}
