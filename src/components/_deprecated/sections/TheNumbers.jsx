import { motion } from "framer-motion";

const COLUMNS = [
  {
    title: "Facility Structure",
    rows: [
      { label: "Total Size", value: "€1.5M" },
      { label: "Tranches", value: "Senior / Junior" },
      { label: "Min. Ticket", value: "€25,000" },
      { label: "Currency", value: "EURT stablecoin" },
      { label: "Tenor", value: "5 years" },
      { label: "First Close", value: "Q2 2026" },
    ],
  },
  {
    title: "Returns",
    rows: [
      { label: "Target Yield (Senior)", value: "5.5–8% p.a." },
      { label: "Target Yield (Junior)", value: "18–24% p.a." },
      { label: "INR Lending Rate", value: "12–16% p.a." },
      { label: "Year 1–2", value: "Interest-only" },
      { label: "Year 3–5", value: "Amortising" },
      { label: "FX Exposure", value: "Hedged (2% reserve)" },
    ],
  },
  {
    title: "Security Package",
    rows: [
      { label: "Receivables", value: "Assigned to BV" },
      { label: "Share Pledge", value: "Yes" },
      { label: "First-Loss Reserve", value: "10%" },
      { label: "On-Chain Escrow", value: "Smart contract" },
      { label: "Stop-Loss", value: "Automated oracle" },
      { label: "Audit Trail", value: "Public (Polygon)" },
    ],
  },
];

export default function TheNumbers() {
  return (
    <section className="px-6 py-24" style={{ backgroundColor: "#1e293b" }}>
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
            The Investment Case
          </p>
          <h2
            className="font-bold leading-tight tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", color: "#F3EFE7", letterSpacing: "-0.02em" }}
          >
            The numbers.
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {COLUMNS.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-3xl p-7"
              style={{
                backgroundColor: "rgba(45,106,79,0.45)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
              }}
            >
              <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest" style={{ color: "#D4A017" }}>
                {col.title}
              </h3>
              <div className="space-y-4">
                {col.rows.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 border-b pb-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <span className="text-sm" style={{ color: "rgba(243,239,231,0.55)" }}>
                      {row.label}
                    </span>
                    <span className="text-right text-sm font-semibold" style={{ color: "#F3EFE7" }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 text-center text-xs"
          style={{ color: "rgba(243,239,231,0.35)" }}
        >
          Subject to final due diligence and credit committee approval.
        </motion.p>
      </div>
    </section>
  );
}
