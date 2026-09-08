import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { Check, AlertCircle, RotateCcw, Clock, CheckCircle2, ArrowDownToLine, RefreshCw } from "lucide-react";
import { Section, StepLabel } from "./shared.jsx";
import { ensurePolygon, LIVE_ADDRESS_BY_ID } from "./data.js";
import coreArtifact   from "../ABI/genericFundCore.json";
import fxPoolArtifact from "../ABI/NilaFxPool.json";
import ninArtifact    from "../ABI/NilaNINV2.json";

const CORE_ADDR     = import.meta.env.VITE_CORE_ADDRESS;
const FX_POOL_ADDR  = import.meta.env.VITE_FX_POOL_ADDRESS;
const NIN_ADDR      = import.meta.env.VITE_NIN_ADDRESS;
const RAY           = 10n ** 27n;
const MAX_UINT256   = 2n ** 256n - 1n;

// ─── ABI interfaces ───────────────────────────────────────────────────────────
const coreIface   = new ethers.Interface(coreArtifact.abi   ?? coreArtifact);
const fxPoolIface = new ethers.Interface(fxPoolArtifact.abi ?? fxPoolArtifact);
const ninIface    = new ethers.Interface(ninArtifact.abi    ?? ninArtifact);

// ─── Tx helpers ───────────────────────────────────────────────────────────────

async function estimateGas(txParams) {
  try {
    const estimate = await window.ethereum.request({
      method: "eth_estimateGas",
      params: [txParams],
    });
    const buffered = BigInt(estimate) * 130n / 100n;
    return "0x" + buffered.toString(16);
  } catch {
    return undefined;
  }
}

async function sendTx(txParams) {
  try {
    await window.ethereum.request({ method: "eth_call", params: [txParams, "latest"] });
  } catch (err) {
    throw new Error(err?.data?.message || err?.message || "Transaction would revert");
  }
  const gas = await estimateGas(txParams);
  return window.ethereum.request({
    method: "eth_sendTransaction",
    params: [{ ...txParams, ...(gas && { gas }) }],
  });
}

async function waitForTx(txHash, maxWaitMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const receipt = await window.ethereum.request({
      method: "eth_getTransactionReceipt",
      params: [txHash],
    });
    if (receipt) {
      if (receipt.status === "0x0") throw new Error("Transaction reverted");
      return receipt;
    }
    await new Promise((r) => setTimeout(r, 2500));
  }
  throw new Error("Transaction timed out");
}

// ─── Share math ───────────────────────────────────────────────────────────────

/**
 * Convert a USDT amount to senior shares, given the current FX rate and index.
 * Returns a bigint with a small safety buffer subtracted (matches PWA logic).
 */
function usdtToShares(amountUsdt, fxRateFloat, seniorIndex) {
  if (!fxRateFloat || !seniorIndex || seniorIndex === 0n) return 0n;
  // USDT → nIN float (fxRateFloat is INR per USDT; nIN ≈ INR)
  const amountNin = amountUsdt * fxRateFloat;
  // nIN float → nIN wei (18 decimals)
  const amountNinWei = BigInt(Math.round(amountNin * 1e12)) * 10n ** 6n; // avoid float precision loss
  // nIN wei → shares
  const rawShares = amountNinWei * RAY / seniorIndex;
  // safety buffer to avoid off-by-one reverts (matches PWA)
  return rawShares > 10000n ? rawShares - 10000n : rawShares;
}

/**
 * Convert senior shares → USDT float for display.
 */
function sharesToUsdt(shares, fxRateFloat, seniorIndex) {
  if (!fxRateFloat || !seniorIndex || seniorIndex === 0n || !shares) return 0;
  const ninWei  = shares * seniorIndex / RAY;
  const ninFloat = Number(ninWei) / 1e18;
  return ninFloat / fxRateFloat;
}

// ─── Countdown helper ─────────────────────────────────────────────────────────

