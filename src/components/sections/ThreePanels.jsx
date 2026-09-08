import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PANELS = [
  {
    label: "TRACK",
    headline: "Autonomous agricultural credit engine.",
    body: "Satellite-verified harvests trigger repayment automatically. Dynamic leverage adjusts to performance in real time. Every loan, crop and cashflow — live and on-chain.",
    link: "View a live portfolio",
    action: "view-portfolio",
  },
  {
    label: "CONTRIBUTE",
    headline: "Fund the unions that\nmatch your goals.",
    body: "Fund a specific SHG union directly, or deposit into a themed index: climate-resilient agriculture, post-harvest infrastructure, regenerative farming, or emerging trade corridors. Each theme targets where the operational gap is widest — and the return potential highest.",
    link: "Browse unions",
    action: "browse-unions",
  },
  {
    label: "EARN",
    stat: "5–8%",
    statSub: "target APY  ·  paid in USDt  ·  backed by crop receivables",
    body: "Displaces 24–60% informal credit. 10% first-loss reserve. 90-day cycles, 2-week minimum hold.",
    link: "View current rates",
    action: "view-rates",
  },
];

export default function ThreePanels({ onOpenUnions }) {
  return (
    <section
      id="invest"
      className="relative z-10"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div
        className="sticky top-0 px-6 pt-20 md:pb-60 min-h-screen md:h-screen w-full md:overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 0% 0%, var(--color-primary-mid) 0%, var(--color-primary) 75%)",
        }}>
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="mx-auto grid max-w-6xl min-h-96 gap-5 md:grid-cols-3">
        {PANELS.map((panel, i) => (
          <motion.div
            key={panel.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="group flex flex-col rounded-3xl p-7 transition-all duration-300 transition hover:bg-accent-hover hover:-translate-y-1.5"
            style={{
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderTopColor = "var(--color-accent)";
              e.currentTarget.style.borderTopWidth = "2px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderTopColor = "rgba(255,255,255,0.07)";
              e.currentTarget.style.borderTopWidth = "1px";
            }}
          >
            {/* Label */}
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
              {panel.label}
            </p>

            {/* Stat or headline */}
            {panel.stat ? (
              <>
                <p className="mb-1 font-bold leading-none" style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", color: "var(--color-accent)" }}>
                  {panel.stat}
                </p>
                <p className="mb-5 text-xs" style={{ color: "rgba(243,239,231,0.45)" }}>
                  {panel.statSub}
                </p>
              </>
            ) : (
              <p
                className="mb-5 font-semibold leading-snug text-text-on-dark"
                style={{ fontSize: "clamp(1.25rem, 2vw, 1.5rem)", whiteSpace: "pre-line" }}
              >
                {panel.headline}
              </p>
            )}

            {/* Body */}
            <p className="flex-1 text-sm leading-relaxed" style={{ color: "rgba(243,239,231,0.65)" }}>
              {panel.body}
            </p>

            {/* SDG icons — Contribute card only */}
            {panel.label === "CONTRIBUTE" && (
              <div className="mt-5 flex items-end gap-3" style={{ height: "64px" }}>
                {[
                  { file: "/sdg/sdg-01.jpg", title: "SDG 1 — No Poverty" },
                  { file: "/sdg/sdg-02.jpg", title: "SDG 2 — Zero Hunger" },
                  { file: "/sdg/sdg-08.jpg", title: "SDG 8 — Decent Work & Economic Growth" },
                  { file: "/sdg/sdg-10.jpg", title: "SDG 10 — Reduced Inequalities" },
                  { file: "/sdg/sdg-17.jpg", title: "SDG 17 — Partnerships for the Goals" },
                ].map((sdg) => (
                  <img
                    key={sdg.file}
                    src={sdg.file}
                    alt={sdg.title}
                    title={sdg.title}
                    className="sdg-icon"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      filter: "grayscale(100%) brightness(0.75)",
                      opacity: 0.65,
                      transition: "filter 0.25s ease, opacity 0.25s ease",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = "grayscale(0%) brightness(1)";
                      e.currentTarget.style.opacity = "1";
                      e.currentTarget.style.width = "64px";
                      e.currentTarget.style.height = "64px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = "grayscale(100%) brightness(0.75)";
                      e.currentTarget.style.opacity = "0.65";
                      e.currentTarget.style.width = "32px";
                      e.currentTarget.style.height = "32px";
                    }}
                  />
                ))}
              </div>
            )}

            {/* Link */}
            {panel.action === "browse-unions" ? (
              <button
                onClick={onOpenUnions}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition hover:gap-2.5"
                style={{ color: "var(--color-primary-light)", background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                {panel.link}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <a
                href="#"
                data-action={panel.action}
                data-phase="2"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium transition hover:gap-2.5"
                style={{ color: "var(--color-primary-light)" }}
              >
                {panel.link}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            )}
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
}
