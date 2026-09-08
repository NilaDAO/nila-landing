// ─── Live union address mapping (id → onchain address) ───────────────────────
export const LIVE_ADDRESS_BY_ID = {
  "MT-001": "0xF18E4966731bD6D3a56c1eb23Da7C708c9C48070",
};

// ─── Fund type metadata ──────────────────────────────────────────────────────
// Keys can be short string aliases (for hardcoded data) or lowercased bytes32 hex
// from the contract.  `getFundMeta` resolves either.
export const FUND_TYPE_META = {
  groundup:       { label: "Ground-up",       description: "Seeding & early-season working capital",             maxTenureMonths: 8  },
  postharvest:    { label: "Post-harvest",     description: "Storage, grading & market-access financing",         maxTenureMonths: 3  },
  sharedcropping: { label: "Shared Cropping",  description: "Joint cultivation agreements between members",       maxTenureMonths: 6  },
  cropspecific:   { label: "Crop-specific",    description: "Targeted fund for a specific crop cycle",            maxTenureMonths: 8  },
  machinery:      { label: "Machinery",        description: "Equipment & machinery term loans",                   maxTenureMonths: 24 },
};

/** Resolve human-readable metadata for a fund loanType (string alias or bytes32 hex). */
export function getFundMeta(loanType) {
  if (!loanType) return { label: "Fund", description: "" };
  const key = typeof loanType === "string" ? loanType.toLowerCase() : String(loanType);
  // Direct match (short alias)
  if (FUND_TYPE_META[key]) return FUND_TYPE_META[key];
  // Try matching the tail of a bytes32 hex against known aliases
  for (const [alias, meta] of Object.entries(FUND_TYPE_META)) {
    if (key.endsWith(alias)) return meta;
  }
  // Fallback: truncated hex
  return { label: key.length > 10 ? `${key.slice(0, 6)}…${key.slice(-4)}` : key, description: "" };
}

// ─── Founding timestamps (unix seconds) — hardcoded until contracts expose a getter
export const FOUNDING_TS = {
  "MT-001": 1740787200, // 1 March 2025 00:00 UTC
};

// ─── KYC'd leader count — hardcoded until roles contract exposes a counter
export const LEADER_COUNT = {
  "MT-001": 2,
};

// ─── Governance helpers ──────────────────────────────────────────────────────
// Tamil Nadu 4-month crop seasons: Jun–Sep, Oct–Jan, Feb–May.
const SEASON_BOUNDARIES = [
  [2, 1],  // Feb 1  → start of summer season
  [6, 1],  // Jun 1  → start of kharif season
  [10, 1], // Oct 1  → start of rabi season
];

/** Count seasons (including the current in-progress one) between `foundingTs` (unix s) and now. */
export function computeSeasons(foundingTs) {
  if (!foundingTs) return null;
  const start = new Date(foundingTs * 1000);
  const now   = new Date();
  let count = 0;
  for (let y = start.getFullYear(); y <= now.getFullYear(); y++) {
    for (const [m] of SEASON_BOUNDARIES) {
      const boundary = new Date(y, m - 1, 1);     // month is 0-indexed
      // Count if the season has started and started after (or at) founding
      if (boundary >= start && boundary <= now) count++;
    }
  }
  return count;
}

/** Compute on-chain age in months from founding timestamp. */
export function computeOnChainAgeMonths(foundingTs) {
  if (!foundingTs) return null;
  const start = new Date(foundingTs * 1000);
  const now   = new Date();
  return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
}

/** Build governance indicators with live-computed values + scores. */
export function computeGovernanceIndicators(unionId, staticGov) {
  const ts = FOUNDING_TS[unionId];

  // On-chain age — informational only, no score
  const ageMonths = computeOnChainAgeMonths(ts);
  const ageDisplay = ageMonths != null
    ? ageMonths < 1 ? "< 1 month" : `${ageMonths} month${ageMonths !== 1 ? "s" : ""}`
    : null;

  // Seasons — 1 pt per year (3 seasons), max 3 pts at 3 years (9 seasons)
  const seasons      = computeSeasons(ts);
  const seasonsScore = seasons != null ? Math.min(Math.floor(seasons / 3), 3) : null;

  // KYC'd leaders — 1 pt per leader, max 3
  const leaders      = LEADER_COUNT[unionId] ?? null;
  const leadersScore = leaders != null ? Math.min(leaders, 3) : null;

  return {
    onChainAge:   { value: ageDisplay,                   score: null,         maxScore: null },
    leaderCount:  { value: leaders,                      score: leadersScore, maxScore: 3 },
    auditStatus:  { value: staticGov?.auditStatus?.value ?? "Self-reported", score: null, maxScore: null },
    seasons:      { value: seasons,                      score: seasonsScore, maxScore: 3 },
  };
}

