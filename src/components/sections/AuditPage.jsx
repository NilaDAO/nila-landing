import { useEffect, useState } from "react";

// Minimal, dependency-free markdown renderer scoped to what facts.md actually uses:
// headers, horizontal rules, pipe tables, fenced code blocks, paragraphs, ordered
// lists, bold/code/link inline spans. facts.md is the single source of truth for
// every number on this page — this component renders it, it does not restate it.

function renderInline(text, keyPrefix) {
  const nodes = [];
  let rest = text;
  let i = 0;
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/;
  while (rest.length > 0) {
    const m = rest.match(pattern);
    if (!m) {
      nodes.push(rest);
      break;
    }
    if (m.index > 0) nodes.push(rest.slice(0, m.index));
    if (m[1] !== undefined) {
      const isExternal = /^https?:\/\//.test(m[2]);
      nodes.push(
        <a
          key={`${keyPrefix}-${i++}`}
          href={m[2]}
          className="underline"
          style={{ color: "var(--color-accent)" }}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {m[1]}
        </a>
      );
    } else if (m[3] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-${i++}`} style={{ color: "var(--color-text-on-dark)" }}>{m[3]}</strong>);
    } else if (m[4] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-${i++}`}
          className="rounded px-1 py-0.5 text-[0.85em]"
          style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "var(--color-accent)" }}
        >
          {m[4]}
        </code>
      );
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return nodes;
}

function parseTable(lines, startIdx) {
  const headerCells = lines[startIdx].split("|").map((c) => c.trim()).filter((c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === ""));
  let i = startIdx + 2; // skip header + separator row
  const rows = [];
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    const cells = lines[i].split("|").map((c) => c.trim()).filter((c, idx, arr) => !(idx === 0 && c === "") && !(idx === arr.length - 1 && c === ""));
    rows.push(cells);
    i++;
  }
  return { headerCells, rows, nextIdx: i };
}

function MarkdownBody({ text }) {
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") { i++; continue; }

    if (line.startsWith("```")) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      i++; // skip closing fence
      blocks.push(
        <pre
          key={key++}
          className="my-4 overflow-x-auto rounded-lg p-4 text-xs leading-relaxed"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--color-text-soft)" }}
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (line.trim() === "---") {
      blocks.push(<hr key={key++} className="my-8" style={{ borderColor: "rgba(255,255,255,0.1)" }} />);
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(<h3 key={key++} className="mt-8 mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>{renderInline(line.slice(4), `h3-${key}`)}</h3>);
      i++; continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(<h2 key={key++} className="mt-10 mb-4 text-xl font-bold tracking-tight" style={{ color: "var(--color-text-on-dark)" }}>{renderInline(line.slice(3), `h2-${key}`)}</h2>);
      i++; continue;
    }
    if (line.startsWith("# ")) {
      i++; continue; // h1 handled separately in page header
    }

    if (line.trim().startsWith("|")) {
      const { headerCells, rows, nextIdx } = parseTable(lines, i);
      blocks.push(
        <div key={key++} className="my-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {headerCells.map((c, ci) => (
                  <th
                    key={ci}
                    className="border-b px-3 py-2 text-left font-semibold"
                    style={{ borderColor: "rgba(255,255,255,0.12)", color: "var(--color-text-on-dark)" }}
                  >
                    {renderInline(c, `th-${key}-${ci}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td
                      key={ci}
                      className="border-b px-3 py-2 align-top"
                      style={{ borderColor: "rgba(255,255,255,0.06)", color: "var(--color-text-soft)" }}
                    >
                      {renderInline(c, `td-${key}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      i = nextIdx;
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-4 list-decimal space-y-2 pl-5 text-sm leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
          {items.map((it, ii) => <li key={ii}>{renderInline(it, `ol-${key}-${ii}`)}</li>)}
        </ol>
      );
      continue;
    }

    if (line.trim().startsWith("*")) {
      i++; continue;
    }

    // paragraph — collect until blank line
    const paraLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].trim().startsWith("|") && lines[i].trim() !== "---") {
      paraLines.push(lines[i]);
      i++;
    }
    const paraText = paraLines.join(" ");
    const isItalicWhole = paraText.trim().startsWith("*") && paraText.trim().endsWith("*");
    blocks.push(
      <p
        key={key++}
        className="my-4 text-sm leading-relaxed"
        style={{ color: "var(--color-text-soft)", fontStyle: isItalicWhole ? "italic" : "normal" }}
      >
        {renderInline(isItalicWhole ? paraText.trim().slice(1, -1) : paraText, `p-${key}`)}
      </p>
    );
  }

  return <>{blocks}</>;
}

export default function AuditPage() {
  const [factsText, setFactsText] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/audit/facts.md")
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(setFactsText)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-text-on-dark)" }}>
      <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <a href="/" className="flex items-center gap-2">
          <img src="/bw2.png" alt="Nila" className="h-7 w-auto" />
        </a>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-primary-light)" }}>
          Audit
        </p>
        <h1 className="mb-6 font-bold tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
          Nila — Audit Fact Sheet
        </h1>

        <p className="mb-6 text-sm leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
          This page exists for adversarial diligence. Every quantitative claim in Nila's pitch that has a checkable
          source is listed with its evidence and verification status — nothing here is estimated or extrapolated.
          Paste{" "}
          <a href="/audit/facts.md" className="underline" style={{ color: "var(--color-accent)" }}>
            /audit/facts.md
          </a>{" "}
          into the LLM of your choice and ask it to refute our claims.
        </p>

        <div className="mb-10 flex flex-wrap gap-3">
          <a
            href="/audit/facts.md"
            className="rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:opacity-80"
            style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
          >
            Download facts.md
          </a>
          <a
            href="/audit/loan-tape.csv"
            className="rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition hover:opacity-80"
            style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)" }}
          >
            Download loan-tape.csv
          </a>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--color-text-soft)" }}>
            Could not load /audit/facts.md. It should be available directly at{" "}
            <a href="/audit/facts.md" className="underline" style={{ color: "var(--color-accent)" }}>/audit/facts.md</a>.
          </p>
        )}
        {!error && factsText === null && (
          <p className="text-sm" style={{ color: "var(--color-text-soft)" }}>Loading facts.md…</p>
        )}
        {factsText !== null && <MarkdownBody text={factsText} />}
      </div>

      <div className="px-6 py-8 border-t text-xs" style={{ borderColor: "rgba(255,255,255,0.07)", color: "var(--color-text-soft)" }}>
        <div className="mx-auto max-w-3xl flex justify-between flex-wrap gap-3">
          <span>© 2026 Nila.land BV</span>
          <span><a href="/audit/facts.md" className="underline hover:opacity-80">facts.md</a></span>
        </div>
      </div>
    </div>
  );
}
