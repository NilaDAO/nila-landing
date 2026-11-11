export default function RiskDisclosure() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-primary)", color: "var(--color-text-on-dark)" }}>
      {/* Minimal nav */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
        <a href="/" className="flex items-center gap-2">
          <img src="/bw2.png" alt="Nila" className="h-7 w-auto" />
        </a>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-primary-light)" }}>
          Legal
        </p>
        <h1 className="mb-2 font-bold tracking-tight" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
          Risk Disclosure
        </h1>
        <p className="mb-12 text-sm" style={{ color: "var(--color-text-soft)" }}>
          Last updated: 11 November 2026 · Blockchainforcommons · Amsterdam, Netherlands
        </p>

        <RiskBody />
      </div>

      {/* Footer */}
      <div className="px-6 py-8 border-t text-xs" style={{ borderColor: "rgba(255,255,255,0.07)", color: "var(--color-text-soft)" }}>
        <div className="mx-auto max-w-3xl flex justify-between flex-wrap gap-3">
          <span>© 2026 Blockchainforcommons</span>
          <div className="flex gap-4">
            <a href="/privacy" className="underline hover:opacity-80">Privacy Policy</a>
            <a href="/terms" className="underline hover:opacity-80">Terms of Use</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Policy text only; the old page above and the W1 page (src/w1/Legal.jsx) both render it.
export function RiskBody() {
  return (
        <div className="space-y-10 text-sm leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>1. General investment risk</h2>
            <p>
              Investing through Nila means financing crop advances: seasonal advances to members of farmer unions in Tamil Nadu, India, paid back from the harvest they finance. As with any investment, you may lose part or all of your principal. Past repayment of Nila’s crop advances (on-chain at nila.land/audit) does not guarantee future results.
            </p>
            <p className="mt-3">
              This is not a bank deposit. Your capital is not protected by any deposit guarantee scheme. You should only invest amounts you can afford to lose entirely.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>2. Agricultural and crop-cycle risk</h2>
            <p>
              A crop advance is paid back from the harvest of the crop it finances. Agricultural output is uncertain: droughts, floods, pests, disease and other climate events can reduce yields below the plan. If a harvest fails or underperforms, repayment may be delayed, reduced or not happen.
            </p>
            <p className="mt-3">
              Crop prices also move. Nila uses satellite monitoring of every financed field and a crop calendar per crop; these reduce agricultural risk but do not remove it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>3. Foreign exchange risk</h2>
            <p>
              You deposit and are paid in USDC on the Stellar network. Crop advances are lent and repaid in Indian rupees (INR), and the interest is earned in rupees and paid to you in USDC at the exchange rate of the day it is paid. The INR/USD rate moves; an unfavourable movement can reduce your effective return, even if every crop advance is repaid in full.
            </p>
            <p className="mt-3">
              Nila does not hedge exchange-rate exposure on your behalf.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>4. Smart contract and technology risk</h2>
            <p>
              Nila runs on smart contracts on the Stellar network (senior deposits, crop advances, vouchers, repayment). Crop advances made before November 2026 run on Polygon until they are repaid. The contracts are published at nila.land/audit, but no smart contract is guaranteed to be free of bugs or vulnerabilities.
            </p>
            <p className="mt-3">
              Blockchain networks may experience congestion or outages. Third parties, including the stablecoin issuer (Circle, for USDC), network infrastructure providers and wallet software, are further points of failure outside Nila’s control.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>5. Liquidity risk</h2>
            <p>
              You may ask for your principal back at any time. It is paid in USDC at par after a 14-day unbonding period, less your part of any loss from crop advances that were not repaid.
            </p>
            <p className="mt-3">
              This is agricultural finance with real crop cycles, not a money market fund. A crop advance runs until the harvest it finances (typically 3 to 8 months), and interest owed to you is paid once the union has exchanged the rupees for USDC.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>6. Regulatory risk</h2>
            <p>
              The regulatory environment for digital assets, stablecoins, and cross-border lending is evolving. Changes in regulation — in the Netherlands, India, or any jurisdiction relevant to your situation — may restrict, tax, or prohibit activities related to your investment.
            </p>
            <p className="mt-3">
              Blockchainforcommons is registered in the Netherlands and operates under Dutch law. It is your responsibility to ensure that participating in Nila is lawful in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>7. Who takes losses first</h2>
            <p>
              Members’ own savings in the union’s fund take losses before senior money. When a crop advance is repaid, machine owners are paid first, then senior money, then the members’ own savings (interest and principal). The union also keeps a rainy-day fund from its interest fees.
            </p>
            <p className="mt-3">
              This protection is finite. In a severe case, for example a crop failure across a whole union, the members’ savings and the rainy-day fund may not cover the loss, and your principal would be reduced in proportion.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>8. No guarantee of returns</h2>
            <p>
              nUSD targets 3–5% a year, paid in USDC. It is a target, not a promise. Your USDC guarantees the vouchers in farmers’ year plans, and your return is the interest on those vouchers, earned in rupees and paid in USDC when the union exchanges them. A farmer pays at most about 1 paise per rupee a month on a crop advance. Actual returns may be higher or lower than the target, and may be zero or negative in adverse scenarios.
            </p>
            <p className="mt-3">
              Nila does not guarantee any rate of return. What you receive depends on how crop advances are repaid, the INR/USD rate and the union’s fees.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>9. Investor suitability</h2>
            <p>
              nUSD is intended for qualified investors who understand the risks of agricultural finance, digital assets, and emerging-market exposure. By investing, you represent that:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>You have read and understood this risk disclosure in full</li>
              <li>You are investing with funds you can afford to lose</li>
              <li>You understand that crop advances run until their harvest</li>
              <li>You are solely responsible for your own tax obligations related to any returns</li>
              <li>You are not a resident of a jurisdiction where this investment is prohibited</li>
            </ul>
            <p className="mt-3">
              If you are unsure whether this investment is suitable for you, seek independent financial advice before proceeding.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>10. Contact</h2>
            <p>
              For questions about this disclosure or Nila's risk framework, contact us at{" "}
              <a href="mailto:info@nila.land" className="underline" style={{ color: "var(--color-accent)" }}>info@nila.land</a>.
            </p>
          </section>
        </div>
  );
}
