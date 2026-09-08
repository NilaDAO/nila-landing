/**
 * useUnions.js
 *
 * Fetches union list + fund-type metadata from GenericFundViewer + GenericFundCore
 * via Multicall3.  All monetary values are returned in USDT (float).
 *
 * Conversion
 * ----------
 * nIN is pegged 1:1 to INR.  The FxPool stores `lastFxRate` scaled by 10^oracleDecimals
 * (typically 8) representing INR per 1 USDT.  Therefore:
 *
 *   rate_float  = lastFxRate / 10^oracleDecimals   (e.g. 9021281202 / 1e8 ≈ 90.21 INR/USDT)
 *   usdt        = nin_float / rate_float
 *
 * Data returned per union (active only)
 * --------------------------------------
 *   treasury, rainyDay                   – USDT float
 *   rateParams                           – { baseRateBP, kinkUtilBP, slope1BP, slope2BP, maxRateBP }
 *   reserveConfig                        – { safetyBP, safetyFloor (USDT), hardStop, exists }
 *   totalAum                             – USDT float
 *   fxRate                               – { raw: bigint, decimals: number, rateFloat: number }
 *
 * Data returned per fund
 * -----------------------
 *   junior / senior: { totalDeposits, totalBorrows, index }  – USDT float
 *   bucketThreshold  – WAD ratio float (e.g. 0.3 = 30% of senior pool, dimensionless)
 *   bucketMaxAmount  – USDT float (max single loan amount)
 *   aum, utilisation
 */

import { useMemo }         from 'react';
import { useQuery }        from '@tanstack/react-query';
import { ethers }          from 'ethers';
import viewerArtifact      from '../components/ABI/genericFundViewer.json';
import coreArtifact        from '../components/ABI/genericFundCore.json';
import fxPoolArtifact      from '../components/ABI/NilaFxPool.json';
import multicallAbi        from '../components/ABI/MultiCall3.json';

// Hardhat artifacts wrap the ABI array under `.abi`
const viewerAbi  = viewerArtifact.abi  ?? viewerArtifact;
const coreAbi    = coreArtifact.abi    ?? coreArtifact;
const fxPoolAbi  = fxPoolArtifact.abi  ?? fxPoolArtifact;

// ─── Contract addresses ────────────────────────────────────────────────────────
const VIEWER_ADDRESS    = import.meta.env.VITE_VIEWER_ADDRESS    ?? '';
const CORE_ADDRESS      = import.meta.env.VITE_CORE_ADDRESS      ?? '';
const FX_POOL_ADDRESS   = import.meta.env.VITE_FX_POOL_ADDRESS   ?? '';
const MULTICALL_ADDRESS = import.meta.env.VITE_MULTICALL_ADDRESS ?? '0xcA11bde05977b3631167028862bE2a173976CA11';
const RPC_URL           = import.meta.env.VITE_RPC_URL           ?? 'https://polygon-rpc.com';

// Tranche enum: 0 = JUNIOR, 1 = SENIOR
const JUNIOR = 0;
const SENIOR = 1;

// nIN decimals
const DECIMALS = 18;

function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

// ─── useUnions ─────────────────────────────────────────────────────────────────
export function useUnions() {
  const unionAddresses = useMemo(() => {
    const raw = import.meta.env.VITE_UNION_ADDRESSES ?? '';
    return raw
      .split(',')
      .map((a) => a.trim())
      .filter((a) => ethers.isAddress(a));
  }, []);

  return useQuery({
    queryKey:            ['unions', unionAddresses],
    enabled:             !!VIEWER_ADDRESS && unionAddresses.length > 0,
    staleTime:           5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect:  true,
    retry:               3,
    retryDelay:          (i) => Math.min(1000 * 2 ** i, 8000),
    queryFn:             () => fetchUnions(unionAddresses),
  });
}

// ─── useUnionFunds ─────────────────────────────────────────────────────────────
export function useUnionFunds(unionAddress) {
  return useQuery({
    queryKey:            ['unionFunds', unionAddress],
    enabled:             !!VIEWER_ADDRESS && ethers.isAddress(unionAddress ?? ''),
    staleTime:           5 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect:  true,
    retry:               3,
    retryDelay:          (i) => Math.min(1000 * 2 ** i, 8000),
    queryFn:             () => fetchUnionFunds(unionAddress),
  });
}

// ─── Core fetchers ─────────────────────────────────────────────────────────────

