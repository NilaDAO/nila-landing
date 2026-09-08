import { useEffect } from "react";

// Self-contained Sprint budget page for the WFP Innovation Accelerator application.
// Content is frozen and reconciled against on-chain data — this component renders
// it verbatim, styled with the source document's own CSS scoped under .wfp-page.
// Not linked from nav/footer/sitemap; noindex is injected below since this SPA has
// no per-route <head> mechanism (no route here can appear in raw view-source).

export default function WfpPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Nila — WFP Innovation Accelerator, SDG2 Sprint budget";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="wfp-page">
      <style>{`
        .wfp-page{
          --bg:#080C18; --card:#111A2E; --edge:#24304A; --amber:var(--color-accent);
          --body:#9BAAC0; --dim:#5E6E86; --white:#fff; --green:#7FB069;
          margin:0; min-height:100vh; background:var(--bg); color:var(--body);
          font:400 15px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
          background-image:
            linear-gradient(rgba(14,20,36,.55) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,20,36,.55) 1px, transparent 1px);
          background-size:66px 66px;
        }
        .wfp-page *{box-sizing:border-box}
        .wfp-page .wrap{max-width:920px;margin:0 auto;padding:56px 24px 90px}
        .wfp-page .kicker{color:var(--amber);font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase}
        .wfp-page h1{color:var(--white);font-size:34px;line-height:1.2;margin:14px 0 10px;font-weight:700;letter-spacing:-.01em}
        .wfp-page .lede{font-size:16px;max-width:70ch;margin:0 0 8px}
        .wfp-page .meta{color:var(--dim);font-size:13px;margin-top:18px}
        .wfp-page h2{color:var(--white);font-size:19px;margin:52px 0 6px;font-weight:700}
        .wfp-page h2 .n{color:var(--amber);font-weight:700;margin-right:10px}
        .wfp-page h3.h3{color:var(--white);font-size:15px;margin:30px 0 4px;font-weight:700;letter-spacing:.01em}
        .wfp-page td.d{color:var(--dim);font-size:13px}
        .wfp-page .sub{color:var(--dim);font-size:13.5px;margin:0 0 20px;max-width:74ch}
        .wfp-page .card{background:var(--card);border:1px solid var(--edge);border-radius:10px;padding:22px 24px;margin:16px 0}
        .wfp-page .ask{display:flex;flex-wrap:wrap;align-items:baseline;gap:16px;
             background:var(--card);border:1px solid var(--amber);border-radius:10px;padding:24px 26px;margin:26px 0}
        .wfp-page .ask .fig{color:var(--amber);font-size:42px;font-weight:700;line-height:1;letter-spacing:-.02em}
        .wfp-page .ask .txt{flex:1;min-width:280px;font-size:14.5px}
        .wfp-page .table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
        .wfp-page .table-scroll table{min-width:520px}
        .wfp-page table{width:100%;border-collapse:collapse;font-size:14.5px}
        .wfp-page th{color:var(--dim);text-align:left;font-weight:700;font-size:11px;letter-spacing:.13em;
           text-transform:uppercase;padding:0 0 12px;border-bottom:1px solid var(--edge)}
        .wfp-page th.r,.wfp-page td.r{text-align:right}
        .wfp-page td{padding:11px 0;border-bottom:1px solid rgba(36,48,74,.55)}
        .wfp-page tr:last-child td{border-bottom:none}
        .wfp-page td.name{color:var(--white)}
        .wfp-page td.amt{color:var(--white);font-variant-numeric:tabular-nums;white-space:nowrap}
        .wfp-page td.pct{color:var(--dim);font-variant-numeric:tabular-nums;width:64px}
        .wfp-page tr.total td{border-top:1px solid var(--edge);border-bottom:none;padding-top:14px;font-weight:700;color:var(--white)}
        .wfp-page .bar{height:5px;background:rgba(224,163,60,.16);border-radius:3px;margin-top:7px;overflow:hidden}
        .wfp-page .bar span{display:block;height:100%;background:var(--amber);border-radius:3px}
        .wfp-page .ms{color:var(--amber);font-weight:700;font-size:13px;letter-spacing:.06em}
        .wfp-page .note{color:var(--dim);font-size:13px;margin-top:14px;max-width:78ch}
        .wfp-page .flow{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:14px 0 4px;font-size:14px}
        .wfp-page .flow .step{background:rgba(224,163,60,.08);border:1px solid var(--edge);border-radius:7px;padding:8px 13px;color:var(--white)}
        .wfp-page .flow .ar{color:var(--dim)}
        .wfp-page .kv{display:grid;grid-template-columns:1fr auto;gap:9px 20px;font-size:14.5px}
        .wfp-page .kv .k{color:var(--body)} .wfp-page .kv .v{color:var(--white);font-variant-numeric:tabular-nums;white-space:nowrap}
        .wfp-page .kv .k.tot,.wfp-page .kv .v.tot{border-top:1px solid var(--edge);padding-top:11px;font-weight:700;color:var(--white)}
        .wfp-page .hl{color:var(--amber);font-weight:700}
        .wfp-page a{color:var(--amber)}
        .wfp-page footer{margin-top:64px;padding-top:22px;border-top:1px solid var(--edge);color:var(--dim);font-size:12.5px}
        @media(max-width:600px){
          .wfp-page h1{font-size:26px}
          .wfp-page .ask .fig{font-size:34px}
          .wfp-page .wrap{padding:36px 18px 70px}
        }
      `}</style>
      <div className="wrap">

        <div className="kicker">WFP Innovation Accelerator · SDG2 open call</div>
        <h1>The April gap — Sprint budget</h1>
        <p className="lede">A rotation-window facility for women smallholders in the Cauvery delta, Tamil Nadu.
        What the six-month Sprint costs, how it is split, and where the loan capital comes from.
        The line-level workbook is available on request.</p>
        <div className="meta">Nila · Blockchainforcommons (KvK 55518559) · Amsterdam &amp; Chennai ·
        prepared August 2026 · FX ₹95/$, the rate Nila's own FX pool contract reports on-chain</div>

        <div className="ask">
          <div className="fig">US$81,000</div>
          <div className="txt">Equity-free, over a six-month milestone-gated Sprint timed to the{" "}
          <strong style={{ color: "#fff" }}>April 2027</strong> planting window.</div>
        </div>

        <h2><span className="n">01</span>Where it goes</h2>
        <p className="sub">Direct costs US$73,685 plus 10% contingency.</p>
        <div className="card">
          <div className="table-scroll">
          <table>
            <tbody>
            <tr><th>Category</th><th className="r">Amount</th><th className="r">Share</th></tr>
            <tr><td className="name">Engineering &amp; data<div className="bar"><span style={{ width: "100%" }}></span></div></td><td className="amt r">$22,500</td><td className="pct r">31%</td></tr>
            <tr><td className="name">Field baseline &amp; measurement<div className="bar"><span style={{ width: "75%" }}></span></div></td><td className="amt r">$16,800</td><td className="pct r">23%</td></tr>
            <tr><td className="name">Union nursery<div className="bar"><span style={{ width: "51%" }}></span></div></td><td className="amt r">$11,535</td><td className="pct r">16%</td></tr>
            <tr><td className="name">Publication &amp; portability<div className="bar"><span style={{ width: "43%" }}></span></div></td><td className="amt r">$9,700</td><td className="pct r">13%</td></tr>
            <tr><td className="name">Product &amp; operations<div className="bar"><span style={{ width: "36%" }}></span></div></td><td className="amt r">$8,200</td><td className="pct r">11%</td></tr>
            <tr><td className="name">Compliance &amp; legal<div className="bar"><span style={{ width: "22%" }}></span></div></td><td className="amt r">$4,950</td><td className="pct r">7%</td></tr>
            <tr className="total"><td>Direct costs</td><td className="amt r">$73,685</td><td className="pct r"></td></tr>
            <tr><td>Contingency, 10%</td><td className="amt r">$7,368</td><td className="pct r"></td></tr>
            <tr className="total"><td>Total requested</td><td className="amt r" style={{ color: "var(--amber)" }}>$81,054</td><td className="pct r"></td></tr>
            </tbody>
          </table>
          </div>
        </div>

        <h2><span className="n">02</span>When it is spent</h2>
        <p className="sub">The trigger fires once a year, on a known date. Everything before M3 exists to be ready
        for the April window; M4 exists to make the design portable.</p>
        <div className="card">
          <div className="table-scroll">
          <table>
            <tbody>
            <tr><th>Milestone</th><th>Weeks</th><th className="r">Amount</th><th className="r">Share</th></tr>
            <tr><td><span className="ms">M1</span>{" "}Baseline</td><td>1–5</td><td className="amt r">$12,500</td><td className="pct r">17%</td></tr>
            <tr><td><span className="ms">M2</span>{" "}Build</td><td>6–12</td><td className="amt r">$31,614</td><td className="pct r">43%</td></tr>
            <tr><td><span className="ms">M3</span>{" "}The April window</td><td>13–20</td><td className="amt r">$15,471</td><td className="pct r">21%</td></tr>
            <tr><td><span className="ms">M4</span>{" "}Measure, publish, port</td><td>21–26</td><td className="amt r">$14,100</td><td className="pct r">19%</td></tr>
            </tbody>
          </table>
          </div>
          <p className="note">M2 carries the weight because two things are built there: per-cycle phenology
          classification, which makes crop rotation detectable at plot level, and the union nursery itself.
          Both must be finished before the window opens.</p>
        </div>

        <h2><span className="n">03</span>Loan capital</h2>
        <p className="sub">What the April cohort needs to borrow, and what the existing pool holds.</p>
        <div className="card">
          <div className="kv">
            <div className="k">Settlings, 2 acres at 4,400 per acre</div><div className="v">₹17,600</div>
            <div className="k">Land preparation and planting labour</div><div className="v">₹8,000</div>
            <div className="k">School-fee bridge</div><div className="v">₹6,000</div>
            <div className="k tot">Per farmer</div><div className="v tot">₹31,600 · $333</div>
          </div>
          <div className="kv" style={{ marginTop: 22 }}>
            <div className="k">Farmers in the M3 cohort</div><div className="v">20</div>
            <div className="k tot">Bridge-loan capital required</div><div className="v tot">$6,653</div>
          </div>
          <div className="kv" style={{ marginTop: 22 }}>
            <div className="k">Senior tranche, on-chain</div><div className="v">$7,940</div>
            <div className="k">Junior tranche — member first-loss, on-chain</div><div className="v">$2,620</div>
            <div className="k tot">Existing pool</div><div className="v tot">$10,560</div>
          </div>
          <p className="note">63% of the existing pool, recycling within the season. Pool figures are read directly
          from Polygon mainnet — see <a href="https://nila.land/audit">nila.land/audit</a>.</p>
          <p className="note">The pool is currently fully deployed across 28 live loans. April 2027 capacity depends
          on repayments recycling on schedule, or on the book growing before then.</p>
        </div>

        <h2><span className="n">04</span>The union nursery</h2>
        <p className="sub">Sugarcane is not grown from seed. A single bud cut from cane, sprouted in a tray for
        25–35 days, becomes a <em>settling</em> — and there is no commercial nursery in these districts to
        produce them. Every grower raises her own, weeks ahead, or does not replant at all.</p>
        <div className="card">
          <div className="flow">
            <span className="step">Single-bud sett</span><span className="ar">→</span>
            <span className="step">Protray, 50 cells</span><span className="ar">→</span>
            <span className="step">25–35 days under poly</span><span className="ar">→</span>
            <span className="step">Settling</span><span className="ar">→</span>
            <span className="step">Transplanted, 5 × 2 ft</span>
          </div>
          <p className="note" style={{ marginBottom: 0 }}>Nursery-raised single-bud settlings are the Sustainable
          Sugarcane Initiative, promoted by ICAR and NABARD: yield up ~20%, water down ~30%, cultivation cost
          down 20–25%. What smallholders lack is the nursery it requires.</p>
        </div>

        <h3 className="h3">Build cost — one pilot unit</h3>
        <div className="card">
          <div className="table-scroll">
          <table>
            <tbody>
            <tr><th>Item</th><th>Basis</th><th className="r">₹</th><th className="r">$</th></tr>
            <tr><td className="name">Covered structure, poly over timber</td><td className="d">800 m² at ₹300/m²</td><td className="amt r">240,000</td><td className="amt r">2,526</td></tr>
            <tr><td className="name">Protrays, 50-cell</td><td className="d">2,400 trays at ₹25</td><td className="amt r">60,000</td><td className="amt r">632</td></tr>
            <tr><td className="name">Irrigation, misting, tank, pump</td><td className="d"></td><td className="amt r">60,000</td><td className="amt r">632</td></tr>
            <tr><td className="name">Tools, benches, fencing, contingency</td><td className="d"></td><td className="amt r">40,000</td><td className="amt r">421</td></tr>
            <tr><td className="name">Land</td><td className="d">Union-owned ground</td><td className="amt r">—</td><td className="amt r">—</td></tr>
            <tr className="total"><td>Total</td><td></td><td className="amt r">400,000</td><td className="amt r" style={{ color: "var(--amber)" }}>4,211</td></tr>
            </tbody>
          </table>
          </div>
          <p className="note">20 acres at 4,400 settlings per acre is 88,000 settlings — 1,760 protrays, roughly
          800 m² of bench and paths.</p>
        </div>

        <h3 className="h3">Annual operating model</h3>
        <p className="sub">Modelled at 20 acres of sugarcane in the April window, plus three further batches of
        transplanted paddy and vegetables across the delta's other seasons.</p>
        <div className="card">
          <div className="kv">
            <div className="k">Sugarcane settlings, April window</div><div className="v">88,000 units</div>
            <div className="k">Paddy and vegetable seedlings, three further batches</div><div className="v">75,000 units</div>
            <div className="k tot">Revenue</div><div className="v tot">₹266,000</div>
            <div className="k">Direct cost of production — media, setts, tray wear</div><div className="v">−₹130,400</div>
            <div className="k tot">Gross margin</div><div className="v tot">₹135,600</div>
          </div>
          <div className="kv" style={{ marginTop: 22 }}>
            <div className="k">Operator — union share, 0.3 FTE of a ₹9,000/month role</div><div className="v">−₹32,400</div>
            <div className="k">Structure depreciation, five years</div><div className="v">−₹80,000</div>
            <div className="k">Maintenance, water, power, tray replacement</div><div className="v">−₹53,000</div>
            <div className="k tot">Fixed cost</div><div className="v tot">−₹165,400</div>
            <div className="k tot">Net result, year one at 20 acres</div><div className="v tot" style={{ color: "var(--amber)" }}>−₹29,800</div>
          </div>
          <p className="note">₹9,000 a month is the wage the union named as the minimum acceptable for a woman
          operator; the nursery carries 30% of it, the role sitting inside an existing union job. Depreciation is
          48% of fixed cost — capital recovery, not labour, is what needs volume.</p>
        </div>

        <h3 className="h3">Break-even</h3>
        <div className="card">
          <div className="kv">
            <div className="k">Sugarcane acres served</div><div className="v">~26 acres</div>
            <div className="k">Rotation loans a season, at two acres each</div><div className="v">~13 farmers</div>
            <div className="k">As a share of the 38 sugarcane growers we finance today</div><div className="v">34%</div>
            <div className="k">Or, at 20 acres — the settling price that clears it</div><div className="v">₹2.34</div>
          </div>
          <p className="note">Six of those 38 rotated last cycle unaided. Thirteen makes the nursery self-funding,
          and it is the M3 gate metric.</p>
        </div>

        <h3 className="h3">What a second unit costs</h3>
        <p className="sub">Nursery area scales at roughly 40 m² per acre of sugarcane served. Publishing the
        replication cost is an M4 output.</p>
        <div className="card">
          <div className="table-scroll">
          <table>
            <tbody>
            <tr><th>Farmers served</th><th className="r">Acres</th><th className="r">Nursery</th><th className="r">Capital cost</th></tr>
            <tr><td className="name">13 — break-even cohort</td><td className="amt r">26</td><td className="amt r">1,042 m²</td><td className="amt r">₹500,050 · $5,264</td></tr>
            <tr><td className="name">38 — every cane grower we finance today</td><td className="amt r">76</td><td className="amt r">3,044 m²</td><td className="amt r">₹1,460,900 · $15,378</td></tr>
            <tr><td className="name">100</td><td className="amt r">200</td><td className="amt r">8,008 m²</td><td className="amt r">₹3,843,400 · $40,457</td></tr>
            <tr><td className="name">300</td><td className="amt r">600</td><td className="amt r">24,024 m²</td><td className="amt r">₹11,530,200 · $121,371</td></tr>
            </tbody>
          </table>
          </div>
          <p className="note">Sized for peak simultaneous demand in one planting window. If the window is long enough
          to stagger two batches through the same structure, every figure above halves. How long that window
          actually runs is an M1 question.</p>
        </div>

        <h3 className="h3">What we do not yet know</h3>
        <div className="card">
          <p style={{ margin: "0 0 10px" }}><strong style={{ color: "#fff" }}>Non-cane demand is the weakest number in this
          model.</strong> The 75,000 paddy and vegetable seedlings are set from tray capacity, not from measured
          member demand. If those batches run near the structure's real capacity the nursery is comfortably
          profitable at 20 acres; if they do not materialise it needs 26. Measuring that comes first.</p>
          <p style={{ margin: "0 0 10px" }}><strong style={{ color: "#fff" }}>Seasonality is a rostering problem before it is a
          cost problem.</strong> The annual operator cost is right, but the work is not evenly spread — sowing and
          hardening off ahead of a single April window is close to full-time for several weeks.</p>
          <p style={{ margin: 0 }}><strong style={{ color: "#fff" }}>Year one is chicken-and-egg.</strong> Nursery revenue
          depends on rotation loans, which depend on the nursery. Ten of 38 growers already rotated or replanted
          unaided, and those 38 are a fraction of the union's ~900 members.</p>
        </div>

        <h2><span className="n">05</span>Use of proceeds</h2>
        <div className="card">
          <p style={{ margin: "0 0 12px" }}>Field baseline and measurement · Earth-observation engineering ·
          the union nursery's build and first production run · loan-product development ·
          compliance and legal · publication of the field study and portability pack.</p>
          <p className="note" style={{ marginTop: 0 }}>Nursery inventory funded here is the union's working stock; the
          farmer's repayment flows back into the nursery.</p>
        </div>

        <footer>
          Nila · Blockchainforcommons, KvK 55518559 · Rozenstraat 53D, 1016 NN Amsterdam ·
          carst@nila.land · <a href="https://nila.land">nila.land</a><br />
          On-chain figures read from Polygon PoS mainnet at block 91,130,864, 30 July 2026.
          FX ₹95/$ per the FX pool contract's <code style={{ color: "var(--body)" }}>lastFxRate()</code>.
          Line-level budget workbook available on request.
        </footer>

      </div>
    </div>
  );
}
