import { motion } from "framer-motion";

const TIMELINE = [
  {
    season: "Season 1",
    period: "Kharif 2023",
    crop: "Paddy",
    repayment: "100%",
    farmers: 12,
  },
  {
    season: "Season 2",
    period: "Rabi 2023–24",
    crop: "Paddy + Wheat",
    repayment: "100%",
    farmers: 27,
  },
  {
    season: "Season 3",
    period: "Kharif 2024",
    crop: "Paddy + Millets",
    repayment: "100%",
    farmers: 40,
  },
];

const CREDENTIALS = [
  "Dutch BV legal entity (Netherlands Chamber of Commerce)",
  "Field office, Tamil Nadu — operational since 2023",
  "Open-source smart contracts (GitHub, audited)",
  "4 SHG union MOUs signed",
  "Indian legal counsel engaged",
  "PMFBY crop insurance integration pipeline",
];

export default function TrustTrackRecord() {
  return (
    <section className="px-6 py-24" style={{ backgroundColor: "#f1f5f9" }}>
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
            Track Record
          </p>
          <h2
            className="font-bold leading-tight tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", color: "#1A1A1A", letterSpacing: "-0.02em" }}
          >
            100% repayment. Three seasons. Zero defaults.
          </h2>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative pl-8">
              {/* Vertical line */}
              <div
                className="absolute left-2.5 top-2 h-[calc(100%-2rem)] w-0.5 rounded-full"
                style={{ backgroundColor: "#94a3b8", opacity: 0.3 }}
              />

              <div className="space-y-10">
                {TIMELINE.map((item, i) => (
                  <div key={item.season} className="relative">
                    {/* Dot */}
                    <div
                      className="absolute -left-[1.375rem] top-1 h-3 w-3 rounded-full ring-2"
                      style={{ backgroundColor: "#D4A017", ringColor: "#f1f5f9" }}
                    />
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                      {item.season} · {item.period}
                    </p>
                    <h3 className="mt-1 text-base font-semibold" style={{ color: "#1A1A1A" }}>
                      {item.crop}
                    </h3>
                    <div className="mt-2 flex gap-6 text-sm" style={{ color: "#6B7280" }}>
                      <span>
                        Repayment: <strong style={{ color: "#1e293b" }}>{item.repayment}</strong>
                      </span>
                      <span>
                        Farmers: <strong style={{ color: "#1e293b" }}>{item.farmers}</strong>
                      </span>
                    </div>
                  </div>
                ))}

                {/* Stage 2 upcoming */}
                <div className="relative opacity-50">
                  <div
                    className="absolute -left-[1.375rem] top-1 h-3 w-3 rounded-full ring-2 ring-[#f1f5f9]"
                    style={{ backgroundColor: "#6B7280" }}
                  />
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6B7280" }}>
                    Stage 2 · 2025–26
                  </p>
                  <h3 className="mt-1 text-base font-semibold" style={{ color: "#6B7280" }}>
                    Scale to 10,000+ farmers
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Credentials */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl bg-white p-8 shadow-xl"
            style={{ border: "1px solid rgba(0,0,0,0.04)" }}
          >
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-widest" style={{ color: "#1e293b" }}>
              Credentials
            </h3>
            <ul className="space-y-4">
              {CREDENTIALS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: "#1A1A1A" }}>
                  <span className="mt-0.5 shrink-0 text-lg leading-none" style={{ color: "#94a3b8" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
