import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FinalCTA({ onOpenModal }) {
  return (
    <section className="px-6 py-28 text-center" style={{ backgroundColor: "#1e293b" }}>
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
            Ready to invest?
          </p>
          <h2
            className="mb-6 font-bold leading-tight tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.75rem)", color: "#F3EFE7", letterSpacing: "-0.02em" }}
          >
            Request the full Information Memorandum.
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed" style={{ color: "rgba(243,239,231,0.65)" }}>
            The complete IM — including financial model, Stage 1 performance data, management team
            profiles, legal structure, and full term sheet — is available to qualified investors
            under NDA.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={onOpenModal}
              className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
              style={{ backgroundColor: "#D4A017" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#B8860B")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D4A017")}
            >
              Request Information Memorandum
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-8 text-xs" style={{ color: "rgba(243,239,231,0.35)" }}>
            carst@blockchainforcommons.com · Response within 2 business days
          </p>
        </motion.div>
      </div>
    </section>
  );
}
