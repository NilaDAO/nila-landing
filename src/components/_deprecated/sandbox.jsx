import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Leaf, DollarSign,Droplets, Shield, BadgeCheck, Store, CloudSun } from "lucide-react";

/**
 * NILA — Single-Canvas Experience
 *
 * The page does NOT scroll. The visualization advances stages internally
 * while the canvas stays mounted. Only the boxes/links change.
 */

const TYPES = [
  { id: "finance", label: "Finance", Icon: DollarSign, baseDelta: 2, note: "Group credit reduces cost" },
  { id: "insurance", label: "Insurance", Icon: Shield, baseDelta: 0, riskDrop: 0.3, note: "Coverage improves stability" },
  { id: "quality", label: "Quality", Icon: BadgeCheck, baseDelta: 8, note: "Premium unlocked" },
  { id: "attestation", label: "Traceability", Icon: Store, baseDelta: 3, note: "Trade coordination uplift" },
  { id: "moisture", label: "Moisture", Icon: Droplets, baseDelta: 3, note: "Trade coordination uplift" },
  { id: "climate", label: "Climate", Icon: CloudSun, baseDelta: 2, note: "Resilience improves expected yield" },
  { id: "inputs", label: "Inputs", Icon: Leaf, baseDelta: 3, note: "Shared procurement reduces cost" },
];

const PALETTE = ["emerald", "sky", "orange", "amber"];
const COLOR_BG = {
  emerald: "bg-green",
  sky: "bg-red",
  orange: "bg-grey",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
  stone: "bg-stone-500",
};

export const SANDBOX_MAX_STAGE = 3;

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const getBarHeight = (farm) => ("yield" in farm ? Math.floor(farm.yield * 2) : 24);

function makeInitialFarms(count = 12) {
  const crops = ["Sugarcane", "Paddy", "Millet","Groundnut"];
  const period = [150,85,85,85];
  const cropOffsets = [0, 10, 30, 20]; // offset in days per crop type for clustering

  return Array.from({ length: count }, (_, i) => {
    const shuffled = [...TYPES].sort(() => Math.random() - 1.5);
    const sliced = shuffled.slice(0, Math.floor(Math.random() * 4) + 1); // 1–3 types
    const selection = sliced.sort(() => Math.random() - 1.5).map((t) => t.id);

    const cropIdx = Math.floor(Math.random() * crops.length);
    const start = new Date(2025, 9, 1 + cropOffsets[cropIdx]); // base start offset by crop

    const harvest = new Date(start);    
    harvest.setDate(start.getDate() + period[cropIdx] + Math.floor(Math.random() * 5)); // small intra-crop variance

    // **store initial positions here**
    const initX = Math.random() * 200 - 50;
    const initY = 100;

    return {
      id: `farm-${i + 1}`,
      name: `Farm ${i + 1}`,
      crop: crops[cropIdx],
      types: selection,
      linkedTypes: [],
      inUnion: false,
      stageGroup: "union",
      x: initX,
      y: initY,
      hue: PALETTE[cropIdx],
      start,
      harvest,
    };
  });
}

function computeLedger(farms) {
  const inUnion = farms.filter((f) => f.inUnion);
  const typeToFarms = new Map(TYPES.map((t) => [t.id, []]));
  inUnion.forEach((f) => {
    f.linkedTypes.forEach((t) => {
      const arr = typeToFarms.get(t);
      if (arr) arr.push(f.id);
    });
  });
  const rows = [];
  let total = 0;
  let distinctLinked = 0;
  let riskDropTotal = 0;
  TYPES.forEach((t) => {
    const linkedCount = typeToFarms.get(t.id)?.length ?? 0;
    if (linkedCount >= 2) {
      distinctLinked += 1;
      if (t.id === "insurance" && t.riskDrop) {
        riskDropTotal += t.riskDrop;
        rows.push({ category: t.label, delta: 0, note: `Risk −${t.riskDrop}` });
      }
      if ((t.baseDelta ?? 0) > 0) {
        total += t.baseDelta;
        rows.push({ category: t.label, delta: t.baseDelta, note: t.note });
      }
    }
  });
  if (distinctLinked >= 3) {
    const bonus = 3; total += bonus; rows.push({ category: "Multi-type", delta: bonus, note: "Compound effect" });
  }
  return { rows, total: Math.round(total * 10) / 10, riskDrop: riskDropTotal > 0 ? riskDropTotal : 0 };
}

