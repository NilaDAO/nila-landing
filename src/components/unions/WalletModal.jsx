import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, ChevronRight, X, AlertCircle } from "lucide-react";
import { WALLET_OPTIONS, ensurePolygon, readUsdtBalance, readUsdcBalance, readNinBalance, hasNinInteraction } from "./data.js";

export function WalletModal({ onConnected, onClose }) {
  const [connecting, setConnecting] = useState(null);
  const [error, setError] = useState(null);
  const [previewAddress, setPreviewAddress] = useState(null);

  // Passively read the already-permitted account (no MetaMask popup)
  useEffect(() => {
    if (!window.ethereum?.isMetaMask) return;
    window.ethereum.request({ method: "eth_accounts" })
      .then((accounts) => { if (accounts?.[0]) setPreviewAddress(accounts[0]); })
      .catch(() => {});
  }, []);

  const handleConnect = async (walletId) => {
    if (walletId !== "metamask") return;
    if (!window.ethereum?.isMetaMask) {
      setError("MetaMask not detected. Please install the browser extension.");
      return;
    }
    setConnecting(walletId);
    setError(null);
    try {
      await ensurePolygon();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      const [usdt, usdc, nin, ninUser] = await Promise.all([
        readUsdtBalance(address),
        readUsdcBalance(address),
        readNinBalance(address),
        hasNinInteraction(address),
      ]);
      onConnected({ address, usdt, usdc, nin, ninUser });
    } catch (err) {
      if (err.code === 4001) setError("Connection rejected.");
      else setError(err.message ?? "Connection failed. Please try again.");
    } finally {
      setConnecting(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
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
        className="w-full max-w-sm rounded-3xl p-6"
        style={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold" style={{ color: "var(--color-text-on-dark)" }}>Connect wallet</h3>
          <button onClick={onClose} className="rounded-xl p-1.5 transition hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-5 text-sm" style={{ color: "var(--color-text-soft)" }}>
          Minimum balance required: <strong className="text-white">50 USDT</strong>
          {" "}— or existing nIN holder
        </p>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: "#ef4444" }} />
            <p className="text-sm" style={{ color: "#fca5a5" }}>{error}</p>
          </div>
        )}

        <div className="space-y-2.5">
          {WALLET_OPTIONS.map((w) => {
            const isMetaMask = w.id === "metamask";
            const isBusy = connecting === w.id;
            return (
              <button
                key={w.id}
                onClick={() => isMetaMask && handleConnect(w.id)}
                disabled={!!connecting || !isMetaMask}
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all"
                style={{
                  backgroundColor: isMetaMask ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                  border: isBusy ? "1px solid var(--color-accent)" : "1px solid rgba(255,255,255,0.09)",
                  cursor: !isMetaMask ? "not-allowed" : connecting ? "wait" : "pointer",
                  opacity: !isMetaMask ? 0.45 : 1,
                }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {isBusy
                    ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 rounded-full border-2 border-transparent"
                        style={{ borderTopColor: "var(--color-accent)" }}
                      />
                    )
                    : <Wallet className="h-4 w-4" style={{ color: "var(--color-text-soft)" }} />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-on-dark)" }}>{w.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-soft)" }}>
                    {isMetaMask && previewAddress
                      ? `${previewAddress.slice(0, 6)}…${previewAddress.slice(-4)}`
                      : w.description}
                  </p>
                </div>
                {isMetaMask
                  ? <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: "var(--color-text-soft)" }} />
                  : <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "var(--color-text-soft)" }}>Soon</span>
                }
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
