// FAQ answers inside the W1 FAQ card (DFaq / MFaq, patched in by scripts/w1/post.py). One open at a time; the row keeps
// the board's look (52 px row, chevron), the answer opens under it. Text: ./faq.js.
import { useState } from "react";
import { FAQ } from "./faq.js";

export default function FaqList() {
  const [open, setOpen] = useState(-1);
  return FAQ.map(([q, a], i) => {
    const on = open === i;
    return (
      <div key={q} style={{ borderTop: i ? "1px solid #1F2733" : "none" }}>
        <h3 style={{ margin: 0 }}>
          <button type="button" aria-expanded={on} aria-controls={`faq-a${i}`} id={`faq-q${i}`} onClick={() => setOpen(on ? -1 : i)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, minHeight: 52, padding: "8px 0", boxSizing: "border-box",
                           background: "none", border: 0, color: "#F1F5F9", font: "inherit", fontSize: 14, lineHeight: 1.5, fontWeight: 700,
                           textAlign: "left", cursor: "pointer" }}>
            <span style={{ flex: 1, minWidth: 0 }}>{q}</span>
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                 style={{ flexShrink: 0, transition: "transform .25s", transform: on ? "rotate(180deg)" : "none" }}><path d="m6 9 6 6 6-6" /></svg>
          </button>
        </h3>
        <div id={`faq-a${i}`} role="region" aria-labelledby={`faq-q${i}`}
             style={{ display: "grid", gridTemplateRows: on ? "1fr" : "0fr", transition: "grid-template-rows .3s cubic-bezier(.2,.7,.2,1)" }}>
          <div style={{ overflow: "hidden" }} inert={on ? undefined : true}>
            <p style={{ margin: 0, padding: "0 32px 16px 0", fontSize: 14, lineHeight: 1.6, color: "#CBD5E1" }}>{a}</p>
          </div>
        </div>
      </div>
    );
  });
}
