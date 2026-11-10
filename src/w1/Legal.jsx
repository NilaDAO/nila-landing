// /privacy, /terms, /risk in the W1 style: the /audit nav, header and footer around the unchanged policy text
// (src/components/sections/Legal*.jsx). The text reads its colours from CSS variables, re-set here to W1 tokens.
import { useState } from "react";
import "./w1.css";
import { W1Ctx } from "./ctx.js";
import PageNav from "./PageNav.jsx";
import MobileMenu from "./MobileMenu.jsx";
import DFooter from "./desktop/DFooter.jsx";
import MFooter from "./mobile/MFooter.jsx";
import ComingSoonChip from "./ComingSoonChip.jsx";
import { useIsMobile, useComingSoon, homeHref } from "./util.js";
import { PrivacyBody } from "../components/sections/LegalPrivacy.jsx";
import { TermsBody } from "../components/sections/LegalTerms.jsx";
import { RiskBody } from "../components/sections/LegalRiskDisclosure.jsx";

const PAGES = {
  "/privacy": { title: "Privacy Policy", Body: PrivacyBody },
  "/terms": { title: "Terms of Use", Body: TermsBody },
  "/risk": { title: "Risk Disclosure", Body: RiskBody },
};
const OTHERS = Object.entries(PAGES);

const TOKENS = { "--color-text-soft": "#94A3B8", "--color-text-on-dark": "#F1F5F9", "--color-accent": "#F1F5F9" };

export default function Legal({ path }) {
  const { title, Body } = PAGES[path];
  const mobile = useIsMobile();
  const [menu, setMenu] = useState(false);
  const [soon, comingSoon] = useComingSoon();
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
          <header style={{ position: "relative" }}>
            <PageNav mobile={mobile} />
            <div style={{ padding: mobile ? "40px 16px 40px" : "72px 48px 64px" }}>
              <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: mobile ? 16 : 20 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8" }}>Legal</span>
                <h1 style={{ margin: 0, fontSize: mobile ? 40 : 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{title}</h1>
                <p style={{ margin: 0, fontSize: 14, color: "#94A3B8" }}>Last updated: 1 February 2026</p>
                <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {OTHERS.map(([href, p]) => (
                    <a key={href} href={homeHref(href)} aria-current={href === path ? "page" : undefined}
                       style={{ height: 36, padding: "0 14px", borderRadius: 9999, display: "inline-flex", alignItems: "center", fontSize: 14, fontWeight: 700,
                                background: href === path ? "#F1F5F9" : "#1F2733", color: href === path ? "#0A0A0A" : "#F1F5F9" }}>{p.title}</a>
                  ))}
                </nav>
              </div>
            </div>
          </header>
        </div>
        {mobile && menu && <MobileMenu onClose={() => setMenu(false)} />}

        <main className="w1-legal" style={{ ...TOKENS, padding: mobile ? "8px 16px 64px" : "16px 48px 96px" }}>
          <div style={{ maxWidth: 1152, margin: "0 auto" }}>
            <article style={{ maxWidth: 760 }}><Body /></article>
          </div>
        </main>

        <Footer />
        <ComingSoonChip on={soon} />
      </div>
    </W1Ctx.Provider>
  );
}
