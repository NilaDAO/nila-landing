// W1 — nila.land home (dev/nila-design page 6: LandHome / LandHomeMobile).
// Desktop and mobile are separate boards, so they are separate section sets; one switch picks the set.
import { Component, lazy, Suspense, useEffect, useState } from "react";
import "./w1.css";
import { W1Ctx } from "./ctx.js";
import MobileMenu from "./MobileMenu.jsx";

import DNews from "./desktop/DNews.jsx";
import DHero from "./desktop/DHero.jsx";
import DMetrics from "./desktop/DMetrics.jsx";
import DOffers from "./desktop/DOffers.jsx";
import DWave1 from "./desktop/DWave1.jsx";
import DYear from "./desktop/DYear.jsx";
import DPackage from "./desktop/DPackage.jsx";
import DWave2 from "./desktop/DWave2.jsx";
import DTrust from "./desktop/DTrust.jsx";
import DWave3 from "./desktop/DWave3.jsx";
import DStellar from "./desktop/DStellar.jsx";
import DBacked from "./desktop/DBacked.jsx";
import DHow from "./desktop/DHow.jsx";
import DGlobeWave from "./desktop/DGlobeWave.jsx";
import DFaq from "./desktop/DFaq.jsx";
import DFooter from "./desktop/DFooter.jsx";

import MNews from "./mobile/MNews.jsx";
import MHero from "./mobile/MHero.jsx";
import MMetrics from "./mobile/MMetrics.jsx";
import MOffers from "./mobile/MOffers.jsx";
import MWave1 from "./mobile/MWave1.jsx";
import MYear from "./mobile/MYear.jsx";
import MPackage from "./mobile/MPackage.jsx";
import MWave2 from "./mobile/MWave2.jsx";
import MTrust from "./mobile/MTrust.jsx";
import MWave3 from "./mobile/MWave3.jsx";
import MStellar from "./mobile/MStellar.jsx";
import MBacked from "./mobile/MBacked.jsx";
import MHow from "./mobile/MHow.jsx";
import MGlobeWave from "./mobile/MGlobeWave.jsx";
import MFaq from "./mobile/MFaq.jsx";
import MFooter from "./mobile/MFooter.jsx";

const W1Globe = lazy(() => import("./W1Globe.jsx"));

// Below this width the 390 board is used; the desktop board is fluid (max-width 1152) above it.
const MOBILE_QUERY = "(max-width: 899px)";

function useIsMobile() {
  const [m, setM] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

// No WebGL (old phones, some browsers): drop the globe, keep the page.
class GlobeGuard extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

// Board band "Globe (three.js) as now; union markers in white" → W1Globe (lazy: three.js is heavy).
function GlobeSection({ mobile }) {
  return <GlobeGuard><Suspense fallback={<div style={{ height: mobile ? 300 : 520, background: "#0A0A0A" }} />}><W1Globe mobile={mobile} /></Suspense></GlobeGuard>;
}

const Anchor = ({ id }) => <span id={id} style={{ display: "block", position: "relative", top: -8 }} />;

export default function Home({ onOpenUnions }) {
  const mobile = useIsMobile();
  const [news, setNews] = useState(true);
  const [menu, setMenu] = useState(false);
  const [soon, setSoon] = useState(0); // "Coming soon" chip, bottom right, for pages not built yet
  useEffect(() => {
    if (!soon) return undefined;
    const t = setTimeout(() => setSoon(0), 2500);
    return () => clearTimeout(t);
  }, [soon]);
  const ctx = {
    openUnions: () => { setMenu(false); onOpenUnions(); },
    toggleMenu: () => setMenu((v) => !v),
    closeNews: () => setNews(false),
    comingSoon: () => { setMenu(false); setSoon(Date.now()); },
  };

  const S = mobile
    ? { News: MNews, Hero: MHero, Metrics: MMetrics, Offers: MOffers, Wave1: MWave1, Year: MYear, Package: MPackage, Wave2: MWave2, Trust: MTrust, Wave3: MWave3, Stellar: MStellar, Backed: MBacked, How: MHow, GlobeWave: MGlobeWave, Faq: MFaq, Footer: MFooter }
    : { News: DNews, Hero: DHero, Metrics: DMetrics, Offers: DOffers, Wave1: DWave1, Year: DYear, Package: DPackage, Wave2: DWave2, Trust: DTrust, Wave3: DWave3, Stellar: DStellar, Backed: DBacked, How: DHow, GlobeWave: DGlobeWave, Faq: DFaq, Footer: DFooter };

  return (
    <W1Ctx.Provider value={ctx}>
      <div className="w1" style={{ background: "#0A0A0A", minHeight: "100vh", overflowX: "hidden" }}>
        {news && <S.News />}
        <S.Hero />
        {mobile && menu && <MobileMenu onClose={() => setMenu(false)} />}
        <S.Metrics />
        <Anchor id="nusd" />
        <S.Offers />
        <S.Wave1 />
        <S.Year />
        <S.Package />
        <S.Wave2 />
        <S.Trust />
        <S.Wave3 />
        <S.Stellar />
        <S.Backed />
        <Anchor id="how" />
        <S.How />
        <GlobeSection mobile={mobile} />
        <S.GlobeWave />
        <Anchor id="faq" />
        <S.Faq />
        <S.Footer />
        {soon > 0 && (
          <div role="status" aria-live="polite"
               style={{ position: "fixed", right: 16, bottom: 16, zIndex: 60, display: "inline-flex", alignItems: "center", height: 32,
                        padding: "0 14px", borderRadius: 9999, background: "var(--nl-surface-raised)", border: "1px solid #2A3442",
                        boxShadow: "var(--nl-shadow-card)", fontSize: 12, fontWeight: 700, color: "var(--nl-text)" }}>
            Coming soon
          </div>
        )}
      </div>
    </W1Ctx.Provider>
  );
}
