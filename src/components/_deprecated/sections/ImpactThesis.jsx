import { motion } from "framer-motion";
import { Home, Zap, Unlock } from "lucide-react";

const CARDS = [
  {
    Icon: Home,
    title: "No Land Title Required",
    desc: "Farmers without cadastral records access formal credit via GPS-verified field boundary attestation. Border your property once, receive a non-transferable on-chain land title.",
  },
  {
    Icon: Zap,
    title: "Same-Day Payment",
    desc: "Disbursements settle in under 2 hours via stablecoin directly to the farmer's mobile wallet. No correspondent banking, no float, no 30-day delays.",
  },
  {
    Icon: Unlock,
    title: "Open Infrastructure",
    desc: "All transaction data is public on Polygon. Any ERP or procurement system can subscribe via webhook. Four union MOUs signed, 10,000+ farmer capacity in Stage 2.",
  },
];

export default function ImpactThesis() {
  return (
    <section
      id="impact"
      className="px-6 py-24"
      style={{ backgroundColor: "#e2e8f0" }}
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
            Impact
          </p>
          <h2
            className="font-bold leading-tight tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", color: "#1A1A1A", letterSpacing: "-0.02em" }}
          >
            Three structural barriers removed. One infrastructure layer.
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {CARDS.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-3xl bg-white p-8 shadow-xl ring-1 transition hover:-translate-y-1"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.04)" }}
            >
              <div
                className="mb-5 inline-flex rounded-2xl p-3"
                style={{ backgroundColor: "#e2e8f0" }}
              >
                <Icon className="h-6 w-6" style={{ color: "#1e293b" }} />
              </div>
              <h3 className="mb-3 text-lg font-semibold" style={{ color: "#1e293b" }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
