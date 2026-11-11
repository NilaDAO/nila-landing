// /how data: the copy (public/how/how.json) and the live numbers from /audit/snapshot.json (prompt §1).
let howP, snapP;
export const loadHowData = () => (howP ||= fetch("/how/how.json").then((r) => (r.ok ? r.json() : null)).catch(() => null));
export const loadSnapshot = () => (snapP ||= fetch("/audit/snapshot.json").then((r) => (r.ok ? r.json() : null)).catch(() => null));

const inr = (x) => `₹${x.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Live keys (prompt §1). Each returns the share and the figure line, written from the same numbers.
export function liveNumbers(snap) {
  if (!snap?.polygon) return null;
  const p = snap.polygon;
  const loans = (p.loans || []).filter((l) => l.status !== "removed");
  const n = (st) => loans.filter((l) => l.status === st).length;
  const repaid = n("repaid"), defaulted = n("defaulted"), live = n("live");
  const dated = loans.filter((l) => l.status === "live" && Number(l._maturityTs) > 0).length;
  const notOn = dated === 0 ? " The satellite harvest date is not switched on yet." : "";
  const jr = Number(p.juniorDeposits) || 0, sr = Number(p.seniorDeposits) || 0;
  return {
    block: p.block,
    date: new Date(p.time).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    closedRepaid: repaid + defaulted ? { v: repaid / (repaid + defaulted),
      fig: `${repaid} of ${repaid + defaulted} closed. ${defaulted} ${defaulted === 1 ? "default" : "defaults"}. ${live} still running.` } : null,
    dueDateSet: live ? { v: dated / live, fig: `${dated} of ${live} carry a due date on-chain.${notOn}`,
      figSeen: `${dated} of ${live} running crop shares on Polygon carry a due date.${notOn}` } : null,
    outsideShare: jr + sr ? { v: sr / (jr + sr), fig: `${inr(sr)} of ${inr(jr + sr)} in the GroundUp Fund.` } : null,
  };
}

