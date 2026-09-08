import { motion } from "framer-motion";
import { useLandHolders } from "../../hooks/useLandHolders";

export default function MetricsBar() {
  const { data: totalSupply } = useLandHolders();

  const METRICS = [
    { value: "99%",   label: "Principal Repayment" },
    { value: "4",     label: "Crop Seasons Completed" },
    { value: totalSupply != null ? String(totalSupply) : "40", label: "Verified digital Land Titles" },
    { value: "$1.7M", label: "Target Facility Size" },
  ];

  return (
    <section className="px-6 py-20" style={{ backgroundColor: "#e2e8f0" }}>
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
        {METRICS.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col items-center text-center"
          >
            { i != 2 ?
            <span
              className="font-bold leading-none"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1e293b" }}
            >
              {m.value}
            </span>
            :
            <a
              className="font-bold underline leading-none"
              href="https://polygonscan.com/token/0x636060dbC695a8232992b28c1765828263f17251"
              target="_blank"
              style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1e293b" }}
            >
              {m.value}
            </a>
            }
            <span className="mt-2 text-sm leading-snug" style={{ color: "#6B7280" }}>
              {m.label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