async function fetchUnions(unionAddresses) {
  const provider    = getProvider();
  const mc          = new ethers.Contract(MULTICALL_ADDRESS, multicallAbi, provider);
  const viewerIface = new ethers.Interface(viewerAbi);
  const coreIface   = new ethers.Interface(coreAbi);
  const fxIface     = new ethers.Interface(fxPoolAbi);

  const hasFxPool  = ethers.isAddress(FX_POOL_ADDRESS);
  const hasCore    = ethers.isAddress(CORE_ADDRESS);

  // ── Pass 0: fetch FX rate + oracle decimals + union structs (one multicall)
  const pass0Calls = [];
  const pass0Meta  = [];

  if (hasFxPool) {
    pass0Calls.push([FX_POOL_ADDRESS, fxIface.encodeFunctionData('lastFxRate')]);
    pass0Meta.push({ kind: 'fxRate' });
    pass0Calls.push([FX_POOL_ADDRESS, fxIface.encodeFunctionData('oracleDecimals')]);
    pass0Meta.push({ kind: 'oracleDecimals' });
  }

  for (const addr of unionAddresses) {
    pass0Calls.push([VIEWER_ADDRESS, viewerIface.encodeFunctionData('getUnion', [addr])]);
    pass0Meta.push({ kind: 'union', addr });
  }

  const [, pass0Results] = await mc.aggregate.staticCall(pass0Calls);

  // Extract FX rate: raw bigint scaled by 10^oracleDecimals (INR per 1 USDT)
  let fxRateRaw      = 0n;
  let fxDecimals     = 8;   // safe default — Chainlink USD/INR feed uses 8
  let resultOffset   = 0;

  if (hasFxPool) {
    [fxRateRaw]  = fxIface.decodeFunctionResult('lastFxRate',      pass0Results[0]);
    [fxDecimals] = fxIface.decodeFunctionResult('oracleDecimals',  pass0Results[1]);
    fxDecimals   = Number(fxDecimals);
    resultOffset = 2;
  }

  // toUsdt: convert a nIN float → USDT float
  const toUsdt   = makeToUsdt(fxRateRaw, fxDecimals);
  const fxRateWad = fxRateRaw; // keep alias for fxRate field on union

  // Decode union structs
  const rawUnions = unionAddresses.map((addr, i) => {
    const decoded = viewerIface.decodeFunctionResult('getUnion', pass0Results[resultOffset + i]);
    const u = decoded[0];
    return {
      address:   addr,
      name:      u.name,
      location:  u.location,
      active:    u.active,
      fundTypes: [...u.fundTypes],
      fundIds:   [...u.fundIds],
    };
  });

  const activeUnions = rawUnions.filter((u) => u.active);
  if (activeUnions.length === 0) return rawUnions;

  // ── Pass 1: treasury + fund totals + rate params + reserve + bucket cfg ───
  const calls    = [];
  const callMeta = [];

  // Global fee BPs (one call each, not per-union)
  if (hasCore) {
    calls.push([CORE_ADDRESS, coreIface.encodeFunctionData('treasuryFeeBP')]);
    callMeta.push({ kind: 'treasuryFeeBP' });

    calls.push([CORE_ADDRESS, coreIface.encodeFunctionData('rainyFeeBP')]);
    callMeta.push({ kind: 'rainyFeeBP' });
  }

  for (const u of activeUnions) {
    calls.push([VIEWER_ADDRESS, viewerIface.encodeFunctionData('getTreasuryBalances', [u.address])]);
    callMeta.push({ unionAddr: u.address, kind: 'treasury' });

    for (const loanType of u.fundTypes) {
      for (const tranche of [JUNIOR, SENIOR]) {
        calls.push([
          VIEWER_ADDRESS,
          viewerIface.encodeFunctionData('getFundTotalsByTranche', [tranche, u.address, loanType]),
        ]);
        callMeta.push({ unionAddr: u.address, kind: 'fundTotals', loanType, tranche });
      }
    }

    if (hasCore) {
      calls.push([CORE_ADDRESS, coreIface.encodeFunctionData('rateParamsByUnion', [u.address])]);
      callMeta.push({ unionAddr: u.address, kind: 'rateParams' });

      calls.push([CORE_ADDRESS, coreIface.encodeFunctionData('reserveCfgByUnion', [u.address])]);
      callMeta.push({ unionAddr: u.address, kind: 'reserveConfig' });

      for (const loanType of u.fundTypes) {
        calls.push([CORE_ADDRESS, coreIface.encodeFunctionData('bucketTresholds', [u.address, loanType])]);
        callMeta.push({ unionAddr: u.address, kind: 'bucketThreshold', loanType });

        calls.push([CORE_ADDRESS, coreIface.encodeFunctionData('bucketMaxAmount', [u.address, loanType])]);
        callMeta.push({ unionAddr: u.address, kind: 'bucketMaxAmount', loanType });
      }
    }
  }

  const [, results] = await mc.aggregate.staticCall(calls);

  // ── Aggregate ─────────────────────────────────────────────────────────────
  const treasuryByUnion   = {};
  const fundTotalsByUnion = {};
  const rateParamsByUnion = {};
  const reserveCfgByUnion = {};
  const bucketCfgByUnion  = {};
  let globalTreasuryFeeBP = 0;
  let globalRainyFeeBP    = 0;

  results.forEach((data, idx) => {
    const meta = callMeta[idx];

    if (meta.kind === 'treasuryFeeBP') {
      const [bp] = coreIface.decodeFunctionResult('treasuryFeeBP', data);
      globalTreasuryFeeBP = Number(bp);
    }

    if (meta.kind === 'rainyFeeBP') {
      const [bp] = coreIface.decodeFunctionResult('rainyFeeBP', data);
      globalRainyFeeBP = Number(bp);
    }

    if (meta.kind === 'treasury') {
      const [treasury, rainyDay] = viewerIface.decodeFunctionResult('getTreasuryBalances', data);
      treasuryByUnion[meta.unionAddr] = {
        treasury: toUsdt(fmtNin(treasury)),
        rainyDay: toUsdt(fmtNin(rainyDay)),
      };
    }

    if (meta.kind === 'fundTotals') {
      const [totalDeposits, totalBorrows, index] = viewerIface.decodeFunctionResult(
        'getFundTotalsByTranche', data,
      );
      if (!fundTotalsByUnion[meta.unionAddr]) fundTotalsByUnion[meta.unionAddr] = {};
      if (!fundTotalsByUnion[meta.unionAddr][meta.loanType])
        fundTotalsByUnion[meta.unionAddr][meta.loanType] = {};
      const side = meta.tranche === JUNIOR ? 'junior' : 'senior';
      fundTotalsByUnion[meta.unionAddr][meta.loanType][side] = {
        totalDeposits: toUsdt(fmtNin(totalDeposits)),
        totalBorrows:  toUsdt(fmtNin(totalBorrows)),
        index:         index.toString(),
      };
    }

    if (meta.kind === 'rateParams') {
      const [baseRateBP, kinkUtilBP, slope1BP, slope2BP, maxRateBP] =
        coreIface.decodeFunctionResult('rateParamsByUnion', data);
      rateParamsByUnion[meta.unionAddr] = {
        baseRateBP: Number(baseRateBP),
        kinkUtilBP: Number(kinkUtilBP),
        slope1BP:   Number(slope1BP),
        slope2BP:   Number(slope2BP),
        maxRateBP:  Number(maxRateBP),
      };
    }

    if (meta.kind === 'reserveConfig') {
      const [safetyBP, safetyFloor, hardStop, exists] =
        coreIface.decodeFunctionResult('reserveCfgByUnion', data);
      reserveCfgByUnion[meta.unionAddr] = {
        safetyBP:    Number(safetyBP),
        safetyFloor: toUsdt(fmtNin(safetyFloor)),
        hardStop:    Boolean(hardStop),
        exists:      Boolean(exists),
      };
    }

    if (meta.kind === 'bucketThreshold') {
      if (!bucketCfgByUnion[meta.unionAddr]) bucketCfgByUnion[meta.unionAddr] = {};
      if (!bucketCfgByUnion[meta.unionAddr][meta.loanType])
        bucketCfgByUnion[meta.unionAddr][meta.loanType] = {};
      const [thresholdWad] = coreIface.decodeFunctionResult('bucketTresholds', data);
      // thresholdWad is a WAD ratio (dimensionless), not a currency — decode with 18 decimals only
      bucketCfgByUnion[meta.unionAddr][meta.loanType].threshold = parseFloat(ethers.formatUnits(thresholdWad, 18));
    }

    if (meta.kind === 'bucketMaxAmount') {
      if (!bucketCfgByUnion[meta.unionAddr]) bucketCfgByUnion[meta.unionAddr] = {};
      if (!bucketCfgByUnion[meta.unionAddr][meta.loanType])
        bucketCfgByUnion[meta.unionAddr][meta.loanType] = {};
      const [maxLoanAmount] = coreIface.decodeFunctionResult('bucketMaxAmount', data);
      bucketCfgByUnion[meta.unionAddr][meta.loanType].maxAmount = toUsdt(fmtNin(maxLoanAmount));
    }
  });

  // ── Merge ─────────────────────────────────────────────────────────────────
  return rawUnions.map((u) => {
    if (!u.active) return u;

    const treasury   = treasuryByUnion[u.address]  ?? { treasury: 0, rainyDay: 0 };
    const fundTotals = fundTotalsByUnion[u.address] ?? {};
    const rateParams = rateParamsByUnion[u.address] ?? null;
    const reserveCfg = reserveCfgByUnion[u.address] ?? null;
    const bucketCfgs = bucketCfgByUnion[u.address]  ?? {};

    const funds = u.fundTypes.map((loanType, i) => {
      const totals    = fundTotals[loanType] ?? {};
      const junior    = totals.junior ?? { totalDeposits: 0, totalBorrows: 0, index: '0' };
      const senior    = totals.senior ?? { totalDeposits: 0, totalBorrows: 0, index: '0' };
      const bucketCfg = bucketCfgs[loanType] ?? { threshold: 0, maxAmount: 0 };
      const aum       = junior.totalDeposits + senior.totalDeposits;

      return {
        loanType,
        fundId:          u.fundIds[i] ?? '',
        junior,
        senior,
        bucketThreshold: bucketCfg.threshold,  // WAD ratio float (dimensionless, e.g. 0.3 = 30%)
        bucketMaxAmount: bucketCfg.maxAmount,   // USDT
        aum,                                    // USDT
        utilisation: safeDiv(
          junior.totalBorrows + senior.totalBorrows,
          aum,
        ),
      };
    });

    const fxRateFloat = fxRateRaw ? parseFloat(ethers.formatUnits(fxRateRaw, fxDecimals)) : 0;

    return {
      ...u,
      fxRate: { raw: fxRateRaw, decimals: fxDecimals, rateFloat: fxRateFloat }, // INR per 1 USDT
      treasury:        treasury.treasury,   // USDT
      rainyDay:        treasury.rainyDay,   // USDT
      treasuryFeeBP:   globalTreasuryFeeBP, // basis points (e.g. 100 = 1%)
      rainyFeeBP:      globalRainyFeeBP,    // basis points
      rateParams,
      reserveConfig: reserveCfg,
      funds,
      totalAum: funds.reduce((s, f) => s + f.aum, 0),  // USDT
    };
  });
}

