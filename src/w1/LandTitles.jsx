// "Verified digital land titles" (Carst, 12 Nov): live titles only — minted, minus revoked and test titles — from the
// last FAO Whisp run (/audit/whisp.json, titles_live), so the count always matches the plots that were checked.
// Before a Whisp run exists: NilaLandTitle.totalSupply on Polygon; until either read returns: the board's figure.
import { useEffect, useState } from "react";
import { useLandHolders } from "../hooks/useLandHolders";

export default function LandTitles({ fallback }) {
  const { data } = useLandHolders();
  const [live, setLive] = useState(null);
  useEffect(() => {
    fetch("/audit/whisp.json").then((r) => (r.ok ? r.json() : null)).then((d) => setLive(d?.titles_live ?? null)).catch(() => {});
  }, []);
  return <>{live != null ? String(live) : data != null ? String(data) : fallback}</>;
}
