// "Coming soon" toast, bottom right, for pages not built yet (state: useComingSoon in util.js).
// Slides in from the right, slides out when `on` drops. Red = the landing's --color-red (#e69283, src/index.css);
// the W1 tokens have no red. Ink text on it is 8.6:1.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const RED = "#E69283";
const IN = [{ transform: "translateX(calc(100% + 24px))", opacity: 0 }, { transform: "translateX(0)", opacity: 1 }];
const EASE_IN = { duration: 420, easing: "cubic-bezier(.2,.7,.2,1)", fill: "both" };
const EASE_OUT = { duration: 300, easing: "cubic-bezier(.4,0,1,1)", fill: "both" };

// Portal to <body>: App wraps the home page in a transformed div, which would pin position:fixed to that div.
export default function ComingSoonChip({ on }) {
  const [shown, setShown] = useState(on);
  const el = useRef(null);

  useEffect(() => { if (on) setShown(true); }, [on]);

  useEffect(() => {
    const node = el.current;
    if (!node || !node.animate) { if (!on) setShown(false); return undefined; }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const a = node.animate(on ? IN : [...IN].reverse(), reduce ? { duration: 1, fill: "both" } : on ? EASE_IN : EASE_OUT);
    if (!on) a.onfinish = () => setShown(false);
    return () => { a.onfinish = null; };
  }, [on, shown]);

  if (!shown) return null;
  return createPortal(
    <div ref={el} className="w1" role="status" aria-live="polite"
         style={{ position: "fixed", right: 16, bottom: 16, zIndex: 1000, // above the slide-in pages (App overlay is 200)
                  display: "inline-flex", alignItems: "center", gap: 8, height: 44,
                  padding: "0 18px 0 14px", borderRadius: 12, background: RED, color: "var(--nl-surface-ink)",
                  boxShadow: "var(--nl-shadow-card)", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
      </svg>
      Coming soon
    </div>,
    document.body,
  );
}
