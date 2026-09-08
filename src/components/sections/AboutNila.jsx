import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const TOKENS = [
  {
    crop: "Paddy",
    image: "/paddy.png",
    weight: "380 kg",
    id: "#TN-0041",
    accent: "#bbaf91",
    label: "The gap",
    paragraph:
      "India has close to a million farming self-help groups — 83% of them women-only, with leading repayment rates of 95%+. But most dont want to be formally registered, so access to capital is hard. The result: a $74 billion annual credit gap in India (33%), over $170 billion across South and Southeast Asia — filled by moneylenders at 24–60% a year.",
  },
  {
    crop: "Sugarcane",
    image: "/sugarcane.png",
    weight: "610 kg",
    id: "#TN-0042",
    accent: "#91905b",
    paragraph: null,
  },
  {
    crop: "Groundnut",
    image: "/groundnuts.png",
    weight: "210 kg",
    id: "#TN-0043",
    accent: "#91905b",
    label: "The mechanism",
    paragraph:
          "Nila opens these groups to global capital through rules-based lending with full traceability — without requiring SHGs to first clear decades of institutional paperwork. Every loan, disbursement and repayment is logged and auditable in real time. Not paperwork-formal — transparant and verifiable.",
   },
  {
    crop: "Millet",
    image: "/millets.png",
    weight: "290 kg",
    id: "#TN-0044",
    accent: "#6b7a43",
    paragraph: null, // visual weight only
  },
  {
    crop: "Paddy",
    image: "/paddy.png",
    weight: "420 kg",
    id: "#TN-0045",
    accent: "#bbaf91",
    label: "The safeguards",
    paragraph:  // 5th card adds visual weight to the stack, no new paragraph
      "Every facility carries a dynamic first-loss reserve - based on last seasons defaults - from membership contributions. Food-token receivables back each loan with verified crop harvests. Registered land titles held by SHG members underpin the union's collective credit. Farmers replace 36% informal debt. You earn 5–8% APY in USDt (FX-hedge piloted).",
  },
  {
    crop: "Cassava",
    image: "/cassave.png",
    weight: "1020 kg",
    id: "#TN-0046",
    accent: "#8d8b86",
    paragraph: null, // 5th card adds visual weight to the stack, no new paragraph
  },
];

const N = TOKENS.length;
const CARD_W = 176;
const CARD_H = 240;
const CARD_GAP = 24;
const BELT_STEP = CARD_W + CARD_GAP;

const STACK_X = 24;
const STACK_Y = 80;         // stack sits here (higher up)
const BELT_Y = STACK_Y + 80; // belt is lower — cards "hop up" when they land
const STACK_OFFSET = 8;     // depth offset per stacked card

// How many scroll phases: N card phases + 1 for the "all stacked / loan reveal" phase
const TOTAL_PHASES = N + 1;

const CARD_BG = "#1e293b";       /* slate-800 */
const CARD_BORDER = "rgba(255,255,255,0.10)";

function CardFace({ token }) {
  return (
    <div
      style={{
        width: `${CARD_W}px`,
        borderRadius: "20px",
        backgroundColor: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: "0 8px 28px rgba(0,0,0,0.60)",
        overflow: "hidden",
      }}
    >
      <div style={{ height: "5px", backgroundColor: token.accent }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 0", height: "88px" }}>
        {token.image
          ? <img src={token.image} alt={token.crop} style={{ width: "64px", height: "64px", objectFit: "contain" }} />
          : <span style={{ fontSize: "44px", lineHeight: 1 }}>🌾</span>
        }
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "10px 14px 14px" }}>
        <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--color-text-on-dark)" }}>
          {token.crop}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
          <span style={{ fontSize: "11px", color: "rgba(243,239,231,0.45)" }}>{token.weight}</span>
          <span style={{
            fontSize: "9px", fontFamily: "monospace", fontWeight: 700,
            padding: "2px 6px", borderRadius: "999px",
            backgroundColor: `${token.accent}28`, color: token.accent,
            border: `1px solid ${token.accent}55`,
          }}>{token.id}</span>
        </div>
      </div>
    </div>
  );
}

