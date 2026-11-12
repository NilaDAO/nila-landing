// /audit in the W1 style: the home page's nav and footer around facts.md. No board for this page in nila-design;
// it reuses the W1 tokens and patterns (hero gradient + grid, raised chips, ink cards, footer).
import { useEffect, useState } from "react";
import "./w1.css";
import { W1Ctx } from "./ctx.js";
import PageNav from "./PageNav.jsx";
import MobileMenu from "./MobileMenu.jsx";
import DFooter from "./desktop/DFooter.jsx";
import MFooter from "./mobile/MFooter.jsx";
import FactsMarkdown from "./FactsMarkdown.jsx";
import ComingSoonChip from "./ComingSoonChip.jsx";
import { useIsMobile, useComingSoon, homeHref, headings } from "./util.js";

const FILES = [
  { href: "/audit/facts.txt", name: "facts.md", what: "This page as plain text" },
  { href: "/audit/snapshot.json", name: "snapshot.json", what: "Every value the last refresh read" },
];

function Header({ mobile }) {
  return (
    <header style={{ padding: mobile ? "40px 16px 48px" : "72px 48px 80px" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: mobile ? 16 : 24 }}>
        <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", height: 24, padding: "0 8px", borderRadius: 9999, background: "#1F2733",
                       fontSize: 12, fontWeight: 700, color: "#F1F5F9", whiteSpace: "nowrap" }}>
          <span style={{ width: 7, height: 7, borderRadius: 9999, background: "#D4CF5A", marginRight: 6, display: "inline-block", animation: "nlLive 1.8s ease-out infinite" }} />
          Read from Polygon and Stellar mainnet
        </span>
        <h1 style={{ margin: 0, fontSize: mobile ? 40 : 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>Audit fact sheet</h1>
        <p style={{ margin: 0, maxWidth: 680, fontSize: mobile ? 16 : 20, lineHeight: 1.5, color: "#94A3B8" }}>
          Every figure Nila publishes that has a checkable source, with the evidence next to it. Paste{" "}
          <a href="/audit/facts.txt" target="_blank" rel="noopener noreferrer" style={{ color: "#F1F5F9", textDecoration: "underline" }}>facts.md</a>{" "}
          into any AI and ask it to find what does not add up.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)", gap: 8, marginTop: mobile ? 8 : 16 }}>
          {FILES.map((f) => (
            <a key={f.name} href={f.href} download={f.name === "facts.md" ? undefined : f.name} target={f.name === "facts.md" ? "_blank" : undefined}
               rel="noopener noreferrer"
               style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 16, background: "#121212", border: "1px solid #1F2733" }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: "#1F2733", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4CF5A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12M6 10l6 6 6-6M5 20h14" /></svg>
              </span>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{f.name}</span>
                <span style={{ fontSize: 12, color: "#94A3B8" }}>{f.what}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

function Toc({ items, active }) {
  return (
    <nav aria-label="Sections" style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 8 }}>On this page</span>
      {items.map((h) => (
        <a key={h.id} href={`#${h.id}`}
           onClick={(e) => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); history.replaceState(null, "", `#${h.id}`); }}
           style={{ fontSize: 13, lineHeight: 1.4, padding: "6px 10px", borderRadius: 8, color: active === h.id ? "#F1F5F9" : "#94A3B8",
                    background: active === h.id ? "#1F2733" : "transparent" }}>{h.title}</a>
      ))}
    </nav>
  );
}

function useActiveHeading(ids) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!ids.length) return undefined;
    const io = new IntersectionObserver((es) => {
      const vis = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: "0px 0px -70% 0px" });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  return active;
}

export default function Audit() {
  const mobile = useIsMobile();
  const [menu, setMenu] = useState(false);
  const [soon, comingSoon] = useComingSoon();
  const [text, setText] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/audit/facts.txt")
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((t) => { if (/^\s*<!doctype/i.test(t)) throw new Error("got the app page"); return t; }) // a host rewrite, not the file
      .then((t) => setText(t.replace(/<!--[\s\S]*?-->\n?/g, ""))) // hide the generator's block markers
      .catch(() => setError(true));
  }, []);

  const toc = text ? headings(text) : [];
  const active = useActiveHeading(mobile ? [] : toc.map((h) => h.id));

  // Arriving with #section: scroll once the text is in.
  useEffect(() => {
    if (text && location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start" });
  }, [text]);

  const ctx = {
    openUnions: () => location.assign(homeHref("#unions")),
    toggleMenu: () => setMenu((v) => !v),
    closeNews: () => {},
    comingSoon: () => { setMenu(false); comingSoon(); },
  };
  const Footer = mobile ? MFooter : DFooter;

  return (
    <W1Ctx.Provider value={ctx}>
      <div className="w1" style={{ background: "#0A0A0A", minHeight: "100vh", overflowX: "hidden" }}>
        <div style={{ position: "relative", background: "radial-gradient(ellipse at 80% 0%, #171B22 0%, #0A0A0A 70%)" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, backgroundSize: "48px 48px",
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)" }} />
          <div style={{ position: "relative" }}>
            <PageNav mobile={mobile} />
            <Header mobile={mobile} />
          </div>
        </div>
        {mobile && menu && <MobileMenu onClose={() => setMenu(false)} />}

        <main style={{ padding: mobile ? "8px 16px 64px" : "16px 48px 96px" }}>
          <div style={{ maxWidth: 1152, margin: "0 auto", display: mobile ? "block" : "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: 64, alignItems: "start" }}>
            {!mobile && <Toc items={toc} active={active} />}
            <article style={{ minWidth: 0, maxWidth: 820 }}>
              {error && <p style={{ color: "#94A3B8" }}>Could not load facts.md. It is also at <a href="/audit/facts.txt" style={{ textDecoration: "underline" }}>/audit/facts.txt</a>.</p>}
              {!error && text === null && <p style={{ color: "#94A3B8" }}>Loading facts.md…</p>}
              {text !== null && <FactsMarkdown text={text} mobile={mobile} />}
            </article>
          </div>
        </main>

        <Footer />
        <ComingSoonChip on={soon} />
      </div>
    </W1Ctx.Provider>
  );
}
