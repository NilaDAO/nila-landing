// "Integrated with Nila" (Carst, 12 Nov): services that use Nila's data. Sits first inside the Built on Stellar card
// (one shared card, patched into DStellar / MStellar by scripts/w1/post.py): partners on the left, a divider, then
// Built on Stellar and Build with Nila on the right. On phones it stacks above, with the divider underneath.
// Logos are the partners' own files (public/w1/partners/), on a light tile so their own colours stay.
const PARTNERS = [
  { name: "Open Supply Hub", href: "https://opensupplyhub.org/production-locations/IN20263167FRTM7", logo: "/w1/partners/open-supply-hub.svg", ratio: 972.96 / 364.15 },
];

export default function Integrated({ mobile }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", boxSizing: "border-box",
                  ...(mobile ? { flex: "1 1 100%", paddingBottom: 20, borderBottom: "1px solid #1F2733" }
                             : { flex: "0 0 auto", paddingRight: 24, borderRight: "1px solid #1F2733", alignSelf: "stretch" }) }}>
      <h2 style={{ margin: 0, fontSize: 12, fontWeight: 700, lineHeight: 1.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8" }}>
        Integrated with Nila
      </h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 12 }}>
        {PARTNERS.map((p) => (
          <li key={p.name}>
            <a href={p.href} target="_blank" rel="noopener noreferrer" title={p.name}
               style={{ height: 44, padding: "0 16px", borderRadius: 12, background: "#F1F5F9", display: "flex", alignItems: "center", boxSizing: "border-box" }}>
              <img src={p.logo} alt={p.name} height={24} width={Math.round(24 * p.ratio)} style={{ display: "block" }} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
