// W1 globe band (board: "Globe (three.js) as now; union markers in white").
// Same data and behaviour as components/sections/globe.jsx (country polygons from /tex/custom_updated.geojson,
// tap a country → its figures), restyled to the design: dark sphere seen as a horizon, white union marker,
// figures in an ink card. Drag rotates east–west; no zoom, so the page keeps scrolling.
import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "react-globe.gl";
import { MeshPhongMaterial, Color } from "three";
import { geoArea, geoContains } from "d3-geo";

const TN = { lat: 11.878858, lng: 78.964963, label: "Tamil Nadu · 3 unions" };

// Camera and canvas copied from the old globe's banner mode (components/sections/globe.jsx), as Carst asked (10 Nov):
// camera at (150 | 310 on mobile, −5, 0), fov 40; canvas width ÷ 2.2 (mobile ÷ 0.75, clipped to 72 %). The old desktop
// looked at (0, 70, 0) with the controls off; the old mobile had the controls on, which globe.gl keeps aimed at the
// centre. globe.gl resets the orbit target on every move, so the camera is turned by hand here: drag east–west, old
// auto-rotate speed (OrbitControls 0.1 = one turn per 10 min), tilt fixed as before.
const OLD = {
  desktop: { camX: 150, lookY: 70, ratio: 2.2, clip: 1 },
  mobile: { camX: 310, lookY: 0, ratio: 0.75, clip: 0.72 },
};
const AUTO = (2 * Math.PI) / 60 / 60 * 0.1 / 60; // rad per ms
const DRAG = 0.005; // rad per px

const fmtUsd = (v) => {
  if (!v && v !== 0) return "no data";
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
};
const nameOf = (f) => f.properties?.name || f.properties?.admin || f.properties?.NAME;
// d3 needs rings wound clockwise; a ring the wrong way round covers the rest of the world (area > 2π).
const reverseRings = (g) =>
  g.type === "Polygon" ? { ...g, coordinates: g.coordinates.map((r) => [...r].reverse()) }
  : { ...g, coordinates: g.coordinates.map((p) => p.map((r) => [...r].reverse())) };
const rewound = (f) => (geoArea(f) > 2 * Math.PI ? { ...f, geometry: reverseRings(f.geometry) } : f);
const num = (v) => (!v ? "no data" : v.toLocaleString());

// Union marker: a plain green dot (Carst, 10 Nov; was the old green-yellow cross), with the board's chip beside it.
function marker() {
  const el = document.createElement("div");
  el.style.cssText = "position:relative;width:12px;height:12px;transform:translate(-50%,-50%);pointer-events:none;font-family:Inter,system-ui,sans-serif";
  el.innerHTML =
    '<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#d4cf5a;border:1.5px solid #020617;box-sizing:border-box"></span>' +
    `<span style="position:absolute;left:20px;top:50%;transform:translateY(-50%);display:inline-flex;align-items:center;height:24px;padding:0 8px;border-radius:9999px;background:#1F2733;font-size:12px;font-weight:700;color:#F1F5F9;white-space:nowrap">${TN.label}</span>`;
  return el;
}

const Row = ({ label, value, note }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, fontSize: 13, lineHeight: 1.5 }}>
    <span style={{ color: "var(--nl-text-muted)" }}>{label}</span>
    <span style={{ fontWeight: 700, color: "var(--nl-text)", textAlign: "right" }}>
      {value}{note && <span style={{ fontWeight: 400, color: "var(--nl-text-muted)" }}> {note}</span>}
    </span>
  </div>
);
const Eyebrow = ({ children }) => (
  <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--nl-text-muted)" }}>{children}</span>
);

