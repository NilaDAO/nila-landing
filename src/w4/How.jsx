// W4 — /how (dev/nila-design page 6: LandHow / LandHowMobile). Built section by section (Carst, 10 Nov):
// the satellite section first; the AI plan, the member's year and the yield story wait for new copy.
// No page title: "Sow in season" sits on the home page's How it works section (Carst, 10 Nov). From the home page it slides in like Meet the unions
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
        <Sat />
        <Footer />
        <ComingSoonChip on={soon} />
      </div>
    </W1Ctx.Provider>
  );
}