async function fetchUnionFunds(unionAddress) {
  const provider    = getProvider();
  const mc          = new ethers.Contract(MULTICALL_ADDRESS, multicallAbi, provider);
  const viewerIface = new ethers.Interface(viewerAbi);
  const fxIface     = new ethers.Interface(fxPoolAbi);

  const hasFxPool = ethers.isAddress(FX_POOL_ADDRESS);

  // Batch: fxRate + oracleDecimals (optional) + getUnion in one call
  const initCalls = [];
  if (hasFxPool) {
    initCalls.push([FX_POOL_ADDRESS, fxIface.encodeFunctionData('lastFxRate')]);
    initCalls.push([FX_POOL_ADDRESS, fxIface.encodeFunctionData('oracleDecimals')]);
  }
  initCalls.push([VIEWER_ADDRESS, viewerIface.encodeFunctionData('getUnion', [unionAddress])]);

  const [, initResults] = await mc.aggregate.staticCall(initCalls);

  let fxRateRaw  = 0n;
  let fxDecimals = 8;
  let unionDataRaw;
  if (hasFxPool) {
    [fxRateRaw]  = fxIface.decodeFunctionResult('lastFxRate',     initResults[0]);
    [fxDecimals] = fxIface.decodeFunctionResult('oracleDecimals', initResults[1]);
    fxDecimals   = Number(fxDecimals);
    unionDataRaw = initResults[2];
  } else {
    unionDataRaw = initResults[0];
  }

  const toUsdt = makeToUsdt(fxRateRaw, fxDecimals);

  const decoded  = viewerIface.decodeFunctionResult('getUnion', unionDataRaw);
  const u        = decoded[0];
  const fundTypes = [...u.fundTypes];
  const fundIds   = [...u.fundIds];

  if (fundTypes.length === 0) return [];

  // Per fundType: totals + liquidity buffer
  const calls = [];
  const meta  = [];

  for (const loanType of fundTypes) {
    for (const tranche of [JUNIOR, SENIOR]) {
      calls.push([
        VIEWER_ADDRESS,
        viewerIface.encodeFunctionData('getFundTotalsByTranche', [tranche, unionAddress, loanType]),
      ]);
      meta.push({ kind: 'totals', loanType, tranche });
    }

    calls.push([
      VIEWER_ADDRESS,
      viewerIface.encodeFunctionData('getLiquidityBuffer', [unionAddress, loanType]),
    ]);
    meta.push({ kind: 'liquidity', loanType });
  }

  const [, results] = await mc.aggregate.staticCall(calls);

  const byLoanType = {};
  results.forEach((data, idx) => {
    const m = meta[idx];
    if (!byLoanType[m.loanType]) byLoanType[m.loanType] = {};

    if (m.kind === 'totals') {
      const [totalDeposits, totalBorrows, index] = viewerIface.decodeFunctionResult(
        'getFundTotalsByTranche', data,
      );
      const side = m.tranche === JUNIOR ? 'junior' : 'senior';
      byLoanType[m.loanType][side] = {
        totalDeposits: toUsdt(fmtNin(totalDeposits)),
        totalBorrows:  toUsdt(fmtNin(totalBorrows)),
        index:         index.toString(),
      };
    }

    if (m.kind === 'liquidity') {
      const [safetyBP, safetyFloor, claimableReserved, idleCash, hardStop, requiredReserve, headroom] =
        viewerIface.decodeFunctionResult('getLiquidityBuffer', data);
      byLoanType[m.loanType].liquidity = {
        safetyBP:          Number(safetyBP),
        safetyFloor:       toUsdt(fmtNin(safetyFloor)),
        claimableReserved: toUsdt(fmtNin(claimableReserved)),
        idleCash:          toUsdt(fmtNin(idleCash)),
        hardStop:          Boolean(hardStop),
        requiredReserve:   toUsdt(fmtNin(requiredReserve)),
        headroom:          toUsdt(fmtNin(headroom)),
      };
    }
  });

  return fundTypes.map((loanType, i) => {
    const d         = byLoanType[loanType] ?? {};
    const junior    = d.junior    ?? { totalDeposits: 0, totalBorrows: 0, index: '0' };
    const senior    = d.senior    ?? { totalDeposits: 0, totalBorrows: 0, index: '0' };
    const liquidity = d.liquidity ?? null;
    const aum       = junior.totalDeposits + senior.totalDeposits;

    return {
      loanType,
      fundId:      fundIds[i] ?? '',
      junior,
      senior,
      liquidity,
      aum,
      utilisation: safeDiv(junior.totalBorrows + senior.totalBorrows, aum),
    };
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Parse a raw bigint from the contract (18-decimal nIN) to a JS float. */
function fmtNin(raw) {
  return parseFloat(ethers.formatUnits(raw, DECIMALS));
}

/**
 * Returns a converter function: ninFloat → usdtFloat.
 *
 * fxRateRaw is a bigint scaled by 10^fxDecimals = INR per 1 USDT
 * (e.g. 9_021_281_202 / 1e8 ≈ 90.21 INR/USDT).
 * 1 nIN = 1 INR, so:  usdt = nin / rate_float
 *
 * If fxRateRaw is 0 (not loaded), the value passes through unchanged.
 */
function makeToUsdt(fxRateRaw, fxDecimals = 8) {
  if (!fxRateRaw || fxRateRaw === 0n) return (v) => v;
  const rate = parseFloat(ethers.formatUnits(fxRateRaw, fxDecimals)); // INR per USDT
  return (ninFloat) => ninFloat / rate;
}

function safeDiv(num, denom) {
  if (!denom || denom === 0) return 0;
  return num / denom;
}

// ─── Chainlink AggregatorV3 (minimal ABI for historical lookups) ──────────────
const CHAINLINK_AGG_ABI = [
  'function decimals() view returns (uint8)',
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function getRoundData(uint80 _roundId) view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
];

// localStorage cache for per-position entry FX rates (7-day TTL, keyed by shares)
const ENTRY_FX_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function entryFxCacheKey(wallet, union, sharesBig) {
  return `nila_entryFx_v1_${wallet.toLowerCase()}_${union.toLowerCase()}_${sharesBig.toString()}`;
}

function loadEntryFxCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, cachedAt } = JSON.parse(raw);
    if (Date.now() - cachedAt > ENTRY_FX_CACHE_TTL) { localStorage.removeItem(key); return null; }
    return data;
  } catch (_) { return null; }
}

function saveEntryFxCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, cachedAt: Date.now() })); } catch (_) {}
}

/**
 * Binary-search a Chainlink AggregatorV3 proxy for the round that was current
 * at `targetTs`. Returns the `answer` bigint or null if unavailable. Searches
 * only within the current phase — if targetTs predates the phase's earliest
 * round the earliest round's answer is returned instead.
 */
async function chainlinkRateAtTimestamp(provider, aggregatorAddr, targetTs) {
  const agg = new ethers.Contract(aggregatorAddr, CHAINLINK_AGG_ABI, provider);
  const latest = await agg.latestRoundData();
  const latestTs = Number(latest.updatedAt);
  if (targetTs >= latestTs) return latest.answer;

  const MASK_64 = (1n << 64n) - 1n;
  const phaseId = BigInt(latest.roundId) >> 64n;
  const latestAggRound = BigInt(latest.roundId) & MASK_64;
  const pack = (aggRound) => (phaseId << 64n) | aggRound;

  let lo = 1n, hi = latestAggRound, bestAnswer = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1n;
    let data;
    try { data = await agg.getRoundData(pack(mid)); }
    catch (_) { lo = mid + 1n; continue; }
    const ts = Number(data.updatedAt);
    if (ts === 0) { lo = mid + 1n; continue; }
    if (ts <= targetTs) { bestAnswer = data.answer; lo = mid + 1n; }
    else                { hi = mid - 1n; }
  }
  if (bestAnswer !== null) return bestAnswer;
  try { return (await agg.getRoundData(pack(1n))).answer; } catch (_) { return null; }
}

/**
 * queryFilter wrapper that tries an unbounded range first, then falls back to
 * backward-walking in chunks. Public RPCs (e.g. polygon-rpc.com) reject
 * `fromBlock: 0`; this keeps things working across both public and Alchemy.
 */
async function queryEventsPaged(contract, filter, provider, label = '') {
  try {
    return await contract.queryFilter(filter, 0, 'latest');
  } catch (err) {
    console.warn('[queryEventsPaged]', label, 'unbounded failed, paging:', err?.message);
  }
  const latestBlock = await provider.getBlockNumber();
  const CHUNK     = 100_000;   // ≈ 2.3 days on Polygon
  const MAX_BACK  = 15_000_000; // ≈ 11 months
  const out = [];
  let to = latestBlock;
  while (to > 0 && latestBlock - to < MAX_BACK) {
    const from = Math.max(0, to - CHUNK);
    try {
      const evs = await contract.queryFilter(filter, from, to);
      out.push(...evs);
    } catch (err) {
      console.warn('[queryEventsPaged]', label, 'chunk', from, to, 'failed:', err?.message);
    }
    if (from === 0) break;
    to = from - 1;
  }
  return out;
}

