// Impact as a meter list (Carst, 10 Nov): Food, Income, Women's land, Independence, Her voice — one row each, a bar
// against its own whole, the figure and its source. Not measured yet = an empty dashed track, said in words.
// dataviz: several ratios each against its own whole → meter list, not rings; one hue, identity by label.
import { useState } from "react";

const ACCENT = "#D4CF5A", TRACK = "#1F2733", MUTED = "#94A3B8";
const STATUS = { chain: ["#D4CF5A", "On-chain"], self: ["#D4A634", "Self-reported"], open: ["#E69283", "Not measured yet"] };

function Meter({ value }) {
  const v = value == null ? null : Math.max(0, Math.min(1, value));
  return (
    <div style={{ position: "relative", height: 10, borderRadius: 9999, background: v == null ? "transparent" : TRACK,
                  border: v == null ? `1px dashed #334155` : "none", boxSizing: "border-box" }}>
      {v != null && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%`, borderRadius: 9999, background: ACCENT,
                                  transition: "width .8s cubic-bezier(.2,.7,.2,1)" }} />}
    </div>
  );
}

// Two bars on one scale: the sourced baseline, and ours as the data comes in (Carst, 10 Nov — income).
function Compare({ rows }) {
  const max = Math.max(...rows.map((r) => r.value || 0)) * 1.15 || 1;
  const inr = (x) => `₹${Math.round(x).toLocaleString("en-IN")}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((r, i) => (
        <div key={r.label} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 84px", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: MUTED }}>{r.label}</span>
            {r.value == null
              ? <div style={{ height: 10, borderRadius: 9999, border: "1px dashed #334155" }} />
              : <div style={{ height: 10, width: `${(r.value / max) * 100}%`, borderRadius: 9999, background: i ? ACCENT : "#64748B" }} />}
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, textAlign: "right", color: r.value == null ? "#64748B" : "#F1F5F9" }}>
            {r.value == null ? "—" : `${inr(r.value)}`}<span style={{ fontSize: 11, fontWeight: 400, color: MUTED }}>{r.value == null ? "" : "/mo"}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ImpactMeters({ metrics, mobile }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ background: "#121212", border: "1px solid #1C1F26", borderRadius: 24, boxShadow: "var(--nl-shadow-card)", padding: mobile ? "4px 16px" : "4px 24px" }}>
      {metrics.map((m, i) => {
        const [dot, label] = STATUS[m.status] || STATUS.open;
        const pct = m.compare ? "" : m.value == null ? "—" : `${Math.round(m.value * 100)}%`;
        const isOpen = open === m.key;
        return (
          <div key={m.key} style={{ padding: "18px 0", borderTop: i ? "1px solid #1F2733" : "none" }}>
            <button onClick={() => setOpen(isOpen ? null : m.key)} aria-expanded={isOpen}
                    style={{ all: "unset", cursor: "pointer", width: "100%", display: "grid", alignItems: "center", gap: mobile ? 10 : 20,
                             gridTemplateColumns: mobile ? "1fr auto" : "200px minmax(0,1fr) 64px 20px" }}>
              <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{m.name}</span>
                <span style={{ fontSize: 12, color: "#64748B" }}>{m.framework}</span>
              </span>
              {!mobile && (m.compare ? <Compare rows={m.compare} /> : <Meter value={m.value} />)}
              <span style={{ fontSize: 22, fontWeight: 700, textAlign: "right", color: m.value == null ? "#64748B" : "#F1F5F9" }}>{pct}</span>
              {!mobile && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                               style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}><path d="m6 9 6 6 6-6" /></svg>}
            </button>
            {mobile && <div style={{ marginTop: 10 }}>{m.compare ? <Compare rows={m.compare} /> : <Meter value={m.value} />}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10, fontSize: 14, lineHeight: 1.5, paddingLeft: mobile ? 0 : 220 }}>
              <span style={{ color: MUTED }}>{m.def}</span>
              <span style={{ display: "flex", gap: 8, alignItems: "baseline", color: "#CBD5E1", fontSize: 13 }}>
                <span style={{ width: 7, height: 7, borderRadius: 9999, background: dot, flexShrink: 0, transform: "translateY(-1px)" }} />
                <span>{m.figure || label}{m.when ? ` · ${m.when}` : ""}</span>
              </span>
              {isOpen && <span style={{ color: "#64748B", fontSize: 12 }}>Source: {m.source}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
