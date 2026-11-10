// W1 — nila.land home (dev/nila-design page 6: LandHome / LandHomeMobile).
// Desktop and mobile are separate boards, so they are separate section sets; one switch picks the set.
import { Component, lazy, Suspense, useEffect, useState } from "react";
import "./w1.css";
import { W1Ctx } from "./ctx.js";
import MobileMenu from "./MobileMenu.jsx";
import { useIsMobile, useComingSoon } from "./util.js";
import ComingSoonChip from "./ComingSoonChip.jsx";

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
  const [soon, comingSoon] = useComingSoon();
  // Arriving from another page (/audit) with #nusd, #how, #faq or #unions.
  useEffect(() => {
    const id = location.hash.slice(1);
    if (id === "unions") { onOpenUnions(); return; }
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 300);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const ctx = {
    openUnions: () => { setMenu(false); onOpenUnions(); },
    toggleMenu: () => setMenu((v) => !v),
    closeNews: () => setNews(false),
    comingSoon: () => { setMenu(false); comingSoon(); },
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
        <ComingSoonChip on={soon} />
      </div>
    </W1Ctx.Provider>
  );
}