// ─── Union data ───────────────────────────────────────────────────────────────
export const UNIONS = [
  {
    id: "MT-001",
    name: "Mother Theresa Union",
    location: "Sankuraparam, Tamil Nadu, India",
    members: 900,
    crops: ["Sugarcane", "Sesame", "Groundnuts"],
    seasons: 3,
    sdgs: [1, 2, 8, 10],
    status: "active",
    minInvest: "50 USDT",
    maxInvest: 1000,
    allocation: [],
    description:
      "Mother Theresa is woman-only union in Viriyur. The union operates a 2Cr revolving fund since 2002. It is aligned to the Catholic Archdiocese of Pondicherry and Cuddalore.",
    indicators: {
      financial: {
        firstLossRatio:   { value: null, score: null, maxScore: null }, // live onchain, informational
        bucketThreshold:  { value: null, score: null, maxScore: 20  }, // live onchain
        reserveBuffer:    { value: null, score: null, maxScore: 15  }, // live onchain
        insuranceCoverage:  { value: null,              score: null, maxScore:  7 }, // onchain attestation
        portfolioRevenue:   { value: null,              score: null, maxScore: 10 }, // live — computed from active loans
        cropStress:         { value: null,              score: null, maxScore:  8 }, // live — computed from active loans
        foodTokenCollateral:{ value: "Not operational", score: null, maxScore: null },
        landTitleCollateral:{ value: "Not operational", score: null, maxScore: null },
      },
      geoClimate: {
        climateRisk:        { value: null, score: null, maxScore: 5 },
        waterManagement:    { value: "Canal", score: null, maxScore: 3 },
        geographicSpread:   { value: null, score: null, maxScore: 3 },
        cropDiversification:{ value: ["Sugarcane", "Sesame", "Groundnuts"], score: null, maxScore: 3 },
        cropRotation:       { value: null, score: null, maxScore: 2 },
        bufferCropping:     { value: null, score: null, maxScore: 2 },
        seedQuality:        { value: null, score: null, maxScore: 2 },
        yieldBenchmark:     { value: null, score: null, maxScore: 3 },
        profitPerProperty:  { value: null, score: null, maxScore: 2 },
        typicalFundNeed:    { value: null, score: null, maxScore: 0 },
      },
      governance: {
        // Computed live by computeGovernanceIndicators() — only auditStatus is read from here
        auditStatus:{ value: "Self-reported" },
      },
    },
  },
];

// ─── Index fund data ──────────────────────────────────────────────────────────
export const INDEXES = [
  {
    id: "IDX-001",
    name: "Kallakurichi Agri Index I",
    location: "Kallakurichi district, Tamil Nadu, India",
    crops: ["Sugarcane", "Paddy", "Groundnut", "Millet"],
    sdgs: [1, 2, 5, 8, 10],
    status: "active",
    healthScore: 88,
    lockPeriod: "1 year",
    withdrawalType: "annual",
    withdrawalNotice: "30 days",
    riskRating: "Medium",
    fee: "2.0%",
    minInvest: "50 USDT",
    targetAum: 600000, // USDT
    totalDeposited: 18400, // USDT — current deposits into this index
    allocation: [
      { unionId: "MT-001", name: "Mother Theresa Union", deposited: 18400 },
    ],
    image: "/index-nila-agri-1.png",
    opportunityUrl: "/opportunities/nila-agri-index-i",
    explainer:
      "Your deposit goes into a Nila-controlled wallet. Our advisors allocate it across a curated basket of union senior tranches — selected after a full case study. You gain diversified exposure without choosing unions yourself, in exchange for a 3% opportunity-management fee.",
    description:
      "Nila Agri Index I is a managed custody product targeting agri-finance opportunities in the Kallakurichi district, Tamil Nadu India.",
    focusAreas: [
      {
        label: "Sugarcane post-process logistics",
        detail: "Financing transport, milling queue management, and value chain coordination for sugarcane growers after harvest.",
        url: "/opportunities/sugarcane-post-process-logistics",
      },
      {
        label: "Post-harvest financing",
        detail: "Short-term working capital deployed between harvest and sale, covering storage, grading, and market-access costs.",
        url: "/opportunities/post-harvest-financing",
      }
    ],
  },
];

export const WALLET_OPTIONS = [
  { id: "metamask",      name: "MetaMask",        description: "Browser extension" },
  { id: "walletconnect", name: "WalletConnect",   description: "Mobile & QR" },
  { id: "coinbase",      name: "Coinbase Wallet", description: "Coinbase app" },
];

