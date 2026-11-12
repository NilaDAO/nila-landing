// Under "Verified digital land titles" (Carst, 12 Nov): the Whisp logo and the result of the FAO Whisp check of every
// land title, linking to /audit/whisp. Numbers from /audit/whisp.json (written by `npm run whisp`); before the first
// run it says "Whisp check" and the page explains the check has not run yet, so no result is ever claimed early.
// Logo: Whisp's own white nav logo (public/w1/partners/whisp-white.svg, from whisp.openforis.org; whisp-app is MIT).
import { useEffect, useState } from "react";
import { homeHref } from "./util.js";

const STYLE = { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "12px", fontWeight: "700", color: "#94A3B8",
                textDecoration: "underline", whiteSpace: "nowrap" };

export default function WhispLink() {
  const [w, setW] = useState(null);
  useEffect(() => {
    fetch("/audit/whisp.json").then((r) => (r.ok ? r.json() : null)).then((d) => setW(d?.plots_checked ? d : null)).catch(() => {});
  }, []);
  return (
    <a href={homeHref("/audit/whisp")} style={STYLE} title={w ? `Checked with FAO Whisp on ${w.checked_at.slice(0, 10)}` : "FAO Whisp check of every land title"}>
      <img src="/w1/partners/whisp-white.svg" alt="Whisp" width={51} height={16} style={{ display: "block" }} />
      {w ? `FAO · ${w.no_tree_loss_since_2020}/${w.plots_checked} forest-free ↗` : "FAO check ↗"}
    </a>
  );
}
