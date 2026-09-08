import { useState, useRef, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUnions, useWeightedRates, useActiveLoans, useInvestorPositions, useUnbondPreview } from "../../hooks/useUnions";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet, Check, X, BarChart2, CreditCard } from "lucide-react";

import {
  UNIONS, INDEXES, LIVE_ADDRESS_BY_ID,
  POLYGON_CHAIN_ID,
  loadWalletCache, saveWalletCache, clearWalletCache,
  readUsdtBalance, readUsdcBalance, readNinBalance, hasNinInteraction,
} from "../unions/data.js";
import { computeHealthScore, computeLiveFinancialIndicators } from "../unions/shared.jsx";
import { CarouselSection } from "../unions/CarouselSection.jsx";
import { HealthSection }   from "../unions/HealthSection.jsx";
import { TermsSection }    from "../unions/TermsSection.jsx";
import { AmountSection }   from "../unions/AmountSection.jsx";
import { TxSection }       from "../unions/TxSection.jsx";
import { WalletModal }     from "../unions/WalletModal.jsx";
import { RampModal }       from "../unions/RampModal.jsx";
import { WithdrawSection } from "../unions/WithdrawSection.jsx";

// ─── Main UnionsPage ──────────────────────────────────────────────────────────
export default function UnionsPage({ onBack, onOpenModal }) {
  const { data: unionsOnchain } = useUnions();

  // Merge live onchain data onto matching UNIONS entries
  const unions = useMemo(() => {
    const liveByAddress = {};
    if (unionsOnchain) {
      for (const u of unionsOnchain) {
        liveByAddress[u.address.toLowerCase()] = u;
      }
    }
    return UNIONS.map((dummy) => {
      const addr = LIVE_ADDRESS_BY_ID[dummy.id];
      if (!addr) return dummy;
      const live = liveByAddress[addr.toLowerCase()];
      if (!live) return dummy;
      return {
        ...dummy,
        treasury:        live.treasury,
        rainyDay:        live.rainyDay,
        treasuryFeeBP:   live.treasuryFeeBP,
        rainyFeeBP:      live.rainyFeeBP,
        funds:           live.funds ?? [],
        totalAum:        live.totalAum,
        rateParams:      live.rateParams,
        reserveConfig:   live.reserveConfig,
        fxRate:          live.fxRate,
        _live:           true,
      };
    });
  }, [unionsOnchain]);

  const [selectedUnion, setSelectedUnion]       = useState(null);
  const [wallet, setWallet]                     = useState(() => loadWalletCache());
  const [carouselIndex, setCarouselIndex]       = useState(0);
  const [showWalletModal, setShowWalletModal]   = useState(false);
  const [showRamp, setShowRamp]                 = useState(false);
  const [flowStep, setFlowStep]                 = useState(null); // null | "terms" | "amount" | "tx"
  const [investmentAmount, setInvestmentAmount] = useState(null);
  const [investSourceToken, setInvestSourceToken] = useState("USDT");
  const [useNin, setUseNin]                     = useState(false);
  const [navScrolled, setNavScrolled]           = useState(false);
  const [myUnionsOnly, setMyUnionsOnly]         = useState(false);
  const [pillHovered, setPillHovered]           = useState(false);

  const qc = useQueryClient();

  // ── Investor positions (onchain) ────────────────────────────────────────────
  const unionAddresses = useMemo(
    () => Object.values(LIVE_ADDRESS_BY_ID).filter(Boolean),
    [],
  );

  const { data: positions } = useInvestorPositions(wallet?.address, unionAddresses);

  // investments: { [unionId]: { amount, earnedPending } }  — derived from onchain positions
  const investments = useMemo(() => {
    if (!positions || !wallet) return {};
    const result = {};
    for (const union of UNIONS) {
      const addr = LIVE_ADDRESS_BY_ID[union.id];
      if (!addr) continue;
      const pos = positions[addr.toLowerCase()];
      if (!pos) continue;
      result[union.id] = pos;
    }
    return result;
  }, [positions, wallet]);

  // Backfill ninUser for cached wallets that pre-date the nIN interaction check
  useEffect(() => {
    if (!wallet || wallet.ninUser !== undefined) return;
    hasNinInteraction(wallet.address).then((ninUser) => {
      const updated = { ...wallet, ninUser };
      saveWalletCache(updated);
      setWallet(updated);
    });
  }, []);

  // Onchain hooks for the currently-selected live union (used by HealthSection)
  const liveAddress = selectedUnion?._live ? LIVE_ADDRESS_BY_ID[selectedUnion.id] ?? null : null;
  const liveOnchainUnion = liveAddress
    ? (unionsOnchain ?? []).find((u) => u.address.toLowerCase() === liveAddress.toLowerCase())
    : null;
  const { activeCount, activeLoans, data: liveLoansData } = useActiveLoans(liveAddress);

  // Derive fund IDs from active loans (reliable: doesn't depend on getUnion.fundTypes being set)
  // Falls back to contract fundTypes if no loan data yet.
  const liveOnchainFundTypes = liveOnchainUnion?.fundTypes ?? [];
  const liveLoanFundIds = useMemo(
    () => [...new Set((liveLoansData?.items ?? []).map((l) => l.fund).filter(Boolean))],
    [liveLoansData],
  );
  const liveFundIds = useMemo(
    () => [...new Set([...liveOnchainFundTypes, ...liveLoanFundIds])],
    [liveOnchainFundTypes, liveLoanFundIds],
  );
  const { rateByFund, historyByFund } = useWeightedRates(liveAddress, liveFundIds);

  // Always-on rate fetch for MT-001 so the index card APY is available regardless of selection
  const mt001Address  = LIVE_ADDRESS_BY_ID["MT-001"] ?? null;
  const mt001Onchain  = (unionsOnchain ?? []).find((u) => mt001Address && u.address.toLowerCase() === mt001Address.toLowerCase());
  const { data: mt001LoansData } = useActiveLoans(mt001Address);

  const mt001OnchainFundTypes = mt001Onchain?.fundTypes ?? [];
  const mt001LoanFundIds = useMemo(
    () => [...new Set((mt001LoansData?.items ?? []).map((l) => l.fund).filter(Boolean))],
    [mt001LoansData],
  );
  const mt001FundIds = useMemo(
    () => [...new Set([...mt001OnchainFundTypes, ...mt001LoanFundIds])],
    [mt001OnchainFundTypes, mt001LoanFundIds],
  );
  const { rateByFund: mt001RateByFund, historyByFund: mt001HistoryByFund } = useWeightedRates(mt001Address, mt001FundIds);

  // Merged rate + history maps: always includes MT-001; selected-union takes precedence
  const allRateByFund = useMemo(
    () => ({ ...mt001RateByFund, ...rateByFund }),
    [mt001RateByFund, rateByFund]
  );
  const allHistoryByFund = useMemo(
    () => ({ ...mt001HistoryByFund, ...historyByFund }),
    [mt001HistoryByFund, historyByFund]
  );

  // ── Unbond preview for selected live union ──────────────────────────────────
  const { data: unbondPreview, refetch: refetchUnbondPreview } = useUnbondPreview(
    liveAddress,
    wallet?.address,
  );

  // Refs
  const healthRef          = useRef(null);
  const termsRef           = useRef(null);
  const amountRef          = useRef(null);
  const txRef              = useRef(null);
  const withdrawRef        = useRef(null);
  const scrollContainerRef = useRef(null);
  const carouselRef        = useRef(null);
  const selectingUnionRef  = useRef(false);

  // Nav scroll shadow
  useEffect(() => {
    const el = scrollContainerRef.current?.parentElement ?? scrollContainerRef.current;
    if (!el) return;
    const handleScroll = () => setNavScrolled(el.scrollTop > 60);
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // MetaMask account / chain change listeners
  useEffect(() => {
    if (!window.ethereum) return;
    const onAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        handleDisconnect();
      } else if (wallet) {
        Promise.all([readUsdtBalance(accounts[0]), readUsdcBalance(accounts[0]), readNinBalance(accounts[0])]).then(([usdt, usdc, nin]) =>
          setWallet((w) => w ? { ...w, address: accounts[0], usdt, usdc, nin } : null)
        );
      }
    };
    const onChainChanged = () => { if (wallet) handleDisconnect(); };
    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, [wallet]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-validate cached wallet on mount
  useEffect(() => {
    const cached = loadWalletCache();
    if (!cached || !window.ethereum) return;
    (async () => {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        const chainId  = await window.ethereum.request({ method: "eth_chainId" });
        if (accounts.length === 0 || accounts[0].toLowerCase() !== cached.address.toLowerCase() || chainId !== POLYGON_CHAIN_ID) {
          clearWalletCache();
          setWallet(null);
          return;
        }
        const [usdt, usdc, nin] = await Promise.all([readUsdtBalance(cached.address), readUsdcBalance(cached.address), readNinBalance(cached.address)]);
        const refreshed = { ...cached, usdt, usdc, nin };
        saveWalletCache(refreshed);
        setWallet(refreshed);
      } catch (_) {
        clearWalletCache();
        setWallet(null);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleDisconnect = () => {
    clearWalletCache();
    setWallet(null);
    setSelectedUnion(null);
    setFlowStep(null);
    setInvestmentAmount(null);
    setUseNin(false);
    setPillHovered(false);
  };

  const scrollTo = (ref, delay = 0) => {
    const run = () => {
      const el = ref.current;
      if (!el) return;
      let container = el.parentElement;
      while (container && container !== document.body) {
        const { overflowY } = window.getComputedStyle(container);
        if (overflowY === "auto" || overflowY === "scroll") break;
        container = container.parentElement;
      }
      if (!container) return;
      const navHeight = 65;
      const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop - navHeight;
      container.scrollTo({ top, behavior: "smooth" });
    };
    if (delay > 0) setTimeout(run, delay); else run();
  };

  const handleSelectUnion = (union) => {
    selectingUnionRef.current = true;
    carouselRef.current?.snapToUnion(union.id);
    setSelectedUnion(union);
    setFlowStep(null);
    setInvestmentAmount(null);
    setUseNin(false);
  };

  const handleScrollToHealth = (union) => {
    if (selectedUnion?.id === union.id) {
      scrollTo(healthRef, 0);
    } else {
      handleSelectUnion(union);
    }
  };

  const handleWalletConnected = (walletData) => {
    saveWalletCache(walletData);
    setWallet(walletData);
    setShowWalletModal(false);
    const investedIds = Object.keys(investments);
    if (investedIds.length > 0) {
      setMyUnionsOnly(false);
      const firstInvestedUnion = unions.find((u) => u.id === investedIds[0]);
      if (firstInvestedUnion) {
        setTimeout(() => carouselRef.current?.snapToUnion(firstInvestedUnion.id), 50);
        setSelectedUnion(firstInvestedUnion);
        setFlowStep(null);
        setInvestmentAmount(null);
      }
    } else {
      scrollTo(healthRef);
    }
  };

  const handleInvestFromHealth  = () => setFlowStep("terms");

  const handleAddMoreFromCarousel = (union) => {
    if (!union) return;
    handleSelectUnion(union);
    setTimeout(() => setFlowStep("terms"), 50);
  };

  const handleWithdrawFromCarousel = (union) => {
    if (!union) return;
    handleSelectUnion(union);
    scrollTo(withdrawRef, 300);
  };
  const handleTermsConfirmed    = ({ useNin: u } = {}) => { setUseNin(!!u); setFlowStep("amount"); };
  const handleAmountSet = ({ amount, sourceToken }) => { setInvestmentAmount(amount); setInvestSourceToken(sourceToken || "USDT"); setFlowStep("tx"); };
  const handleTxDone = () => {
    qc.invalidateQueries({ queryKey: ['investorPositions'] });
    setSelectedUnion(null);
    setFlowStep(null);
    setInvestmentAmount(null);
    setUseNin(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWithdrawDone = () => {
    qc.refetchQueries({ queryKey: ['investorPositions'] });
    qc.removeQueries({ queryKey: ['unbondPreview'] });
    setSelectedUnion(null);
    setFlowStep(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={scrollContainerRef} className="relative min-h-screen w-full"
      style={{ background: "radial-gradient(ellipse at 0% 0%, var(--color-primary-mid) 0%, var(--color-primary) 75%)" }}>

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Sticky nav */}
      <div
        className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 md:px-10 ${
          navScrolled
            ? "bg-primary/80 shadow-sm shadow-slate-950/60 backdrop-blur-md ring-1 ring-white/5"
            : "bg-transparent"
        }`}
        style={{ position: "sticky" }}
      >
        <div onClick={onBack}
          className="inline-flex items-center gap-2 px-2 py-2 text-sm font-semibold transition hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          Back
        </div>

        <img
          src="/bw2.png"
          alt="Nila"
          onClick={onBack}
          className="hidden md:block h-7 w-auto cursor-pointer"
          style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
        />

        <div className="flex items-center gap-2">
          {/* Portfolio pill */}
          {wallet && Object.keys(investments).length > 0 && (() => {
            const totalDeposited = Object.values(investments).reduce((s, v) => s + v.amount, 0).toFixed(2);
            const totalPending   = Object.values(investments).reduce((s, v) => s + v.earnedPending, 0);
            return (
              <>
                <div className="flex sm:hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold"
                  style={{ backgroundColor: "rgba(212,166,23,0.10)", border: "1px solid rgba(212,166,23,0.25)", color: "var(--color-accent)" }}>
                  <BarChart2 className="h-3 w-3" />
                  {totalDeposited} USDT
                </div>
                <div className="hidden sm:flex items-center gap-3 rounded-full px-4 py-2 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(212,166,23,0.10)", border: "1px solid rgba(212,166,23,0.25)", color: "var(--color-accent)" }}>
                  <span className="flex items-center gap-1">
                    <BarChart2 className="h-3.5 w-3.5" />
                    {totalDeposited} USDT
                  </span>
                  <span style={{ color: "rgba(212,166,23,0.5)" }}>·</span>
                  <span style={{ color: "#52B788" }}>+{totalPending.toFixed(2)} pending</span>
                </div>
              </>
            );
          })()}

          {/* Buy USD button — hidden once user has funds deployed */}
          {!(wallet && Object.keys(investments).length > 0) && (
            <button
              onClick={() => setShowRamp(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-semibold transition-all hover:bg-white/10"
              style={{
                backgroundColor: "rgba(212,166,23,0.08)",
                border: "1px solid rgba(212,166,23,0.25)",
                color: "var(--color-accent)",
              }}
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Buy USD</span>
              <span className="sm:hidden">Buy</span>
            </button>
          )}

          {/* Wallet button */}
          {wallet ? (
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: pillHovered ? "rgba(239,68,68,0.12)" : "rgba(82,183,136,0.12)",
                border: pillHovered ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(82,183,136,0.25)",
                color: pillHovered ? "#ef4444" : "#52B788",
              }}
              onMouseEnter={() => setPillHovered(true)}
              onMouseLeave={() => setPillHovered(false)}
              onClick={handleDisconnect}
            >
              {pillHovered ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              {pillHovered ? "Disconnect" : `${wallet.usdt} USDT${wallet.usdc ? ` · ${wallet.usdc} USDC` : ""}`}
            </div>
          ) : (
            <button onClick={() => setShowWalletModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition hover:bg-white/10 bg-primary"
              style={{ color: "var(--color-text-on-dark)" }}>
              <Wallet className="h-4 w-4" />
              Connect wallet
            </button>
          )}
        </div>
      </div>

      {/* Carousel */}
      <CarouselSection
        ref={carouselRef}
        indexes={INDEXES}
        unions={unions}
        activeIndex={carouselIndex}
        onSnapTo={(i) => {
          if (i !== carouselIndex && !selectingUnionRef.current) {
            setSelectedUnion(null);
            setFlowStep(null);
            setInvestmentAmount(null);
          }
          selectingUnionRef.current = false;
          setCarouselIndex(i);
        }}
        selectedUnion={selectedUnion}
        wallet={wallet}
        onSelectUnion={handleSelectUnion}
        onScrollToHealth={handleScrollToHealth}
        investments={investments}
        myUnionsOnly={myUnionsOnly}
        onToggleMyUnions={() => {
          setMyUnionsOnly((v) => !v);
          setSelectedUnion(null);
          setFlowStep(null);
          setInvestmentAmount(null);
        }}
        rateByFund={allRateByFund}
        historyByFund={allHistoryByFund}
        onOpenModal={onOpenModal}
        onAddMore={handleAddMoreFromCarousel}
        onWithdraw={handleWithdrawFromCarousel}
      />

      {/* Health section */}
      <AnimatePresence>
        {selectedUnion && !INDEXES.some((idx) => idx.id === selectedUnion.id) && (
          <HealthSection
            key={selectedUnion.id}
            union={selectedUnion}
            wallet={wallet}
            onInvest={handleInvestFromHealth}
            stepRef={healthRef}
            onReady={() => scrollTo(healthRef)}
            investment={investments[selectedUnion.id] ?? null}
            rateByFund={rateByFund}
            activeCount={activeCount}
            loans={activeLoans}
          />
        )}
      </AnimatePresence>

      {/* Withdraw section — visible when invested and not mid-invest-flow */}
      <AnimatePresence>
        {selectedUnion &&
          !INDEXES.some((idx) => idx.id === selectedUnion.id) &&
          investments[selectedUnion.id] &&
          !flowStep && (
          <WithdrawSection
            key={`withdraw-${selectedUnion.id}`}
            union={selectedUnion}
            unionAddr={liveAddress}
            wallet={wallet}
            investment={investments[selectedUnion.id]}
            unbondPreview={unbondPreview}
            onRefreshPreview={refetchUnbondPreview}
            stepRef={withdrawRef}
            onReady={() => scrollTo(withdrawRef, 80)}
            onDone={handleWithdrawDone}
          />
        )}
      </AnimatePresence>

      {/* Terms */}
      <AnimatePresence>
        {flowStep === "terms" && (
          <TermsSection
            key="terms"
            union={selectedUnion}
            wallet={wallet}
            rateByFund={rateByFund}
            historyByFund={historyByFund}
            onConfirm={handleTermsConfirmed}
            stepRef={termsRef}
            onReady={() => scrollTo(termsRef)}
          />
        )}
      </AnimatePresence>

      {/* Amount */}
      <AnimatePresence>
        {flowStep === "amount" && (
          <AmountSection
            key="amount"
            union={selectedUnion}
            wallet={wallet}
            onInvest={handleAmountSet}
            stepRef={amountRef}
            onReady={() => scrollTo(amountRef)}
            useNin={useNin}
          />
        )}
      </AnimatePresence>

      {/* Transaction */}
      <AnimatePresence>
        {flowStep === "tx" && (
          <TxSection
            key="tx"
            amount={investmentAmount}
            sourceToken={investSourceToken}
            union={selectedUnion}
            onDone={handleTxDone}
            stepRef={txRef}
            onReady={() => scrollTo(txRef)}
          />
        )}
      </AnimatePresence>

      <div style={{ height: "20vh" }} />

      {/* Wallet modal */}
      <AnimatePresence>
        {showWalletModal && (
          <WalletModal
            onConnected={handleWalletConnected}
            onClose={() => setShowWalletModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Buy stablecoins modal */}
      <AnimatePresence>
        {showRamp && (
          <RampModal
            onClose={() => setShowRamp(false)}
            onConnectWallet={() => { setShowRamp(false); setShowWalletModal(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
