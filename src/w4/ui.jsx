// Building blocks for the /how tabs (W1 tokens; ink cards, raised chips).
const MUTED = "#94A3B8";

// Status of a claim. live = on-chain or in the code today; rule = a decided plan rule; self = Nila's own figure;
// off = written, not switched on; open = we do not have it yet.
const STATUS = {
  live: { dot: "#D4CF5A", text: "Live" },
  chain: { dot: "#D4CF5A", text: "On-chain" },
  rule: { dot: "#D4CF5A", text: "Plan rule" },
  self: { dot: "#D4A634", text: "Self-reported" },
  off: { dot: "#E69283", text: "Not switched on" },
  open: { dot: "#E69283", text: "Not yet" },
};

export function Chip({ s }) {
  const c = STATUS[s];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 24, padding: "0 8px", borderRadius: 9999, background: "#1F2733",
                   fontSize: 12, fontWeight: 700, color: "#F1F5F9", whiteSpace: "nowrap", flexShrink: 0 }}>
      <span style={{ width: 7, height: 7, borderRadius: 9999, background: c.dot }} />{c.text}
    </span>
  );
}

export function Section({ mobile, eyebrow, title, intro, children }) {
  return (
    <section style={{ padding: mobile ? "32px 0 48px" : "48px 0 72px" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: mobile ? "0 16px" : "0 24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: mobile ? 20 : 28 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
          {eyebrow && <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.5, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>{eyebrow}</span>}
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>{title}</h2>
          {intro && <p style={{ margin: 0, fontSize: mobile ? 14 : 16, lineHeight: 1.55, color: MUTED }}>{intro}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

// Ink card with rows: title, body, status chip on the right.
export function Rows({ rows, mobile }) {
  return (
    <div style={{ background: "#121212", border: "1px solid #1C1F26", borderRadius: 24, boxShadow: "var(--nl-shadow-card)", padding: mobile ? "6px 16px" : "6px 22px" }}>
      {rows.map((r, i) => (
        <div key={r.title} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 0", borderTop: i ? "1px solid #1F2733" : "none",
                                     flexDirection: mobile ? "column" : "row" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4, fontSize: 14, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700 }}>{r.title}</span>
            <span style={{ color: MUTED }}>{r.body}</span>
            {r.where && <span style={{ color: "#64748B", fontSize: 12 }}>{r.where}</span>}
          </div>
          <Chip s={r.s} />
        </div>
      ))}
    </div>
  );
}

export function Figures({ items, note, mobile }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : `repeat(${items.length}, 1fr)`, gap: 8 }}>
        {items.map((f) => (
          <div key={f.label} style={{ background: "#121212", border: "1px solid #1C1F26", borderRadius: 16, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: mobile ? 28 : 32, fontWeight: 700, lineHeight: 1.2 }}>{f.value}</span>
            <span style={{ fontSize: 12, lineHeight: 1.4, color: MUTED }}>{f.label}</span>
          </div>
        ))}
      </div>
      {note && <span style={{ fontSize: 12, lineHeight: 1.5, color: MUTED }}>{note}</span>}
    </div>
  );
}
