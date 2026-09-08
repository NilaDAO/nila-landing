import { useState } from "react";
import { motion } from "framer-motion";
import Accordion from "../accordion";

const FAQ_ITEMS = [
  {
    title: "What does Nila actually do?",
    content:
      "Nila connects global stablecoin capital to Indian farmer self-help group (SHG) unions. We don't hold funds and we don't decide who borrows — the union does that. Nila provides the traceability, collateral structure and automated settlement so that a remote investor can fund a Tamil Nadu rice harvest with the same confidence they'd fund a structured note. Invest directly into a union, or through a themed custody index targeting climate-resilient agriculture, post-harvest infrastructure or regenerative farming.",
  },
  {
    title: "How does my capital reach farmers?",
    content:
      "You deposit USDt (EURc and ARC coming soon) into a facility tied to a specific SHG union. The union's elected leaders allocate loans to member groups using their own internal credit scoring. Funds convert to INR at disbursement. Harvest activity is detected remotely through satellite imagery — combining optical vegetation indices (NDVI) with radar (VV/VH polarisation) that works regardless of cloud cover. When harvest is confirmed, repayment is triggered automatically within three to five weeks — principal plus coupon routed back to your wallet in USDt. The full flow is traceable end to end.",
  },
  {
    title: "What makes this an autonomous risk engine?",
    content:
      "We combine two types of satellite data: optical imagery (NDVI) to track crop maturity, and synthetic aperture radar (VV/VH polarisation) to confirm harvest activity on the ground. Radar works through cloud cover, which matters during monsoon season. Once our system detects that a harvest has occurred, the repayment clock starts automatically — no self-reporting, no field visits, no delays. If repayment is late, the leverage ratio tightens on its own. If performance is strong, it expands. The entire cycle — monitoring, triggering, enforcing, adjusting — runs without manual intervention. That's what allows us to scale across thousands of unions.",
  },
  {
    title: "Why SHGs and not banks or MFIs?",
    content:
      "SHGs have 95%+ repayment rates across 30 years of data (NABARD). They outperform every formal lending channel in rural India. The reason is structural: members know each other, live in the same village, and collectively guarantee each other's loans. Banks can't replicate that local knowledge; microfinance institutions charge too much to. The only thing SHGs lack is access to enough capital — which is exactly the gap Nila fills.",
  },
  {
    title: "What are food tokens?",
    content:
      "Food tokens represent verified crop receivables — the projected harvest value from a union's members. As crop growth is confirmed through field and satellite data, tokens are issued as collateral against the loan facility. They give you asset-backed exposure tied to real produce with real market pricing. If a harvest underperforms, collateral values adjust and the first-loss reserve activates before your principal is affected.",
  },
  {
    title: "How is my investment protected?",
    content:
      "Three layers. First, a dynamic first-loss reserve funded by SHG members themselves — every union contributes capital that absorbs losses before your principal is touched. New unions start at 1:1 leverage; as repayment history builds, that ratio can reach 10× for top performers. If a repayment is delayed beyond the harvest window the ratio tightens automatically — no manual intervention, no costly recovery process. The system self-corrects. Second, food-token receivables back each facility with verified crop assets. Third, SHG members collectively hold registered land titles that underpin the union's creditworthiness.",
  },
  {
    title: "What returns should I expect?",
    content:
      "Target APY is 5-8%, paid in USDc or USDt. The yield comes from the interest spread: SHG unions are very slowly building credit history, independent from formal lenders or MFIs. Nila leverages the growing creditworthiness of SHGs to capture part of that displacement spread. Returns are FX-dependent (Automated FX hedge piloted) since underlying loans are in INR.",
  },
  {
    title: "Can I withdraw early?",
    content:
      "Facilities run on rolling 90-day cycles with a 2-week minimum hold. After that you can request withdrawal at any cycle boundary, subject to facility liquidity. If fully deployed, your withdrawal queues for the next repayment event. This is agricultural lending with real crop cycles, not a money market — typical wait times are disclosed per facility before you commit.",
  },
  {
    title: "How do I verify independently?",
    content:
      "Every transaction — deposit, disbursement, repayment, collateral issuance — is recorded on-chain and visible through a block explorer. Your dashboard links directly to transaction records. Crop verification data is timestamped and archived. Union repayment histories are published quarterly. The system is designed so you never need to trust Nila — only the data.",
  },
];

export default function InvestorFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const handleItemClick = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="px-6 py-24"
      style={{ backgroundColor: "var(--color-bg-light)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-16 md:flex-row md:gap-24">

          {/* LEFT — heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="md:w-1/3 md:pt-2"
          >
            <h1
              className="font-bold text-xs leading-tight tracking-tight"
              style={{ color: "var(--color-primary-light)", letterSpacing: "-0.03em" }}
            >
              FAQ
            </h1>
          </motion.div>

          {/* RIGHT — accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="md:w-2/3"
          >
            <Accordion
              items={FAQ_ITEMS}
              openIndex={openIndex}
              handleItemClick={handleItemClick}
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
