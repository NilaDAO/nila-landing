// Crops Nila finances, read from the chains (Carst, 11 Nov: "we keep adding new ones"): the crop family names from the
// Polygon FoodToken (`cropName(code)`) and each family's sowing windows from the Stellar crop_calendar
// (`windows(family)`, months 1–12). Writes public/audit/crops.json; llms-full.txt lists the crops from it.
//   npm run crops            (also runs as part of `npm run audit`)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ethers } from "ethers";
import { rpc as srpc, Contract as SContract, TransactionBuilder, Networks, nativeToScVal, scValToNative, BASE_FEE } from "@stellar/stellar-sdk";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CFG = JSON.parse(fs.readFileSync(path.join(HERE, "config.json"), "utf8"));
const MAX_CODE = 63; // family codes are registered from 0 upwards; stop after this many

export async function readCrops() {
  const p = new ethers.JsonRpcProvider(process.env.POLYGON_RPC || CFG.polygon.rpc);
  const ft = new ethers.Contract(CFG.polygon.contracts.foodToken, ["function cropName(uint16) view returns (string)"], p);
  const block = await p.getBlockNumber();
  const names = [];
  for (let code = 0; code <= MAX_CODE; code++) {
    const name = (await ft.cropName(code, { blockTag: block })).trim();
    if (name) names.push({ code, name });
  }

  const S = CFG.stellar, s = new srpc.Server(process.env.STELLAR_RPC || S.rpc);
  const ledger = (await s.getLatestLedger()).sequence;
  const acct = await s.getAccount(S.defaultUnion);
  const windows = async (family) => {
    const tx = new TransactionBuilder(acct, { fee: BASE_FEE, networkPassphrase: Networks.PUBLIC })
      .addOperation(new SContract(S.contracts.crop_calendar).call("windows", nativeToScVal(family, { type: "u32" }))).setTimeout(30).build();
    const r = await s.simulateTransaction(tx);
    if (srpc.Api.isSimulationError(r)) throw new Error(`windows(${family}): ${r.error}`);
    return (scValToNative(r.result.retval) || []).map((w) => ({ first: Number(w.first), last: Number(w.last) }));
  };
  const crops = [];
  for (const c of names) crops.push({ ...c, windows: await windows(c.code) });
  return { polygonBlock: block, stellarLedger: ledger, read: new Date().toISOString(), crops };
}

export async function writeCrops() {
  const out = await readCrops();
  fs.writeFileSync(path.join(ROOT, "public/audit/crops.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`[crops] ${out.crops.length} crop families on Polygon, ${out.crops.filter((c) => c.windows.length).length} with a sowing window on Stellar`);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await writeCrops();
