// Impact rings (Carst, 10 Nov: "test the concentric rings design"). One ring per impact, outer to inner, each a share
// of its own whole. One hue for every ring: the label beside it carries identity, not the colour (dataviz: identity
// never by colour alone). A ring we cannot measure yet is an empty track, labelled so.
import { useState } from "react";

const ACCENT = "#D4CF5A", TRACK = "#1F2733", MUTED = "#94A3B8";

// rings: [{ key, name, value (0..1 | null), figure, def }]
export default function ImpactRings({ rings, mobile }) {
  const [hot, setHot] = useState(null);
  const size = mobile ? 220 : 260, sw = mobile ? 14 : 16, gap = 8;
  const c = size / 2;
  return (
    <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: mobile ? 20 : 40, alignItems: mobile ? "stretch" : "center",
                  background: "#121212", border: "1px solid #1C1F26", borderRadius: 24, boxShadow: "var(--nl-shadow-card)", padding: mobile ? 18 : 28 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" style={{ flexShrink: 0, alignSelf: "center" }}
           aria-label={rings.map((r) => `${r.name}: ${r.value == null ? "not measured yet" : `${Math.round(r.value * 100)}%`}`).join("; ")}>
        {rings.map((r, i) => {
          const rad = c - sw / 2 - i * (sw + gap);
          const len = 2 * Math.PI * rad;
          const v = r.value == null ? 0 : Math.max(0, Math.min(1, r.value));
          const dim = hot && hot !== r.key;
          return (
            <g key={r.key} onMouseEnter={() => setHot(r.key)} onMouseLeave={() => setHot(null)} style={{ cursor: "default" }}>
              <circle cx={c} cy={c} r={rad} fill="none" stroke={TRACK} strokeWidth={sw}
                      strokeDasharray={r.value == null ? "2 6" : undefined} />
              {v > 0 && (
                <circle cx={c} cy={c} r={rad} fill="none" stroke={ACCENT} strokeWidth={sw} strokeLinecap="round"
                        strokeDasharray={`${len * v} ${len}`} transform={`rotate(-90 ${c} ${c})`}
                        style={{ opacity: dim ? 0.35 : 1, transition: "opacity .2s, stroke-dasharray .8s cubic-bezier(.2,.7,.2,1)" }} />
              )}
              {/* wider invisible hit ring */}
              <circle cx={c} cy={c} r={rad} fill="none" stroke="transparent" strokeWidth={sw + gap} />
            </g>
          );
        })}
      </svg>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {rings.map((r, i) => (
          <li key={r.key} onMouseEnter={() => setHot(r.key)} onMouseLeave={() => setHot(null)}
              style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 0", borderTop: i ? "1px solid #1F2733" : "none",
                       opacity: hot && hot !== r.key ? 0.5 : 1, transition: "opacity .2s" }}>
            <span style={{ width: 52, flexShrink: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.1, color: r.value == null ? "#64748B" : "#F1F5F9" }}>
              {r.value == null ? "—" : `${Math.round(r.value * 100)}%`}
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: 14, lineHeight: 1.5, minWidth: 0 }}>
              <span style={{ fontWeight: 700 }}>{r.name} <span style={{ fontWeight: 400, fontSize: 12, color: "#64748B" }}>· {["outer", "middle", "inner"][i]} ring</span></span>
              <span style={{ color: MUTED }}>{r.def}</span>
              <span style={{ color: "#CBD5E1", fontSize: 13 }}>{r.figure}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
