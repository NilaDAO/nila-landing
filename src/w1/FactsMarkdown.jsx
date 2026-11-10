// facts.md → W1-styled blocks. Same subset as the old AuditPage renderer (headers, rules, pipe tables, fenced code,
// numbered lists, paragraphs, bold/code/link spans); facts.md stays the single source of every number on /audit.

const T = {
  text: "var(--nl-text)", muted: "var(--nl-text-muted)", accent: "var(--nl-accent)",
  raised: "var(--nl-surface-raised)", line: "#1F2733", ink: "var(--nl-surface-ink)",
};
import { slug } from "./util.js";

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";


function inline(text, kp) {
  const out = [];
  let rest = text;
  let i = 0;
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/;
  while (rest) {
    const m = rest.match(re);
    if (!m) { out.push(rest); break; }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const k = `${kp}-${i++}`;
    if (m[1] !== undefined) {
      const ext = /^https?:\/\//.test(m[2]);
      out.push(<a key={k} href={m[2]} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined}
                  style={{ color: T.text, textDecoration: "underline", textDecorationColor: "#4B5563", textUnderlineOffset: 3,
                          ...(/^`.*`$/.test(m[1]) ? { fontFamily: MONO, fontSize: "0.86em", overflowWrap: "anywhere" } : {}) }}>{m[1].replace(/^`(.*)`$/, "$1")}</a>);
    } else if (m[3] !== undefined) {
      out.push(<strong key={k} style={{ color: T.text, fontWeight: 700 }}>{m[3]}</strong>);
    } else {
      out.push(<code key={k} style={{ fontFamily: MONO, fontSize: "0.86em", padding: "1px 6px", borderRadius: 6, background: T.raised, color: T.text, overflowWrap: "anywhere" }}>{m[4]}</code>);
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

const cells = (line) => line.split("|").map((c) => c.trim()).filter((c, i, a) => !(i === 0 && c === "") && !(i === a.length - 1 && c === ""));

export default function FactsMarkdown({ text, mobile }) {
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  let key = 0;
  const P = { margin: "0 0 16px", fontSize: mobile ? 15 : 16, lineHeight: 1.6, color: T.muted };

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (t === "") { i++; continue; }

    if (line.startsWith("```")) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      out.push(<pre key={key++} style={{ margin: "0 0 20px", padding: 18, borderRadius: 16, background: T.ink, border: `1px solid ${T.line}`,
                                          overflowX: "auto", fontFamily: MONO, fontSize: 12, lineHeight: 1.6, color: T.muted }}><code>{code.join("\n")}</code></pre>);
      continue;
    }
    if (t === "---") { i++; continue; } // sections already carry their own divider
    if (line.startsWith("# ")) { i++; continue; } // page title is in the header

    if (line.startsWith("## ")) {
      const h = line.slice(3);
      out.push(<h2 key={key++} id={slug(h)} style={{ margin: out.length ? "56px 0 20px" : "0 0 20px", paddingTop: out.length ? 32 : 0,
                                                      borderTop: out.length ? `1px solid ${T.line}` : "none", scrollMarginTop: 24,
                                                      fontSize: mobile ? 24 : 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.01em", color: T.text }}>{inline(h, `h2${key}`)}</h2>);
      i++; continue;
    }
    if (line.startsWith("### ")) {
      out.push(<h3 key={key++} style={{ margin: "32px 0 12px", fontSize: 12, fontWeight: 700, lineHeight: 1.5, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted }}>
        {inline(line.slice(4), `h3${key}`)}</h3>);
      i++; continue;
    }

    if (t.startsWith("|")) {
      const head = cells(lines[i]);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      out.push(
        <div key={key++} style={{ margin: "0 0 24px", borderRadius: 16, background: T.ink, border: `1px solid ${T.line}`, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, lineHeight: 1.5 }}>
            <thead><tr>{head.map((c, ci) => (
              <th key={ci} style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                                     color: T.muted, borderBottom: `1px solid ${T.line}`, whiteSpace: "nowrap" }}>{inline(c, `th${key}${ci}`)}</th>))}</tr></thead>
            <tbody>{rows.map((r, ri) => (
              <tr key={ri}>{r.map((c, ci) => (
                <td key={ci} style={{ padding: "10px 14px", verticalAlign: "top", color: ci === 0 ? T.text : T.muted,
                                       borderBottom: ri === rows.length - 1 ? "none" : `1px solid ${T.line}` }}>{inline(c, `td${key}${ri}${ci}`)}</td>))}</tr>))}
            </tbody>
          </table>
        </div>);
      continue;
    }

    if (/^\d+\.\s/.test(t)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^\d+\.\s/, ""));
      out.push(
        <ol key={key++} style={{ margin: "0 0 20px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((it, ii) => (
            <li key={ii} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 12, background: T.ink, border: `1px solid ${T.line}`,
                                   fontSize: 14, lineHeight: 1.55, color: T.muted }}>
              <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 9999, background: T.raised, color: T.text, fontSize: 11, fontWeight: 700,
                             display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{ii + 1}</span>
              <span>{inline(it, `ol${key}${ii}`)}</span>
            </li>))}
        </ol>);
      continue;
    }

    if (t.startsWith("*") && !t.startsWith("**")) {
      // whole-line italic note
      const note = t.replace(/^\*|\*$/g, "");
      out.push(<p key={key++} style={{ ...P, fontSize: 13, fontStyle: "italic" }}>{inline(note, `n${key}`)}</p>);
      i++; continue;
    }

    const para = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].trim().startsWith("|")
           && lines[i].trim() !== "---" && !lines[i].startsWith("```")) para.push(lines[i++]);
    out.push(<p key={key++} style={P}>{inline(para.join(" "), `p${key}`)}</p>);
  }
  return <>{out}</>;
}
