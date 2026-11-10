// /how — Impact tab (Carst, 10 Nov): five measures — Food, Income, Women's land, Independence, Her voice — from
// /impact/impact.json (hardcoded now, later written by a scheduled job), then food per crop, then the health line
// read live from /audit/snapshot.json. Land health lives under Climate.
import { useEffect, useState } from "react";
import { Section, Figures } from "./ui.jsx";
import ImpactMeters from "./ImpactMeters.jsx";
import FoodByCrop from "./FoodByCrop.jsx";

const useJson = (url) => {
  const [s, setS] = useState(null);
  useEffect(() => { fetch(url).then((r) => (r.ok ? r.json() : null)).then(setS).catch(() => {}); }, [url]);
  return s;
};

// Design preview only (npm run dev, ?sample): made-up numbers, labelled on the chart. Never in a build.
const SAMPLE = import.meta.env.DEV && new URLSearchParams(location.search).has("sample") ? [
  { crop: "paddy_samba", name: "Paddy (Samba)", color: "#1e8ba5", area_ha: 6.2, kg_ha: 4600, baseline_kg_ha: 3900, harvested: true },
  { crop: "black_gram", name: "Black gram", color: "#4da80e", area_ha: 3.1, kg_ha: 620, baseline_kg_ha: 540, harvested: true },
  { crop: "groundnut", name: "Groundnut", color: "#5cb810", area_ha: 2.4, kg_ha: 1900, baseline_kg_ha: 2050, harvested: false },
  { crop: "sugarcane", name: "Sugarcane", color: "#34b8a0", area_ha: 4.0, kg_ha: 98000, baseline_kg_ha: 86000, harvested: false },
] : null;

export default function Impact({ mobile }) {
  const impact = useJson("/impact/impact.json");
  const snap = useJson("/audit/snapshot.json");
  const loans = snap?.polygon?.loans?.filter((l) => l.status !== "removed") || [];
  const count = (st) => loans.filter((l) => l.status === st).length;
  const closed = loans.filter((l) => l.status !== "live").length;
  const v = (x) => (snap ? x : "—");
  const crops = SAMPLE || impact?.food?.crops || [];

  return (
    <Section mobile={mobile} eyebrow="Impact" title="Food, income, women’s land, independence, her voice."
             intro="Five measures, each against a baseline we name. Where we have no figure yet, the row says when we will.">
      {impact && <ImpactMeters mobile={mobile} metrics={impact.metrics} />}
      <FoodByCrop mobile={mobile} crops={crops} season={impact?.food?.season} sample={!!SAMPLE} />
      <Figures mobile={mobile}
        items={[
          { value: v(`${count("repaid")} of ${closed}`), label: "closed crop shares repaid in full" },
          { value: v(String(count("defaulted"))), label: "defaults" },
          { value: v(String(count("live"))), label: "crop shares still running" },
          { value: v(String(snap?.polygon?.landTitles ?? "—")), label: "land titles" },
        ]}
        note={snap && <>Health check, read at Polygon block {snap.polygon.block.toLocaleString("en-US")}. Impact figures as of {impact?.asOf}.{" "}
          <a href="/audit" style={{ color: "#F1F5F9", textDecoration: "underline" }}>Open the audit</a></>} />
    </Section>
  );
}
