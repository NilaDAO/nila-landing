// Link wiring for the W1 sections. The generated sections render <A k label>; this file decides where each goes.
// k = the board's href, label = the link's visible text (or aria-label).
import { useContext } from "react";
import { W1Ctx } from "./ctx.js";
import { homeHref } from "./util.js";

// On the home page: smooth scroll. In a slide-in page (ctx.back): slide back first. Elsewhere (/audit, /how):
// go to the home page at that anchor.
const scrollTo = (id, ctx) => () => {
  const go = () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (ctx?.back) { ctx.back(); setTimeout(go, 460); return; }
  if (document.getElementById(id)) go();
  else location.assign(homeHref(`#${id}`));
};

// Targets that do not exist yet (W2 harvests, W4 how it works, FAQ answers, SCF news page).
// They render as inert links until Carst picks a target — see docs/LANDING_REDESIGN_PLAN.md.
const PENDING = new Set([
  "What does Nila offer?",
  "What is nUSD, and where does the yield come from?",
  "What is a crop plan?",
  "Who are the unions and the members?",
  "What is a voucher?",
  "What is a food token?",
  "How does a buyer lock a harvest?",
  "Where does funding go?",
  "How do I verify independently?",
]);

// Shown but switched off (dimmed, no action). Empty since "Lock in a harvest" got the Coming soon toast (Carst, 10 Nov).
const DISABLED = new Set([]);

// /how at one tab; from the home page it slides in (ctx.openHow) and reads the tab from the hash.
const howTab = (tab, ctx) => ({
  href: homeHref(`/how#${tab}`),
  onClick: ctx.openHow ? () => { history.replaceState(null, "", `${location.pathname}${location.search}#${tab}`); ctx.openHow(); } : undefined,
});

function resolve(k, label, ctx) {
  if (DISABLED.has(label)) return { href: undefined, "aria-disabled": true, pending: true, disabled: true };
  switch (label) {
    case "": return ctx.back ? { href: homeHref("/"), onClick: ctx.back } : { href: homeHref("/") }; // logo (back button in a slide-in page)
    case "nila.land": return { href: homeHref("/") };
    case "nUSD": return { href: homeHref("#nusd"), onClick: scrollTo("nusd", ctx) };
    case "How it works": return { href: homeHref("#how"), onClick: scrollTo("how", ctx) };
    case "FAQ": return { href: homeHref("#faq"), onClick: scrollTo("faq", ctx) };
    case "Meet the unions":
    case "Check access": return { href: "#unions", onClick: ctx.openUnions };
    case "open the audit":
    case "Open the audit":
    case "audit ↗":
    case "Fact sheet": return { href: homeHref("/audit") };
    case "facts.md": return { href: "/audit/facts.md", target: "_blank" };
    case "Season ledger (CSV)": return { href: "/audit/loan-tape.csv" }; // season ledger not built yet: loan tape until then
    case "Code (nila-soroban)": return { href: "https://github.com/NilaDAO/nila-soroban", target: "_blank" };
    case "Privacy Policy": return { href: "/privacy" };
    case "Terms of Use": return { href: "/terms" };
    case "Risk Disclosure": return { href: "/risk" };
    case "info@nila.land": return { href: "mailto:info@nila.land" };
    case "Lock in a harvest":
    case "Harvests": return { href: "#harvests", onClick: ctx.comingSoon }; // W2 not built: chip bottom right
    case "Build with Nila": return { href: "#build", onClick: ctx.comingSoon }; // no other services use Nila tokens yet (Carst, 10 Nov)
    case "Impact Members, repayments, and what we can’t measure yet.": return howTab("impact", ctx);   // W4 tabs (Carst, 10 Nov)
    case "Technical Chains, signatures, AI and satellite.": return howTab("technical", ctx);
    case "Climate Soil, seasons and land that recovers.": return howTab("climate", ctx);
    case "View a live field": return { href: "#live", onClick: ctx.comingSoon }; // W4: no public live field view yet
    case "Read more": return { href: "https://communityfund.stellar.org/project/nila-fwc", target: "_blank" }; // SCF project page (Carst, 10 Nov)
    case "Menu": return { href: "#menu", onClick: ctx.toggleMenu };
    case "Close": return { href: "#close", onClick: ctx.closeNews };
    default:
      if (!PENDING.has(label) && import.meta.env.DEV) console.warn("[w1] unwired link", k, label);
      return { href: undefined, "aria-disabled": true, pending: true };
  }
}

export function A({ k, label, children, style, ...rest }) {
  const ctx = useContext(W1Ctx);
  const { onClick, pending, disabled, ...t } = resolve(k, label, ctx);
  const handle = (e) => {
    if (onClick || pending) e.preventDefault();
    onClick?.();
  };
  const rel = t.target === "_blank" ? "noopener noreferrer" : undefined;
  return (
    <a {...rest} {...t} rel={rel} onClick={handle} style={disabled ? { ...style, opacity: 0.4, cursor: "not-allowed" } : pending ? { ...style, cursor: "default" } : style}
       data-pending={pending ? "" : undefined}>
      {children}
    </a>
  );
}

// Inline SVG artwork from the board (kept as files in ../art, loaded with ?raw). display: contents keeps the board layout.
export function Art({ svg }) {
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
