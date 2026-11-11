// X and LinkedIn in the footer's Contact column (Carst, 11 Nov). Icons drawn inline, in the footer's link colour.
const LINKS = [
  { href: "https://x.com/NilaDAO", label: "Nila on X",
    d: "M17.75 3h3.07l-6.71 7.67L22 21h-6.18l-4.84-6.33L5.44 21H2.37l7.18-8.2L2 3h6.34l4.37 5.78L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" },
  { href: "https://www.linkedin.com/company/nilaland", label: "Nila on LinkedIn",
    d: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.83v1.54h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13V21h-4v-4.99c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.92 1.3-1.92 2.64V21h-4V9.75Z" },
];

export default function Social() {
  return (
    <span style={{ display: "flex", gap: 8, marginTop: 4 }}>
      {LINKS.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label}
           style={{ width: 36, height: 36, borderRadius: 9999, background: "#1F2733", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#F1F5F9" aria-hidden="true"><path d={l.d} /></svg>
        </a>
      ))}
    </span>
  );
}
