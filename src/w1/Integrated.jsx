// "Integrated with Nila" (Carst, 12 Nov): services that use Nila's data, under Built on Stellar. Hand-owned (no board).
// Logos are the partners' own files (public/w1/partners/), shown on a light tile so their own colours stay as they are.
const PARTNERS = [
  { name: "Open Supply Hub", href: "https://opensupplyhub.org/", logo: "/w1/partners/open-supply-hub.svg", ratio: 972.96 / 364.15 },
];

export default function Integrated({ mobile }) {
  return (
    <section style={{ position: "relative", overflow: "hidden", background: "#0A0A0A" }}>
      {/* the same faint grid as Built on Stellar above, so the two read as one band */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, backgroundSize: "48px 48px",
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)" }} />
      <div style={{ position: "relative", maxWidth: 1152, margin: "0 auto", padding: mobile ? "8px 16px 48px" : "0 24px 72px", boxSizing: "border-box",
                    display: "flex", flexDirection: mobile ? "column" : "row", alignItems: mobile ? "flex-start" : "center", gap: mobile ? 16 : 32 }}>
        <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700, lineHeight: 1.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", flexShrink: 0 }}>
          Integrated with Nila
        </h2>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 12 }}>
          {PARTNERS.map((p) => (
            <li key={p.name}>
              <a href={p.href} target="_blank" rel="noopener noreferrer" title={p.name}
                 style={{ height: 64, padding: "0 22px", borderRadius: 16, background: "#F1F5F9", display: "flex", alignItems: "center", boxSizing: "border-box" }}>
                <img src={p.logo} alt={p.name} height={32} width={Math.round(32 * p.ratio)} style={{ display: "block" }} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