function BeltCard({ token, index, scrollYProgress }) {
  const stackX = STACK_X;
  const stackY = STACK_Y + index * STACK_OFFSET;
  const beltStartX = STACK_X + index * BELT_STEP;

  // Each card lands in its phase window: [index/N, (index + 0.18)/N] of the card phases.
  // Card phases occupy [0, N/TOTAL_PHASES] of total scroll.
  const cardPhaseEnd = N / TOTAL_PHASES;
  const landStart = (index / N) * cardPhaseEnd;
  const landEnd = landStart + (0.18 / N) * cardPhaseEnd;

  // After all cards land, the whole right panel shifts down in the final phase.
  // We translate the entire right panel via the parent, so individual cards don't need to move.
  const x = useTransform(
    scrollYProgress,
    index === 0 ? [0, 1] : [0, landEnd, 1],
    index === 0 ? [stackX, stackX] : [beltStartX, stackX, stackX]
  );

  // Cards hop up: travel from BELT_Y → stackY as they land
  const y = useTransform(
    scrollYProgress,
    index === 0 ? [0, 1] : [0, landStart, landEnd, 1],
    index === 0 ? [stackY, stackY] : [BELT_Y, BELT_Y, stackY, stackY]
  );

  return (
    <motion.div
      style={{
        x,
        y,
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: index + 1,
      }}
    >
      <CardFace token={token} />
    </motion.div>
  );
}

// One paragraph visible at a time — crossfade + small slide as scroll advances.
function Paragraph({ token, index, scrollYProgress, transitions }) {
  const FADE = 0.035;
  const prevT = index === 0 ? null : transitions[index - 1];
  const nextT = index < transitions.length ? transitions[index] : null;

  // Build opacity + y keyframes based on which transitions apply.
  let times, oVals, yVals;
  if (prevT === null && nextT === null) {
    times = [0, 1]; oVals = [1, 1]; yVals = [0, 0];
  } else if (prevT === null) {
    const outS = nextT - FADE / 2;
    const outE = nextT + FADE / 2;
    times = [0, outS, outE, 1];
    oVals = [1, 1, 0, 0];
    yVals = [0, 0, -10, -10];
  } else if (nextT === null) {
    const inS = prevT - FADE / 2;
    const inE = prevT + FADE / 2;
    times = [0, inS, inE, 1];
    oVals = [0, 0, 1, 1];
    yVals = [14, 14, 0, 0];
  } else {
    const inS = prevT - FADE / 2;
    const inE = prevT + FADE / 2;
    const outS = nextT - FADE / 2;
    const outE = nextT + FADE / 2;
    times = [0, inS, inE, outS, outE, 1];
    oVals = [0, 0, 1, 1, 0, 0];
    yVals = [14, 14, 0, 0, -10, -10];
  }

  const opacity = useTransform(scrollYProgress, times, oVals);
  const y = useTransform(scrollYProgress, times, yVals);

  return (
    <motion.div
      style={{
        opacity,
        y,
        willChange: "opacity, transform",
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
      }}
      className="absolute inset-0 flex flex-col rounded-3xl p-7"
    >
      <p
        className="mb-4 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--color-accent)" }}
      >
        {token.label}
      </p>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "rgba(243,239,231,0.75)" }}
      >
        {token.paragraph}
      </p>
    </motion.div>
  );
}

// The collateral → loan panel that slides up after all cards are stacked
function LoanReveal({ scrollYProgress }) {
  // This phase occupies [N/TOTAL_PHASES, 1] of scroll
  const phaseStart = N / TOTAL_PHASES;
  const phaseReveal = phaseStart + 0.1;

  // Right panel slides down slightly to reveal the loan section
  const rightPanelY = useTransform(
    scrollYProgress,
    [phaseStart, phaseReveal, 1],
    [0, 30, 30]
  );

  // Loan section fades and slides up
  const loanOpacity = useTransform(
    scrollYProgress,
    [phaseStart, phaseReveal],
    [0, 1]
  );
  const loanY = useTransform(
    scrollYProgress,
    [phaseStart, phaseReveal],
    [30, 0]
  );

  return { rightPanelY, loanOpacity, loanY };
}

const textTokens = TOKENS.filter(t => t.paragraph !== null);

// Scroll positions at which the visible paragraph swaps. Aligned with the
// landings of the 2nd and 3rd text-carrying cards (TOKENS indices 2 and 4).
const PARAGRAPH_TRANSITIONS = [
  (2 / N) * (N / TOTAL_PHASES),
  (4 / N) * (N / TOTAL_PHASES),
];

