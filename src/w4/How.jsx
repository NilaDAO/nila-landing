// W4 — /how (dev/nila-design page 6: LandHow / LandHowMobile). Built section by section (Carst, 10 Nov):
// the satellite section first; the AI plan, the member's year and the yield story wait for new copy.
// No page title: "Sow in season" sits on the home page's How it works section (Carst, 10 Nov). From the home page it slides in like Meet the unions
// (onBack set: the logo becomes a back button); at /how it is a plain page.
import { useEffect, useState } from "react";
import "../w1/w1.css";
import { W1Ctx } from "../w1/ctx.js";
import PageNav from "../w1/PageNav.jsx";
import MobileMenu from "../w1/MobileMenu.jsx";
import ComingSoonChip from "../w1/ComingSoonChip.jsx";
import DFooter from "../w1/desktop/DFooter.jsx";
import MFooter from "../w1/mobile/MFooter.jsx";
import { useIsMobile, useComingSoon, homeHref } from "../w1/util.js";
import Impact from "./Impact.jsx";
import Technical from "./Technical.jsx";
import Climate from "./Climate.jsx";

// Three tabs, one per reader (Carst, 10 Nov; docs/W4_frame.md). The hash picks the tab: /how#technical.
const TABS = [["impact", "Impact", Impact], ["technical", "Technical", Technical], ["climate", "Climate", Climate]];
const fromHash = (h) => (TABS.some(([k]) => k === h.slice(1)) ? h.slice(1) : "impact");

// Desktop: tabs stacked in a left column, under the back button (Carst, 10 Nov), sticky while the content scrolls.
// Mobile: one segmented row under the nav.
function TabBar({ tab, setTab, mobile }) {
  const btn = (k) => ({ height: 40, padding: "0 14px", border: 0, borderRadius: 10, cursor: "pointer", font: "inherit", fontSize: 14, fontWeight: 700,
                        textAlign: "left", background: tab === k ? "#1F2733" : "transparent", color: tab === k ? "#F1F5F9" : "#94A3B8" });
  if (mobile) {
    return (
      <div role="tablist" aria-label="How it works" style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", gap: 2, padding: 2, borderRadius: 12, background: "#121212", boxShadow: "inset 0 0 0 1px #1F2733" }}>
          {TABS.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={{ ...btn(k), flex: 1, textAlign: "center" }}>{label}</button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div role="tablist" aria-orientation="vertical" aria-label="How it works"
         style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 2, padding: 2, borderRadius: 12,
                  background: "#121212", boxShadow: "inset 0 0 0 1px #1F2733" }}>
      {TABS.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={btn(k)}>{label}</button>
      ))}
    </div>
  );
}

export default function How({ onBack, onOpenUnions }) {
  const mobile = useIsMobile();
  const [menu, setMenu] = useState(false);
  const [soon, comingSoon] = useComingSoon();
  const [tab, setTabState] = useState(() => fromHash(location.hash));
  const setTab = (k) => { setTabState(k); history.replaceState(null, "", `${location.pathname}${location.search}#${k}`); };
  useEffect(() => {
    const on = () => setTabState(fromHash(location.hash));
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const ctx = {
    openUnions: onOpenUnions || (() => location.assign(homeHref("#unions"))),
    back: onBack || null,
    toggleMenu: () => setMenu((v) => !v),
    closeNews: () => {},
    comingSoon: () => { setMenu(false); comingSoon(); },
  };
  const Footer = mobile ? MFooter : DFooter;
  const Tab = TABS.find(([k]) => k === tab)[2];

  return (
    <W1Ctx.Provider value={ctx}>
      <div className="w1" style={{ background: "#0A0A0A", minHeight: "100vh", overflowX: "hidden" }}>
        <PageNav mobile={mobile} />
        {mobile && menu && <MobileMenu onClose={() => setMenu(false)} />}
        {mobile ? (
          <><TabBar tab={tab} setTab={setTab} mobile /><Tab mobile /></>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "160px minmax(0, 1fr)", gap: 8, padding: "48px 0 0 48px", alignItems: "start" }}>
            <TabBar tab={tab} setTab={setTab} />
            <div style={{ minWidth: 0, marginTop: -48 }}><Tab /></div>
          </div>
        )}
        <Footer />
        <ComingSoonChip on={soon} />
      </div>
    </W1Ctx.Provider>
  );
}
