// /how as one ring diagram (design board W4b v1837, docs/W4b_rings_board.dc.html; prompts handoffs/Claude_Code_Prompt_W4_Rings*.md).
// All copy is in public/how/how.json; live numbers come from /audit/snapshot.json. The <svg> stays mounted while the
// reader clicks through tabs and categories: the ring slots and the four segment arcs are keyed by position and always
// present, so a switch only changes stroke-dasharray, the tick's rotation and opacity, and CSS transitions the change.

// A ring's number: live, else value, else none. "liveFigure" picks another figure line of the same live key.
function ringValue(ring, nums) {
  if (ring.live) {
    const l = nums?.[ring.live];
    if (l) return { v: l.v, fig: (ring.liveFigure && l[ring.liveFigure]) || l.fig };
    return { v: null, fig: ring.figure };
  }
  return { v: ring.value ?? null, fig: ring.figure };
}

// ---- the diagram --------------------------------------------------------------------------------------------------
const C = 170, R = [161, 133, 105], LEN = R.map((r) => 2 * Math.PI * r), SW = 18;
const EASE = "cubic-bezier(.2,.7,.2,1)";
const POS = ["outer ring", "middle ring", "inner ring"];
const SEGCOL = ["#D4CF5A", "#94A3B8", "#64748B", "#E69283"];
const pct = (v) => (v == null ? "—" : `${Math.round(v * 100)}%`);
const clamp = (v) => Math.max(0, Math.min(1, v));

// slots: [{ shown, v, tick, dashed }] × 3; segs: up to 4 shares of one whole, drawn in the outer slot.
function Rings({ slots, segs, size, label }) {
  let acc = 0;
  return (
    <svg className="w4-rings" width={size} height={size} viewBox="0 0 340 340" role="img" aria-label={label}
         style={{ flexShrink: 0, display: "block", overflow: "visible" }}>
      {slots.map((s, i) => {
        const f = s.v == null ? 0 : clamp(s.v);
        return (
          <g key={i}>
            <circle cx={C} cy={C} r={R[i]} fill="none" stroke="#1F2733" strokeWidth={SW}
                    style={{ transition: "opacity .4s", opacity: s.shown ? 1 : 0.25, strokeDasharray: s.dashed ? "2 6" : "none" }} />
            <circle cx={C} cy={C} r={R[i]} fill="none" stroke="#D4CF5A" strokeWidth={SW} strokeLinecap="round" transform={`rotate(-90 ${C} ${C})`}
                    style={{ strokeDasharray: `${(LEN[i] * f).toFixed(1)} ${LEN[i].toFixed(1)}`, opacity: s.v != null && f > 0 ? 1 : 0,
                             transition: `stroke-dasharray .8s ${EASE}, opacity .3s` }} />
            <line x1={C} y1={C - R[i] - 14} x2={C} y2={C - R[i] + 14} stroke="#F1F5F9" strokeWidth={3} strokeLinecap="round"
                  style={{ transformBox: "view-box", transformOrigin: `${C}px ${C}px`, transform: `rotate(${((s.tick ?? 0) * 360).toFixed(1)}deg)`,
                           opacity: s.tick == null ? 0 : 1, transition: `transform .8s ${EASE}, opacity .3s` }} />
          </g>
        );
      })}
      {SEGCOL.map((col, j) => {
        const f = segs[j] == null ? 0 : clamp(segs[j]), gap = f > 0.01 ? 2 : 0, len = LEN[0];
        const dash = `0 ${(len * acc).toFixed(1)} ${Math.max(0, len * f - gap).toFixed(1)} ${len.toFixed(1)}`;
        acc += f;
        return (
          <circle key={`seg${j}`} cx={C} cy={C} r={R[0]} fill="none" stroke={col} strokeWidth={SW} transform={`rotate(-90 ${C} ${C})`}
                  style={{ strokeDasharray: dash, opacity: f > 0 ? 1 : 0, transition: `stroke-dasharray .8s ${EASE}, opacity .3s` }} />
        );
      })}
    </svg>
  );
}

