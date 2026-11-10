// W4 — /how (dev/nila-design page 6: LandHow / LandHowMobile). Built section by section (Carst, 10 Nov):
// the satellite section first; the AI plan, the member's year and the yield story wait for new copy.
import { useState } from "react";
import "../w1/w1.css";
import { W1Ctx } from "../w1/ctx.js";
import PageNav from "../w1/PageNav.jsx";
import MobileMenu from "../w1/MobileMenu.jsx";
import ComingSoonChip from "../w1/ComingSoonChip.jsx";
import DFooter from "../w1/desktop/DFooter.jsx";
import MFooter from "../w1/mobile/MFooter.jsx";
import { useIsMobile, useComingSoon, homeHref } from "../w1/util.js";
import DTop from "./DTop.jsx";
import MTop from "./MTop.jsx";
import DSat from "./DSat.jsx";
import MSat from "./MSat.jsx";

export default function How() {
  const mobile = useIsMobile();
  const [menu, setMenu] = useState(false);
  const [soon, comingSoon] = useComingSoon();
  const ctx = {
    openUnions: () => location.assign(homeHref("#unions")),
    toggleMenu: () => setMenu((v) => !v),
    closeNews: () => {},
    comingSoon: () => { setMenu(false); comingSoon(); },
  };
  const [Top, Sat, Footer] = mobile ? [MTop, MSat, MFooter] : [DTop, DSat, DFooter];

  return (
    <W1Ctx.Provider value={ctx}>
      <div className="w1" style={{ background: "#0A0A0A", minHeight: "100vh", overflowX: "hidden" }}>
        <div style={{ background: "#0E1014" }}><PageNav mobile={mobile} /></div>
        {mobile && menu && <MobileMenu onClose={() => setMenu(false)} />}
        <Top />
        <Sat />
        <Footer />
        <ComingSoonChip on={soon} />
      </div>
    </W1Ctx.Provider>
  );
}
