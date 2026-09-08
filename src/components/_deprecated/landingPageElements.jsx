import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip as Tp, XAxis, YAxis } from "recharts";

const CARD_BASE = "rounded-3xl bg-slate-950/10 ring-1 ring-white/10 shadow-xl dark:shadow-slate-950/40 backdrop-blur";
const CARD_BODY = "p-6 md:p-10";
const SECTION_OUTER = "flex w-full justify-center px-4 pt-12 sm:px-6";
const SECTION_INNER = "w-full max-w-6xl text-slate-700 dark:text-slate-100";
const PARAGRAPH = "text-sm md:text-base leading-relaxed text-slate-800 dark:text-slate-100";
const CTA_PRIMARY = "inline-flex items-center gap-3 rounded-2xl bg-green px-5 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-green/20 transition hover:shadow-green/40";
const CTA_SECONDARY = "inline-flex items-center gap-3 rounded-2xl bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-100 ring-1 ring-white/10 transition hover:bg-slate-900/80";
const STAT_CARD = "flex flex-col gap-1 rounded-2xl bg-slate-950/0 dark:bg-slate-950/60 px-6 py-5 text-left ring-1 ring-white/10 shadow shadow-slate-950/30";

const PREMIUM_SERIES = [
  { month: "Apr", pass: 19.24, uplift: 5.2, diff: 1.01 },
  { month: "May", pass: 19.24, uplift: 6.4, diff: -1.09 },
  { month: "Jun", pass: 19.24, uplift: 8.1, diff: -0.2 },
  { month: "Jul", pass: 19.24, uplift: 7.4, diff: -2.13 },
  { month: "Aug", pass: 19.24, uplift: 9.3, diff: -0.74 },
  { month: "Sep", pass: 19.24, uplift: 10.1, diff: -0.76 },
  { month: "Oct", pass: 19.24, uplift: 11.0, diff: 0.97 },
];

const STAGE_SUMMARY = [
  {
    title: "Stage 1 · Informal rhythms",
    description: "Each farm community follows its own natural cycles and traditions, with limited coordination or shared tooling.",
  },
  {
    title: "Stage 2 · Organic clustering",
    description: "Demand and supply are matched early season; farms receive finance and an implementation plan. Fields are monitored remotely and yields continously validated.",
  },
  {
    title: "Stage 3 · Coordinated union",
    description: "Crops are harvested and selected to meet trader specifications. Those that do not meet the standards can sell their crops on the open market, and their loans converted to standard rate.",
  },
];

const toPct = (value) => `${value.toFixed(2)}%`;

function usePrefersDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => setIsDarkMode(event.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return isDarkMode;
}

