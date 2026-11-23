// nila.land/senior (executive decision 23 Nov): the senior guarantee pool for invited investors. The chain is the
// invitation: only a wallet the trust accepted (senior.set_investor, after KYC at the anchor) sees the pool.
// Texts approved by the executive 23 Nov; the four marked NEW below wait for approval.
import { useEffect, useState } from "react";
import { UNBOND_S, UNIT, connect, i128, addr, load, send, usdc } from "./chain";

const ink = "#F2EFE8", quiet = "#9A968E", line = "#2A2926", accent = "#E8B44C";
const box = { border: `1px solid ${line}`, borderRadius: 12, padding: 16, marginTop: 16 };
const btn = (on = true) => ({
  width: "100%", padding: "14px 16px", marginTop: 12, borderRadius: 10, border: 0, fontSize: 16, fontWeight: 600,
  background: on ? accent : line, color: on ? "#0A0A0A" : quiet, cursor: on ? "pointer" : "default",
});
const day = (ts) => new Date(ts * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function Senior() {
  const [who, setWho] = useState(null);
  const [st, setSt] = useState(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    document.body.style.background = "#0A0A0A";
    document.title = "Senior pool · Nila";
  }, []);
  const refresh = (a = who) => load(a).then(setSt).catch((e) => setErr(e.message));
  const run = async (fn, args) => {
    setBusy(true); setErr("");
    try { await send(who, fn, args); setAmount(""); await refresh(); } catch (e) { setErr(e.message); }
    setBusy(false);
  };
  const doConnect = async () => {
    setErr("");
    try { const a = await connect(); setWho(a); await refresh(a); } catch (e) { setErr(e.message); }
  };

  const units = (() => { try { return BigInt(Math.round(Number(amount) * Number(UNIT))); } catch { return 0n; } })();
  const ready = st && st.pending > 0n && Date.now() / 1000 >= st.requestTs + UNBOND_S;

  return (
    <main style={{ minHeight: "100vh", color: ink, font: "16px/1.5 system-ui, sans-serif", padding: "48px 16px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Senior pool</h1>
        <p style={{ color: quiet }}>
          Your investment guarantees agri-services. If a farmer cannot pay for a service, you cover the service
          provider&apos;s loss.
        </p>

        {!who && <button type="button" style={btn()} onClick={doConnect}>Connect your Stellar wallet</button>}

        {/* NEW: shown to a wallet the trust has not accepted. */}
        {st && !st.accepted && <p style={box}>This page is for invited investors.</p>}

        {st && st.accepted && (
          <>
            <div style={box}>
              <div>Your share: {usdc(st.value)} USDC</div>
              <div style={{ color: quiet }}>Pool: {usdc(st.total)} USDC</div>
              <div style={{ color: quiet }}>Exits wait 14 days</div>
            </div>

            <div style={box}>
              {/* NEW: the input's label and the wallet's USDC. */}
              <label style={{ color: quiet, fontSize: 14 }}>
                USDC ({usdc(st.balance)} in your wallet)
                <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                  style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: 12,
                    borderRadius: 10, border: `1px solid ${line}`, background: "#141413", color: ink, fontSize: 16 }} />
              </label>
              <button type="button" disabled={busy || units <= 0n || units > st.balance}
                style={btn(!busy && units > 0n && units <= st.balance)}
                onClick={() => run("deposit", [addr(who), i128(units)])}>Deposit USDC</button>
            </div>

            <div style={box}>
              <button type="button" disabled={busy || st.shares <= 0n} style={btn(!busy && st.shares > 0n)}
                onClick={() => run("request_redeem", [addr(who), i128(st.shares)])}>Ask to withdraw</button>
              {st.pending > 0n && (
                <>
                  <button type="button" disabled={busy || !ready} style={btn(!busy && ready)}
                    onClick={() => run("redeem", [addr(who)])}>Withdraw {usdc(st.pendingValue)} USDC</button>
                  {/* NEW: the date the withdrawal becomes available. */}
                  {!ready && <p style={{ color: quiet, fontSize: 14 }}>From {day(st.requestTs + UNBOND_S)}</p>}
                </>
              )}
            </div>
          </>
        )}

        {/* NEW: while a transaction is on its way. */}
        {busy && <p style={{ color: quiet }}>Confirm in your wallet…</p>}
        {err && <p style={{ color: "#E5735C" }}>{err}</p>}
      </div>
    </main>
  );
}
