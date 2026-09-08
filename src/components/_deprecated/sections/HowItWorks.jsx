import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Verify",
    desc: "Sentinel-2 optical + SAR radar imagery confirms field boundaries and crop health via NDVI/NDMI scoring in under 120 seconds. Cloud cover is no obstacle.",
  },
  {
    n: "02",
    title: "Tokenise",
    desc: "Land boundary and harvest batch minted as non-transferable ERC-1155 tokens on Polygon L2. IPFS stores the full attestation trail.",
  },
  {
    n: "03",
    title: "Lend",
    desc: "Senior tranche funds disbursed same-day to the farmer's wallet. The local SHG union co-signs. Interest-only Year 1–2, amortising Year 3–5.",
  },
  {
    n: "04",
    title: "Settle",
    desc: "Dual-confirmation oracle + trader triggers automatic repayment split. Surplus returns to the farmer. Full audit trail on-chain, publicly verifiable.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="px-6 py-24"
      style={{ backgroundColor: "#1e293b" }}
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
            Process
          </p>
          <h2
            className="font-bold leading-tight tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", color: "#F3EFE7", letterSpacing: "-0.02em" }}
          >
            From satellite to settlement in three crop seasons.
          </h2>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-3xl p-7 backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span
                className="mb-4 block text-3xl font-bold"
                style={{ color: "#D4A017" }}
              >
                {step.n}
              </span>
              <h3 className="mb-3 text-lg font-semibold" style={{ color: "#F3EFE7" }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(243,239,231,0.65)" }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