export default function AboutNila() {
  const sectionRef = useRef(null);
  const scaleWrapperRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Compute CSS scale so the fixed-width card panel fits on small screens
  useEffect(() => {
    const PANEL_W = 480;
    const update = () => {
      const el = scaleWrapperRef.current;
      if (!el) return;
      const available = el.parentElement?.offsetWidth ?? window.innerWidth;
      const scale = Math.min(1, available / PANEL_W);
      el.style.transform = `scale(${scale})`;
      // Shrink the wrapper's layout height so it doesn't leave a gap
      el.style.height = `${520 * scale}px`;
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { rightPanelY, loanOpacity, loanY } = LoanReveal({ scrollYProgress });

  return (
    <div
      id="opportunity"
      ref={sectionRef}
      style={{ position: 'relative', height: `${TOTAL_PHASES * 100}vh`, backgroundColor: "var(--color-primary)" }}
    >
      <div
        className="sticky top-0 h-screen w-full overflow-hidden px-6"
        style={{
          background: "radial-gradient(ellipse at 0% 80%, var(--color-primary-mid) 0%, var(--color-primary) 75%)",
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
        <div className="mx-auto flex h-full max-w-6xl flex-col items-start justify-center md:flex-row md:items-center">

          {/* TOP on mobile / LEFT on desktop — paragraphs (one at a time, crossfade) */}
          <div className="w-full md:w-[45%] md:pr-12 pb-4 md:pb-0">
            <div className="relative min-h-[18rem] md:min-h-[520px]">
              {textTokens.map((token, i) => (
                <Paragraph
                  key={token.id}
                  token={token}
                  index={i}
                  scrollYProgress={scrollYProgress}
                  transitions={PARAGRAPH_TRANSITIONS}
                />
              ))}
            </div>
          </div>

          {/* BOTTOM on mobile / RIGHT on desktop — belt + stack + loan reveal.
              On mobile we scale the whole panel down so the absolute-positioned cards
              and loan reveal (which assume ~520px height) fit without any layout math. */}
          <motion.div
            style={{ y: rightPanelY }}
            className="w-full md:w-[55%] relative overflow-visible md:overflow-hidden"
          >
            {/* Scale wrapper: shrinks content to fit on small screens, full size on md+ */}
            <div
              ref={scaleWrapperRef}
              className="origin-top-left"
              style={{
                height: "520px",
                width: "100%",
              }}
            >
              {/* Inner fixed-width container so card positions are stable */}
              <div className="relative md:h-screen" style={{ minWidth: "480px" }}>

            {/* Belt surface line — sits below BELT_Y cards */}
            <div style={{
              position: "absolute",
              left: 24, right: 0,
              top: `${BELT_Y + CARD_H - 12}px`,
              height: "2px",
              background: "linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.18) 70%, rgba(255,255,255,0.02) 100%)",
            }} />

            {/* Cards */}
            {TOKENS.map((token, i) => (
              <BeltCard key={token.id} token={token} index={i} scrollYProgress={scrollYProgress} />
            ))}

            {/* Divider + loan section — appears after all cards stacked */}
            <motion.div
              style={{
                opacity: loanOpacity,
                y: loanY,
                position: "absolute",
                left: 24,
                top: `${STACK_Y + CARD_H + N * STACK_OFFSET}px`,
                right: 0,
              }}
            >
              {/* Divider line */}
              <div style={{
                height: "1px",
                background: "linear-gradient(90deg, rgba(212,160,23,0.6) 0%, rgba(212,160,23,0.15) 80%, transparent 100%)",
                marginBottom: "28px",
              }} />

              {/* Collateral → Loan label */}
              <p style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(212,160,23,0.7)",
                marginBottom: "16px",
              }}>
                Crop tokens → diversified collateral
              </p>

              {/* Dollar coin visual */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                {/* Stack icon (simplified) */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: "48px", height: "8px", borderRadius: "4px",
                      backgroundColor: i === 0 ? "#D4A017" : "rgba(212,160,23,0.35)",
                      border: "1px solid rgba(212,160,23,0.5)",
                    }} />
                  ))}
                  <p style={{ margin: "6px 0 0", fontSize: "12px", color: "rgba(243,239,231,0.45)", textAlign: "center" }}>
                    Food tokens
                  </p>
                </div>

                {/* Arrow */}
                <div style={{ fontSize: "18px", color: "rgba(243,239,231,0.3)" }}>→</div>

                {/* Loan coin */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "50%",
                    backgroundColor: "rgba(212,160,23,0.12)",
                    border: "2px solid rgba(212,160,23,0.55)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "28px",
                    boxShadow: "0 0 24px rgba(212,160,23,0.2)",
                  }}>
                    💵
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "rgba(243,239,231,0.45)", textAlign: "center" }}>
                    Loan disbursed
                  </p>
                </div>

                {/* Arrow */}
                <div style={{ fontSize: "18px", color: "rgba(243,239,231,0.3)" }}>→</div>

                {/* Yield coin */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: "64px", height: "64px", borderRadius: "50%",
                    backgroundColor: "rgba(82,183,136,0.12)",
                    border: "2px solid rgba(82,183,136,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "28px",
                    boxShadow: "0 0 24px rgba(82,183,136,0.15)",
                  }}>
                    📈
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "rgba(243,239,231,0.45)", textAlign: "center" }}>
                    5–8% APY
                  </p>
                </div>
              </div>
            </motion.div>

              </div>{/* end inner fixed-width container */}
            </div>{/* end scale wrapper */}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
