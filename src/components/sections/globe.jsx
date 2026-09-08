import { useEffect, useRef, useState, useMemo } from 'react'
import Globe from 'react-globe.gl'
import { geoCentroid } from 'd3-geo'

export default function WireGlobe({ banner = false }) {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 720, height: 720 })
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  const [countries, setCountries] = useState([])
  const [hoverPoly, setHoverPoly] = useState(null)
  const [active, setActive] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const fmtUsd = (v) => {
    if (!v && v !== 0) return 'no data'
    if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`
    if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
    if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`
    return `$${v.toLocaleString()}`
  }

  const stats = useMemo(() => {
    if (!active) return null
    const p = active.properties || {}
    const [lng, lat] = geoCentroid(active)
    return {
      name: p.name ?? p.admin,
      FarmCoops: !p.cs ? 'no data' : p.cs.toLocaleString(),
      ProducerOrg: !p.po ? 'no data' : p.po.toLocaleString(),
      SHG_total: !p.shg_i ? 'no data' : p.shg_i.toLocaleString(),
      SHG_female: !p.shg_f ? 'no data' : p.shg_f.toLocaleString(),
      SHG_female_pct: (p.shg_f && p.shg_i) ? `${Math.round(p.shg_f / p.shg_i * 100)}%` : null,
      fpop: !p.fpop ? 'no data' : p.fpop.toLocaleString(),
      fpop_ratio: !p.ratio_pop_fpop ? 'no data' : p.ratio_pop_fpop.toLocaleString(),
      pop: p.pop_est,
      aum_total: fmtUsd(p.aum_total_usd),
      credit_annual: fmtUsd(p.credit_annual_usd),
      aum_per_group: fmtUsd(p.aum_per_group_usd),
      credit_per_farmer: fmtUsd(p.credit_per_farmer_usd),
      credit_gap_pct: p.credit_gap_pct != null ? `${p.credit_gap_pct}%` : 'no data',
      credit_need_per_farmer: fmtUsd(p.credit_need_per_farmer_usd),
      aum_sources: p.aum_sources || null,
      lat, lng
    }
  }, [active])

  /* ------------------ Camera setup ------------------ */

  useEffect(() => {
    const g = ref.current
    if (!g) return

    const controls = g.controls()

    if (banner) {
      controls.enabled = false

      const mobile = window.innerWidth < 768

      const applyCamera = () => {
        const cam = g.camera()
        if (!cam) return
        const isMobile = window.innerWidth < 768
        cam.position.set(isMobile ? 310 : 150, -5, 0)
        cam.lookAt(0, 70, 0)
        cam.fov = 40
        cam.updateProjectionMatrix()
      }

      requestAnimationFrame(applyCamera)

      if (mobile) {
        // On mobile: allow east-west pan/rotate, slow auto-rotation, no zoom
        controls.enabled = true
        controls.enableZoom = false
        controls.enablePan = false
        controls.enableRotate = true
        controls.autoRotate = true
        controls.autoRotateSpeed = 0.1
        // Lock vertical rotation so the camera tilt stays fixed
        controls.minPolarAngle = Math.PI / 2
        controls.maxPolarAngle = Math.PI / 2
      }

      window.addEventListener('resize', applyCamera)
      g._bannerResizeHandler = applyCamera
      return () => {
        if (g._bannerResizeHandler) window.removeEventListener('resize', g._bannerResizeHandler)
      }
    } else {
      g.pointOfView({ lat: 23, lng: 100, altitude: 1 }, 0)
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.1
      g.renderer?.().setClearColor('#020617', 1)
    }
  }, [banner])

  /* ------------------ Dark mode ------------------ */

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => setIsDarkMode(e.matches)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  /* ------------------ Load GeoJSON ------------------ */

  useEffect(() => {
    fetch('/tex/custom_updated.geojson')
      .then(r => r.json())
      .then((geo) => {
        const feats = Array.isArray(geo.features) ? geo.features : []
        const clean = feats.filter((f) => (f.properties?.name || f.properties?.admin) && f.geometry)
        setCountries(clean)
        setActive(clean[0])
        console.log('countries:', clean.length)
      })
      .catch(console.error)
  }, [])

  /* ------------------ Responsive size ------------------ */

  useEffect(() => {
    const updateSize = () => {
      const mobile = document.documentElement.clientWidth < 768
      setIsMobile(mobile)
      if (banner) {
        const w = document.documentElement.clientWidth
        // Mobile: taller canvas so south pole extends below the visible clip
        const ratio = mobile ? 0.75 : 2.2
        setSize({ width: w, height: Math.round(w / ratio) })
      } else {
        const maxDim = 900
        const w = Math.max(320, Math.min(window.innerWidth, maxDim))
        const h = Math.max(320, Math.min(window.innerHeight, maxDim))
        setSize({ width: Math.min(w, h), height: Math.min(w, h) })
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [banner])

  /* ------------------ Render ------------------ */

  /* ---- Shared legend panel (rendered once, used in two places) ---- */
  const legendPanel = stats ? (
    <div className="overflow-y-auto w-96 max-w-[90vw] rounded-2xl backdrop-blur shadow-xl border border-white/20 p-5"
      style={{ backgroundColor: "rgba(15,23,42,0.65)" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{stats.name}</h3>
        <button
          className="rounded-md px-2 py-1 text-xs text-white hover:text-slate-900"
          onClick={() => setActive(null)}
        >close</button>
      </div>

      {/* Demographics — 2-column grid */}
      {Number.isFinite(stats.pop) && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-100 mb-3">
          <div><span className="text-slate-400">Farmer Pop</span><br/><span className="font-medium">{stats.fpop}</span> <span className="text-slate-400 text-[10px]">({stats.fpop_ratio}%)</span></div>
          <div><span className="text-slate-400">Coops</span><br/><span className="font-medium">{stats.FarmCoops}</span></div>
          <div><span className="text-slate-400">Producer Orgs</span><br/><span className="font-medium">{stats.ProducerOrg}</span></div>
          <div><span className="text-slate-400">Ag-SHGs</span><br/><span className="font-medium">{stats.SHG_total}</span>{stats.SHG_female_pct && <span className="text-slate-400 text-[10px]"> ({stats.SHG_female_pct} female)</span>}</div>
        </div>
      )}

      {/* Cooperative Financials — 2-column grid */}
      <div className="border-t border-white/10 pt-3">
        <div className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wide mb-2">Cooperative Financials</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-100">
          <div><span className="text-slate-400">Total AUM</span><br/><span className="font-medium">{stats.aum_total}</span></div>
          <div><span className="text-slate-400">Annual Credit</span><br/><span className="font-medium">{stats.credit_annual}</span></div>
          <div><span className="text-slate-400">AUM / Group</span><br/><span className="font-medium">{stats.aum_per_group}</span></div>
          <div><span className="text-slate-400">Credit / Farmer</span><br/><span className="font-medium">{stats.credit_per_farmer}</span></div>
          <div className="col-span-2"><span className="text-slate-400">Credit Need / Farmer</span><br/><span className="font-medium">{stats.credit_need_per_farmer}</span></div>
        </div>

        {/* Credit gap — full width, aligned with grid */}
        <div className="mt-3 py-2 px-3 rounded-lg bg-red-500/10 border border-red-400/20 flex items-center justify-between">
          <span className="text-[10px] text-red-300 uppercase tracking-wide font-medium">Credit Gap</span>
          <span className="text-base font-bold text-red-400">{stats.credit_gap_pct}</span>
        </div>

        {stats.aum_sources && <div className="mt-2 text-[10px] text-slate-400 leading-snug"><span className="text-slate-300">Sources:</span> {stats.aum_sources}</div>}
      </div>
    </div>
  ) : null

  return (
    <div
      className={banner
        ? "relative w-full overflow-hidden"
        : "relative mt-12 flex w-full justify-center overflow-hidden rounded-3xl bg-slate-950 ring-1 ring-white/10"
      }
      style={{
        maxWidth: "100vw",
        overflowX: "hidden",
        ...(banner ? { backgroundColor: "var(--color-primary)" } : {}),
      }}
    >
      {/* Grid texture — matches other sections */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Mobile: legend in normal flow, overlapping globe north pole via negative margin-bottom */}
      {legendPanel && (
        <div className="relative z-20 flex justify-center px-4 pt-6 md:hidden" style={{ marginBottom: "-2.5rem" }}>
          {legendPanel}
        </div>
      )}

      {/* Globe canvas — on mobile, clip south pole by capping visible height */}
      <div style={isMobile ? { maxHeight: `${Math.round(size.height * 0.72)}px`, overflow: 'hidden' } : {}}>
      <Globe
        ref={ref}
        width={size.width}
        height={size.height}
        showGlobe={true}
        showAtmosphere={false}
        showGraticules={true}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl={isDarkMode
          ? '//unpkg.com/three-globe/example/img/earth-night.jpg'
          : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'}

        polygonsData={countries}
        polygonCapColor={() => 'rgba(212, 166, 52, 0.15)'}
        polygonSideColor={() => 'rgba(255, 255, 255, 0)'}
        polygonStrokeColor={d => d === hoverPoly ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.35)'}
        polygonAltitude={() => 0.001}
        polygonsTransitionDuration={0}

        onPolygonHover={p => {
          setHoverPoly(p)
          const c = ref.current?.controls()
          if (c) c.autoRotate = !p
        }}
        onPolygonClick={poly => setActive(poly)}
        onGlobeClick={() => setActive(null)}

        htmlElementsData={[{ lat: 11.878858, lng: 78.964963, name: 'Mth Teresa Union' }]}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={() => 0.01}
        htmlElement={d => {
          const el = document.createElement('div')
          el.style.width = '20px'
          el.style.height = '20px'
          el.style.transform = 'translate(-50%, -50%)'
          el.style.cursor = 'pointer'
          el.innerHTML = `
            <svg viewBox="0 0 24 24" width="22" height="22">
              <rect x="2" y="2" width="20" height="20" rx="4" fill="#d4cf5a" stroke="#020617" stroke-width="1.5"/>
              <path d="M12 6v12M6 12h12" stroke="#020617" stroke-width="2" stroke-linecap="round"/>
            </svg>
          `
          el.title = d.name
          el.addEventListener('click', () => console.log('clicked', d.name))
          return el
        }}
      />
      </div>

      {banner && (
        <div className="pointer-events-none absolute bottom-0 left-0 w-full z-20" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: "64px" }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--color-bg-light)" />
          </svg>
        </div>
      )}

      {/* Desktop: legend as absolute overlay */}
      {legendPanel && (
        <div className="pointer-events-none absolute inset-0 hidden md:flex justify-start items-start p-4">
          <div className="pointer-events-auto max-h-[70vh] overflow-y-auto">
            {legendPanel}
          </div>
        </div>
      )}
    </div>
  )
}