// The card: eyebrow, category, question and explain line (always sharp); rings, legend and definition (blurred while
// waiting for a baseline); the source line (hidden while waiting: the overlay names the source).
export function RingCard({ tab, cat, nums, mobile }) {
  const vals = cat.rings.map((r) => ringValue(r, nums));
  const waiting = cat.rings.length > 0 && vals.every((x) => x.v == null);
  const seg = !!cat.segmented;
  const slots = [0, 1, 2].map((i) => {
    const r = cat.rings[i];
    if (seg) return { shown: i === 0, v: null, tick: null, dashed: false };
    if (!r) return { shown: false, v: null, tick: null, dashed: false };
    if (waiting) return { shown: true, v: r.placeholder ?? null, tick: r.placeholderTick ?? null, dashed: false };
    return { shown: true, v: vals[i].v, tick: r.tick ?? null, dashed: vals[i].v == null };
  });
  const segs = seg ? cat.rings.slice(0, 4).map((r, i) => (waiting ? r.placeholder : vals[i].v) ?? null) : [];
  const aria = waiting ? `${cat.name}: waiting for a baseline measure`
    : cat.rings.map((r, i) => `${r.label}: ${vals[i].v == null ? "not measured yet" : pct(vals[i].v)}`).join("; ");
  const anyLive = cat.rings.some((r) => r.live);
  const source = nums && anyLive ? cat.source.replace(/block [\d,]+/, `block ${nums.block.toLocaleString("en-US")}`) : cat.source;

  return (
    <div style={{ minWidth: 0, background: "#121212", border: "1px solid #1C1F26", borderRadius: 24, boxShadow: "var(--nl-shadow-card)",
                  padding: mobile ? 18 : 24, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8" }}>{tab.name} · {cat.status}</span>
        <h2 style={{ margin: 0, fontSize: mobile ? 18 : 19, fontWeight: 700, lineHeight: 1.3 }}>{cat.name}</h2>
        <p style={{ margin: 0, fontSize: mobile ? 14 : 15, lineHeight: 1.5, color: "#CBD5E1" }}>{cat.question}</p>
        {cat.explain && <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.55, color: "#94A3B8" }}>{cat.explain}</p>}
      </div>

      <div style={{ position: "relative" }}>
        <div aria-hidden={waiting || undefined}
             style={{ transition: "filter .3s, opacity .3s", filter: waiting ? "blur(8px)" : "none", opacity: waiting ? 0.45 : 1,
                      pointerEvents: waiting ? "none" : undefined, userSelect: waiting ? "none" : undefined }}>
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 18 : 32, alignItems: "center" }}>
            <Rings slots={slots} segs={segs} size={mobile ? 200 : 260} label={aria} />
            <ol style={{ listStyle: "none", margin: 0, padding: 0, flex: 1, minWidth: 0, alignSelf: "stretch", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {cat.rings.slice(0, seg ? 4 : 3).map((r, i) => {
                const v = waiting ? null : vals[i].v;
                return (
                  <li key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "10px 0", borderTop: i ? "1px solid #1F2733" : "none" }}>
                    <span style={{ width: 52, flexShrink: 0, fontSize: 20, fontWeight: 700, lineHeight: 1.1, color: v == null ? "#64748B" : "#F1F5F9" }}>{pct(v)}</span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>
                        {seg && <span aria-hidden="true" style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, marginRight: 8, background: SEGCOL[i] }} />}
                        {r.label}{" "}
                        <span style={{ fontWeight: 400, fontSize: 11, color: "#64748B" }}>
                          · {seg ? "part of one whole" : POS[i]}{!waiting && !seg && r.tick != null ? ` · tick ${pct(r.tick)} before` : ""}
                        </span>
                      </span>
                      <span style={{ fontSize: 13, lineHeight: 1.5, color: "#CBD5E1" }}>{vals[i].fig}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
          <p style={{ margin: "18px 0 0", fontSize: 13, lineHeight: 1.6, color: "#94A3B8" }}>{cat.definition}</p>
        </div>
        {waiting && (
          <div role="status" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                      gap: 6, textAlign: "center", padding: 24, pointerEvents: "none" }}>
            <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, color: "#F1F5F9" }}>Waiting for a baseline measure</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#CBD5E1" }}>{cat.status}</span>
            <span style={{ fontSize: 12, lineHeight: 1.5, color: "#94A3B8", maxWidth: 400 }}>Measured from: {cat.source}</span>
          </div>
        )}
      </div>

      {!waiting && (
        <p style={{ margin: 0, paddingTop: 12, borderTop: "1px solid #1F2733", fontSize: 12, lineHeight: 1.5, color: "#64748B" }}>
          Source: {source}{nums && anyLive ? `, read ${nums.date}` : ""}. A dashed ring is not measured yet; a white tick is the baseline.
          {nums && anyLive && <>{" "}<a href="/audit" style={{ color: "#94A3B8", textDecoration: "underline" }}>Open the audit</a></>}
        </p>
      )}
    </div>
  );
}

