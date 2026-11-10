// W1 globe band (board: "Globe (three.js) as now; union markers in white").
// Same data and behaviour as components/sections/globe.jsx (country polygons from /tex/custom_updated.geojson,
// tap a country → its figures), restyled to the design: dark sphere seen as a horizon, white union marker,
// figures in an ink card. Drag rotates east–west; no zoom, so the page keeps scrolling.
import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { MeshPhongMaterial, Color } from "three";

const TN = { lat: 11.878858, lng: 78.964963, label: "Tamil Nadu · 3 unions" };

// Camera per layout, from the board: a sphere of 1248 px (desktop) / 720 px (mobile) whose top sits 70 / 50 px into
// the band, with Tamil Nadu ~120 / 80 px below that top. fov 40 at altitude 0.52 gives that sphere size; looking
// from latitude ≈ −14° puts Tamil Nadu there; the view offset moves the sphere centre below the band.
const CAM = {
  desktop: { band: 520, alt: 0.52, lat: -14, centreY: 694 },
  mobile: { band: 300, alt: 0.52, lat: -13, centreY: 410 },
};

const fmtUsd = (v) => {
  if (!v && v !== 0) return "no data";
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
};
const num = (v) => (!v ? "no data" : v.toLocaleString());

function marker() {
  const el = document.createElement("div");
  el.style.cssText = "display:flex;align-items:center;gap:8px;transform:translate(-5px,-50%);pointer-events:none;font-family:Inter,system-ui,sans-serif";
  el.innerHTML =
    '<span style="width:10px;height:10px;border-radius:9999px;background:#F1F5F9;box-shadow:0 0 0 3px rgba(241,245,249,.25);flex-shrink:0"></span>' +
    `<span style="display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:9999px;background:#1F2733;font-size:12px;font-weight:700;color:#F1F5F9;white-space:nowrap">${TN.label}</span>`;
  return el;
}

const Row = ({ label, value, note }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, fontSize: 14, lineHeight: 1.5 }}>
    <span style={{ color: "var(--nl-text-muted)" }}>{label}</span>
    <span style={{ fontWeight: 700, color: "var(--nl-text)", textAlign: "right" }}>
      {value}{note && <span style={{ fontWeight: 400, color: "var(--nl-text-muted)" }}> {note}</span>}
    </span>
  </div>
);
const Eyebrow = ({ children }) => (
  <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--nl-text-muted)" }}>{children}</span>
);

function CountryCard({ s, onClose }) {
  return (
    <div style={{ background: "var(--nl-surface-ink)", border: "1px solid #1C1F26", borderRadius: 24, boxShadow: "var(--nl-shadow-card)",
                  padding: 18, display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>{s.name}</span>
        <button type="button" aria-label="Close" onClick={onClose}
                style={{ width: 40, height: 40, borderRadius: 9999, border: 0, background: "var(--nl-surface-raised)", display: "flex",
                         alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      {Number.isFinite(s.pop) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Row label="Farmer Pop" value={s.fpop} note={`(${s.fpop_ratio}%)`} />
          <Row label="Coops" value={s.FarmCoops} />
          <Row label="Producer Orgs" value={s.ProducerOrg} />
          <Row label="Ag-SHGs" value={s.SHG_total} note={s.SHG_female_pct && `(${s.SHG_female_pct} female)`} />
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 14, borderTop: "1px solid #1F2733" }}>
        <Eyebrow>Cooperative Financials</Eyebrow>
        <Row label="Total AUM" value={s.aum_total} />
        <Row label="Annual Credit" value={s.credit_annual} />
        <Row label="AUM / Group" value={s.aum_per_group} />
        <Row label="Credit / Farmer" value={s.credit_per_farmer} />
        <Row label="Credit Need / Farmer" value={s.credit_need_per_farmer} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, height: 44, padding: "0 14px",
                    borderRadius: 12, border: "1px solid #1F2733", fontSize: 14 }}>
        <span style={{ color: "var(--nl-text-muted)" }}>Credit Gap</span>
        <span style={{ fontSize: 16, fontWeight: 700 }}>{s.credit_gap_pct}</span>
      </div>
      {s.aum_sources && (
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: "var(--nl-text-muted)" }}>Sources: {s.aum_sources}</p>
      )}
    </div>
  );
}

