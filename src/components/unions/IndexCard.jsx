import { useState } from "react";
import { TrendingUp, Info, ExternalLink } from "lucide-react";
import { STATUS_COLORS } from "./data.js";
import { HealthRing } from "./shared.jsx";

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
          <span
            className="absolute"
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

// Compute investor APY for a single union (mirrors UnionCard logic)
function unionInvestorApy(union, rateByFund) {
  const fund0 = union.funds?.[0];
  const fk = fund0?.loanType?.toLowerCase() || fund0?.fundId?.toLowerCase();
  const currentRate = (fk && rateByFund?.[fk]) ?? null;
  const treasuryPct = union.treasuryFeeBP != null ? union.treasuryFeeBP / 100 : null;
  const rainyDayPct = union.rainyFeeBP    != null ? union.rainyFeeBP    / 100 : null;
  const feePct = union.fee ? parseFloat(union.fee) : null;
  const TDS = 1;
  if (currentRate == null || treasuryPct == null || rainyDayPct == null) return null;
  return currentRate - treasuryPct - rainyDayPct - feePct - TDS;
}

const INDEX_MGMT_FEE = 1.25; // opportunity management overhead (%)

export function IndexCard({ index, isActive, wallet, unions = [], rateByFund, onSelect, onOpenModal }) {
  const s = STATUS_COLORS[index.status];

  // Mean investor APY across active unions that have live rate data
  const activeApys = unions
    .filter((u) => u.status === "active")
    .map((u) => unionInvestorApy(u, rateByFund))
    .filter((v) => v != null);

  const meanDirectApy = activeApys.length > 0
    ? activeApys.reduce((a, b) => a + b, 0) / activeApys.length
    : null;

  const targetApy = meanDirectApy != null ? meanDirectApy - INDEX_MGMT_FEE : null;

  return (
    <div
      onClick={() => !isActive && onSelect(index)}
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
          src={index.image ?? "/index-nila-agri-1.png"}
          alt={index.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div style={{ height: "4px", background: "linear-gradient(90deg, var(--color-accent), transparent)" }} />

      <div className="flex flex-col flex-1 p-6">
        {/* Status + Health ring */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
            {index.status}
          </span>
          <HealthRing score={index.healthScore} locked={!wallet || (wallet.usdt < 50 && !wallet.ninUser)} size={52} />
        </div>

        {/* Name with "What is an Index?" tooltip */}
        <h3 className="mb-1 font-bold leading-tight"
          style={{ color: "var(--color-text-on-dark)", fontSize: isActive ? "1.25rem" : "1rem" }}>
          {index.name}
          <Tip text={index.explainer} />
        </h3>
        <p className="mb-5 text-xs" style={{ color: "var(--color-text-soft)" }}>{index.location}</p>

        {/* Active card: full content */}
        {isActive && (
          <>
            {/* Description */}
            <p className="mb-4 text-xs leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
              {index.description}
            </p>

            {/* Target APY tile */}
            <div className="flex items-center gap-3 rounded-xl p-3.5 mb-3"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <TrendingUp className="h-4 w-4 flex-shrink-0" style={{ color: "var(--color-accent)" }} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5"
                  style={{ color: "var(--color-text-soft)" }}>
                  Target APY
                  <Tip text="Mean net investor APY across active unions, minus the 3% opportunity-management fee charged by Nila advisors. Indicative only — live rates vary." />
                </p>
                <p className="text-2xl font-bold leading-none" style={{ color: "var(--color-accent)" }}>
                  {targetApy != null ? `${targetApy.toFixed(1)}%` : "—"}
                </p>
              </div>
              {meanDirectApy != null && (
                <div className="text-right flex-shrink-0">
                  <p className="text-[9px]" style={{ color: "var(--color-text-soft)" }}>direct avg</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-soft)" }}>
                    {meanDirectApy.toFixed(1)}%
                  </p>
                  <p className="text-[9px]" style={{ color: "var(--color-text-soft)" }}>
                    − {INDEX_MGMT_FEE}% mgmt
                  </p>
                </div>
              )}
            </div>

            {/* Liquidity & lock terms */}
            <div className="rounded-xl p-3.5 mb-3"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-1"
                style={{ color: "var(--color-text-soft)" }}>
                Liquidity
              </p>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-text-on-dark)" }}>
                1-year lock · 30-day notice
              </p>
              <p className="text-[10px] leading-snug" style={{ color: "var(--color-text-soft)" }}>
                Capital is locked for one year. Submit a withdrawal notice 30 days before your annual unlock window.
              </p>
            </div>

            {/* Allocation slider */}
            {index.targetAum > 0 && (
              (() => {
                const target = index.targetAum;
                const alloc = index.allocation ?? [];
                const totalDep = index.totalDeposited ?? alloc.reduce((s, a) => s + a.deposited, 0);
                const unallocated = Math.max(0, totalDep - alloc.reduce((s, a) => s + a.deposited, 0));
                const fmt = (v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`;
                const filledPct = Math.min(100, (totalDep / target) * 100);

                // Assign a distinct muted colour per union segment
                const SEGMENT_COLORS = ["#52B788", "#4E9AC7", "#B97C52", "#9B7EC8", "#C7A44E"];

                return (
                  <div className="rounded-xl p-3 mb-3"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-soft)" }}>
                        Allocation
                        <Tip text="How deposited capital has been deployed across union senior tranches. The bar fills towards the index target AUM." />
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: filledPct >= 100 ? "#ef4444" : "var(--color-accent)" }}>
                        {fmt(totalDep)} / {fmt(target)}
                      </span>
                    </div>

                    {/* Stacked bar */}
                    <div className="h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                      {alloc.map((a, i) => {
                        const pct = Math.min(100, (a.deposited / target) * 100);
                        return (
                          <div key={a.unionId}
                            style={{ width: `${pct}%`, backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length], transition: "width 0.6s ease" }} />
                        );
                      })}
                      {unallocated > 0 && (
                        <div style={{ width: `${Math.min(100, (unallocated / target) * 100)}%`, backgroundColor: "rgba(248,250,252,0.15)", transition: "width 0.6s ease" }} />
                      )}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                      {alloc.map((a, i) => (
                        <span key={a.unionId} className="flex items-center gap-1 text-[9px]" style={{ color: "var(--color-text-soft)" }}>
                          <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                          {a.name} {fmt(a.deposited)}
                        </span>
                      ))}
                      <span className="flex items-center gap-1 text-[9px] ml-auto" style={{ color: "var(--color-text-soft)" }}>
                        target {fmt(target)}
                      </span>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Focus areas */}
            {index.focusAreas?.length > 0 && (
              <div className="flex flex-col gap-2 mb-5">
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5"
                  style={{ color: "var(--color-text-soft)" }}>
                  Focus areas
                </p>
                {index.focusAreas.map((area) => (
                  <a
                    key={area.label}
                    href={area.url}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-start justify-between gap-3 rounded-xl p-3 group transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      textDecoration: "none",
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-text-on-dark)" }}>
                        {area.label}
                      </p>
                      <p className="text-[10px] leading-snug" style={{ color: "var(--color-text-soft)" }}>
                        {area.detail}
                      </p>
                    </div>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: "var(--color-text-soft)" }} />
                  </a>
                ))}
              </div>
            )}

            {/* Accredited investor CTA */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenModal?.(); }}
              className="w-full rounded-2xl py-3.5 mt-auto text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--color-accent)", color: "#0f172a", cursor: "pointer" }}
            >
              Request access — accredited investors only
            </button>
          </>
        )}

        {/* Collapsed card: description teaser */}
        {!isActive && (
          <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--color-text-soft)" }}>
            {index.description}
          </p>
        )}
      </div>
    </div>
  );
}
