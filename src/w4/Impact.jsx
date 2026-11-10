// /how — Impact tab: what an impact funder asks, answered from the chain where we can and marked "Not yet" where
// we cannot (docs/W4_frame.md §1). Figures are read from /audit/snapshot.json, the same file as the audit page.
import { useEffect, useState } from "react";
import { Section, Figures, Rows } from "./ui.jsx";

function useSnapshot() {
  const [s, setS] = useState(null);
  useEffect(() => {
    fetch("/audit/snapshot.json").then((r) => (r.ok ? r.json() : null)).then(setS).catch(() => {});
  }, []);
  return s;
}

const ROWS = [
  { title: "Who she is", s: "open",
    body: "One member of Mother Theresa Union in Sankuraparam, in her own words and with her consent. We have not recorded it yet." },
  { title: "Members", s: "self", body: "About 2,000 members in 3 unions in Tamil Nadu. The count comes from the unions’ own books." },
  { title: "Women", s: "self", body: "About 90% of the members are women. Also from the unions, not from the chain." },
  { title: "What a crop share costs her", s: "open",
    body: "The rate of every share is on-chain. We have not yet set it next to what she paid a moneylender or microfinance lender before, with a source for that rate." },
  { title: "What changed for her", s: "open",
    body: "Not measured. The first full year plans run in 2026–27; after that season we publish her yield and income next to the season before." },
];

export default function Impact({ mobile }) {
  const snap = useSnapshot();
  const loans = snap?.polygon?.loans?.filter((l) => l.status !== "removed") || [];
  const count = (st) => loans.filter((l) => l.status === st).length;
  const repaid = count("repaid");
  const closed = loans.filter((l) => l.status !== "live").length;
  const wallets = new Set(loans.map((l) => l._borrower)).size;
  const date = snap ? new Date(snap.polygon.time).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  const v = (x) => (snap ? x : "—");

  return (
    <Section mobile={mobile} eyebrow="Impact" title="What we can show, and what we can’t yet."
             intro="The figures are read from Polygon mainnet by the same script as the audit page. Where we have no figure, the row says so.">
      <Figures mobile={mobile}
        items={[
          { value: v(`${repaid} of ${closed}`), label: "closed crop shares repaid in full" },
          { value: v(String(count("defaulted"))), label: "defaults" },
          { value: v(String(count("live"))), label: "crop shares still running" },
          { value: v(String(snap?.polygon?.landTitles ?? "—")), label: "land titles" },
        ]}
        note={snap && <>Read at Polygon block {snap.polygon.block.toLocaleString("en-US")}, {date}. {wallets} wallets have taken a crop share; a wallet is
          not a person, so we do not turn that into a head count. <a href="/audit" style={{ color: "#F1F5F9", textDecoration: "underline" }}>Open the audit</a></>} />
      <Rows mobile={mobile} rows={ROWS} />
    </Section>
  );
}