export default function W1Globe({ mobile }) {
  const ref = useRef(null);
  const box = useRef(null);
  const cam = mobile ? CAM.mobile : CAM.desktop;
  const [width, setWidth] = useState(0);
  const [countries, setCountries] = useState([]);
  const [hover, setHover] = useState(null);
  const [active, setActive] = useState(null);

  const material = useMemo(() => new MeshPhongMaterial({ color: new Color("#1B2638"), emissive: new Color("#0B1220"), shininess: 4 }), []);

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    fetch("/tex/custom_updated.geojson")
      .then((r) => r.json())
      .then((geo) => {
        const clean = (geo.features || []).filter((f) => (f.properties?.name || f.properties?.admin) && f.geometry);
        setCountries(clean);
        setActive(clean.find((f) => (f.properties.name || f.properties.admin) === "India") || clean[0] || null);
      })
      .catch(() => {});
  }, []);

  // Camera: horizon view with Tamil Nadu facing us; drag rotates around the polar axis only.
  useEffect(() => {
    const g = ref.current;
    if (!g || !width) return;
    const camera = g.camera();
    const controls = g.controls();
    camera.fov = 40;
    g.pointOfView({ lat: cam.lat, lng: TN.lng, altitude: cam.alt }, 0);
    controls.update();
    const polar = controls.getPolarAngle();
    Object.assign(controls, {
      enabled: true, enableZoom: false, enablePan: false, enableRotate: true, rotateSpeed: 0.4,
      minPolarAngle: polar, maxPolarAngle: polar, autoRotate: true, autoRotateSpeed: 0.1,
    });
    // vertical swipes keep scrolling the page; horizontal drags rotate the globe
    g.renderer().domElement.style.touchAction = "pan-y";
    if (import.meta.env.DEV) window.__w1globe = g;
  }, [width, cam]);

  const stats = useMemo(() => {
    if (!active) return null;
    const p = active.properties || {};
    return {
      name: p.name ?? p.admin,
      FarmCoops: num(p.cs), ProducerOrg: num(p.po), SHG_total: num(p.shg_i),
      SHG_female_pct: p.shg_f && p.shg_i ? `${Math.round((p.shg_f / p.shg_i) * 100)}%` : null,
      fpop: num(p.fpop), fpop_ratio: num(p.ratio_pop_fpop), pop: p.pop_est,
      aum_total: fmtUsd(p.aum_total_usd), credit_annual: fmtUsd(p.credit_annual_usd),
      aum_per_group: fmtUsd(p.aum_per_group_usd), credit_per_farmer: fmtUsd(p.credit_per_farmer_usd),
      credit_gap_pct: p.credit_gap_pct != null ? `${p.credit_gap_pct}%` : "no data",
      credit_need_per_farmer: fmtUsd(p.credit_need_per_farmer_usd), aum_sources: p.aum_sources || null,
    };
  }, [active]);

  const card = stats && <CountryCard s={stats} onClose={() => setActive(null)} />;

  return (
    <section style={{ position: "relative", overflow: "hidden", background: "#0A0A0A" }}>
      <div ref={box} style={{ position: "relative", height: cam.band, cursor: hover ? "pointer" : "grab" }}>
        {width > 0 && (
          <Globe
            ref={ref}
            width={width}
            height={cam.band}
            globeOffset={[0, cam.centreY - cam.band / 2]}
            backgroundColor="rgba(0,0,0,0)"
            globeMaterial={material}
            showAtmosphere
            atmosphereColor="#F1F5F9"
            atmosphereAltitude={0.06}
            showGraticules
            polygonsData={countries}
            polygonAltitude={0.004}
            polygonCapColor={(d) => (d === active ? "rgba(241,245,249,0.14)" : d === hover ? "rgba(241,245,249,0.12)" : "rgba(241,245,249,0.04)")}
            polygonSideColor={() => "rgba(0,0,0,0)"}
            polygonStrokeColor={(d) => (d === hover || d === active ? "#F1F5F9" : "rgba(241,245,249,0.3)")}
            polygonsTransitionDuration={0}
            onPolygonHover={(p) => {
              setHover(p);
              const c = ref.current?.controls();
              if (c) c.autoRotate = !p;
            }}
            onPolygonClick={(p) => setActive(p)}
            onGlobeClick={() => setActive(null)}
            htmlElementsData={[TN]}
            htmlLat="lat"
            htmlLng="lng"
            htmlAltitude={0.01}
            htmlElement={marker}
          />
        )}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04, backgroundSize: "48px 48px",
                      backgroundImage: "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)" }} />
        {!mobile && card && (
          <div style={{ position: "absolute", left: 48, top: 24, width: 360, maxHeight: cam.band - 48, overflowY: "auto", zIndex: 3 }}>{card}</div>
        )}
      </div>
      {mobile && card && <div style={{ position: "relative", zIndex: 3, padding: "0 16px 88px" }}>{card}</div>}
    </section>
  );
}