function ComposedPremiumChart() {
  const isDarkMode = usePrefersDarkMode();
  const data = useMemo(
    () =>
      PREMIUM_SERIES.map((entry) => {
        const inrPct = Number(entry.pass) || 0;
        const fxPct = Number(entry.diff) || 0;
        const usdPct = ((1 + inrPct / 100) / (1 + fxPct / 100) - 1) * 100;
        return { ...entry, usdPct, inrPct, fxPct };
      }),
    []
  );

  const accentColor = isDarkMode ? "#a5b4fc" : "#0f172a";
  const lineColor = isDarkMode ? "#f8fafc" : "#020617";
  const axisColor = isDarkMode ? "#cbd5e1" : "#475569";
  const gridColor = isDarkMode ? "rgba(148, 163, 184, 0.3)" : "rgba(15, 23, 42, 0.08)";
  const gradientId = isDarkMode ? "premiumGradientDark" : "premiumGradientLight";
  const tooltipStyle = useMemo(
    () => ({
      background: isDarkMode ? "#0F172A" : "#FFFFFF",
      border: isDarkMode ? "1px solid rgba(248,250,252,0.12)" : "1px solid rgba(15,23,42,0.12)",
      borderRadius: 12,
      color: isDarkMode ? "#F8FAFC" : "#0F172A",
    }),
    [isDarkMode]
  );

  return (
    <div className="w-full h-52 md:h-60">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity={0.45} />
              <stop offset="100%" stopColor={accentColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="month" tick={{ fill: axisColor }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: axisColor }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />

          <Tp
            contentStyle={tooltipStyle}
            formatter={(value, key) => {
              if (key === "inrPct") return [toPct(value), "INR premium"];
              if (key === "usdPct") return [toPct(value), "USD premium"];
              if (key === "fxPct") return [toPct(value), "FX change (INR/USD)"];
              return [value, key];
            }}
            labelFormatter={(month) => `Month: ${month}`}
          />

          <Area type="monotone" dataKey="inrPct" name="INR premium" stroke={accentColor} fill={`url(#${gradientId})`} />
          <Line type="monotone" dataKey="usdPct" name="USD premium" dot={false} stroke={lineColor} strokeDasharray="4 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConnectCards({ sticky, account, chainID }) {
  const [copied, setCopied] = useState(false);

  const userLanguage = useMemo(() => {
    if (typeof navigator !== "undefined") {
      return navigator.language || navigator.userLanguage || "en";
    }
    return "en";
  }, []);

  const copyToClipboard = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    navigator.clipboard
      .writeText(`https://pwa.nila.land?account=${account}&language=${userLanguage}&chain=${chainID}`)
      .then(() => setCopied(true))
      .catch((error) => {
        console.error("Error copying text: ", error);
      });
  };

  if (sticky) {
    return null;
  }

  return (
    <div className={SECTION_OUTER}>
      <div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className={`${CARD_BASE} ${CARD_BODY} flex flex-col gap-4`}>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100">Low rate loans for SHGs and cooperatives </h3>
            <p className={PARAGRAPH}>
              Nila loans are non-privileged, which means ANYONE can access them, if they are able to proof use of land, and are part off a local group. There is NO requirements of personal or cadastral records.
            </p>
            <a
              href="https://mirror.xyz/0xAd5220415e07515a0c7BdC2951086e66D840a959/QZ3PqPrK-sFrlJWSdxgBW0ZcPJIejhT03zgmWgY0bE0"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold dark:text-green text-black underline dark:decoration-green/60 decoration-2 underline-offset-4 transition hover:text-green/80"
            >
              Read how Nila is generating income for farmers.
            </a>
            <p className="text-sm italic text-slate-400">
              “Sovereign farmers demand system change; monopolistic supply chains and depleted fields require alternatives. Provide the liquidity for new business models and new global access.”
            </p>
            <p className="text-xs italic text-slate-400">@FarmFiYoga, 2023</p>
          </div>
          <div className={`${CARD_BASE} ${CARD_BODY} flex flex-col gap-6`}>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100">Dear union leaders.</h3>
            <p className={PARAGRAPH}>
              We need your help by creating your local union. Start by sharing your unique link to the Nila app and register farms in your area.
            </p>
            {chainID ? (
              <button
                type="button"
                onClick={copyToClipboard}
                onMouseLeave={() => setCopied(false)}
                className={`${CTA_PRIMARY} w-full justify-center`}
              >
                {copied ? "Link copied" : "Copy your link"}
              </button>
            ) : (
              <div className={`${CTA_SECONDARY} w-full justify-center opacity-70`}>Please connect your wallet first.</div>
            )}
            <div className="flex items-start gap-3 text-sm text-slate-800 dark:text-slate-100">
              <Info className="h-5 w-5 shrink-0 text-slate-400" />
              <div className="space-y-2">
                <p>* Referral bonus: Unions receive grant rewards and financial support. Contact us if you are looking for funds.</p>
                <p>* Profits &amp; risks: Union leaders gain financially from members&apos; productivity increase but also share financial risks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EcosystemCard() {
  return (
    <div className={SECTION_OUTER}>
      <div className={`${SECTION_INNER} py-12`}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className={`${CARD_BASE} ${CARD_BODY} space-y-5`}>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100">Invest in farmland</h3>
            <p className={PARAGRAPH}>
              Earn a stable yield on your stablecoins. Completely decentralized and non-custodial. Support farmers worldwide by providing low-rate loans, collateralized by local unions.
            </p>
            <img src="/localcurrency.svg" width={320} height={320} className="h-auto w-full max-w-xs" alt="Local currency illustration" />
          </div>
          <div className={`${CARD_BASE} ${CARD_BODY} space-y-5`}>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100">19.24% APY (oct 25)</h3>
            <p className={PARAGRAPH}>Yield depends on performance, utilization, and global exchange rates.</p>
            <ComposedPremiumChart />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BatchEngine({ stage = 1, onStageChange, maxStage = STAGE_SUMMARY.length }) {
  const boundedStage = Math.min(Math.max(stage, 1), maxStage);
  const stageInfo = STAGE_SUMMARY[boundedStage - 1] ?? STAGE_SUMMARY[0];
  const controlsEnabled = typeof onStageChange === "function";
  const canPrev = controlsEnabled && boundedStage > 1;
  const canNext = controlsEnabled && boundedStage < maxStage;

  const handleAdvance = (dir) => {
    if (!controlsEnabled) return;
    onStageChange((prev) => {
      if (typeof prev !== "number") {
        const base = Number.isFinite(boundedStage) ? boundedStage : 1;
        return Math.min(Math.max(base + dir, 1), maxStage);
      }
      return Math.min(Math.max(prev + dir, 1), maxStage);
    });
  };

  return (
    <div className={SECTION_OUTER}>
      <div className={SECTION_INNER}>
        <div className={`${CARD_BASE} ${CARD_BODY} space-y-5`}>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Open, neutral and value-added.</h3>
          <p className={PARAGRAPH}>
            Ag-markets in the global south are opaque, slow and informally operated/funded. Structure is required so farmers get quick cash, no hidden math and collective discounts. Traders get reliable, spec-grade volume with full traceability, fewer rejects and instant, rules-based settlement.
          </p>
          <div className="flex flex-col items-center">
            <UnionBox
              label="info"
              highlight={false}
              className="w-full"
            >
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-100 dark:text-slate-400">Batch engine stage</div>
                    <h4 className="text-lg font-semibold text-slate-200 dark:text-slate-700">{stageInfo.title}</h4>
                  </div>
                  <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-slate-200">
                    {boundedStage}/{maxStage}
                  </span>
                </div>
                <p className="text-sm text-slate-100 dark:text-slate-800">{stageInfo.description}</p>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAdvance(-1)}
                    disabled={!canPrev}
                    className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      canPrev ? "bg-slate-900/60 text-slate-100 dark:text-slate-100 ring-1 ring-white/10 hover:bg-slate-900/70" : "cursor-not-allowed bg-slate-900/20 text-slate-500"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdvance(1)}
                    disabled={!canNext}
                    className={`w-full rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      canNext ? "bg-green text-slate-900 shadow-lg shadow-green/20 hover:bg-green/90" : "cursor-not-allowed bg-green/20 text-green-200/80"
                    }`}
                  >
                    {canNext ? "Advance" : "Aligned"}
                  </button>
                </div>
              </div>
            </UnionBox>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnionBox({ children, label = "Union Cell α", highlight = false, className = "" }) {
  return (
    <div
      className={`relative rounded-3xl border-2 ${highlight ? "border-emerald-400/90" : "border-neutral-300/10"} bg-slate-950/60 p-6 ring-black/5 ${className}`}
    >
      <div className="absolute -top-3 z-10 text-xs px-2 py-0.5 rounded-full bg-grey text-black shadow">{label}</div>
      <div className="relative pt-6 pb-2">{children}</div>
      {highlight ? <div className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-green" /> : null}
    </div>
  );
}

export function Wallet() {
  return (
    <div className={SECTION_OUTER}>
      <div className={SECTION_INNER}>
        <div className={`${CARD_BASE} ${CARD_BODY} space-y-5`}>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100">One-app to drive a global network</h3>
          <p className={PARAGRAPH}>
            The Digital wallet connects finance to farms. Group leaders can connect their base, and access new liquidity.
          </p>
          <p className={PARAGRAPH}>The Nila finance app is permissionless and only requires a phone number to get started.</p>
          <div className="flex flex-col items-center gap-6">
            <button
              type="button"
              onClick={() => window.open("https://pwa.nila.land", "_blank")}
              className={`${CTA_PRIMARY} w-full justify-center sm:w-2/3 lg:w-1/2`}
            >
              Open the App (mobile only)
            </button>
            <img
              src="/NilaAppScreen.jpeg"
              width={200}
              height={320}
              className="h-auto w-full max-w-[220px] rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              alt="Nila app preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicCurrencyCard() {
  return (
    <div className={SECTION_OUTER}>
      <div className={`${SECTION_INNER} py-12`}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className={`${CARD_BASE} ${CARD_BODY} space-y-5`}>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100">Basic Universal Equity</h3>
            <p className={PARAGRAPH}>
              Nila users gain network ownership and priority equity in the long-tail of Nila-based projects. Qualify for loyalty drops.
            </p>
            <p className={PARAGRAPH}>Investors receive tradeable ERC-1155 tokens (or similar) equal to the value of your deposit.</p>
            <img src="/ecosystem.svg" width={320} height={320} className="h-auto w-full max-w-sm" alt="Nila ecosystem illustration" />
          </div>
          <div className={`${CARD_BASE} ${CARD_BODY} space-y-5`}>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-100">Simple stress-free agri-finance.</h3>
            <p className={PARAGRAPH}>
              Our strength is our trust programmed in our code. No really. We don&apos;t do controls and field checks, but monitor remotely.
              Symbiotic relationships are created by letting neighbours build up equity in each other.
            </p>
            <img src="/tree_of_life.png" className="h-auto w-full max-w-xs rounded-2xl bg-slate-950/0 dark:bg-slate-950 p-6" alt="Tree of life" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GenStatus({ sticky }) {
  if (sticky) {
    return null;
  }

  const MC = 200000; // nIN
  const yld = (MC * 0.1924) / 88; // nIN

  return (
    <div className={SECTION_OUTER}>
      <div className={SECTION_INNER}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={STAT_CARD}>
            <span className="text-2xl font-semibold text-slate-700 dark:text-slate-100">0.00001%</span>
            <span className="text-sm text-slate-400">global farmland tracked</span>
          </div>
          <div className={STAT_CARD}>
            <span className="text-2xl font-semibold text-slate-700 dark:text-slate-100">400/450M</span>
            <span className="text-sm text-slate-400">farmers onboarded</span>
          </div>
          <div className={STAT_CARD}>
            <span className="text-2xl font-semibold text-slate-700 dark:text-slate-100">₹{MC}/-</span>
            <span className="text-sm text-slate-400">Nila market cap</span>
          </div>
          <div className={STAT_CARD}>
            <span className="text-2xl font-semibold text-slate-700 dark:text-slate-100">$ {Math.round(yld)},-</span>
            <span className="text-sm text-slate-400">earnings generated</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrackStatus() {
  const track = [
    { name: "PolyScan", link: "https://polygonscan.com/", disabled: false },
    { name: "Pera Explorer", link: "https://explorer.perawallet.app/", disabled: true },
    { name: "Celo Scan", link: "https://celoscan.io", disabled: true },
    { name: "Vechain Explorer", link: "https://explore-testnet.vechain.org/", disabled: true },
  ];

  return (
    <div className={SECTION_OUTER}>
      <div className={`${SECTION_INNER} py-12 space-y-6`}>
        <div>
          <p className="text-sm text-slate-800 dark:text-slate-100">Nila Farms (NFTs and Food tokens) can be found on:</p>
          <hr className="mt-4 border-t border-white/10" />
        </div>
        <div className="flex flex-wrap gap-3">
          {track.map((t) => (
            <a
              key={t.name}
              href={t.link}
              className={`rounded-full bg-slate-950/10 dark:bg-slate-950/60 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-100 ring-1 ring-white/10 transition hover:bg-slate-900/40 ${
                t.disabled ? "opacity-30 pointer-events-none" : ""
              }`}
            >
              {t.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PartnerStatus() {
  const partners = [
    { icon: "/80002.png", name: "Polygon (infrastructure)", link: "https://polygon.technology/" },
    { icon: "/416002.png", name: "Algorand Foundation (financial)", link: "https://algorandtechnologies.com/" },
  ];

  return (
    <div className={SECTION_OUTER}>
      <div className={`${SECTION_INNER} py-12 space-y-6`}>
        <div>
          <p className="text-sm text-slate-800 dark:text-slate-100">Nila web3 partners</p>
          <hr className="mt-4 border-t border-white/10" />
        </div>
        <div className="flex flex-wrap gap-3">
          {partners.map((partner) =>
            partner.link ? (
              <a
                key={partner.name}
                href={partner.link}
                className="flex flex-row items-center rounded-full bg-slate-950/10 dark:bg-slate-950/60 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-100 ring-1 ring-white/10 transition hover:bg-slate-900/40"
              >
                <img src={partner.icon} className="w-9 h-9 mr-3" alt="L1 chains" />
                {partner.name}
              </a>
            ) : (
              <span
                key={partner.name}
                className="rounded-full bg-slate-900/60 px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-100 ring-1 ring-white/10"
              >
                {partner.name}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
