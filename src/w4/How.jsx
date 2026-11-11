// W4 — /how as one ring diagram (design board W4b; handoffs/Claude_Code_Prompt_W4_Rings.md). Copy: public/how/how.json.
// From the home page it slides in like Meet the unions (onBack set: the logo becomes a back button); at /how it is a plain page.
// The hash keeps the state: /how#impact-capital, #technical-seen; a bare tab (#climate) opens its first category.
import { useEffect, useState } from "react";
import "../w1/w1.css";
import { W1Ctx } from "../w1/ctx.js";
import PageNav from "../w1/PageNav.jsx";
import MobileMenu from "../w1/MobileMenu.jsx";
import ComingSoonChip from "../w1/ComingSoonChip.jsx";
import DFooter from "../w1/desktop/DFooter.jsx";
import MFooter from "../w1/mobile/MFooter.jsx";
import { useIsMobile, useComingSoon, homeHref } from "../w1/util.js";
import { RingCard, SideNav, TopNav } from "./HowRings.jsx";
import { loadHowData, loadSnapshot, liveNumbers } from "./howData.js";
import DSat from "./DSat.jsx";
import MSat from "./MSat.jsx";

// Start both fetches as soon as this chunk loads (App preloads it), so the page is filled when it slides in.
loadHowData();
loadSnapshot();

function fromHash(data, hash) {
  const [t, ...rest] = hash.replace(/^#/, "").split("-");
  const tab = data.tabs.find((x) => x.key === t) || data.tabs[0];
  const cat = tab.categories.find((c) => c.key === rest.join("-")) || tab.categories[0];
  return [tab.key, cat.key];
}

export default function How({ onBack, onOpenUnions }) {
  const mobile = useIsMobile();
  const [menu, setMenu] = useState(false);
  const [soon, comingSoon] = useComingSoon();
  const [data, setData] = useState(null);
  const [nums, setNums] = useState(null);
  const [sel, setSel] = useState(null); // [tabKey, catKey]

  useEffect(() => {
    loadHowData().then((d) => { if (d) { setData(d); setSel(fromHash(d, location.hash)); } });
    loadSnapshot().then((s) => setNums(liveNumbers(s)));
  }, []);
  useEffect(() => {
    if (!data) return undefined;
    const on = () => setSel(fromHash(data, location.hash));
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, [data]);

  const go = (t, c) => {
    const [tk, ck] = fromHash(data, c ? `${t}-${c}` : t);
    setSel([tk, ck]);
    history.replaceState(null, "", `${location.pathname}${location.search}#${tk}-${ck}`);
  };

  const ctx = {
    openUnions: onOpenUnions || (() => location.assign(homeHref("#unions"))),
    back: onBack || null,
    toggleMenu: () => setMenu((v) => !v),
    closeNews: () => {},
    comingSoon: () => { setMenu(false); comingSoon(); },
  };
  const Footer = mobile ? MFooter : DFooter;
  const tab = data && sel && data.tabs.find((t) => t.key === sel[0]);
  const cat = tab && tab.categories.find((c) => c.key === sel[1]);

  return (
    <W1Ctx.Provider value={ctx}>
      <div className="w1" style={{ background: "#0A0A0A", minHeight: "100vh", overflowX: "hidden" }}>
        <PageNav mobile={mobile} current="How it works" />
        {mobile && menu && <MobileMenu onClose={() => setMenu(false)} />}

        <section style={{ background: "#0E1014" }}>
          <div style={{ maxWidth: 1152, margin: "0 auto", padding: mobile ? "28px 16px 16px" : "44px 24px 24px", boxSizing: "border-box",
                        display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8" }}>How it works</span>
            {/* two lines reserved, so the card never jumps when the title changes */}
            <h1 style={{ margin: 0, minHeight: mobile ? 56 : 70, fontSize: mobile ? 22 : 28, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
              {tab?.title}
            </h1>
          </div>
        </section>

        <section style={{ background: "#0A0A0A" }}>
          {tab && cat && (mobile ? (
            <div style={{ padding: "16px 0 64px", display: "flex", flexDirection: "column", gap: 16 }}>
              <TopNav data={data} tab={tab} cat={cat} go={go} />
              <div style={{ padding: "0 16px" }}><RingCard tab={tab} cat={cat} nums={nums} mobile /></div>
            </div>
          ) : (
            <div style={{ maxWidth: 1152, margin: "0 auto", padding: "24px 24px 96px", boxSizing: "border-box", display: "flex", gap: 32 }}>
              <SideNav data={data} tab={tab} cat={cat} go={go} />
              <div style={{ flex: 1, minWidth: 0 }}><RingCard tab={tab} cat={cat} nums={nums} /></div>
            </div>
          ))}
        </section>

        {tab?.key === "technical" && (mobile ? <MSat /> : <DSat />)}

        <Footer />
        <ComingSoonChip on={soon} />
      </div>
    </W1Ctx.Provider>
  );
}