/**
 * For each positioned union, scan Deposit events for this wallet and compute a
 * shares-weighted entry FX rate (INR per USDT, float). Cached in localStorage
 * keyed by (wallet, union, shares) so it only recomputes when the position
 * changes. Returns { [unionAddrLower]: number | null }.
 */
async function fetchEntryFxRates(provider, walletAddress, positionByAddr, currentFxRateFloat) {
  console.log('[fetchEntryFxRates] ENTER — positions:', Object.keys(positionByAddr).length,
              'wallet:', walletAddress, 'FX_POOL:', FX_POOL_ADDRESS);
  if (!ethers.isAddress(FX_POOL_ADDRESS)) {
    console.warn('[fetchEntryFxRates] FX_POOL_ADDRESS not set');
    return {};
  }
  const fxPool = new ethers.Contract(FX_POOL_ADDRESS, fxPoolAbi, provider);

  // The deployed FxPool may not expose `usdInrOracle()`. Try the getter first;
  // on revert, fall back to scanning `OracleUpdated(address oracle, uint8 decimals)`
  // events and taking the most recent one.
  let oracleAddr = null;
  let oracleDec  = 8;
  try {
    oracleAddr = await fxPool.usdInrOracle();
    oracleDec  = Number(await fxPool.oracleDecimals());
  } catch (_) {
    console.warn('[fetchEntryFxRates] usdInrOracle() reverted — scanning OracleUpdated events');
    try {
      const events = await queryEventsPaged(fxPool, fxPool.filters.OracleUpdated(), provider, 'OracleUpdated');
      if (events.length > 0) {
        const latest = events.sort((a, b) =>
          (b.blockNumber - a.blockNumber) || (b.logIndex - a.logIndex)
        )[0];
        oracleAddr = latest.args.oracle;
        oracleDec  = Number(latest.args.decimals);
      }
    } catch (err) {
      console.warn('[fetchEntryFxRates] OracleUpdated scan failed:', err);
    }
  }
  if (!oracleAddr || !ethers.isAddress(oracleAddr) || oracleAddr === ethers.ZeroAddress) {
    console.warn('[fetchEntryFxRates] Chainlink oracle address unavailable:', oracleAddr);
    return {};
  }
  console.log('[fetchEntryFxRates] oracle:', oracleAddr, 'decimals:', oracleDec);

  // Auto-detect feed direction. FxPool's `lastFxRate` is INR per USDT (e.g. 90.21).
  // Chainlink may expose either INR/USD (same direction, ≈90) or USD/INR (inverse,
  // ≈0.011). We compare latestRoundData to the known FxPool rate and pick whichever
  // orientation is closer, then invert downstream if needed.
  let feedInverted = false;
  try {
    const probe = new ethers.Contract(oracleAddr, CHAINLINK_AGG_ABI, provider);
    const latest = await probe.latestRoundData();
    const feedFloat = parseFloat(ethers.formatUnits(latest.answer, oracleDec));
    if (currentFxRateFloat && feedFloat > 0) {
      const directDiff  = Math.abs(feedFloat - currentFxRateFloat) / currentFxRateFloat;
      const inverseDiff = Math.abs((1 / feedFloat) - currentFxRateFloat) / currentFxRateFloat;
      feedInverted = inverseDiff < directDiff;
    }
    console.log('[fetchEntryFxRates] feed latest:', feedFloat, 'fxPool:', currentFxRateFloat, 'inverted:', feedInverted);
  } catch (err) {
    console.warn('[fetchEntryFxRates] feed probe failed (assuming direct):', err?.message);
  }

  const core = new ethers.Contract(CORE_ADDRESS, coreAbi, provider);
  const entries = Object.entries(positionByAddr);
  const out = {};

  await Promise.all(entries.map(async ([addr, pos]) => {
    const cacheKey = entryFxCacheKey(walletAddress, addr, pos.shares);
    const cached = loadEntryFxCache(cacheKey);
    if (cached && typeof cached.entryRate === 'number') {
      console.log('[fetchEntryFxRates]', addr, 'cache hit →', cached.entryRate);
      out[addr] = cached.entryRate;
      return;
    }

    try {
      // Deposit(investor indexed, tranche, unionAddr indexed, ...) — ethers v6
      // filters are positional across ALL params, so non-indexed slots need null.
      const filter = core.filters.Deposit(walletAddress, null, addr);
      const events = await queryEventsPaged(core, filter, provider, `Deposit:${addr}`);
      console.log('[fetchEntryFxRates]', addr, 'events:', events.length,
        'tranches:', events.map((e) => Number(e.args.tranche)));
      const seniorEvents = events.filter((e) => Number(e.args.tranche) === SENIOR);
      if (seniorEvents.length === 0) {
        console.warn('[fetchEntryFxRates]', addr, 'no senior Deposit events found');
        out[addr] = null;
        return;
      }

      const blockTimes = await Promise.all(
        seniorEvents.map((e) => provider.getBlock(e.blockNumber).then((b) => Number(b.timestamp)))
      );

      const uniqueTs = [...new Set(blockTimes)];
      const tsRate = {};
      await Promise.all(uniqueTs.map(async (ts) => {
        const answer = await chainlinkRateAtTimestamp(provider, oracleAddr, ts);
        if (answer === null) return;
        const raw = parseFloat(ethers.formatUnits(answer, oracleDec));
        // Normalize to "INR per USDT" regardless of feed direction
        tsRate[ts] = feedInverted ? (raw > 0 ? 1 / raw : 0) : raw;
      }));

      let weightSum = 0, rateWeighted = 0;
      seniorEvents.forEach((e, i) => {
        const rate = tsRate[blockTimes[i]];
        if (!rate) return;
        const shares = parseFloat(ethers.formatUnits(e.args.sharesOut, DECIMALS));
        weightSum += shares;
        rateWeighted += rate * shares;
      });

      const entryRate = weightSum > 0 ? rateWeighted / weightSum : null;
      out[addr] = entryRate;
      if (entryRate !== null) saveEntryFxCache(cacheKey, { entryRate });
    } catch (err) {
      console.warn('[fetchEntryFxRates]', addr, err);
      out[addr] = null;
    }
  }));

  return out;
}

