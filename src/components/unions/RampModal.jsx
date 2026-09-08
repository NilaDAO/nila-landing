import { useState } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, Wallet, CreditCard, ArrowRight, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";

// ─── Brand icons (inline SVG) ────────────────────────────────────────────────

function RevolutIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M15.5 3H7v7.5h3V21l7.5-10.5h-5L15.5 3Z" fill="currentColor" />
    </svg>
  );
}

function MoonPayIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path d="M12 3a9 9 0 0 0 0 18c-3 0-5.5-4-5.5-9S9 3 12 3Z" fill="currentColor" opacity="0.5" />
      <circle cx="14.5" cy="9" r="2.5" fill="currentColor" />
    </svg>
  );
}

function StripeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M13.98 8.14c0-.97.8-1.34 2.12-1.34 1.9 0 4.3.58 6.2 1.6V3.6A16.6 16.6 0 0 0 16.1 2.5c-4.94 0-8.22 2.58-8.22 6.9 0 6.72 9.26 5.64 9.26 8.54 0 1.14-1 1.52-2.38 1.52-2.06 0-4.7-.84-6.78-1.98v4.88A17.2 17.2 0 0 0 14.76 24c5.06 0 8.54-2.5 8.54-6.88 0-7.26-9.32-5.96-9.32-8.98Z"
        fill="currentColor"
        transform="scale(0.82) translate(2, 2)"
      />
    </svg>
  );
}

// ─── Revolut steps ───────────────────────────────────────────────────────────
const REVOLUT_STEPS = [
  {
    n: 1,
    title: "Create a crypto wallet",
    body: "Download MetaMask (browser extension or mobile app). Create a new wallet and securely save your seed phrase. Copy your wallet address — it starts with 0x.",
    cta: "Get MetaMask",
    url: "https://metamask.io/download/",
    icon: Wallet,
  },
  {
    n: 2,
    title: "Buy USDT on Revolut Ramp",
    body: "Go to Revolut Ramp, log in or create a free Revolut account. Select USDT on Polygon network, enter an amount, paste your wallet address, and pay by card or bank transfer.",
    cta: "Open Revolut Ramp",
    url: "https://ramp.revolut.com/crypto/buy",
    icon: CreditCard,
  },
  {
    n: 3,
    title: "Come back and connect",
    body: "Once USDT arrives in your wallet (usually a few minutes), return here and click 'Connect wallet'. Your balance will be detected automatically.",
    cta: null,
    icon: CheckCircle2,
  },
];

// ─── MoonPay steps ───────────────────────────────────────────────────────────
const MOONPAY_STEPS = [
  {
    n: 1,
    title: "Create a crypto wallet",
    body: "Download MetaMask (browser extension or mobile app). Create a new wallet and securely save your seed phrase. Copy your wallet address — it starts with 0x.",
    cta: "Get MetaMask",
    url: "https://metamask.io/download/",
    icon: Wallet,
  },
  {
    n: 2,
    title: "Buy USDT on MoonPay",
    body: "Open MoonPay, select USDT on Polygon network, enter an amount and paste your wallet address. Pay by card, bank transfer, Apple Pay or Google Pay. Available in 160+ countries.",
    cta: "Open MoonPay",
    url: "https://buy.moonpay.com/?currencyCode=usdt_polygon&baseCurrencyCode=usd&theme=dark",
    icon: CreditCard,
  },
  {
    n: 3,
    title: "Come back and connect",
    body: "Once USDT arrives in your wallet (usually a few minutes), return here and click 'Connect wallet'. Your balance will be detected automatically.",
    cta: null,
    icon: CheckCircle2,
  },
];

// ─── Stripe steps ────────────────────────────────────────────────────────────
const STRIPE_STEPS = [
  {
    n: 1,
    title: "Create a crypto wallet",
    body: "Download MetaMask (browser extension or mobile app). Create a new wallet and securely save your seed phrase. Copy your wallet address — it starts with 0x.",
    cta: "Get MetaMask",
    url: "https://metamask.io/download/",
    icon: Wallet,
  },
  {
    n: 2,
    title: "Buy USDC on Stripe",
    body: "Open Stripe's crypto onramp. Select USDC on Polygon network, enter an amount, paste your wallet address, and pay by card or bank transfer. Stripe accepts Visa, Mastercard and US bank accounts.",
    cta: "Open Stripe Onramp",
    url: "https://crypto.link.com",
    icon: CreditCard,
    note: "Delivers USDC (auto-converted to USDT when you invest)",
  },
  {
    n: 3,
    title: "Come back and connect",
    body: "Once USDC arrives in your wallet (usually a few minutes), return here and click 'Connect wallet'. Your balance will be detected automatically — USDC is accepted alongside USDT.",
    cta: null,
    icon: CheckCircle2,
  },
];

