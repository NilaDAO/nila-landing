// Under "Verified digital land titles" (Carst, 12 Nov): the FAO Whisp result of every land title, linking to
// /audit/whisp. Read from /audit/whisp.json (written by `npm run whisp`); until that file exists the old audit link
// stays, so the home page never claims a check that has not run. Text only: no FAO / Open Foris logo until they agree.
import { useEffect, useState } from "react";
import { homeHref } from "./util.js";

const STYLE = { fontSize: "12px", fontWeight: "700", color: "#94A3B8", textDecoration: "underline", whiteSpace: "nowrap" };

export default function WhispLink() {
  const [w, setW] = useState(null);
  useEffect(() => {
    fetch("/audit/whisp.json").then((r) => (r.ok ? r.json() : null)).then((d) => setW(d?.plots_checked ? d : null)).catch(() => {});
  }, []);
  if (!w) return <a href={homeHref("/audit")} style={STYLE}>audit ↗</a>;
  return (
    <a href={homeHref("/audit/whisp")} style={STYLE} title={`Checked with FAO Whisp on ${w.checked_at.slice(0, 10)}`}>
      FAO Whisp: {w.no_tree_loss_since_2020}/{w.plots_checked} forest-free ↗
    </a>
  );
}