// ---- navigation: tabs, and the active tab's categories ----------------------------------------------------------
const BTN = { display: "block", width: "100%", textAlign: "left", border: 0, font: "inherit", cursor: "pointer", boxSizing: "border-box" };

export function SideNav({ data, tab, cat, go }) {
  return (
    <div role="tablist" aria-orientation="vertical" aria-label="How it works"
         style={{ width: 220, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, position: "sticky", top: 24, alignSelf: "flex-start" }}>
      {data.tabs.map((t) => {
        const on = t.key === tab.key;
        return (
          <div key={t.key} style={{ display: "contents" }}>
            <button type="button" role="tab" aria-selected={on} onClick={() => go(t.key)}
                    style={{ ...BTN, height: 40, padding: "0 14px", borderRadius: 12, fontSize: 14, fontWeight: 700,
                             background: on ? "#1F2733" : "transparent", color: on ? "#F1F5F9" : "#94A3B8" }}>{t.name}</button>
            {on && (
              <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "4px 0 10px 12px" }}>
                {t.categories.map((c) => {
                  const sel = c.key === cat.key;
                  return (
                    <button key={c.key} type="button" aria-current={sel || undefined} onClick={() => go(t.key, c.key)}
                            style={{ ...BTN, minHeight: 32, padding: "5px 12px", borderRadius: 10, fontSize: 13, lineHeight: 1.4,
                                     background: sel ? "#121212" : "transparent", color: sel ? "#F1F5F9" : "#94A3B8",
                                     boxShadow: sel ? "inset 2px 0 0 #D4CF5A" : "none" }}>{c.name}</button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TopNav({ data, tab, cat, go }) {
  const tb = (on) => ({ height: 40, padding: "0 8px", whiteSpace: "nowrap", border: 0, borderRadius: 10, cursor: "pointer", font: "inherit", fontSize: 14, fontWeight: 700,
                        flex: 1, background: on ? "#1F2733" : "transparent", color: on ? "#F1F5F9" : "#94A3B8" });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div role="tablist" aria-label="How it works" style={{ margin: "0 16px", display: "flex", gap: 2, padding: 2, borderRadius: 12, background: "#121212", boxShadow: "inset 0 0 0 1px #1F2733" }}>
        {data.tabs.map((t) => <button key={t.key} type="button" role="tab" aria-selected={t.key === tab.key} onClick={() => go(t.key)} style={tb(t.key === tab.key)}>{t.name}</button>)}
      </div>
      <div className="w4-chips" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 16px 4px", scrollbarWidth: "none" }}>
        {tab.categories.map((c) => {
          const sel = c.key === cat.key;
          return (
            <button key={c.key} type="button" aria-current={sel || undefined} onClick={() => go(tab.key, c.key)}
                    ref={sel ? (el) => el?.scrollIntoView({ block: "nearest", inline: "nearest" }) : undefined}
                    style={{ flexShrink: 0, height: 36, padding: "0 14px", borderRadius: 9999, border: 0, font: "inherit", fontSize: 14, fontWeight: 700,
                             cursor: "pointer", whiteSpace: "nowrap", background: sel ? "#F1F5F9" : "#1F2733", color: sel ? "#0A0A0A" : "#F1F5F9" }}>{c.name}</button>
          );
        })}
      </div>
    </div>
  );
}