// ─── API URL ────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL ?? '';

// ─── useWeightedRates ──────────────────────────────────────────────────────────
/**
 * Fetches the weighted average interest rate (in %) for each fund in a union.
 *
 * POST /filter_events/weightedRate
 * body: { items: [{ union: string, fund: bytes32 }], include_history: true }
 * response: { count, items: [{ union, fund, found, weighted_rate_bp,
 *   history: [{ updated_at, weighted_rate_bp, loan_count, total_amount, dormant_cash_amount }] }] }
 *
 * Returns:
 *   rateByFund:    { [fundId: string]: number }   — current rate in % (e.g. 7.5)
 *   historyByFund: { [fundId: string]: { date: string, ratePct: number }[] }  — oldest→newest
 *   An empty array [] means loaded but no history; null means still loading.
 */
async function fetchWeightedRates(apiUrl, pairs) {
  if (!pairs?.length) return { count: 0, items: [] };
  console.log('[weightedRates] fetching', pairs);
  const r = await fetch(`${apiUrl}/filter_events/weightedRate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: pairs, include_history: true }),
  });
  if (!r.ok) throw new Error(`weightedRate ${r.status}`);
  const data = await r.json();
  console.log('[weightedRates] response', data);
  return data;
}

export function useWeightedRates(unionAddress, fundIds) {
  const pairs = useMemo(() => {
    if (!unionAddress || !fundIds?.length) return [];
    const filtered = fundIds.filter((f) => typeof f === 'string' && /^0x[0-9a-fA-F]{64}$/.test(f));
    console.log('[weightedRates] unionAddress:', unionAddress, 'fundIds:', fundIds, 'filtered pairs:', filtered);
    return filtered.map((fund) => ({ union: unionAddress, fund: fund.toLowerCase() }));
  }, [unionAddress, fundIds]);

  const fundsKey = pairs.map((p) => p.fund).join('|');

  const query = useQuery({
    queryKey: ['weightedRates', unionAddress, fundsKey],
    enabled: !!API_URL && pairs.length > 0,
    staleTime: 7 * 24 * 60 * 60 * 1000, // 1 week
    gcTime:    7 * 24 * 60 * 60 * 1000,
    refetchInterval:            7 * 24 * 60 * 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (i) => Math.min(2000 * 2 ** i, 10000),
    queryFn: () => fetchWeightedRates(API_URL, pairs),
  });

  const rateByFund = useMemo(() => {
    const out = {};
    for (const item of query.data?.items ?? []) {
      if (!item?.fund || !item?.found) continue;
      const bp = Number(item.weighted_rate_bp);
      if (!Number.isFinite(bp)) continue;
      out[item.fund.toLowerCase()] = bp / 100; // basis points → percent
    }
    return out;
  }, [query.data]);

  const historyByFund = useMemo(() => {
    const out = {};
    for (const item of query.data?.items ?? []) {
      if (!item?.fund) continue;
      // Set to [] when history is missing/empty so consumers can distinguish
      // "still loading" (key absent → null via ??) from "loaded, no data" ([])
      out[item.fund.toLowerCase()] = Array.isArray(item.history)
        ? item.history
            .map((h) => ({
              date:    new Date(Number(h.updated_at) * 1000).toISOString(),
              ratePct: Number(h.weighted_rate_bp) / 100,
            }))
            .filter((h) => Number.isFinite(h.ratePct))
        : [];
    }
    return out;
  }, [query.data]);

  return { ...query, rateByFund, historyByFund };
}

// ─── useActiveLoans ────────────────────────────────────────────────────────────
/**
 * Fetches all transferable (accepted) loans for a union and filters to active ones.
 *
 * POST /filter_events/transferableLoans
 * body: { address: unionAddress }
 * response: { count, items: [{ loan_id, borrower, fund, active, amount, rate_bp, … }] }
 *
 * Returns { activeCount: number, activeLoans: Loan[] }
 */
export function useActiveLoans(unionAddress) {
  const query = useQuery({
    queryKey: ['activeLoans', unionAddress],
    enabled: !!API_URL && !!unionAddress,
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 8000),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/filter_events/transferableLoans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: unionAddress }),
      });
      if (!res.ok) throw new Error(`transferableLoans ${res.status}`);
      const json = await res.json();

      const items = Array.isArray(json.items)
        ? json.items.map((i) => ({
            id:         i.loan_id ?? i.id,
            borrower:   i.borrower,
            fund:       i.fund,
            active:     Boolean(i.active),
            amount:     (() => {
              try { return Number(ethers.formatUnits(i.amount ?? '0', 18)); } catch { return Number(i.amount) || 0; }
            })(),
            rateBP:     Number(i.rate_bp ?? i.rateBP ?? 0),
            drawdownTs: i.drawdown_ts,
            maturityTs: i.maturity_ts,
          }))
        : [];

      return { ...json, items };
    },
  });

  const activeLoans = useMemo(
    () => (query.data?.items ?? []).filter((l) => l.active),
    [query.data],
  );

  return { ...query, activeLoans, activeCount: activeLoans.length };
}

// ─── useInvestorPositions ─────────────────────────────────────────────────────
/**
 * Fetches the connected wallet's senior-tranche position for each union.
 *
 * Pass 1 (aggregate3): FX rate + getInvestorSenior + getUnion per address
 * Pass 2 (aggregate3): getFundTotalsByTranche(SENIOR) only for unions with shares > 0
 *
 * Returns { [unionAddressLower]: { amount, earnedPending } } in USDT.
 *   amount        – deposited principal
 *   earnedPending – accrued interest (index growth)
 */
export function useInvestorPositions(walletAddress, unionAddresses) {
  const key = useMemo(
    () => (unionAddresses ?? []).join(','),
    [unionAddresses],
  );

  const enabled = !!walletAddress && ethers.isAddress(CORE_ADDRESS ?? '') && (unionAddresses ?? []).length > 0;

  return useQuery({
    queryKey:            ['investorPositions', walletAddress, key],
    enabled,
    staleTime:           60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect:  true,
    retry:               2,
    retryDelay:          (i) => Math.min(1000 * 2 ** i, 4000),
    queryFn:             async () => {
      console.log('[useInvestorPositions] queryFn firing…');
      try {
        const result = await fetchInvestorPositions(walletAddress, unionAddresses);
        console.log('[useInvestorPositions] result:', result);
        return result;
      } catch (err) {
        console.error('[useInvestorPositions] error:', err);
        throw err;
      }
    },
  });
}

async function fetchInvestorPositions(walletAddress, unionAddresses) {
  const provider    = getProvider();
  const mc          = new ethers.Contract(MULTICALL_ADDRESS, multicallAbi, provider);
  const coreIface   = new ethers.Interface(coreAbi);
  const viewerIface = new ethers.Interface(viewerAbi);
  const fxIface     = new ethers.Interface(fxPoolAbi);

  const hasFxPool = ethers.isAddress(FX_POOL_ADDRESS);

  // ── Pass 1: FX rate + positions + union structs (for fundTypes) ──────────
  const p1Calls = [];
  const p1Meta  = [];

  if (hasFxPool) {
    p1Calls.push({ target: FX_POOL_ADDRESS, allowFailure: false, callData: fxIface.encodeFunctionData('lastFxRate') });
    p1Meta.push({ kind: 'fxRate' });
    p1Calls.push({ target: FX_POOL_ADDRESS, allowFailure: false, callData: fxIface.encodeFunctionData('oracleDecimals') });
    p1Meta.push({ kind: 'oracleDecimals' });
  }

  for (const addr of unionAddresses) {
    p1Calls.push({
      target: CORE_ADDRESS, allowFailure: true,
      callData: coreIface.encodeFunctionData('getInvestorSenior', [addr, walletAddress]),
    });
    p1Meta.push({ kind: 'position', addr: addr.toLowerCase() });

    p1Calls.push({
      target: VIEWER_ADDRESS, allowFailure: true,
      callData: viewerIface.encodeFunctionData('getUnion', [addr]),
    });
    p1Meta.push({ kind: 'union', addr: addr.toLowerCase() });
  }

  const p1Results = await mc.aggregate3.staticCall(p1Calls);

  // Parse FX rate
  let fxRateRaw = 0n;
  let fxDec     = 8;
  if (hasFxPool) {
    if (p1Results[0].success) [fxRateRaw] = fxIface.decodeFunctionResult('lastFxRate', p1Results[0].returnData);
    if (p1Results[1].success) { [fxDec] = fxIface.decodeFunctionResult('oracleDecimals', p1Results[1].returnData); fxDec = Number(fxDec); }
  }
  const toUsdt = makeToUsdt(fxRateRaw, fxDec);

  // Parse positions + fundTypes
  // NOTE: the deployed Core contract returns a 6-field struct for getInvestorSenior
  // (unbondPeriod, shares, locked, pending, pendingPrincipalSnap, entryIndex)
  // but the ABI file has 7 fields (extra `unclaimed`). Decode manually.
  const INVESTOR_SENIOR_TYPE = '(uint40,uint256,uint256,uint256,uint256,uint256)';
  const abiCoder = ethers.AbiCoder.defaultAbiCoder();

  const positionByAddr  = {};
  const fundTypesByAddr = {};

  for (let i = 0; i < p1Meta.length; i++) {
    const m = p1Meta[i];
    const r = p1Results[i];
    if (!r.success) continue;

    if (m.kind === 'position') {
      const [decoded] = abiCoder.decode([INVESTOR_SENIOR_TYPE], r.returnData);
      const shares        = decoded[1];
      const pendingShares = decoded[3];
      const entryIndex    = decoded[5];
      if (shares > 0n) positionByAddr[m.addr] = { shares, pendingShares, entryIndex };
    } else if (m.kind === 'union') {
      const u = viewerIface.decodeFunctionResult('getUnion', r.returnData)[0];
      if (u.fundTypes?.length > 0) fundTypesByAddr[m.addr] = [...u.fundTypes];
    }
  }

  // ── Pass 2: senior indexes only for unions where user has a position ─────
  const positioned = Object.keys(positionByAddr);
  if (positioned.length === 0) return {};

  const p2Calls = [];
  const p2Meta  = [];

  for (const addr of positioned) {
    const ft = fundTypesByAddr[addr];
    if (!ft?.length) continue;
    p2Calls.push({
      target: VIEWER_ADDRESS, allowFailure: true,
      callData: viewerIface.encodeFunctionData('getFundTotalsByTranche', [SENIOR, addr, ft[0]]),
    });
    p2Meta.push({ addr });
  }

  if (p2Calls.length === 0) return {};

  // Current FX rate as a float (INR per USDT), for the USD P&L math and for
  // auto-detecting Chainlink feed direction in fetchEntryFxRates.
  const currentRateFloat = fxRateRaw > 0n
    ? parseFloat(ethers.formatUnits(fxRateRaw, fxDec))
    : 0;

  // Kick off entry-FX discovery in parallel with the index multicall
  const entryRatesPromise = fetchEntryFxRates(provider, walletAddress, positionByAddr, currentRateFloat);
  const p2Results = await mc.aggregate3.staticCall(p2Calls);
  const entryRates = await entryRatesPromise;

  // ── Compute USDT values ──────────────────────────────────────────────────
  const RAY = 10n ** 27n;
  const out = {};

  p2Results.forEach((r, i) => {
    if (!r.success) return;
    const addr = p2Meta[i].addr;
    const pos  = positionByAddr[addr];
    const [, , index] = viewerIface.decodeFunctionResult('getFundTotalsByTranche', r.returnData);
    if (!index || index === 0n) return;

    const principalNin      = pos.shares * pos.entryIndex / RAY;
    const currentNin        = pos.shares * index           / RAY;
    const principalNinFloat = fmtNin(principalNin);
    const currentNinFloat   = fmtNin(currentNin);

    // "Alongside" USD P&L: principal at entry-time Chainlink rate vs current
    // value at today's rate. Captures FX movement as well as interest growth.
    const entryRate = entryRates[addr];
    let amountUsdAtEntry = null;
    let earnedPendingUsd = null;
    if (entryRate && currentRateFloat) {
      amountUsdAtEntry = principalNinFloat / entryRate;
      const currentUsd = currentNinFloat / currentRateFloat;
      earnedPendingUsd = currentUsd - amountUsdAtEntry;
    }

    out[addr] = {
      amount:        toUsdt(principalNinFloat),
      earnedPending: toUsdt(fmtNin(currentNin - principalNin)),
      amountUsdAtEntry,
      earnedPendingUsd,
      entryFxRate:   entryRate ?? null,
      currentFxRate: currentRateFloat || null,
      // raw on-chain values for withdrawal share math
      totalShares:   pos.shares,
      pendingShares: pos.pendingShares,
      seniorIndex:   index,   // bigint — current senior accumulator index
    };
  });

  return out;
}

// ─── useUnbondPreview ──────────────────────────────────────────────────────────
/**
 * Calls previewUnbondSenior(unionAddr, investor) on the Viewer contract.
 * Returns { requestTs, minWindowTs, pastMin, eligibleNow } or null while loading.
 *
 * requestTs    – Unix timestamp when unbond was requested (0 = none active)
 * minWindowTs  – Unix timestamp when the minimum unbonding window closes
 * pastMin      – true once block.timestamp >= minWindowTs
 * eligibleNow  – true when pastMin AND sufficient liquidity exists to claim
 */
export function useUnbondPreview(unionAddr, walletAddr) {
  return useQuery({
    queryKey: ['unbondPreview', unionAddr?.toLowerCase(), walletAddr?.toLowerCase()],
    enabled:
      !!VIEWER_ADDRESS &&
      !!CORE_ADDRESS &&
      ethers.isAddress(unionAddr ?? '') &&
      ethers.isAddress(walletAddr ?? ''),
    staleTime:            30_000,
    refetchOnWindowFocus: true,
    refetchInterval:      60_000,
    retry:                2,
    retryDelay:           (i) => Math.min(1000 * 2 ** i, 4000),
    queryFn: async () => {
      const provider    = getProvider();
      const mc          = new ethers.Contract(MULTICALL_ADDRESS, multicallAbi, provider);
      const viewerIface = new ethers.Interface(viewerAbi);
      const coreIface   = new ethers.Interface(coreAbi);
      const fxIface     = new ethers.Interface(fxPoolAbi);
      const hasFxPool   = ethers.isAddress(FX_POOL_ADDRESS);

      const calls = [
        // 0 — previewUnbondSenior
        {
          target: VIEWER_ADDRESS, allowFailure: true,
          callData: viewerIface.encodeFunctionData('previewUnbondSenior', [unionAddr, walletAddr]),
        },
        // 1 — DEFAULT_UNBONDING
        {
          target: CORE_ADDRESS, allowFailure: true,
          callData: coreIface.encodeFunctionData('DEFAULT_UNBONDING'),
        },
        // 2 — getSeniorMarket (idle cash)
        {
          target: CORE_ADDRESS, allowFailure: true,
          callData: coreIface.encodeFunctionData('getSeniorMarket', [unionAddr]),
        },
      ];

      if (hasFxPool) {
        // 3 — current FX rate (to convert nIN → USDT)
        calls.push({ target: FX_POOL_ADDRESS, allowFailure: true, callData: fxIface.encodeFunctionData('lastFxRate') });
        calls.push({ target: FX_POOL_ADDRESS, allowFailure: true, callData: fxIface.encodeFunctionData('oracleDecimals') });
      }

      const results = await mc.aggregate3.staticCall(calls);

      // — previewUnbondSenior
      // previewUnbondSenior returns 7 fields:
      // (uint40 requestTs, uint40 minWindowTs, uint256 pendingPrincipalSnap,
      //  bool pastMin, bool coveredByBucket, bool eligibleNow, uint256 pendingShares)
      let requestTs = 0, minWindowTs = 0, pastMin = false, eligibleNow = false;
      if (results[0].success) {
        const decoded = viewerIface.decodeFunctionResult('previewUnbondSenior', results[0].returnData);
        requestTs   = Number(decoded.requestTs);
        minWindowTs = Number(decoded.minWindowTs);
        pastMin     = Boolean(decoded.pastMin);
        eligibleNow = Boolean(decoded.eligibleNow);
        // decoded.coveredByBucket, decoded.pendingPrincipalSnap, decoded.pendingShares available if needed
      }

      // — DEFAULT_UNBONDING
      let defaultUnbonding = 0;
      if (results[1].success) {
        const [d] = coreIface.decodeFunctionResult('DEFAULT_UNBONDING', results[1].returnData);
        defaultUnbonding = Number(d);
      }

      // — getSeniorMarket: cash field (nIN wei)
      let seniorCashNin = 0n;
      if (results[2].success) {
        const [market] = coreIface.decodeFunctionResult('getSeniorMarket', results[2].returnData);
        seniorCashNin = market.cash ?? market[0]; // tuple field
      }

      // — FX rate for cash → USDT conversion
      let seniorCashUsdt = null;
      if (hasFxPool && results[3]?.success && results[4]?.success) {
        const [fxRaw]  = fxIface.decodeFunctionResult('lastFxRate',     results[3].returnData);
        const [fxDec]  = fxIface.decodeFunctionResult('oracleDecimals', results[4].returnData);
        const toUsdt   = makeToUsdt(fxRaw, Number(fxDec));
        const cashFloat = fmtNin(seniorCashNin);
        seniorCashUsdt = toUsdt(cashFloat);
      }

      const out = {
        requestTs,
        minWindowTs,
        pastMin,
        eligibleNow,
        defaultUnbonding,   // seconds — the configured unbond period on Core
        seniorCashUsdt,     // USDT float — idle cash available in senior pool (null if FX unavailable)
      };
      return out;
    },
  });
}
