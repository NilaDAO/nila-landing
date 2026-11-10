// Food per crop (Carst, 10 Nov): yield per hectare on her fields as an index of the same fields' baseline (= 100),
// one row per crop in the PWA crop colour (nila-pwa/src/utils/cropColors.js). One axis for every crop: an index,
// because a sugarcane hectare and a paddy hectare are tonnes apart. Bar = this season, tick = baseline.
// crops: [{ crop, name, color, area_ha, kg_ha, baseline_kg_ha, harvested (bool) }]
const MUTED = "#94A3B8";

export default function FoodByCrop({ crops, season, sample, mobile }) {
  const max = Math.max(150, ...crops.map((c) => (c.kg_ha / c.baseline_kg_ha) * 100 + 10));
  const x = (v) => `${(v / max) * 100}%`;
  return (
    <div style={{ background: "#121212", border: "1px solid #1C1F26", borderRadius: 24, boxShadow: "var(--nl-shadow-card)", padding: mobile ? 16 : 24,
                  display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Food, per crop</span>
          <span style={{ fontSize: 12, color: MUTED }}>Harvest per hectare against the same fields before Nila (baseline = 100){season ? ` · ${season}` : ""}</span>
        </span>
        {sample && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#E69283" }}>SAMPLE DATA · DEV ONLY</span>}
      </div>
      {!crops.length ? (
        <span style={{ fontSize: 14, color: MUTED }}>No crop shares on Stellar yet. The first ones are drawn for the 2026–27 seasons; each crop appears here with its own baseline.</span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {crops.map((c) => {
            const idx = Math.round((c.kg_ha / c.baseline_kg_ha) * 100);
            return (
              <div key={c.crop} title={`${c.name}: ${c.kg_ha.toLocaleString("en-IN")} kg/ha against ${c.baseline_kg_ha.toLocaleString("en-IN")} kg/ha`}
                   style={{ display: "grid", gridTemplateColumns: mobile ? "88px minmax(0,1fr) 44px" : "140px minmax(0,1fr) 56px", gap: 12, alignItems: "center" }}>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />{c.name}
                  </span>
                  <span style={{ fontSize: 11, color: MUTED }}>{c.area_ha} ha · {c.harvested ? "harvested" : "estimated"}</span>
                </span>
                <div style={{ position: "relative", height: 14 }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: x(idx), borderRadius: "0 4px 4px 0", background: c.color,
                                opacity: c.harvested ? 1 : 0.55 }} />
                  <div style={{ position: "absolute", left: x(100), top: -4, bottom: -4, width: 2, background: "#F1F5F9", borderRadius: 1 }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, textAlign: "right" }}>{idx}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: MUTED, paddingTop: 4 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 2, height: 12, background: "#F1F5F9" }} />Baseline = 100</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 2, background: "#94A3B8", opacity: 0.55 }} />Estimated from the plan</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 14, height: 8, borderRadius: 2, background: "#94A3B8" }} />Harvested</span>
          </div>
        </div>
      )}
    </div>
  );
}
