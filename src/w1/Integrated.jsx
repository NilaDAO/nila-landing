// "Integrated with Nila" (Carst, 12 Nov): services that use Nila's data. Sits next to the Built on Stellar card, inside
// that section's row, and wraps under it when the row is too narrow (patched into DStellar / MStellar by
// scripts/w1/post.py). Logos are the partners' own files (public/w1/partners/), drawn white on the same tile as the
// Build with Nila button (#1F2733, 44 px, radius 12), Carst 12 Nov.
const PARTNERS = [
  { name: "Open Supply Hub", href: "https://opensupplyhub.org/production-locations/IN20263167FRTM7", logo: "/w1/partners/open-supply-hub.svg", ratio: 972.96 / 364.15 },
];

export default function Integrated() {
  return (
    <div style={{ flex: "1 0 auto", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", padding: "22px 24px", borderRadius: 24,
                  background: "#121212", border: "1px solid #1C1F26", boxShadow: "rgba(0,0,0,0.15) 0 12px 10px 0, rgba(0,0,0,0.06) 0 5px 12px 2px", boxSizing: "border-box" }}>
      <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700, lineHeight: 1.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8" }}>
        Integrated with Nila
      </h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 12 }}>
        {PARTNERS.map((p) => (
          <li key={p.name}>
            <a href={p.href} target="_blank" rel="noopener noreferrer" title={p.name}
               style={{ height: 44, padding: "0 18px", borderRadius: 12, background: "#1F2733", display: "flex", alignItems: "center", boxSizing: "border-box" }}>
              <img src={p.logo} alt={p.name} height={24} width={Math.round(24 * p.ratio)} style={{ display: "block", filter: "brightness(0) invert(1)" }} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
