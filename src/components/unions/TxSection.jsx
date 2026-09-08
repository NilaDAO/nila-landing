import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, AlertCircle, RotateCcw, Bell, BellOff, CheckCircle2 } from "lucide-react";
import { Section, StepLabel } from "./shared.jsx";
import { ensurePolygon, LIVE_ADDRESS_BY_ID, USDC_POLYGON } from "./data.js";

// ─── Contract addresses from env ─────────────────────────────────────────────
const FX_POOL   = import.meta.env.VITE_FX_POOL_ADDRESS;
const USDT_ADDR = import.meta.env.VITE_USDT_ADDRESS;
const NIN_ADDR  = import.meta.env.VITE_NIN_ADDRESS;
const CORE_ADDR = import.meta.env.VITE_CORE_ADDRESS;

// Uniswap V3 SwapRouter02 on Polygon
const UNISWAP_ROUTER = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

// ─── Function selectors ──────────────────────────────────────────────────────
const APPROVE_SELECTOR = "0x095ea7b3";          // approve(address,uint256)
const MINT_NIN_SELECTOR = "0x6dba4c6f";          // mintNin(uint256)
const DEPOSIT_SENIOR_SELECTOR = "0x4f1a94d4";    // depositSenior(address,uint256)
// Uniswap V3 SwapRouter02.exactInputSingle((address,address,uint24,address,uint256,uint256,uint160))
const EXACT_INPUT_SINGLE_SELECTOR = "0x04e45aaf";

// Pad a number to uint256 hex (64 hex chars)
function toUint256Hex(value) {
  return BigInt(value).toString(16).padStart(64, "0");
}

// Pad an address to bytes32-sized slot (64 hex chars, left-padded)
function toAddressSlot(addr) {
  return addr.slice(2).toLowerCase().padStart(64, "0");
}

// ─── On-chain transaction helpers ────────────────────────────────────────────

/**
 * Estimate gas for a tx and add a 30% buffer.
 * Returns a hex string suitable for the `gas` field, or undefined on failure
 * (letting MetaMask fall back to its own estimate).
 */
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
  // Pre-flight: simulate with eth_call to surface revert reasons before sending
  try {
    await window.ethereum.request({ method: "eth_call", params: [txParams, "latest"] });
  } catch (err) {
    console.error("[sendTx] pre-flight revert:", txParams.to, err);
    throw new Error(err?.data?.message || err?.message || "Transaction would revert");
  }
  const gas = await estimateGas(txParams);
  return window.ethereum.request({
    method: "eth_sendTransaction",
    params: [{ ...txParams, ...(gas && { gas }) }],
  });
}

async function approveToken(tokenAddr, spender, amountRaw) {
  await ensurePolygon();
  const data = APPROVE_SELECTOR + toAddressSlot(spender) + toUint256Hex(amountRaw);
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return sendTx({ from: accounts[0], to: tokenAddr, data });
}

async function mintNin(amountUsdtRaw) {
  await ensurePolygon();
  const data = MINT_NIN_SELECTOR + toUint256Hex(amountUsdtRaw);
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return sendTx({ from: accounts[0], to: FX_POOL, data });
}

async function depositSenior(unionAddr, ninAmountRaw) {
  await ensurePolygon();
  const data = DEPOSIT_SENIOR_SELECTOR
    + toAddressSlot(unionAddr)
    + toUint256Hex(ninAmountRaw);
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return sendTx({ from: accounts[0], to: CORE_ADDR, data });
}

/**
 * Swap USDC → USDT via Uniswap V3 exactInputSingle on Polygon.
 * Uses the 100-bp fee tier (0.01% — stablecoin default on Polygon).
 * Params tuple: (tokenIn, tokenOut, fee, recipient, amountIn, amountOutMinimum, sqrtPriceLimitX96)
 */