export const STATUS_COLORS = {
  active:     { bg: "rgba(82,183,136,0.12)",  text: "#52B788", border: "rgba(82,183,136,0.3)" },
  onboarding: { bg: "rgba(212,160,23,0.12)",  text: "#D4A017", border: "rgba(212,160,23,0.3)" },
  pipeline:   { bg: "rgba(148,163,184,0.12)", text: "#94a3b8", border: "rgba(148,163,184,0.3)" },
};

// ─── Polygon Mainnet ──────────────────────────────────────────────────────────
export const POLYGON_CHAIN_ID = "0x89"; // 137
export const POLYGON_CHAIN_PARAMS = {
  chainId: "0x89",
  chainName: "Polygon Mainnet",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: ["https://polygon-rpc.com"],
  blockExplorerUrls: ["https://polygonscan.com"],
};
export const USDT_POLYGON = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
export const USDC_POLYGON = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"; // native USDC on Polygon
export const NIN_POLYGON  = import.meta.env.VITE_NIN_ADDRESS ?? "0xD1F49598E42D30Cd900Ea86244485ca0647d31C7";

/**
 * Returns true if the address currently holds any nIN, or has ever interacted
 * with the nIN contract (Transfer events). Holding > 0 nIN is the fast path;
 * the log query is a fallback for wallets that have sent all their nIN away.
 */
export async function hasNinInteraction(address) {
  const addr32 = "0x" + address.slice(2).padStart(64, "0");
  // Fast path: balanceOf — same technique as readUsdtBalance
  try {

    const hex = await window.ethereum.request({
      method: "eth_call",
      params: [{ to: NIN_POLYGON, data }, "latest"],
    });
    if (hex && hex !== "0x" && BigInt(hex) > 0n) return true;
  } catch { /* fall through to log query */ }

  // Fallback: check Transfer logs (inbound). eth_getLogs takes a single filter object.
  const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
  try {
    const logs = await window.ethereum.request({
      method: "eth_getLogs",
      params: [{
        address: NIN_POLYGON,
        topics: [TRANSFER_TOPIC, null, addr32],
        fromBlock: "0x0",
        toBlock:   "latest",
      }],
    });
    return Array.isArray(logs) && logs.length > 0;
  } catch {
    return false;
  }
}

export async function readUsdtBalance(address) {
  const data = "0x70a08231" + address.slice(2).padStart(64, "0");
  const hex = await window.ethereum.request({
    method: "eth_call",
    params: [{ to: USDT_POLYGON, data }, "latest"],
  });
  if (!hex || hex === "0x") return 0;
  // USDT on Polygon has 6 decimals — preserve up to 2 decimal places
  return parseFloat((parseInt(hex, 16) / 1e6).toFixed(2));
}

export async function readUsdcBalance(address) {
  const data = "0x70a08231" + address.slice(2).padStart(64, "0");
  const hex = await window.ethereum.request({
    method: "eth_call",
    params: [{ to: USDC_POLYGON, data }, "latest"],
  });
  if (!hex || hex === "0x") return 0;
  // Native USDC on Polygon has 6 decimals
  return parseFloat((parseInt(hex, 16) / 1e6).toFixed(2));
}

export async function readNinBalance(address) {
  const data = "0x70a08231" + address.slice(2).padStart(64, "0");
  const hex = await window.ethereum.request({
    method: "eth_call",
    params: [{ to: NIN_POLYGON, data }, "latest"],
  });
  if (!hex || hex === "0x") return 0;
  console.log('parseInt(hex, 16) / 1e18)', parseInt(hex, 16) / 1e18)
  // nIN has 18 decimals — preserve up to 4 decimal places
  return parseFloat((parseInt(hex, 16) / 1e18).toFixed(4));
}

export async function ensurePolygon() {
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  if (chainId === POLYGON_CHAIN_ID) return;
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: POLYGON_CHAIN_ID }],
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [POLYGON_CHAIN_PARAMS],
      });
    } else {
      throw err;
    }
  }
}

// ─── Wallet cache (localStorage, 24-hour TTL) ─────────────────────────────────
export const WALLET_CACHE_KEY = "nila_wallet_v2";
export const WALLET_TTL_MS = 24 * 60 * 60 * 1000;

export function saveWalletCache(walletData) {
  try {
    localStorage.setItem(WALLET_CACHE_KEY, JSON.stringify({ ...walletData, cachedAt: Date.now() }));
  } catch (_) {}
}

export function clearWalletCache() {
  try { localStorage.removeItem(WALLET_CACHE_KEY); } catch (_) {}
}

export function loadWalletCache() {
  try {
    const raw = localStorage.getItem(WALLET_CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.cachedAt > WALLET_TTL_MS) {
      localStorage.removeItem(WALLET_CACHE_KEY);
      return null;
    }
    return cached;
  } catch (_) {
    return null;
  }
}
