// /how — Impact tab (Carst, 10 Nov): the four things a financed season changes for her — food, income, pride,
// independence — each with the proof we have today and, where we have none, a plain "not yet".
// Figures are read from /audit/snapshot.json, the same file as the audit page.
import { useEffect, useState } from "react";
import { Section, Figures } from "./ui.jsx";

const MUTED = "#94A3B8";
const DOT = { have: "#D4CF5A", not: "#E69283" };

function useSnapshot() {
  const [s, setS] = useState(null);
  useEffect(() => {
    fetch("/audit/snapshot.json").then((r) => (r.ok ? r.json() : null)).then(setS).catch(() => {});
  }, []);
  return s;
}

function Card({ n, title, body, proof }) {
  return (
    <div style={{ background: "#121212", border: "1px solid #1C1F26", borderRadius: 24, boxShadow: "var(--nl-shadow-card)", padding: "22px",
                  display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", color: MUTED }}>{n}</span>
      <h3 style={{ margin: 0, fontSize: 24, fontWeight: 700, lineHeight: 1.25 }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: MUTED }}>{body}</p>
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #1F2733", display: "flex", flexDirection: "column", gap: 6 }}>
        {proof.map(([k, text]) => (
          <span key={text} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: 13, lineHeight: 1.5, color: "#CBD5E1" }}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: DOT[k], flexShrink: 0, transform: "translateY(-1px)" }} />{text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Impact({ mobile }) {
  const snap = useSnapshot();
  const loans = snap?.polygon?.loans?.filter((l) => l.status !== "removed") || [];
  const count = (st) => loans.filter((l) => l.status === st).length;
  const repaid = count("repaid");
  const closed = loans.filter((l) => l.status !== "live").length;
  const wallets = new Set(loans.map((l) => l._borrower)).size;
  const date = snap ? new Date(snap.polygon.time).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
  const v = (x) => (snap ? x : "—");

  const cards = [
    { n: "01", title: "Food that would not have been grown",
      body: "Without seed money on the sowing date, a field is sown late, ratooned or left. Her crop share arrives inside the sowing window of the crop it pays for.",
      proof: [["have", "The harvest her plan expects is on-chain, one food token per crop."],
              ["not", "What she actually harvested: published per season from 2026–27."]] },
    { n: "02", title: "An income she can live on",
      body: "The plan chooses crops and inputs for what the season should earn. The harvest pays the share back; the rest is hers.",
      proof: [["have", v(`${repaid} of ${closed} closed crop shares repaid in full.`)],
              ["not", "Her income before and after: not measured yet."]] },
    { n: "03", title: "Pride",
      body: "The land title is in her name, on her own account. The plan is hers to change, and her choice stands. She does not ask a moneylender for seed.",
      proof: [["have", "Titles and plans are hers on-chain, not the union’s or Nila’s."],
              ["not", "In her own words: not recorded yet."]] },
    { n: "04", title: "No debt that never ends",
      body: "A crop share is paid back from the harvest it was planned for, principal and interest together. Paying only the interest to keep it open is not allowed.",
      proof: [["have", v(`${count("defaulted")} defaults on ${loans.length} crop shares.`)],
              ["not", "Due dates from the satellite harvest date: in the code, not switched on yet."]] },
  ];

  return (
    <Section mobile={mobile} eyebrow="Impact" title="Food, income, pride, independence."
             intro="What a planned and financed season changes for her. Each card says what we can already show and what we cannot yet.">
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: mobile ? 12 : 16 }}>
        {cards.map((c) => <Card key={c.n} {...c} />)}
      </div>
      <Figures mobile={mobile}
        items={[
          { value: v(`${repaid} of ${closed}`), label: "closed crop shares repaid in full" },
          { value: v(String(count("defaulted"))), label: "defaults" },
          { value: v(String(count("live"))), label: "crop shares still running" },
          { value: v(String(snap?.polygon?.landTitles ?? "—")), label: "land titles" },
        ]}
        note={snap && <>Read at Polygon block {snap.polygon.block.toLocaleString("en-US")}, {date}. {wallets} wallets have taken a crop share; a wallet is not
          a person, so we do not turn that into a head count. About 2,000 members in 3 unions, about 90% women: the unions’ own figures.{" "}
          <a href="/audit" style={{ color: "#F1F5F9", textDecoration: "underline" }}>Open the audit</a></>} />
    </Section>
  );
}
