// Nav for the W1 sub-pages (/audit, /how): the home hero's nav without the hero.
import { A } from "./links.jsx";

const LOGO = "/w1/4b8278e23536dd27822ad11d5527514f.png";
const navLink = { fontSize: 14, color: "#94A3B8", padding: "8px 12px" };
const raisedBtn = { height: 44, borderRadius: 12, fontSize: 14, fontWeight: 700, padding: "0 20px", display: "inline-flex", alignItems: "center",
                    justifyContent: "center", gap: 8, boxSizing: "border-box", whiteSpace: "nowrap", color: "#F1F5F9", background: "#1F2733" };

export default function PageNav({ mobile }) {
  return (
    <nav style={{ position: "relative", zIndex: 5, height: mobile ? 72 : 84, padding: mobile ? "0 16px" : "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <A k="" label=""><img src={LOGO} alt="nila" style={{ width: mobile ? 32 : 36, height: mobile ? 32 : 36, display: "block" }} /></A>
      {mobile ? (
        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <A k="" label="Meet the unions" style={{ ...raisedBtn, padding: "0 16px" }}>Meet the unions</A>
          <A k="" label="Menu" aria-label="Menu" style={{ width: 40, height: 40, borderRadius: 9999, background: "#1F2733", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </A>
        </span>
      ) : (
        <>
          <div style={{ display: "flex", gap: 20 }}>
            {["nUSD", "Harvests", "How it works", "FAQ"].map((l) => <A key={l} k="" label={l} style={navLink}>{l}</A>)}
          </div>
          <A k="" label="Meet the unions" style={raisedBtn}>
            Meet the unions
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </A>
        </>
      )}
    </nav>
  );
}

