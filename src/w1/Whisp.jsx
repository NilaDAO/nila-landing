// /audit/whisp (Carst, 12 Nov): the FAO Whisp check of every land title, in two tables: the general result, and the
// plots where the EU deforestation regulation applies. Data: /audit/whisp.json, written by `npm run whisp`
// (scripts/audit/whisp.mjs): anonymised, no coordinates, title numbers, names or villages. Same frame as /audit.
import { useEffect, useState } from "react";
import "./w1.css";
import { W1Ctx } from "./ctx.js";
import PageNav from "./PageNav.jsx";
import MobileMenu from "./MobileMenu.jsx";
import DFooter from "./desktop/DFooter.jsx";
import MFooter from "./mobile/MFooter.jsx";
import ComingSoonChip from "./ComingSoonChip.jsx";
import { useIsMobile, useComingSoon, homeHref } from "./util.js";

const MUTED = "#94A3B8";
const card = { background: "#121212", border: "1px solid #1C1F26", borderRadius: 24, boxShadow: "var(--nl-shadow-card)", overflow: "hidden" };
const th = { textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, padding: "12px 18px", borderBottom: "1px solid #1F2733" };
const td = { fontSize: 14, padding: "11px 18px", borderBottom: "1px solid #1F2733" };
const DOT = { "no tree loss": "#D4CF5A", "tree loss": "#E69283", "no data": "#64748B" };

function Table({ head, rows, foot }) {
  return (
    <div style={card}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>{head.map((h, i) => <th key={h} style={{ ...th, textAlign: i ? "right" : "left" }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, k) => <tr key={k}>{r.map((c, i) => <td key={i} style={{ ...td, textAlign: i ? "right" : "left" }}>{c}</td>)}</tr>)}</tbody>
      </table>
      {foot && <p style={{ margin: 0, padding: "12px 18px", fontSize: 12, lineHeight: 1.55, color: MUTED }}>{foot}</p>}
    </div>
  );
}

const Result = ({ r }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    <span style={{ width: 8, height: 8, borderRadius: 9999, background: DOT[r] || MUTED }} />{r}
  </span>
);

export default function Whisp() {
  const mobile = useIsMobile();
  const [menu, setMenu] = useState(false);
  const [soon, comingSoon] = useComingSoon();
  const [w, setW] = useState(undefined); // undefined loading, null not run yet
  useEffect(() => {
    fetch("/audit/whisp.json").then((r) => (r.ok ? r.json() : null)).then((d) => setW(d?.plots_checked ? d : null)).catch(() => setW(null));
  }, []);
  const ctx = {
    openUnions: () => location.assign(homeHref("#unions")),
    toggleMenu: () => setMenu((v) => !v),
    closeNews: () => {},
    comingSoon: () => { setMenu(false); comingSoon(); },
  };
  const Footer = mobile ? MFooter : DFooter;
  const day = w ? new Date(w.checked_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
  const eudr = w ? w.rows.filter((r) => r.eudr_crops?.length) : [];
  const h2 = { margin: "0 0 4px", fontSize: mobile ? 18 : 19, fontWeight: 700, lineHeight: 1.3 };
  const sub = { margin: "0 0 12px", fontSize: mobile ? 13 : 14, lineHeight: 1.55, color: MUTED, maxWidth: 720 };

  return (
    <W1Ctx.Provider value={ctx}>
      <div className="w1" style={{ background: "#0A0A0A", minHeight: "100vh", overflowX: "hidden" }}>
        <div style={{ position: "relative", background: "radial-gradient(ellipse at 80% 0%, #171B22 0%, #0A0A0A 70%)" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, backgroundSize: "48px 48px",
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)" }} />
          <header style={{ position: "relative" }}>
            <PageNav mobile={mobile} />
            <div style={{ padding: mobile ? "28px 16px 24px" : "44px 48px 32px" }}>
              <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: mobile ? 10 : 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <img src="/w1/partners/whisp-white.svg" alt="Whisp" width={64} height={20} style={{ display: "block" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: MUTED }}>Audit · FAO Whisp</span>
                </span>
                <h1 style={{ margin: 0, fontSize: mobile ? 22 : 28, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em" }}>
                  {w ? `${w.no_tree_loss_since_2020} of ${w.plots_checked} plots: no tree loss since 2020` : "Every field, checked for tree loss"}
                </h1>
                <p style={{ margin: 0, maxWidth: 720, fontSize: mobile ? 14 : 15, lineHeight: 1.55, color: MUTED }}>
                  We send the boundary of every land title to FAO's Whisp (Open Foris), the open tool used for deforestation checks. It
                  compares each plot with satellite maps of tree cover loss since 31 December 2020. The check is private: no GeoIDs are
                  registered, and we publish only the result, never a location, a title number or a name.
                </p>
              </div>
            </div>
          </header>
        </div>
        {mobile && menu && <MobileMenu onClose={() => setMenu(false)} />}

        <main style={{ padding: mobile ? "8px 16px 64px" : "8px 48px 96px" }}>
          <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: mobile ? 28 : 36 }}>
            {w === null && (
              <p style={{ ...sub, color: "#F1F5F9" }}>The first check has not run yet. The results appear here as soon as it has.</p>
            )}
            {w && (
              <>
                <section>
                  <h2 style={h2}>All land titles</h2>
                  <p style={sub}>Checked {day}. Indicator: tree cover loss from 2021 on (Hansen Global Forest Change), any loss above 0 ha counts.</p>
                  <Table head={["Result", "Plots"]}
                         rows={[[<Result key="a" r="no tree loss" />, w.no_tree_loss_since_2020], [<Result key="b" r="tree loss" />, w.tree_loss_since_2020],
                                [<Result key="c" r="no data" />, w.no_data], [<b key="d">Checked</b>, <b key="e">{w.plots_checked}</b>]]}
                         foot="Test titles and revoked titles are not counted." />
                </section>
                <section>
                  <h2 style={h2}>Where the EU deforestation regulation applies</h2>
                  <p style={sub}>The EUDR covers seven commodities: {w.eudr_commodities}. A plot is in scope when a crop planned on it is one of them.</p>
                  {eudr.length ? (
                    <Table head={["#", "Result", "Area", "EUDR crop"]}
                           rows={eudr.map((r) => [r.n, <Result key={r.n} r={r.result} />, `${r.area_ha_band} ha`, r.eudr_crops.join(", ")])} />
                  ) : (
                    <div style={{ ...card, padding: "16px 18px" }}>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                        None. The crops on Nila's crop calendar (paddy, groundnut, sugarcane, banana, sesame, cassava, maize, pulses and fodder) are not EUDR commodities.
                        When a union that grows one of them joins, its plots are listed here with their result.
                      </p>
                    </div>
                  )}
                </section>
              </>
            )}
            <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
              Plain text: <a href="/audit/whisp.md" style={{ color: "#F1F5F9", textDecoration: "underline" }}>whisp.md</a> ·{" "}
              <a href="/audit/whisp.json" style={{ color: "#F1F5F9", textDecoration: "underline" }}>whisp.json</a> ·{" "}
              <a href={homeHref("/audit")} style={{ color: "#F1F5F9", textDecoration: "underline" }}>the full audit</a>
            </p>
          </div>
        </main>

        <Footer />
        <ComingSoonChip on={soon} />
      </div>
    </W1Ctx.Provider>
  );
}
