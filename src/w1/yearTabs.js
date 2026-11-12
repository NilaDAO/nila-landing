// "A year with Nila" (DYear / MYear): the board opens a step on hover, which touch screens do not have, and the
// mobile accordion only opens the step marked `.on`. A tap (or click, or Enter/Space) moves `.on` to that step, so the
// step opens on phones and stays open on desktop. Generated markup is left as it is; this only wires the behaviour.
export function wireYearTabs(root = document) {
  const accs = [...root.querySelectorAll(".nl-acc")];
  const offs = accs.map((acc) => {
    const tabs = [...acc.querySelectorAll(".nl-tab")];
    tabs.forEach((t) => { t.setAttribute("role", "button"); t.tabIndex = 0; t.setAttribute("aria-expanded", String(t.classList.contains("on"))); });
    const pick = (t) => tabs.forEach((x) => { const on = x === t; x.classList.toggle("on", on); x.setAttribute("aria-expanded", String(on)); });
    const onClick = (e) => { const t = e.target.closest(".nl-tab"); if (t && acc.contains(t)) pick(t); };
    const onKey = (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.classList?.contains("nl-tab")) { e.preventDefault(); pick(e.target); } };
    acc.addEventListener("click", onClick);
    acc.addEventListener("keydown", onKey);
    return () => { acc.removeEventListener("click", onClick); acc.removeEventListener("keydown", onKey); };
  });
  return () => offs.forEach((f) => f());
}
