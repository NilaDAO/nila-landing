// Small helpers shared by the W1 pages (home, audit).
import { useEffect, useState } from "react";

// Below this width the 390 board is used; the desktop board is fluid (max-width 1152) above it.
const MOBILE_QUERY = "(max-width: 899px)";

export function useIsMobile() {
  const [m, setM] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

// Same-site link that keeps the dev-only ?w1 preview flag.
export const homeHref = (path) => {
  const [p, hash = ""] = path.startsWith("#") ? ["/", path.slice(1)] : path.split("#");
  return (p || "/") + (import.meta.env.DEV ? location.search : "") + (hash ? `#${hash}` : "");
};

// "Coming soon" chip, bottom right, for pages not built yet; hides after 2.5 s.
export function useComingSoon() {
  const [soon, setSoon] = useState(0);
  useEffect(() => {
    if (!soon) return undefined;
    const t = setTimeout(() => setSoon(0), 2500);
    return () => clearTimeout(t);
  }, [soon]);
  return [soon > 0, () => setSoon(Date.now())];
}


// facts.md section anchors (FactsMarkdown sets the ids, the audit page lists them).
export const slug = (s) => s.toLowerCase().replace(/[`*]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function headings(text) {
  return text.split("\n").filter((l) => l.startsWith("## ")).map((l) => ({ id: slug(l.slice(3)), title: l.slice(3).replace(/[`*]/g, "") }));
}
