// Mobile menu behind the board's Menu button. Not drawn on W1 mobile (design gap, see the lane plan):
// it lists the desktop navbar links with the shared List row look (ink card, raised rows, radius 12).
import { A } from "./links.jsx";

const ITEMS = ["nUSD", "Harvests", "How it works", "FAQ", "Meet the unions"];

export default function MobileMenu({ onClose }) {
  return (
    <div role="dialog" aria-label="Menu" onClick={onClose}
         style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)" }}>
      <nav onClick={(e) => e.stopPropagation()}
           style={{ position: "absolute", top: 8, left: 8, right: 8, padding: 18, borderRadius: 24, background: "var(--nl-surface-ink)",
                    border: "1px solid #1C1F26", boxShadow: "var(--nl-shadow-card)", display: "flex", flexDirection: "column", gap: 8 }}>
        {ITEMS.map((l) => (
          <A key={l} k="#" label={l}
             style={{ height: 44, padding: "0 14px", borderRadius: 12, background: "var(--nl-surface-raised)", display: "flex", alignItems: "center",
                      fontSize: 14, fontWeight: 700, color: "var(--nl-text)" }}>
            <span onClick={onClose} style={{ flex: 1 }}>{l}</span>
          </A>
        ))}
      </nav>
    </div>
  );
}