const PROVIDERS = [
  {
    id: "revolut",
    name: "Revolut Ramp",
    token: "USDT",
    fee: "~1.5%",
    region: "UK + EEA",
    BrandIcon: RevolutIcon,
    steps: REVOLUT_STEPS,
  },
  {
    id: "moonpay",
    name: "MoonPay",
    token: "USDT",
    fee: "~4.5%",
    region: "160+ countries",
    BrandIcon: MoonPayIcon,
    steps: MOONPAY_STEPS,
  },
  {
    id: "stripe",
    name: "Stripe",
    token: "USDC",
    fee: "~4%",
    region: "US + EU",
    BrandIcon: StripeIcon,
    steps: STRIPE_STEPS,
  },
];

export function RampModal({ onClose, onConnectWallet }) {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const provider = selectedProvider ? PROVIDERS.find((p) => p.id === selectedProvider) : null;
  const steps = provider?.steps ?? [];
  const step = steps[activeStep];
  const Icon = step?.icon;
  const isLast = activeStep === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-sm rounded-3xl p-6"
        style={{
          backgroundColor: "#1e293b",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {selectedProvider && (
              <button
                onClick={() => { setSelectedProvider(null); setActiveStep(0); }}
                className="rounded-lg p-1 transition hover:bg-white/10 mr-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" style={{ color: "var(--color-text-soft)" }} />
              </button>
            )}
            <CreditCard className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              {selectedProvider ? `Buy with ${provider.name}` : "Buy stablecoins"}
            </span>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 transition hover:bg-white/10">
            <X className="h-4 w-4" style={{ color: "var(--color-text-soft)" }} />
          </button>
        </div>
        <p className="mb-5 text-xs" style={{ color: "var(--color-text-soft)" }}>
          {selectedProvider
            ? `No exchange account needed — buy ${provider.token} directly to your wallet.`
            : "Buy USDT or USDC with your card or bank account. Choose a provider:"}
        </p>

        {!selectedProvider ? (
          /* ─── Provider selection ─────────────────────────────────────────── */
          <div className="space-y-2.5">
            {PROVIDERS.map((p) => {
              const Brand = p.BrandIcon;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all hover:bg-white/[0.06]"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <Brand size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text-on-dark)" }}>{p.name}</p>
                      <span className="text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                        style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "var(--color-text-soft)" }}>
                        {p.token}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-soft)" }}>
                      {p.region} · fee {p.fee}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: "var(--color-text-soft)" }} />
                </button>
              );
            })}
            <p className="text-center text-[11px] mt-3" style={{ color: "var(--color-text-soft)" }}>
              All providers deliver stablecoins on Polygon network
            </p>
          </div>
        ) : (
          /* ─── Step wizard ───────────────────────────────────────────────── */
          <>
            {/* Step indicators */}
            <div className="flex gap-2 mb-6">
              {steps.map((s, i) => (
                <button
                  key={s.n}
                  onClick={() => setActiveStep(i)}
                  className="flex-1 h-1 rounded-full transition-all"
                  style={{
                    backgroundColor: i <= activeStep ? "var(--color-accent)" : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>

            {/* Step card */}
            <motion.div
              key={`${selectedProvider}-${activeStep}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-5 mb-4"
              style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: "rgba(212,166,23,0.12)", border: "1px solid rgba(212,166,23,0.25)" }}
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--color-accent)" }} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-soft)" }}>
                    Step {step.n} of {steps.length}
                  </p>
                  <p className="text-sm font-bold" style={{ color: "var(--color-text-on-dark)" }}>{step.title}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
                {step.body}
              </p>
              {step.note && (
                <p className="mt-2 text-xs" style={{ color: "rgba(212,166,23,0.7)" }}>
                  {step.note}
                </p>
              )}
              {step.cta && step.url && (
                <a
                  href={step.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:opacity-85"
                  style={{ backgroundColor: "var(--color-accent)", color: "#0f172a" }}
                >
                  {step.cta}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex gap-2">
              {!isLast ? (
                <>
                  {activeStep > 0 && (
                    <button
                      onClick={() => setActiveStep((s) => s - 1)}
                      className="flex-1 rounded-2xl py-3 text-sm font-semibold transition-all"
                      style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--color-text-soft)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={() => setActiveStep((s) => s + 1)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold transition-all"
                    style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "var(--color-text-on-dark)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveStep((s) => s - 1)}
                    className="rounded-2xl px-4 py-3 text-sm font-semibold transition-all"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--color-text-soft)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    Back
                  </button>
                  <button
                    onClick={() => { onClose(); onConnectWallet(); }}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-semibold transition-all"
                    style={{ backgroundColor: "var(--color-accent)", color: "#0f172a", cursor: "pointer" }}
                  >
                    Connect wallet <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </>
        )}

        {/* Footer note */}
        <p className="mt-4 text-center text-[11px]" style={{ color: "var(--color-text-soft)" }}>
          {selectedProvider
            ? `${provider.name} is a third-party service · ${provider.token} on Polygon`
            : "Third-party services · stablecoins on Polygon network"}
        </p>
      </motion.div>
    </div>
  );
}