function ValueSheet({ ledger, onPrev, onNext }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="backdrop-blur-md shadow-xl ring-1 ring-black/10 rounded-2xl overflow-hidden">
        <div className="my-3 flex items-center justify-end gap-2">
          <button
            onClick={onPrev}
            className="py-3 px-6 text-xs rounded-md ring-1 ring-black/10 hover:bg-black/5"
          >
            Prev
          </button>
          <button
            onClick={onNext}
            className="py-3 px-6 text-xs rounded-md ring-1 ring-black/10 hover:bg-black/5"
          >
            Next
          </button>
        </div>
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 px-4 py-2 w-full hover:bg-black/5">
          <span className="text-sm font-semibold tracking-wide">💹 Nila Ledger</span>
          <span className="ml-auto text-xs font-mono">{ledger.total >= 0 ? "▲" : "▼"} {ledger.total.toFixed(1)}%</span>
        </button>
        {open ? (
          <div className="px-4 pb-3">
            <div className="text-xs text-neutral-600 mt-2 mb-1">Live · Cells: {ledger.total > 0 ? 1 : 0}</div>
            <div className="max-h-48 overflow-auto rounded-lg border border-black/5">
              <table className="w-full text-xs">
                <thead className="bg-black/5">
                  <tr>
                    <th className="text-left px-3 py-1.5 font-medium">Category</th>
                    <th className="text-right px-3 py-1.5 font-medium">Δ Value</th>
                    <th className="text-left px-3 py-1.5 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.rows.length === 0 ? (
                    <tr><td colSpan={3} className="px-3 py-3 text-neutral-500">No coordination yet.</td></tr>
                  ) : (
                    ledger.rows.map((r, idx) => (
                      <tr key={idx} className="odd:bg-transparent even:bg-black/2">
                        <td className="px-3 py-1.5">{r.category}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{r.delta ? `+${r.delta}%` : "—"}</td>
                        <td className="px-3 py-1.5 text-neutral-600">{r.note}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm font-semibold">
              <div>Total Value</div>
              <div className="font-mono">{ledger.total >= 0 ? "▲" : "▼"} {ledger.total.toFixed(1)}%</div>
            </div>
            {ledger.riskDrop > 0 ? (
              <div className="mt-1 text-xs text-neutral-600">Stability improved · Risk −{ledger.riskDrop.toFixed(1)}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InsightFooter({ message }) {
  return (
    <div className="bottom-3 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="px-4 py-6 rounded-full bg-black/5 text-sm text-white backdrop-blur-md shadow">
        {message}
      </div>
    </div>
  );
}

function GanttBar({ farm, stage, onDragEnd, onToggleType, y, x, scale, delay = 0 }) {
  const draggable = stage >= 5;
  const barHeight = getBarHeight(farm); // dynamic height if set

  const width = ((farm.harvest.getTime() - farm.start.getTime()) / MS_PER_DAY) * scale;
  return (
    <motion.div
      drag={draggable ? "x" : false}
      dragMomentum={false}
      onDragEnd={(e, info) => onDragEnd && onDragEnd(farm.id, info)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1, x, y }}
      transition={{ type: "spring", stiffness: 120, damping: 20, delay }}
      className={`absolute flex flex-row justify-between items-center gap-1 p-3 rounded-xl shadow-md ${COLOR_BG[farm.hue]} text-black cursor-pointer`}
      style={{ height: barHeight, width }}
    >
      <div className="flex flex-row flex-nowrap gap-3 items-center">
        <div className="text-sm font-bold whitespace-nowrap">{farm.name}</div>
        <div className="flex flex-nowrap gap-1">
          {farm.types.map((t) => (
            <TypePill
              key={t}
              typeId={t}
              active={farm.linkedTypes.includes(t)}
              onToggle={() => onToggleType && onToggleType(farm.id, t)}
            />
          ))}
        </div>
      </div>
      <div className="text-sm font-bold">{farm.crop}</div>
    </motion.div>
  );
}

function TypePill({ typeId, active, onToggle }) {
  const t = TYPES.find((x) => x.id === typeId);
  if (!t) return null;
  const Icon = t.Icon;
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1 rounded bg-black/40 py-1 px-2 text-white"
    >
      <Icon color="white" size={8} /><p className="text-xs">{t.label}</p>
    </button>
  );
}

function UnionBox({ children, label = "Union Cell α", highlight = false, innerRef, contentHeight = 0, contentWidth = 0, className = "" }) {
  return (
    <div ref={innerRef} className={`relative rounded-3xl border-2 ${highlight ? "border-emerald-400/90" : "border-neutral-300/10"} ring-black/5 p-6 ${className}`}>
      <div className="absolute -top-3 z-10 text-xs px-2 py-0.5 rounded-full bg-grey text-black shadow">{label}</div>
      <div
        className="relative pt-6 pb-4"
        style={{
          minHeight: contentHeight || undefined,
          minWidth: contentWidth || undefined,
        }}
      >
        {children}
      </div>
      {highlight ? <div className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-green" /> : null}
    </div>
  );
}

export default function Sandbox({ sectionId = "overview", stage: controlledStage, onStageChange }) { // single-canvas with viewport-gated stage scroll
  const containerRef = useRef(null);
  const unionRef = useRef(null);
  const touchStartYRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [farms, setFarms] = useState(() => makeInitialFarms(18));
  const [stageFarms, setStageFarms] = useState({});
  const [footerMsg, setFooterMsg] = useState("Each farm works alone. No coordination yet.");
  const wheelLockRef = useRef(false);
  const [internalStage, setInternalStage] = useState(1);

  const stage = controlledStage ?? internalStage;
  const updateStage = onStageChange ?? setInternalStage;

  // Viewport gating: only activate stage-scroll when mostly visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsActive(entry.isIntersecting && entry.intersectionRatio > 0.9);
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const MAX_STAGE = SANDBOX_MAX_STAGE;

  const advanceStage = (dir) => {
    updateStage((prev) => {
      if (typeof prev !== "number") {
        const fallbackNext = clamp(stage + dir, 1, MAX_STAGE);
        return fallbackNext;
      }
      const next = clamp(prev + dir, 1, MAX_STAGE);
      return next;
    });
  };

  const onWheel = (e) => {
    if (!isActive || wheelLockRef.current) return; // only when section is active in viewport
    const dir = e.deltaY > 0 ? 1 : -1;
    const boundaryExit = (stage === 1 && dir < 0) || (stage === MAX_STAGE && dir > 0);
    if (boundaryExit) return;
    advanceStage(dir);
    wheelLockRef.current = true;
    setTimeout(() => {
      wheelLockRef.current = false;
    }, 600);
  };

  const handleTouchStart = (event) => {
    if (!isActive) return;
    const touch = event.touches?.[0];
    if (touch) {
      touchStartYRef.current = touch.clientY;
    }
  };

  const handleTouchEnd = (event) => {
    if (!isActive || wheelLockRef.current) {
      touchStartYRef.current = null;
      return;
    }
    const startY = touchStartYRef.current;
    const touch = event.changedTouches?.[0];
    touchStartYRef.current = null;
    if (startY == null || !touch) return;
    const deltaY = startY - touch.clientY;
    if (Math.abs(deltaY) < 30) return; // ignore small swipes
    const dir = deltaY > 0 ? 1 : -1;
    const boundaryExit = (stage === 1 && dir < 0) || (stage === MAX_STAGE && dir > 0);
    if (boundaryExit) return;
    advanceStage(dir);
    wheelLockRef.current = true;
    setTimeout(() => {
      wheelLockRef.current = false;
    }, 600);
  };

  // Auto choreography for stages 1–3
  useEffect(() => {
    const msg = stage === 1
      ? "Each farm communities naturally follows each other, following natural cycles and traditions."
      : stage === 2
      ? "Farmers match and merge organically, but any formal network is non-existent."
      : "Nila ties farms together, allowing external parties to track, verify and add support.";

    setFooterMsg(msg);

    setFarms((prev) => {
      // Restore previous snapshot if exists
      if (stageFarms[stage]) return stageFarms[stage];

      let next = prev;

      if (stage === 1) {
        // Stage 1: random scatter, no union
        next = prev.map((f) => ({
          ...f,
          inUnion: false,
          linkedTypes: [],
          stageGroup: "union",
        }));
      } else if (stage === 2) {
        // Stage 2: sort farms by crop type, keep all farms visible
        const sorted = prev.slice().sort((a, b) => {
          const cropOrder = a.crop.localeCompare(b.crop);
          if (cropOrder !== 0) return cropOrder;
          return a.harvest.getTime() - b.harvest.getTime();
        });
        next = sorted.map((f) => ({ ...f, stageGroup: "union" }));
      } else if (stage === 3) {
        // Stage 3: focus crop with most farms
        const cropGroups = {};
        prev.forEach((f) => {
          if (!cropGroups[f.crop]) cropGroups[f.crop] = [];
          cropGroups[f.crop].push(f);
        });
        const focusEntry = Object.entries(cropGroups).reduce(
          (a, [crop, arr]) => (arr.length > a.count ? { crop, count: arr.length } : a),
          { crop: null, count: 0 }
        );
        const cropFocus = focusEntry.crop;
        const focusFarms = prev.filter((f) => (cropFocus ? f.crop === cropFocus : true));
        const sortedByHarvest = focusFarms
          .slice()
          .sort((a, b) => a.harvest.getTime() - b.harvest.getTime());
        const sortedByPills = focusFarms
          .slice()
          .sort((a, b) => {
            const diff = (b.types?.length ?? 0) - (a.types?.length ?? 0);
            if (diff !== 0) return diff;
            return a.harvest.getTime() - b.harvest.getTime();
          });
        const minimumTrade = Math.min(4, sortedByPills.length);
        const thresholdCount = (
          minimumTrade > 0 ? (sortedByPills[minimumTrade - 1]?.types?.length ?? 0) : 0
        );
        const tradeIds = new Set(
          sortedByPills
            .filter(
              (farm, index) =>
                index < minimumTrade || (farm.types?.length ?? 0) >= thresholdCount
            )
            .map((farm) => farm.id)
        );
        next = sortedByHarvest.map((farm) => ({
          ...farm,
          stageGroup: tradeIds.has(farm.id) ? "trade" : "union",
        }));
      }

      // Save snapshot for this stage
      setStageFarms((prevStages) => ({ ...prevStages, [stage]: next }));

      return next;
    });
  }, [stage]);

  const handleDragEnd = (farmId, info) => {
    const el = unionRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const { x, y } = info.point;
    const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    if (!inside) return;
    setFarms((prev) => prev.map((f) => (f.id === farmId ? { ...f, inUnion: true } : f)));
  };

  const toggleTypeLink = (farmId, typeId) => {
    setFarms((prev) => prev.map((f) => {
      if (f.id !== farmId || !f.inUnion) return f;
      const has = f.linkedTypes.includes(typeId);
      return { ...f, linkedTypes: has ? f.linkedTypes.filter((t) => t !== typeId) : [...f.linkedTypes, typeId] };
    }));
  };

  const ledger = useMemo(() => computeLedger(farms), [farms]);
  const minDate = farms.length > 0 ? Math.min(...farms.map((f) => f.start.getTime())) : Date.now();
  const scale = 5; // pixels per day
  const baseXOffset = 24;
  const baseYOffset = 12;

  const computeLayouts = (subset) => {
    let layoutYLocal = baseYOffset;
    let contentWidthLocal = 0;
    const layouts = subset.map((farm) => {
      const barHeight = getBarHeight(farm);
      const currentY = layoutYLocal;
      layoutYLocal += barHeight + 9;
      const timelineX = baseXOffset + ((farm.start.getTime() - minDate) / MS_PER_DAY) * scale;
      const barWidth = ((farm.harvest.getTime() - farm.start.getTime()) / MS_PER_DAY) * scale;
      contentWidthLocal = Math.max(contentWidthLocal, timelineX + barWidth);
      return { farm, index: farms.indexOf(farm), x: timelineX, y: currentY };
    });
    const canvasHeightLocal = Math.max(layoutYLocal + baseYOffset, subset.length > 0 ? 200 : 160);
    const canvasWidthLocal = Math.max(contentWidthLocal + baseXOffset, 320);
    return { layouts, canvasHeight: canvasHeightLocal, canvasWidth: canvasWidthLocal };
  };

  const unionFarms = stage === 3 ? farms.filter((f) => f.stageGroup !== "trade") : farms;
  const tradeFarms = stage === 3 ? farms.filter((f) => f.stageGroup === "trade") : [];
  const unionLayout = computeLayouts(unionFarms);
  const tradeLayout = computeLayouts(tradeFarms);

  console.log('tradeLayout.layouts', tradeLayout.layouts);
  
  const renderGanttBars = (layouts) =>
    layouts.map(({ farm, index, x, y }) => {
      const targetX = stage >= 3 ? x : farm.x;
      const targetY = y;
      return (
        <GanttBar
          key={farm.id}
          farm={farm}
          stage={stage}
          y={targetY}
          x={targetX}
          scale={scale}
          onDragEnd={handleDragEnd}
          onToggleType={toggleTypeLink}
          delay={0.02 * index}
        />
      );
    });


  // ----- Single Canvas Render -----
  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden overscroll-contain touch-pan-y"
      onWheel={onWheel} onWheelCapture={onWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => { touchStartYRef.current = null; }}
      tabIndex={0}
      onKeyDown={(e) => { if (!isActive) return; if (e.key === 'ArrowDown' || e.key === 'PageDown') advanceStage(1); if (e.key === 'ArrowUp' || e.key === 'PageUp') advanceStage(-1); }}
    >
      {/* Scatter/Attraction layer (visible in 1–2) */}
      <div className="pt-12" style={{ transition: "opacity 400ms" }}>
        {/* Stage 1: scattered */}
        <motion.section>
          {stage === 3 ? (
            <div className="flex flex-col gap-6">
              <UnionBox
                label="Ready for Trade"
                highlight
                contentHeight={tradeLayout.canvasHeight}
                contentWidth={tradeLayout.canvasWidth}
                className="flex-1"
              >
                <div className="flex justify-left pl-12">
                  {tradeLayout.layouts.length > 0 ? (
                    renderGanttBars(tradeLayout.layouts)
                  ) : (
                    <div className="text-sm text-neutral-500">No batches ready for trade yet.</div>
                  )}
                </div>
              </UnionBox>
              <UnionBox
                label="Conventional loan & sales"
                highlight={false}
                innerRef={unionRef}
                contentHeight={unionLayout.canvasHeight}
                contentWidth={unionLayout.canvasWidth}
                className="flex-1"
              >
                <div className="flex justify-left pl-12">
                  {renderGanttBars(unionLayout.layouts)}
                </div>
              </UnionBox>
            </div>
          ) : (
            <UnionBox
              label="Union Cell α"
              highlight={stage >= 3}
              innerRef={unionRef}
              contentHeight={unionLayout.canvasHeight}
              contentWidth={unionLayout.canvasWidth}
            >
              <div className="flex justify-left pl-12">
                {renderGanttBars(unionLayout.layouts)}
              </div>
            </UnionBox>
          )}
        </motion.section>
      </div>
      {/* Outside pool (visible in stage 5)
      <div className="absolute left-0 right-0 bottom-4 z-10" style={{ opacity: stage === 5 ? 1 : 0, pointerEvents: stage === 5 ? "auto" : "none", transition: "opacity 300ms" }}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">Outside farms (pull into the union)</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {outsideFarms.map((f) => (
              <FarmCard key={`out-${f.id}`} farm={f} stage={stage} onDragEnd={handleDragEnd} onToggleType={toggleTypeLink} />
            ))}
          </div>
        </div>
      </div>
      */}
      {sectionId === "overview" && isActive ? (
        <ValueSheet
          ledger={ledger}
          onPrev={() => advanceStage(-1)}
          onNext={() => advanceStage(1)}
        />
      ) : null}
    </div>
  );
}
