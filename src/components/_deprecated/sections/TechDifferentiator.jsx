import { motion } from "framer-motion";
import { Check } from "lucide-react";

const TECH_COLUMNS = [
  {
    category: "Earth Observation",
    items: [
      "Sentinel-2 optical (10m → 2.5m super-res)",
      "Sentinel-1 SAR (cloud-penetrating radar)",
      "NDVI, NDMI, NBR, NDRE, EVI indices",
      "Sub-120 second field verification",
    ],
  },
  {
    category: "On-Chain Infrastructure",
    items: [
      "Polygon L2 (ERC-1155 tokens)",
      "IPFS + on-chain content hash",
      "Non-transferable land title NFTs",
      "Akash decentralised compute",
    ],
  },
  {
    category: "Settlement & Audit",
    items: [
      "Dual-confirmation oracle + trader",
      "Same-day stablecoin disbursement",
      "Automated stop-loss smart contract",
      "Public audit trail, fully verifiable",
    ],
  },
];

export default function TechDifferentiator() {
  return (
    <section className="px-6 py-24" style={{ backgroundColor: "#334155" }}>
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
            Technology
          </p>
          <h2
            className="mb-5 font-bold leading-tight tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", color: "#F3EFE7", letterSpacing: "-0.02em" }}
          >
            Verification infrastructure built for the monsoon season.
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed" style={{ color: "rgba(243,239,231,0.65)" }}>
            Our satellite + SAR stack penetrates cloud cover — critical for tropical agriculture — and
            produces a tamper-proof attestation record stored on IPFS with an on-chain content hash.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {TECH_COLUMNS.map((col, i) => (
            <motion.div
              key={col.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-3xl p-7"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest" style={{ color: "#D4A017" }}>
                {col.category}
              </h3>
              <ul className="space-y-3">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "rgba(243,239,231,0.80)" }}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: "#94a3b8" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
