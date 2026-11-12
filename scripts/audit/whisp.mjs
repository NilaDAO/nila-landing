// FAO Whisp check of every land title (handoffs/Prompt_Whisp_LandTitles.md, Carst 12 Nov). Run by hand:
//   WHISP_API_KEY=… npm run whisp
// Reads each NilaLandTitle on Polygon mainnet, decodes its outer boundary, sends all plots in one synchronous Whisp
// request (POST /api/submit/geojson, X-API-KEY) and publishes only an anonymised result:
//   public/audit/whisp.json and public/audit/whisp.md — no coordinates, token ids, names, villages or exact areas.
// The indicator is GFC_loss_after_2020 (Hansen Global Forest Change: area of tree cover loss from 2021 on), not the
// commodity risk columns (they do not cover sesame, paddy, sugarcane or groundnut). Geometry stays in memory only.
// Private call, no GeoIDs (Carst, 12 Nov): /submit/geojson analyses the polygons and registers nothing; GeoIDs are only
// involved on /submit/geo-ids, which this script never calls. geometryAuditTrail stays false; Whisp keeps the input and
// result files for about 10 minutes (its README), and sends Earth Engine geometry without any account context.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { ethers } from "ethers";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, "config.json"), "utf8"));
const WHISP = process.env.WHISP_URL || "https://whisp.openforis.org/api";
const FIELD = "GFC_loss_after_2020";
const DEAD = new Set(["0x0000000000000000000000000000000000000000", "0x000000000000000000000000000000000000dead"]);

const KEY = process.env.WHISP_API_KEY;
if (!KEY) { console.error("[whisp] WHISP_API_KEY is not set. Generate a key at https://whisp.openforis.org/account/api-keys and run: WHISP_API_KEY=… npm run whisp"); process.exit(1); }

// Outer boundary: out[0] = [lat0, lon0, dLat, dLon, …] as integers scaled by s; returns a closed [lon, lat] ring.
export function ringOf(meta) {
  const s = Number(meta.s) || 100000, a = meta.out?.[0];
  if (!Array.isArray(a) || a.length < 6) return null;
  let lat = a[0], lon = a[1];
  const ring = [[lon / s, lat / s]];
  for (let i = 2; i + 1 < a.length; i += 2) { lat += a[i]; lon += a[i + 1]; ring.push([lon / s, lat / s]); }
  const [f, l] = [ring[0], ring[ring.length - 1]];
  if (f[0] !== l[0] || f[1] !== l[1]) ring.push([...f]);
  return ring;
}
// Planar area on a local equirectangular projection, hectares (only used for the published size band).
export function areaHa(ring) {
  const R = 6371008.8, lat0 = (ring.reduce((t, p) => t + p[1], 0) / ring.length) * Math.PI / 180;
  const xy = ring.map(([lo, la]) => [R * (lo * Math.PI / 180) * Math.cos(lat0), R * (la * Math.PI / 180)]);
  let a = 0; for (let i = 0; i < xy.length - 1; i++) a += xy[i][0] * xy[i + 1][1] - xy[i + 1][0] * xy[i][1];
  return Math.abs(a) / 2 / 10000;
}
const band = (ha) => (ha < 0.5 ? "<0.5" : ha < 1 ? "0.5–1" : ha <= 2 ? "1–2" : ">2");

async function readTitles() {
  const p = new ethers.JsonRpcProvider(process.env.POLYGON_RPC || CFG.polygon.rpc);
  const c = new ethers.Contract(CFG.polygon.contracts.landTitle, [
    "function totalSupply() view returns (uint256)", "function tokenURI(uint256) view returns (string)", "function ownerOf(uint256) view returns (address)"], p);
  const block = await p.getBlockNumber();
  const n = Number(await c.totalSupply({ blockTag: block }));
  const plots = [], skipped = [];
  // Ids run from 1; read until n live titles are found or the ids run out (burned ids leave gaps).
  for (let id = 1, live = 0; live < n && id <= n + 50; id++) {
    let owner;
    try { owner = (await c.ownerOf(id, { blockTag: block })).toLowerCase(); } catch { continue; } // never minted / burned
    if (DEAD.has(owner)) { skipped.push(`${id} (revoked)`); continue; }
    live++;
    let meta;
    try { meta = JSON.parse(Buffer.from((await c.tokenURI(id, { blockTag: block })).split(",")[1], "base64").toString()); }
    catch { skipped.push(`${id} (unreadable tokenURI)`); continue; }
    if (/test/i.test(meta.farm || "")) { skipped.push(`${id} (test: ${meta.farm})`); continue; }
    const ring = ringOf(meta);
    if (!ring) { skipped.push(`${id} (no boundary)`); continue; }
    plots.push({ ring, ha: areaHa(ring) });
  }
  return { block, supply: n, plots, skipped };
}