async function swapUsdcToUsdt(amountUsdcRaw) {
  await ensurePolygon();
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  const recipient = accounts[0];
  // Allow 0.5% slippage on stablecoin swap
  const minOut = (BigInt(amountUsdcRaw) * 995n) / 1000n;

  const data = EXACT_INPUT_SINGLE_SELECTOR
    + toAddressSlot(USDC_POLYGON)  // tokenIn  (USDC)
    + toAddressSlot(USDT_ADDR)     // tokenOut (USDT)
    + toUint256Hex(100)            // fee (100 = 0.01%)
    + toAddressSlot(recipient)     // recipient
    + toUint256Hex(amountUsdcRaw)  // amountIn
    + toUint256Hex(minOut)         // amountOutMinimum
    + toUint256Hex(0);             // sqrtPriceLimitX96 (0 = no limit)

  return sendTx({ from: recipient, to: UNISWAP_ROUTER, data });
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

async function readBalanceRaw(tokenAddr, address) {
  const data = "0x70a08231" + address.slice(2).padStart(64, "0");
  const hex = await window.ethereum.request({
    method: "eth_call",
    params: [{ to: tokenAddr, data }, "latest"],
  });
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

// ─── Step definitions ────────────────────────────────────────────────────────

const USDT_STEPS = [
  { id: "approve",     label: "USDT Approval",  pendingMsg: "Approving USDT…",    successMsg: "Approved" },
  { id: "convert",     label: "NIN Conversion", pendingMsg: "Converting to NIN…", successMsg: "Converted" },
  { id: "deposit",     label: "Deposit Funds",  pendingMsg: "Depositing NIN…",    successMsg: "Deposited" },
  { id: "notify",      label: "Notifications",  pendingMsg: null,                 successMsg: "Done" },
];

const USDC_STEPS = [
  { id: "swap",        label: "USDC → USDT",    pendingMsg: "Swapping USDC…",     successMsg: "Swapped" },
  { id: "approve",     label: "USDT Approval",  pendingMsg: "Approving USDT…",    successMsg: "Approved" },
  { id: "convert",     label: "NIN Conversion", pendingMsg: "Converting to NIN…", successMsg: "Converted" },
  { id: "deposit",     label: "Deposit Funds",  pendingMsg: "Depositing NIN…",    successMsg: "Deposited" },
  { id: "notify",      label: "Notifications",  pendingMsg: null,                 successMsg: "Done" },
];

// Direct NIN deposit — skips USDT approval and NIN minting
const NIN_STEPS = [
  { id: "nin_approve", label: "NIN Approval",   pendingMsg: "Approving NIN…",     successMsg: "Approved" },
  { id: "deposit",     label: "Deposit Funds",  pendingMsg: "Depositing NIN…",    successMsg: "Deposited" },
  { id: "notify",      label: "Notifications",  pendingMsg: null,                 successMsg: "Done" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function TxSection({ amount, sourceToken = "USDT", union, onDone, stepRef, onReady }) {
  const isNin  = sourceToken === "NIN";
  const isUsdc = sourceToken === "USDC";
  const steps = isNin ? NIN_STEPS : isUsdc ? USDC_STEPS : USDT_STEPS;
  const notifyStepIdx = steps.length - 1;

  const [txStep, setTxStep] = useState(0);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState(null);
  const [notifPrefs, setNotifPrefs] = useState({ push: false, emailWeekly: false, emailMonthly: false });
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const [ninReceived, setNinReceived] = useState(null);
  const [usdtFromSwap, setUsdtFromSwap] = useState(null);
  const runningRef = useRef(false);

  const unionAddr = LIVE_ADDRESS_BY_ID[union.id] ?? null;
  const inputAmountRaw = BigInt(Math.round(amount * 1e6)); // both USDC & USDT have 6 decimals
  const ninAmountRaw   = BigInt(Math.round(amount * 1e18)); // NIN has 18 decimals

  const advance = () => {
    setTimeout(() => { setTxStep((s) => s + 1); setStatus("idle"); }, 800);
  };

  const executeStep = useCallback(async () => {
    if (runningRef.current || txStep >= notifyStepIdx || status === "pending") return;
    runningRef.current = true;
    setStatus("pending");
    setErrorMsg(null);

    const currentId = steps[txStep].id;

    try {
      if (currentId === "nin_approve") {
        // User chose to invest directly with NIN from their wallet
        const txHash = await approveToken(NIN_ADDR, CORE_ADDR, ninAmountRaw);
        setLastTxHash(txHash);
        await waitForTx(txHash);
        setNinReceived(ninAmountRaw);
        setStatus("success");
        advance();

      } else if (currentId === "swap") {
        // USDC → USDT via Uniswap V3
        const approveTx = await approveToken(USDC_POLYGON, UNISWAP_ROUTER, inputAmountRaw);
        await waitForTx(approveTx);
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        const usdtBefore = await readBalanceRaw(USDT_ADDR, accounts[0]);
        const swapTx = await swapUsdcToUsdt(inputAmountRaw);
        setLastTxHash(swapTx);
        await waitForTx(swapTx);
        const usdtAfter = await readBalanceRaw(USDT_ADDR, accounts[0]);
        setUsdtFromSwap(usdtAfter - usdtBefore);
        setStatus("success");
        advance();

      } else if (currentId === "approve") {
        const usdtAmount = isUsdc ? (usdtFromSwap ?? inputAmountRaw) : inputAmountRaw;
        const txHash = await approveToken(USDT_ADDR, FX_POOL, usdtAmount);
        setLastTxHash(txHash);
        await waitForTx(txHash);
        setStatus("success");
        advance();

      } else if (currentId === "convert") {
        const usdtAmount = isUsdc ? (usdtFromSwap ?? inputAmountRaw) : inputAmountRaw;
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        const ninBefore = await readBalanceRaw(NIN_ADDR, accounts[0]);
        const txHash = await mintNin(usdtAmount);
        setLastTxHash(txHash);
        await waitForTx(txHash);
        const ninAfter = await readBalanceRaw(NIN_ADDR, accounts[0]);
        const received = ninAfter - ninBefore;
        setNinReceived(received);
        const approveTx = await approveToken(NIN_ADDR, CORE_ADDR, received);
        await waitForTx(approveTx);
        setStatus("success");
        advance();

      } else if (currentId === "deposit") {
        if (!unionAddr) throw new Error("No on-chain address for this union");
        const ninAmount = ninReceived ?? inputAmountRaw;
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        const ninBalance = await readBalanceRaw(NIN_ADDR, accounts[0]);
        const allowanceData = "0xdd62ed3e" + toAddressSlot(accounts[0]) + toAddressSlot(CORE_ADDR);
        const allowanceHex = await window.ethereum.request({ method: "eth_call", params: [{ to: NIN_ADDR, data: allowanceData }, "latest"] });
        console.log("[deposit] ninAmount:", ninAmount.toString(), "ninBalance:", ninBalance.toString(), "allowance:", BigInt(allowanceHex).toString(), "union:", unionAddr, "from:", accounts[0]);
        const txHash = await depositSenior(unionAddr, ninAmount);
        setLastTxHash(txHash);
        await waitForTx(txHash);
        setStatus("success");
        advance();
      }
    } catch (err) {
      console.error("Tx error:", err);
      if (err?.code === 4001 || err?.code === "ACTION_REJECTED") {
        setErrorMsg("Transaction rejected by user");
      } else {
        setErrorMsg(err?.message?.slice(0, 120) || "Transaction failed");
      }
      setStatus("error");
    } finally {
      runningRef.current = false;
    }
  }, [txStep, status, inputAmountRaw, ninAmountRaw, unionAddr, ninReceived, usdtFromSwap, isNin, isUsdc, steps, notifyStepIdx]);

  useEffect(() => {
    if (txStep < notifyStepIdx && status === "idle") {
      executeStep();
    }
  }, [txStep, status, executeStep, notifyStepIdx]);

  const handleRetry = () => { setStatus("idle"); setErrorMsg(null); };

  const handleDone = () => {
    setShowSuccess(true);
    setTimeout(() => { setShowSuccess(false); onDone(); }, 1800);
  };

  const ninDisplay = ninReceived != null ? (Number(ninReceived) / 1e18).toFixed(2) : null;
  const shortTxHash = lastTxHash ? `${lastTxHash.slice(0, 8)}…${lastTxHash.slice(-6)}` : null;
  const polygonscanUrl = lastTxHash ? `https://polygonscan.com/tx/${lastTxHash}` : null;

  // Determine which step shows the nIN received message
  const convertStepIdx = steps.findIndex((s) => s.id === "convert");

  if (showSuccess) {
    return (
      <Section id="tx" onReady={onReady}>
        <div ref={stepRef} className="flex flex-col items-center justify-center text-center">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: 2 }}>
            <CheckCircle2 className="h-20 w-20 mb-6" style={{ color: "var(--color-primary-light)" }} />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "var(--color-text-on-dark)" }}>Investment complete!</h2>
          <p className="text-sm" style={{ color: "var(--color-text-soft)" }}>
            {amount} {sourceToken} invested in {union.name}.
          </p>
        </div>
      </Section>
    );
  }

  return (
    <Section id="tx" onReady={onReady}>
      <div ref={stepRef}>
        <StepLabel label="Step 5 — Transaction" />
        <h2 className="mb-6 text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--color-text-on-dark)", letterSpacing: "-0.02em" }}>
          Completing investment
        </h2>

        {/* Progress bar */}
        <div className="flex items-center gap-0.5 sm:gap-1 mb-6 sm:mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all flex-shrink-0"
                style={{
                  backgroundColor: i < txStep ? "var(--color-primary-light)" : i === txStep ? "var(--color-accent)" : "rgba(255,255,255,0.08)",
                  color: i <= txStep ? "#0f172a" : "var(--color-text-soft)",
                }}>
                {i < txStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1"
                  style={{ backgroundColor: i < txStep ? "var(--color-primary-light)" : "rgba(255,255,255,0.08)" }} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-6 mb-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: `1px solid ${status === "error" ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`,
          }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-soft)" }}>
            {steps[txStep].label}
          </p>

          {txStep < notifyStepIdx ? (
            <div className="flex items-center gap-3">
              {status === "pending" && (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  className="h-5 w-5 rounded-full border-2 border-transparent flex-shrink-0"
                  style={{ borderTopColor: "var(--color-accent)" }} />
              )}
              {status === "success" && <Check className="h-5 w-5 flex-shrink-0" style={{ color: "#52B788" }} />}
              {status === "error"   && <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: "#ef4444" }} />}
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-on-dark)" }}>
                  {status === "error"
                    ? (errorMsg || "Transaction failed")
                    : status === "pending"
                      ? steps[txStep].pendingMsg
                      : steps[txStep].successMsg}
                  {txStep === convertStepIdx && status === "success" && ninDisplay ? ` — You received ${ninDisplay} NIN` : ""}
                </p>
                {status === "success" && shortTxHash && (
                  <a
                    href={polygonscanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs mt-1 font-mono underline cursor-pointer hover:opacity-70 block"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {shortTxHash}
                  </a>
                )}
              </div>
              {status === "error" && (
                <button onClick={handleRetry}
                  className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)" }}>
                  <RotateCcw className="h-3.5 w-3.5" /> Retry
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-soft)" }}>
                Opt in to receive updates about your investment.
              </p>
              {[
                { key: "push",         label: "Push notifications",     Icon: Bell },
                { key: "emailWeekly",  label: "Email digest — Weekly",  Icon: Bell },
                { key: "emailMonthly", label: "Email digest — Monthly", Icon: BellOff },
              ].map(({ key, label, Icon }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color: "var(--color-text-soft)" }} />
                    <span className="text-sm" style={{ color: "var(--color-text-soft)" }}>{label}</span>
                  </div>
                  <button onClick={() => setNotifPrefs({ ...notifPrefs, [key]: !notifPrefs[key] })}
                    className="relative w-10 h-6 rounded-full transition-all flex-shrink-0"
                    style={{ backgroundColor: notifPrefs[key] ? "var(--color-accent)" : "rgba(255,255,255,0.12)" }}>
                    <div className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all"
                      style={{ left: notifPrefs[key] ? "calc(100% - 20px)" : "4px" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {txStep === notifyStepIdx && (
          <div className="flex gap-3">
            <button onClick={handleDone} className="flex-1 rounded-2xl py-4 text-sm font-semibold"
              style={{ backgroundColor: "var(--color-accent)", color: "#0f172a" }}>
              Done
            </button>
            <button onClick={handleDone} className="rounded-2xl px-5 py-4 text-sm font-semibold"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "var(--color-text-soft)", border: "1px solid rgba(255,255,255,0.09)" }}>
              Skip
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}