function useCountdown(targetTs) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!targetTs) return;
    const tick = () => setRemaining(Math.max(0, targetTs - Math.floor(Date.now() / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTs]);

  const days    = Math.floor(remaining / 86400);
  const hours   = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  return { remaining, days, hours, minutes, seconds };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountdownDisplay({ targetTs }) {
  const { remaining, days, hours, minutes, seconds } = useCountdown(targetTs);
  if (remaining === 0) return <span style={{ color: "#52B788" }}>Ready</span>;
  const parts = [];
  if (days > 0)    parts.push(`${days}d`);
  if (hours > 0)   parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return <span>{parts.join(" ")}</span>;
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * WithdrawSection
 *
 * Props:
 *   union          – union metadata object (with .id)
 *   unionAddr      – on-chain address string for this union
 *   wallet         – { address, ... }
 *   investment     – position data: { amount, earnedPending, totalShares, pendingShares, seniorIndex, currentFxRate }
 *   unbondPreview  – { requestTs, minWindowTs, pastMin, eligibleNow } | null (loading)
 *   onRefreshPreview – () => void, triggers a refetch of unbondPreview
 *   stepRef        – React ref for scroll-into-view
 *   onReady        – called once on mount to trigger scroll
 *   onDone         – called after a successful claim to reset parent state
 */
export function WithdrawSection({
  union,
  unionAddr,
  wallet,
  investment,
  unbondPreview,
  onRefreshPreview,
  stepRef,
  onReady,
  onDone,
}) {
  const [inputAmount, setInputAmount]   = useState("");
  const [txStatus, setTxStatus]         = useState("idle"); // idle | pending | success | error
  const [claimStep, setClaimStep]       = useState(null);   // null | 'claim' | 'approve' | 'redeem'
  const [errorMsg, setErrorMsg]         = useState(null);
  const [lastTxHash, setLastTxHash]     = useState(null);
  const [showSuccess, setShowSuccess]   = useState(false);
  const runningRef                      = useRef(false);

  const fxRate      = investment?.currentFxRate ?? 0;
  const seniorIndex = investment?.seniorIndex   ?? 0n;
  const totalShares = investment?.totalShares   ?? 0n;
  const pendingShr  = investment?.pendingShares ?? 0n;

  // Shares available for a new withdrawal request (not already in unbonding)
  const availableShares = totalShares > pendingShr ? totalShares - pendingShr : 0n;
  const maxUsdt = sharesToUsdt(availableShares, fxRate, seniorIndex);

  // Parsed input
  const parsedAmount = parseFloat(inputAmount) || 0;
  const amountValid  = parsedAmount > 0 && parsedAmount <= maxUsdt + 0.01; // small tolerance

  // ── Request unbonding ────────────────────────────────────────────────────────
  const handleRequestUnbond = useCallback(async () => {
    if (runningRef.current || !amountValid) return;
    runningRef.current = true;
    setTxStatus("pending");
    setErrorMsg(null);

    try {
      await ensurePolygon();
      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      const sharesToRequest = usdtToShares(parsedAmount, fxRate, seniorIndex);
      if (sharesToRequest <= 0n) throw new Error("Amount too small");

      const data = coreIface.encodeFunctionData("requestUnbondSenior", [unionAddr, sharesToRequest]);
      const txHash = await sendTx({ from: accounts[0], to: CORE_ADDR, data });
      setLastTxHash(txHash);
      await waitForTx(txHash);

      setTxStatus("success");
      setTimeout(() => {
        onRefreshPreview?.();
      }, 2000);
    } catch (err) {
      console.error("[WithdrawSection] requestUnbond error:", err);
      if (err?.code === 4001 || err?.code === "ACTION_REJECTED") {
        setErrorMsg("Rejected by user");
      } else {
        setErrorMsg(err?.message?.slice(0, 120) || "Transaction failed");
      }
      setTxStatus("error");
    } finally {
      runningRef.current = false;
    }
  }, [amountValid, parsedAmount, fxRate, seniorIndex, unionAddr, onRefreshPreview]);

  // ── Claim → Approve → Redeem ─────────────────────────────────────────────────
  const handleClaim = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setTxStatus("pending");
    setClaimStep("claim");
    setErrorMsg(null);

    try {
      await ensurePolygon();
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const from = accounts[0];

      // Step 1 — claimSenior: releases nIN from the pool to the investor
      const claimData = coreIface.encodeFunctionData("claimSenior", [unionAddr, MAX_UINT256]);
      const claimHash = await sendTx({ from, to: CORE_ADDR, data: claimData });
      setLastTxHash(claimHash);
      await waitForTx(claimHash);

      // Step 2 — read nIN balance received
      setClaimStep("approve");
      const balanceData = ninIface.encodeFunctionData("balanceOf", [from]);
      const balanceResult = await window.ethereum.request({
        method: "eth_call",
        params: [{ to: NIN_ADDR, data: balanceData }, "latest"],
      });
      const [ninBalance] = ninIface.decodeFunctionResult("balanceOf", balanceResult);
      if (ninBalance === 0n) throw new Error("No nIN balance to redeem");

      // Step 2 — approve FxPool to spend nIN
      const approveData = ninIface.encodeFunctionData("approve", [FX_POOL_ADDR, ninBalance]);
      const approveHash = await sendTx({ from, to: NIN_ADDR, data: approveData });
      await waitForTx(approveHash);

      // Step 3 — redeemNin: burns nIN, returns USDT
      setClaimStep("redeem");
      const redeemData = fxPoolIface.encodeFunctionData("redeemNin", [ninBalance]);
      const redeemHash = await sendTx({ from, to: FX_POOL_ADDR, data: redeemData });
      setLastTxHash(redeemHash);
      await waitForTx(redeemHash);

      setTxStatus("success");
      setClaimStep(null);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onDone?.();
      }, 2500);
    } catch (err) {
      console.error("[WithdrawSection] claim error:", err);
      if (err?.code === 4001 || err?.code === "ACTION_REJECTED") {
        setErrorMsg("Rejected by user");
      } else {
        setErrorMsg(err?.message?.slice(0, 120) || "Transaction failed");
      }
      setTxStatus("error");
      setClaimStep(null);
    } finally {
      runningRef.current = false;
    }
  }, [unionAddr, onDone]);

  const handleRetry = () => { setTxStatus("idle"); setErrorMsg(null); setClaimStep(null); };

  const shortTxHash   = lastTxHash ? `${lastTxHash.slice(0, 8)}…${lastTxHash.slice(-6)}` : null;
  const polygonscanUrl = lastTxHash ? `https://polygonscan.com/tx/${lastTxHash}` : null;

  // ── Claim success screen ─────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <Section id="withdraw" onReady={onReady}>
        <div ref={stepRef} className="flex flex-col items-center justify-center text-center py-6">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: 2 }}>
            <CheckCircle2 className="h-16 w-16 mb-5" style={{ color: "var(--color-primary-light)" }} />
          </motion.div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-on-dark)" }}>
            Withdrawal complete
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-soft)" }}>
            USDT has been returned to your wallet.
          </p>
        </div>
      </Section>
    );
  }

  // ── Determine display state ──────────────────────────────────────────────────
  const isLoading        = unbondPreview === null || unbondPreview === undefined;
  const requestTs        = unbondPreview?.requestTs        ?? 0;
  const minWindowTs      = unbondPreview?.minWindowTs      ?? 0;
  const eligibleNow      = unbondPreview?.eligibleNow      ?? false;
  const defaultUnbonding = unbondPreview?.defaultUnbonding ?? 0;
  const seniorCashUsdt   = unbondPreview?.seniorCashUsdt   ?? null;
  const hasActiveBond    = requestTs > 0;

  // Countdown derives from minWindowTs — works whether period is 0 or 14 days
  const nowSecs       = Math.floor(Date.now() / 1000);
  const windowPassed  = minWindowTs > 0 && nowSecs >= minWindowTs;
  const secsLeft      = Math.max(0, minWindowTs - nowSecs);
  const daysLeft      = Math.floor(secsLeft / 86400);
  const hoursLeft     = Math.floor((secsLeft % 86400) / 3600);

  // Can only claim when both the min window has passed AND contract says eligible
  const canClaim = eligibleNow && windowPassed;

  // ── Shared tx feedback row ───────────────────────────────────────────────────
  const TxFeedback = () => (
    <div className="mt-3">
      {txStatus === "error" && (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#ef4444" }} />
          <span className="text-xs flex-1" style={{ color: "#fca5a5" }}>{errorMsg}</span>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <RotateCcw className="h-3 w-3" /> Retry
          </button>
        </div>
      )}
      {txStatus === "success" && shortTxHash && (
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4" style={{ color: "#52B788" }} />
          <a
            href={polygonscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono underline hover:opacity-70"
            style={{ color: "var(--color-accent)" }}
          >
            {shortTxHash}
          </a>
        </div>
      )}
    </div>
  );

  // ── Spinner ──────────────────────────────────────────────────────────────────
  const Spinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      className="h-4 w-4 rounded-full border-2 border-transparent flex-shrink-0"
      style={{ borderTopColor: "var(--color-accent)" }}
    />
  );

  return (
    <Section id="withdraw" onReady={onReady}>
      <div ref={stepRef}>
        <StepLabel label="Your position — Withdraw" />

        <div
          className="rounded-3xl p-5"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* ── Loading ─────────────────────────────────────────────────────── */}
          {isLoading && (
            <div className="flex items-center gap-3 py-2">
              <Spinner />
              <span className="text-sm" style={{ color: "var(--color-text-soft)" }}>
                Checking withdrawal status…
              </span>
            </div>
          )}

          {/* ── No active unbond — show amount input ─────────────────────────── */}
          {!isLoading && !hasActiveBond && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--color-text-soft)" }}>
                Request withdrawal
              </p>

              {/* Available balance info */}
              <div className="flex justify-between text-xs mb-2" style={{ color: "var(--color-text-soft)" }}>
                <span>Available to withdraw</span>
                <span style={{ color: "var(--color-text-on-dark)" }}>
                  {maxUsdt.toFixed(2)} USDT
                </span>
              </div>

              {/* Amount input */}
              <div
                className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4"
                style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
              >
                <input
                  type="number"
                  min="0"
                  max={maxUsdt}
                  step="0.01"
                  placeholder="0.00"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-semibold outline-none placeholder-slate-600"
                  style={{ color: "var(--color-text-on-dark)" }}
                />
                <span className="text-sm font-semibold" style={{ color: "var(--color-text-soft)" }}>USDT</span>
                <button
                  onClick={() => setInputAmount(maxUsdt.toFixed(2))}
                  className="rounded-xl px-2.5 py-1 text-xs font-bold"
                  style={{ backgroundColor: "rgba(212,166,23,0.12)", color: "var(--color-accent)", border: "1px solid rgba(212,166,23,0.25)" }}
                >
                  Max
                </button>
              </div>

              {/* Unbonding period note */}
              <p className="text-xs mb-4" style={{ color: "var(--color-text-soft)" }}>
                Withdrawals are subject to an unbonding period. Funds covered by idle cash are typically available in ~14 days; funds tied to active loans may take up to 3 weeks.
              </p>

              {/* Request button */}
              <button
                onClick={handleRequestUnbond}
                disabled={!amountValid || txStatus === "pending"}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all"
                style={{
                  backgroundColor: amountValid && txStatus !== "pending"
                    ? "var(--color-accent)"
                    : "rgba(255,255,255,0.07)",
                  color: amountValid && txStatus !== "pending" ? "#0f172a" : "var(--color-text-soft)",
                  cursor: amountValid && txStatus !== "pending" ? "pointer" : "not-allowed",
                }}
              >
                {txStatus === "pending" ? (
                  <><Spinner /><span>Requesting…</span></>
                ) : (
                  <><ArrowDownToLine className="h-4 w-4" /><span>Request withdrawal</span></>
                )}
              </button>

              <TxFeedback />
            </>
          )}

          {/* ── Active unbond — show status ──────────────────────────────────── */}
          {!isLoading && hasActiveBond && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-soft)" }}>
                  Withdrawal status
                </p>
                <button
                  onClick={onRefreshPreview}
                  className="p-1 rounded-lg transition hover:opacity-70"
                  style={{ color: "var(--color-text-soft)" }}
                  title="Refresh status"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Pending amount */}
              {pendingShr > 0n && (
                <div className="flex justify-between text-sm mb-3">
                  <span style={{ color: "var(--color-text-soft)" }}>Amount in unbonding</span>
                  <span className="font-semibold" style={{ color: "var(--color-text-on-dark)" }}>
                    ~{sharesToUsdt(pendingShr, fxRate, seniorIndex).toFixed(2)} USDT
                  </span>
                </div>
              )}

              {/* State: eligible to claim — only after min window has passed */}
              {canClaim && (
                <>
                  <div
                    className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4"
                    style={{ backgroundColor: "rgba(82,183,136,0.10)", border: "1px solid rgba(82,183,136,0.25)" }}
                  >
                    <Check className="h-4 w-4 flex-shrink-0" style={{ color: "#52B788" }} />
                    <p className="text-sm font-semibold" style={{ color: "#52B788" }}>
                      Ready to claim — funds are available
                    </p>
                  </div>

                  <button
                    onClick={handleClaim}
                    disabled={txStatus === "pending"}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: txStatus !== "pending" ? "var(--color-accent)" : "rgba(255,255,255,0.07)",
                      color: txStatus !== "pending" ? "#0f172a" : "var(--color-text-soft)",
                      cursor: txStatus !== "pending" ? "pointer" : "not-allowed",
                    }}
                  >
                    {txStatus === "pending" ? (
                      <>
                        <Spinner />
                        <span>
                          {claimStep === "claim"   && "Claiming nIN…"}
                          {claimStep === "approve" && "Approving…"}
                          {claimStep === "redeem"  && "Redeeming USDT…"}
                          {!claimStep              && "Processing…"}
                        </span>
                      </>
                    ) : (
                      <><Check className="h-4 w-4" /><span>Claim &amp; receive USDT</span></>
                    )}
                  </button>

                  <TxFeedback />
                </>
              )}

              {/* State: still within unbonding window (countdown) */}
              {!windowPassed && (
                <>
                  <div
                    className="flex items-center justify-between rounded-2xl px-4 py-3 mb-3"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" style={{ color: "var(--color-text-soft)" }} />
                      <span className="text-sm" style={{ color: "var(--color-text-soft)" }}>Unbonding period</span>
                    </div>
                    <span className="text-sm font-bold font-mono" style={{ color: "var(--color-text-on-dark)" }}>
                      <CountdownDisplay targetTs={minWindowTs} />
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--color-text-soft)" }}>
                    Requested {new Date(requestTs * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    Earliest claim {new Date(minWindowTs * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </>
              )}

              {/* State: past minimum window but waiting for liquidity */}
              {windowPassed && !eligibleNow && (
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{ backgroundColor: "rgba(212,166,23,0.08)", border: "1px solid rgba(212,166,23,0.2)" }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
                    <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>
                      Awaiting loan repayments
                    </p>
                  </div>
                  <p className="text-xs mb-3" style={{ color: "var(--color-text-soft)" }}>
                    Your withdrawal request is registered. The funds are currently deployed in active loans — they will be released automatically as borrowers repay.
                  </p>

                  {/* Idle cash vs needed */}
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "var(--color-text-soft)" }}>Pool idle cash</span>
                    <span style={{ color: "var(--color-text-on-dark)" }}>
                      {seniorCashUsdt != null ? `${seniorCashUsdt.toFixed(2)} USDT` : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mb-3">
                    <span style={{ color: "var(--color-text-soft)" }}>Your withdrawal</span>
                    <span style={{ color: "var(--color-text-on-dark)" }}>
                      ~{pendingShr > 0n ? sharesToUsdt(pendingShr, fxRate, seniorIndex).toFixed(2) : "—"} USDT
                    </span>
                  </div>

                  {/* Progress bar: idle / needed */}
                  {seniorCashUsdt != null && pendingShr > 0n && (() => {
                    const needed = sharesToUsdt(pendingShr, fxRate, seniorIndex);
                    const pct    = needed > 0 ? Math.min(seniorCashUsdt / needed, 1) * 100 : 0;
                    return (
                      <div>
                        <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? "#52B788" : "var(--color-accent)" }}
                          />
                        </div>
                        <p className="text-[10px]" style={{ color: "var(--color-text-soft)" }}>
                          {pct >= 100
                            ? "Pool has enough — refresh to check claim status"
                            : `${pct.toFixed(0)}% of required liquidity available`}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Contract config note */}
                  {defaultUnbonding === 0 && (
                    <p className="text-[10px] mt-2 pt-2" style={{ color: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      Note: the senior unbond period is not set on-chain (DEFAULT_UNBONDING = 0). Funds are claimable as soon as the pool has idle cash.
                    </p>
                  )}

                  {requestTs > 0 && (
                    <p className="text-[10px] mt-1.5 font-mono" style={{ color: "rgba(212,166,23,0.5)" }}>
                      Requested {new Date(requestTs * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </Section>
  );
}
