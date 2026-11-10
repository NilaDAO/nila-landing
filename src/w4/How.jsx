// W4 — /how (dev/nila-design page 6: LandHow / LandHowMobile). Built section by section (Carst, 10 Nov):
// the satellite section first; the AI plan, the member's year and the yield story wait for new copy.
// The board's "How it works" title is replaced by "Sow in season" (Carst, 10 Nov). From the home page it slides in like Meet the unions
// (onBack set: the logo becomes a back button); at /how it is a plain page.
import { useState } from "react";
import "../w1/w1.css";
import { W1Ctx } from "../w1/ctx.js";
import PageNav from "../w1/PageNav.jsx";
import MobileMenu from "../w1/MobileMenu.jsx";
import ComingSoonChip from "../w1/ComingSoonChip.jsx";
import DFooter from "../w1/desktop/DFooter.jsx";
import MFooter from "../w1/mobile/MFooter.jsx";
import { useIsMobile, useComingSoon, homeHref } from "../w1/util.js";
import DSat from "./DSat.jsx";
import MSat from "./MSat.jsx";

// Page title: Avvaiyar's "paruvatthē payir sey" (Carst, 10 Nov). Tamil and source to be checked by Anand / a union leader.
function Title({ mobile }) {
  return (
    <header style={{ padding: mobile ? "32px 0 8px" : "56px 0 8px" }}>
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: mobile ? "0 16px" : "0 24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 12 }}>
        <span lang="ta" style={{ fontSize: mobile ? 16 : 18, fontWeight: 700, color: "#94A3B8" }}>பருவத்தே பயிர் செய்</span>
        <h1 style={{ margin: 0, fontSize: mobile ? 40 : 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}>Sow in season.</h1>
        <span style={{ fontSize: 12, color: "#94A3B8" }}>Avvaiyar</span>
      </div>
    </header>
  );
}

export default function How({ onBack, onOpenUnions }) {
  const mobile = useIsMobile();
  const [menu, setMenu] = useState(false);
  const [soon, comingSoon] = useComingSoon();
  const ctx = {
    openUnions: onOpenUnions || (() => location.assign(homeHref("#unions"))),
    back: onBack || null,
    toggleMenu: () => setMenu((v) => !v),
    closeNews: () => {},
    comingSoon: () => { setMenu(false); comingSoon(); },
  };
  const [Sat, Footer] = mobile ? [MSat, MFooter] : [DSat, DFooter];

  return (
    <W1Ctx.Provider value={ctx}>
      <div className="w1" style={{ background: "#0A0A0A", minHeight: "100vh", overflowX: "hidden" }}>
        <PageNav mobile={mobile} />
        {mobile && menu && <MobileMenu onClose={() => setMenu(false)} />}
        <Title mobile={mobile} />
        <Sat />
        <Footer />
        <ComingSoonChip on={soon} />
      </div>
    </W1Ctx.Provider>
  );
}