async function whisp(plots) {
  // A random per-run index is the only id Whisp sees; it maps back to nothing outside this process.
  const order = plots.map((_, i) => i).sort(() => crypto.randomInt(3) - 1);
  const ids = new Map(order.map((i, k) => [`p${crypto.randomBytes(4).toString("hex")}${k}`, i]));
  const features = [...ids].map(([pid, i]) => ({ type: "Feature", properties: { pid }, geometry: { type: "Polygon", coordinates: [plots[i].ring] } }));
  const res = await fetch(`${WHISP}/submit/geojson`, {
    method: "POST", headers: { "Content-Type": "application/json", "X-API-KEY": KEY },
    body: JSON.stringify({ type: "FeatureCollection", features, analysisOptions: { externalIdColumn: "pid", unitType: "ha", async: false, geometryAuditTrail: false } }),
  });
  let body = await res.json().catch(() => ({}));
  // Sync mode answers with the result, or with a token to poll; handle both.
  const token = body?.data?.token;
  for (let t = 0; token && body?.data?.type !== "FeatureCollection" && t < 60; t++) {
    await new Promise((r) => setTimeout(r, 3000));
    body = await (await fetch(`${WHISP}/status/${token}`, { headers: { "X-API-KEY": KEY } })).json().catch(() => ({}));
    if (/fail|error|cancel/i.test(body?.code || "")) break;
  }
  if (body?.data?.type !== "FeatureCollection") throw new Error(`Whisp did not return a result: ${body?.code || res.status} ${body?.message || ""} ${body?.cause || ""}`.trim());
  const feats = body.data.features || [];
  const cols = [...new Set(feats.flatMap((f) => Object.keys(f.properties || {})))];
  if (!cols.includes(FIELD)) {
    console.error(`[whisp] ${FIELD} is not in the response. Columns returned:\n  ${cols.join(", ")}`);
    process.exit(2);
  }
  return feats.map((f) => {
    const i = ids.get(String(f.properties.pid ?? f.properties.external_id ?? ""));
    const v = f.properties[FIELD];
    const result = v == null || v === "" || Number.isNaN(Number(v)) ? "no data" : Number(v) > 0 ? "tree loss" : "no tree loss";
    return { result, area_ha_band: i == null ? "unknown" : band(plots[i].ha) };
  });
}

const { block, supply, plots, skipped } = await readTitles();
console.log(`[whisp] ${supply} titles on Polygon (block ${block}); ${plots.length} plots sent; skipped: ${skipped.join(", ") || "none"}`);
const rows = (await whisp(plots)).sort(() => crypto.randomInt(3) - 1).map((r, k) => ({ n: k + 1, ...r }));
const count = (r) => rows.filter((x) => x.result === r).length;
const out = {
  checked_at: new Date().toISOString(), source: "FAO Whisp (Open Foris)", indicator: `${FIELD} (Hansen Global Forest Change, tree cover loss from 2021)`,
  plots_checked: rows.length, no_tree_loss_since_2020: count("no tree loss"), tree_loss_since_2020: count("tree loss"), no_data: count("no data"), rows,
};
fs.writeFileSync(path.join(ROOT, "public/audit/whisp.json"), JSON.stringify(out, null, 2) + "\n");
const day = new Date(out.checked_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const md = `# ${out.no_tree_loss_since_2020} of ${out.plots_checked} plots: no tree loss since 2020

Every land title on nila.land, checked with FAO Whisp (Open Foris) on ${day}. Indicator: ${out.indicator}. Plots are anonymised: no coordinates, title numbers, names or villages are published, and rows are in random order. Machine-readable: [whisp.json](/audit/whisp.json).

| | Plots |
|---|---|
| No tree loss since 2020 | ${out.no_tree_loss_since_2020} |
| Tree loss since 2020 | ${out.tree_loss_since_2020} |
| No data | ${out.no_data} |

| # | Result | Area |
|---|---|---|
${rows.map((r) => `| ${r.n} | ${r.result} | ${r.area_ha_band} ha |`).join("\n")}

Test titles are not counted. Method: each title's outer boundary is read from the NilaLandTitle contract on Polygon and sent to the Whisp API in one request; the result per plot is "tree loss" when ${FIELD} is above 0 ha.
`;
fs.writeFileSync(path.join(ROOT, "public/audit/whisp.md"), md);
console.log(`[whisp] ${out.no_tree_loss_since_2020} of ${out.plots_checked} no tree loss, ${out.tree_loss_since_2020} tree loss, ${out.no_data} no data → public/audit/whisp.{json,md}`);
