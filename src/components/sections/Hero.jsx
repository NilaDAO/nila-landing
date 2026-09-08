import { motion } from "framer-motion";
import { ArrowRight, Italic } from "lucide-react";

export default function Hero({ onOpenModal }) {
  return (
    <section
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 pt-48 pb-64"
      style={{
        background: "radial-gradient(ellipse at 80% 0%, var(--color-primary-mid) 0%, var(--color-primary) 75%)",
      }}
    >
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-light/30 bg-primary-light/10 px-4 py-1.5"
        >
          <span className="h-2 w-2 rounded-full bg-primary-light animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-light">
            Live · Tamil Nadu, India
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 font-bold leading-tight tracking-tight text-text-on-dark"
          style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", letterSpacing: "-0.03em" }}
        >
          Agricultural Finance,{" "}
          <br /><span className="text-accent">On-Chain.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-on-dark/75 md:text-lg"
        >
          Nila.land leverages Indian village self-help groups (SHGs) on Digital asset rails. SHGs are India's most successful agri-lenders*.
          Reach farmers <strong>directly</strong> with rules-based remotely tracked funds; first-loss protected or fully backed by RWAs. Earn {" "}
          <strong className="text-accent">5–8% </strong>
          on your stablecoins with industry-leading interest rates.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button
            onClick={onOpenModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-accent-hover hover:-translate-y-0.5"
          >
            Request Information Memorandum
          </button>
        </motion.div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 text-xs text-text-on-dark/40"
        >
          <strong>* Based on rate charged and access.</strong> Source: CEDA Ashoka; NSSO 77th Round AIDIS; RBI Financial Inclusion Reports.
        </motion.p>
      </div>
    </section>
  );
}