function CountryCard({ s, onClose }) {
  return (
    <div style={{ background: "var(--nl-surface-ink)", border: "1px solid #1C1F26", borderRadius: 24, boxShadow: "var(--nl-shadow-card)",
                  padding: 18, display: "flex", flexDirection: "column", gap: 14, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{s.name}</span>
        <button type="button" aria-label="Close" onClick={onClose}
                style={{ width: 40, height: 40, borderRadius: 9999, border: 0, background: "var(--nl-surface-raised)", display: "flex",
                         alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      {Number.isFinite(s.pop) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Row label="Farmer Pop" value={s.fpop} note={s.fpop_ratio && `(${s.fpop_ratio} of pop.)`} />
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 0",
                    borderTop: "1px solid #1F2733", borderBottom: "1px solid #1F2733", fontSize: 13 }}>
        <span style={{ color: "var(--nl-text-muted)" }}>Credit Gap</span>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{s.credit_gap_pct}</span>
      </div>
      {s.aum_sources && (
        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.4, color: "#64748B" }}>Sources: {s.aum_sources}</p>
      )}
    </div>
  );
}

export default function W1Globe({ mobile }) {
  const ref = useRef(null);
  const box = useRef(null);
  const cam = mobile ? OLD.mobile : OLD.desktop;
  const [width, setWidth] = useState(0);
  const [countries, setCountries] = useState([]); // the countries with figures (tappable)
  const [world, setWorld] = useState([]); // every other country, outline only, for reference
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
    Promise.all([fetch("/tex/custom_updated.geojson").then((r) => r.json()), fetch("/tex/world_110m.geojson").then((r) => r.json())])
      .then(([geo, all]) => {
        const clean = (geo.features || []).filter((f) => nameOf(f) && f.geometry);
        const names = new Set(clean.map(nameOf));
        setCountries(clean);
        setWorld((all.features || []).filter((f) => !names.has(nameOf(f))).map((f) => ({ ...f, ref: true })));
        setActive(clean.find((f) => nameOf(f) === "India") || clean[0] || null);
      })
      .catch(() => {});
  }, []);

  const height = Math.round(width / cam.ratio);
  const band = Math.round(height * cam.clip);

  // Camera turned by hand (see OLD). Runs once globe.gl is ready (it sets its own camera first).
  const az = useRef(0);
  const drag = useRef(null); // { x, moved }
  const hoverRef = useRef(null);
  const place = () => {
    const g = ref.current;
    if (!g) return;
    const camera = g.camera();
    camera.position.set(cam.camX * Math.cos(az.current), -5, cam.camX * Math.sin(az.current));
    camera.lookAt(0, cam.lookY, 0);
    g.controls().dispatchEvent({ type: "change" }); // lets globe.gl hide markers on the far side
  };
  const applyCamera = () => {
    const g = ref.current;
    if (!g) return;
    g.controls().enabled = false;
    g.camera().fov = 40;
    g.camera().updateProjectionMatrix();
    place();
    if (import.meta.env.DEV) window.__w1globe = g;
  };
  useEffect(() => {
    if (width) requestAnimationFrame(applyCamera);
  }, [width, cam]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    let raf, last = performance.now();
    const tick = (now) => {
      if (!drag.current && !hoverRef.current) {
        az.current -= AUTO * (now - last);
        place();
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cam]); // eslint-disable-line react-hooks/exhaustive-deps
  const onDown = (e) => { drag.current = { x: e.clientX, moved: 0 }; };
  const onUp = () => { setTimeout(() => { drag.current = null; }, 0); };

  const stats = useMemo(() => {
    if (!active) return null;
    const p = active.properties || {};
    return {
      name: p.name ?? p.admin,
      FarmCoops: num(p.cs), ProducerOrg: num(p.po), SHG_total: num(p.shg_i),
      SHG_female_pct: p.shg_f && p.shg_i ? `${Math.round((p.shg_f / p.shg_i) * 100)}%` : null,
      // fpop_ratio = farmers ÷ pop_est (recomputed in the file, 10 Nov)
      fpop: num(p.fpop), fpop_ratio: p.ratio_pop_fpop != null ? `${p.ratio_pop_fpop}%` : null, pop: p.pop_est,
      aum_total: fmtUsd(p.aum_total_usd), credit_annual: fmtUsd(p.credit_annual_usd),
      aum_per_group: fmtUsd(p.aum_per_group_usd), credit_per_farmer: fmtUsd(p.credit_per_farmer_usd),
      credit_gap_pct: p.credit_gap_pct != null ? `${p.credit_gap_pct}%` : "no data",
      credit_need_per_farmer: fmtUsd(p.credit_need_per_farmer_usd), aum_sources: p.aum_sources || null,
    };
  }, [active]);

  // All shapes lie on one level (different heights shift neighbours against each other). Which country a tap or
  // hover means is decided from the point on the globe: the smallest tappable country that contains it, so Nepal
  // wins over the India shape drawn across it.
  const bySize = useMemo(
    () => countries.map((f) => [f, rewound(f)]).sort((a, b) => geoArea(a[1]) - geoArea(b[1])),
    [countries],
  );
  const pick = (c) => (c ? bySize.find(([, g]) => geoContains(g, [c.lng, c.lat]))?.[0] || null : null);
  if (import.meta.env.DEV) window.__w1pick = (lat, lng) => [nameOf(pick({ lat, lng }) || {}), bySize.map(([f, g]) => [nameOf(f), +geoArea(g).toFixed(4)])];
  const shapes = useMemo(() => [...world, ...countries], [world, countries]);

  const lastPoint = useRef(null);
  const onMove = (e) => {
    const g = ref.current;
    if (!g) return;
    if (drag.current && e.buttons) {
      const dx = e.clientX - drag.current.x;
      drag.current.x = e.clientX;
      drag.current.moved += Math.abs(dx);
      az.current += dx * DRAG;
      place();
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    lastPoint.current = g.toGlobeCoords(e.clientX - r.left, e.clientY - r.top);
    const f = pick(lastPoint.current);
    hoverRef.current = f;
    if (f !== hover) setHover(f);
  };

  const card = stats && <CountryCard s={stats} onClose={() => setActive(null)} />;

  return (
    <section style={{ position: "relative", overflow: "hidden", background: "#0A0A0A" }}>
      <div ref={box} onPointerMove={onMove} onPointerDown={onDown} onPointerUp={onUp}
           onPointerLeave={() => { setHover(null); hoverRef.current = null; drag.current = null; }}
           style={{ position: "relative", height: band || 300, overflow: "hidden", touchAction: "pan-y", cursor: hover ? "pointer" : "grab" }}>
        {width > 0 && (
          <Globe
            ref={ref}
            width={width}
            height={height}
            backgroundColor="rgba(0,0,0,0)"
            globeMaterial={material}
            showAtmosphere
            atmosphereColor="#F1F5F9"
            atmosphereAltitude={0.06}
            showGraticules
            showPointerCursor={false}
            polygonsData={shapes}
            polygonAltitude={0.004}
            polygonCapColor={(d) => (d.ref ? "rgba(148,163,184,0.06)" : d === active ? "rgba(241,245,249,0.22)" : d === hover ? "rgba(241,245,249,0.16)" : "rgba(241,245,249,0.1)")}
            polygonSideColor={() => "rgba(0,0,0,0)"}
            polygonStrokeColor={(d) => (d.ref ? "rgba(148,163,184,0.28)" : d === hover || d === active ? "#F1F5F9" : "rgba(241,245,249,0.6)")}
            polygonsTransitionDuration={0}
            onGlobeReady={applyCamera}
            onPolygonClick={() => { if (!(drag.current?.moved > 4)) setActive(pick(lastPoint.current)); }}
            onGlobeClick={() => { if (!(drag.current?.moved > 4)) setActive(pick(lastPoint.current)); }}
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
          <div style={{ position: "absolute", left: 48, top: 24, width: 360, maxHeight: band - 48, overflowY: "auto", zIndex: 3 }}>{card}</div>
        )}
      </div>
      {mobile && card && <div style={{ position: "relative", zIndex: 3, padding: "0 16px 88px" }}>{card}</div>}
    </section>
  );
}
