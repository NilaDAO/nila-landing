import { useRef, useImperativeHandle, forwardRef, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Wallet, TrendingUp, BarChart2, DollarSign, Plus, ArrowDownToLine, Clock } from "lucide-react";
import { UnionCard } from "./UnionCard.jsx";
import { IndexCard } from "./IndexCard.jsx";
import { useUnbondPreview } from "../../hooks/useUnions.js";
import { LIVE_ADDRESS_BY_ID } from "./data.js";

function useCountdown(targetTs) {
  const [remaining, setRemaining] = useState(() => Math.max(0, (targetTs ?? 0) - Math.floor(Date.now() / 1000)));
  useEffect(() => {
    if (!targetTs) return;
    const tick = () => setRemaining(Math.max(0, targetTs - Math.floor(Date.now() / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTs]);
  return {
    remaining,
    days:    Math.floor(remaining / 86400),
    hours:   Math.floor((remaining % 86400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
  };
}

const RAY = 10n ** 27n;
function sharesToUsdt(shares, fxRateFloat, seniorIndex) {
  if (!fxRateFloat || !seniorIndex || seniorIndex === 0n || !shares) return 0;
  return Number(shares * seniorIndex / RAY) / 1e18 / fxRateFloat;
}

function UnbondBadge({ activeUnbond, investment, onWithdraw, union }) {
  const { minWindowTs, eligibleNow } = activeUnbond;
  const nowSecs      = Math.floor(Date.now() / 1000);
  const windowPassed = minWindowTs > 0 && nowSecs >= minWindowTs;
  const { remaining, days, hours, minutes, seconds } = useCountdown(windowPassed ? 0 : minWindowTs);

  const canClaim = eligibleNow && windowPassed;

  const pendingUsdt = sharesToUsdt(
    investment?.pendingShares ?? 0n,
    investment?.currentFxRate ?? 0,
    investment?.seniorIndex   ?? 0n,
  );
  const amountStr = pendingUsdt > 0 ? `${pendingUsdt.toFixed(2)} USDT` : "—";

  const countdownParts = [];
  if (days > 0)    countdownParts.push(`${days}d`);
  if (hours > 0)   countdownParts.push(`${hours}h`);
  if (minutes > 0) countdownParts.push(`${minutes}m`);
  countdownParts.push(`${String(seconds).padStart(2, "0")}s`);

  return (
    <div className="flex items-center gap-3 py-3 px-16">
      {/* Left: countdown · amount + date sublabel */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold font-mono leading-tight" style={{ color: canClaim ? "var(--color-accent)" : "var(--color-text-on-dark)" }}>
          {canClaim
            ? "Ready to claim"
            : windowPassed
              ? "Awaiting repayment"
              : remaining > 0 ? countdownParts.join(" ") : "Finalising…"}
          {amountStr !== "—" && (
            <span style={{ color: "var(--color-text-soft)", fontWeight: 400 }}> · {amountStr}</span>
          )}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-soft)" }}>
          {canClaim
            ? "Unbonding period complete"
            : windowPassed
              ? "Funds released as loans repay"
              : `Claimable from ${new Date(minWindowTs * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
        </p>
      </div>

      {/* Right: claim button */}
      <button
        onClick={(e) => { e.stopPropagation(); if (canClaim) onWithdraw?.(union); }}
        disabled={!canClaim}
        className="flex-shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition"
        style={{
          backgroundColor: canClaim ? "rgba(212,166,23,0.15)" : "rgba(255,255,255,0.04)",
          border: canClaim ? "1px solid rgba(212,166,23,0.3)" : "1px solid rgba(255,255,255,0.08)",
          color: canClaim ? "var(--color-accent)" : "rgba(255,255,255,0.2)",
          cursor: canClaim ? "pointer" : "not-allowed",
        }}
      >
        <ArrowDownToLine className="h-3 w-3" /> Claim
      </button>
    </div>
  );
}

export const CarouselSection = forwardRef(function CarouselSection(
  { indexes = [], unions, activeIndex, onSnapTo, wallet, onSelectUnion, onScrollToHealth, investments, myUnionsOnly, onToggleMyUnions, rateByFund, historyByFund, onOpenModal, onAddMore, onWithdraw },
  ref
) {
  const [showIndexes, setShowIndexes] = useState(false);

  const hasInvestments = wallet && investments && Object.keys(investments).length > 0;
  const visibleUnions = hasInvestments
    ? myUnionsOnly
      ? unions.filter((u) => !investments[u.id])   // discover: exclude invested
      : unions.filter((u) =>  investments[u.id])   // default:  only invested
    : unions;

  const unionItems = visibleUnions.map((u)   => ({ type: "union", data: u   }));
  const indexItems = showIndexes ? indexes.map((idx) => ({ type: "index", data: idx })) : [];

  // Order: 1) active unions, 2) active indexes, 3) non-active unions, 4) non-active indexes
  const items = [
    ...unionItems.filter((i) => i.data.status === "active"),
    ...indexItems.filter((i) => i.data.status === "active"),
    ...unionItems.filter((i) => i.data.status !== "active"),
    ...indexItems.filter((i) => i.data.status !== "active"),
  ];

  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const scrollTimerRef = useRef(null);
  const pendingIndexSnap = useRef(false);

  const snapTo = (index) => {
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    onSnapTo(clamped);
    const doScroll = () => {
      const card = cardRefs.current[clamped];
      if (!card || !trackRef.current) return;
      const track = trackRef.current;
      track.scrollTo({ left: card.offsetLeft - (track.offsetWidth - card.offsetWidth) / 2, behavior: "smooth" });
    };
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 600);
  };

  const snapToUnion = (unionId) => {
    const idx = items.findIndex((item) => item.data.id === unionId);
    if (idx !== -1) snapTo(idx);
  };

  // Snap to first index after showIndexes has rendered the index cards into the DOM
  useEffect(() => {
    if (pendingIndexSnap.current && showIndexes && indexItems.length > 0) {
      pendingIndexSnap.current = false;
      const firstIndexPos = items.findIndex((i) => i.type === "index");
      if (firstIndexPos !== -1) snapTo(firstIndexPos);
    }
  }, [showIndexes, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleIndexButton = () => {
    if (!showIndexes) {
      pendingIndexSnap.current = true;
      setShowIndexes(true);
    } else {
      setShowIndexes(false);
    }
  };

  useImperativeHandle(ref, () => ({ snapTo, snapToUnion }));

  const onScroll = () => {
    clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track) return;
      const centre = track.scrollLeft + track.offsetWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const cardCentre = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(centre - cardCentre);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      onSnapTo(closest);
    }, 60);
  };

  const activeItemData     = items[activeIndex]?.data;
  const activeUnionAddr    = activeItemData?.id ? (LIVE_ADDRESS_BY_ID[activeItemData.id] ?? null) : null;
  const activeHasPosition  = !!(wallet && investments?.[activeItemData?.id]);

  // Fetch unbond state for the active carousel item whenever it has a position
  const { data: activeUnbond } = useUnbondPreview(
    activeHasPosition ? activeUnionAddr : null,
    activeHasPosition ? wallet?.address : null,
  );

  return (
    <section className="py-8 sm:py-16">
      {/* Header */}
      <div className="mx-auto max-w-lg mb-6 sm:mb-8 px-4 sm:px-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-primary-light)" }}>
          {hasInvestments && !myUnionsOnly ? "Your portfolio" : "Step 1 — Meet the unions"}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--color-text-on-dark)", letterSpacing: "-0.02em" }}>
          {hasInvestments && !myUnionsOnly ? "Your active investments" : "Choose a union to invest"}
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-soft)" }}>
          {hasInvestments && !myUnionsOnly
            ? "Monitor your investments"
            : wallet?.ninUser
              ? "Great. You are familiar with stablecoins."
              : "To view a union's full profile, you need at least 50 USDT or existing nIN in your wallet."}
        </p>
      </div>

      {/* Controls: arrows + dots + index button + My unions toggle */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-6 sm:my-8 px-4">
        <button onClick={() => snapTo(activeIndex - 1)} disabled={activeIndex === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
          style={{
            backgroundColor: activeIndex > 0 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            opacity: activeIndex > 0 ? 1 : 0.3,
            cursor: activeIndex > 0 ? "pointer" : "not-allowed",
          }}>
          <ArrowLeft className="h-4 w-4" style={{ color: "var(--color-text-on-dark)" }} />
        </button>

        <div className="flex gap-2">
          {items.map((_, i) => (
            <button key={i} onClick={() => snapTo(i)}
              className="rounded-full transition-all"
              style={{
                width: i === activeIndex ? "20px" : "6px",
                height: "6px",
                backgroundColor: i === activeIndex ? "var(--color-accent)" : "rgba(255,255,255,0.2)",
              }} />
          ))}
        </div>

        <button onClick={() => snapTo(activeIndex + 1)} disabled={activeIndex === items.length - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-all"
          style={{
            backgroundColor: activeIndex < items.length - 1 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            opacity: activeIndex < items.length - 1 ? 1 : 0.3,
            cursor: activeIndex < items.length - 1 ? "pointer" : "not-allowed",
          }}>
          <ArrowRight className="h-4 w-4" style={{ color: "var(--color-text-on-dark)" }} />
        </button>

        {indexes.length > 0 && (
          <button
            onClick={handleIndexButton}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all hover:opacity-90"
            style={{
              backgroundColor: showIndexes ? "rgba(255,255,255,0.08)" : "var(--color-accent)",
              border: showIndexes ? "1px solid rgba(255,255,255,0.15)" : "none",
              color: showIndexes ? "var(--color-text-soft)" : "#0f172a",
              cursor: "pointer",
            }}
          >
            {showIndexes ? "<- Back to unions" : "-> invest in an index"}
          </button>
        )}

        {wallet && investments && Object.keys(investments).length > 0 && (
          <button
            onClick={onToggleMyUnions}
            className="ml-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
            style={{
              backgroundColor: myUnionsOnly ? "rgba(212,166,23,0.15)" : "rgba(255,255,255,0.06)",
              border: myUnionsOnly ? "1px solid rgba(212,166,23,0.35)" : "1px solid rgba(255,255,255,0.1)",
              color: myUnionsOnly ? "var(--color-accent)" : "var(--color-text-soft)",
            }}>
            <BarChart2 className="h-3 w-3" />
            {myUnionsOnly ? "Show active investments" : "Discover more unions"}
          </button>
        )}
      </div>

      {/* Your position banner — only for union cards */}
      {wallet && investments?.[activeItemData?.id] && (() => {
        const inv = investments[activeItemData.id];

        // USD P&L cell: only populated once the Chainlink entry-time lookup lands.
        // `earnedPendingUsd` can be negative (FX moved against the position) so we
        // show the sign explicitly and color red on loss / green on gain.
        const hasUsd = typeof inv.earnedPendingUsd === 'number';
        const usdPnl = hasUsd ? inv.earnedPendingUsd : null;
        const usdColor = !hasUsd ? "var(--color-text-soft)"
                         : usdPnl >= 0 ? "#52B788" : "#E07A5F";
        const usdValue = hasUsd
          ? `${usdPnl >= 0 ? "+" : "−"}$${Math.abs(usdPnl).toFixed(2)}`
          : "…";

        const cells = [
          { label: "Deposited",        value: `${inv.amount.toFixed(2)} USDT`,         Icon: Wallet,      color: "var(--color-text-on-dark)" },
          { label: "Earnings pending", value: `+${inv.earnedPending.toFixed(2)} USDT`, Icon: TrendingUp,  color: "var(--color-text-on-dark)" },
          { label: "USD P&L (vs entry FX)", value: usdValue, Icon: DollarSign, color: usdColor },
        ];

        return (
          <div className="mb-6 rounded-2xl overflow-hidden"
            style={{
              width: "min(640px, calc(100vw - 32px))",
              marginLeft: "auto",
              marginRight: "auto",
              border: "1px solid rgba(212,166,23,0.2)",
              backgroundColor: "rgba(212,166,23,0.05)",
            }}>
            <div className="px-4 pt-3 pb-1 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
                Your position
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onAddMore?.(activeItemData); }}
                  className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-80"
                  style={{ backgroundColor: "rgba(212,166,23,0.15)", border: "1px solid rgba(212,166,23,0.3)", color: "var(--color-accent)" }}
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onWithdraw?.(activeItemData); }}
                  className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-semibold transition hover:opacity-80"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "var(--color-text-soft)" }}
                >
                  <ArrowDownToLine className="h-3 w-3" /> Withdraw
                </button>
              </div>
            </div>
            <div className="flex" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              {cells.map(({ label, value, Icon, color }, idx, arr) => (
                <div key={label} className="flex-1 flex flex-col items-center py-3 px-2"
                  style={{ borderRight: idx < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  <Icon className="h-3.5 w-3.5 mb-1" style={{ color: "var(--color-accent)" }} />
                  <span className="text-xs font-semibold" style={{ color }}>{value}</span>
                  <span className="text-[10px] mt-0.5 text-center" style={{ color: "var(--color-text-soft)" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Withdrawals section */}
            {activeUnbond?.requestTs > 0 && (
              <>
                <div className="px-4 pt-3 pb-1 flex items-center justify-between gap-2"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-soft)" }}>
                    Withdrawals
                  </p>
                </div>
                <UnbondBadge activeUnbond={activeUnbond} investment={investments?.[activeItemData?.id]} onWithdraw={onWithdraw} union={activeItemData} />
              </>
            )}
          </div>
        );
      })()}

      {/* Track */}
      <div className="relative overflow-hidden">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex gap-4 overflow-x-auto"
          style={{
            paddingLeft: "max(16px, calc(50vw - 320px))",
            paddingRight: "max(16px, calc(50vw - 320px))",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollSnapType: "x mandatory",
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.data.id}
              ref={(el) => (cardRefs.current[i] = el)}
              style={{ flexShrink: 0, scrollSnapAlign: "center" }}
            >
              {item.type === "index" ? (
                <IndexCard
                  index={item.data}
                  isActive={i === activeIndex}
                  wallet={wallet}
                  unions={unions}
                  rateByFund={rateByFund}
                  onSelect={onSelectUnion}
                  onOpenModal={onOpenModal}
                />
              ) : (
                <UnionCard
                  union={item.data}
                  isActive={i === activeIndex}
                  wallet={wallet}
                  investments={investments}
                  rateByFund={rateByFund}
                  historyByFund={historyByFund}
                  onSelect={onSelectUnion}
                  onScrollToHealth={onScrollToHealth}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
