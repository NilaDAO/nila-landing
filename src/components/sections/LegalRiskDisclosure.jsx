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
          Last updated: 1 February 2026 · Nila.land BV · Amsterdam, Netherlands
        </p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>1. General investment risk</h2>
            <p>
              Investing through Nila involves lending capital to agricultural self-help group (SHG) unions in India. As with any investment, there is a risk that you may lose part or all of your principal. Past repayment performance of SHG unions — including the widely cited 95%+ repayment rate across 30 years of NABARD data — does not guarantee future results.
            </p>
            <p className="mt-3">
              This is not a bank deposit. Your capital is not protected by any deposit guarantee scheme. You should only invest amounts you can afford to lose entirely.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>2. Agricultural and crop-cycle risk</h2>
            <p>
              Loan facilities are backed by crop receivables — the projected harvest value from a union's members. Agricultural output is inherently uncertain. Droughts, floods, pest outbreaks, disease, and other climate events can reduce yields below expectations. If a harvest underperforms, the collateral value of food-token receivables may decline and repayment may be delayed or reduced.
            </p>
            <p className="mt-3">
              Crop price volatility also affects receivable values. While Nila uses verified market pricing and satellite-based crop monitoring, these tools reduce — but do not eliminate — agricultural risk.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>3. Foreign exchange risk</h2>
            <p>
              You deposit and receive returns in USDt (Tether on Polygon). Underlying loans to SHG unions are denominated and disbursed in Indian Rupees (INR). The INR/USD exchange rate fluctuates. An unfavourable movement in the exchange rate between disbursement and repayment can reduce your effective return, even if the union repays in full.
            </p>
            <p className="mt-3">
              Nila does not hedge FX exposure on your behalf. The effective yield you receive is net of any FX movement during the loan cycle.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>4. Smart contract and technology risk</h2>
            <p>
              Nila's lending infrastructure runs on Polygon (an Ethereum Layer 2 network). Smart contracts manage fund deposits, loan disbursements, collateral issuance, and repayment routing. While contracts are designed with security in mind, no smart contract is guaranteed to be free of bugs or vulnerabilities.
            </p>
            <p className="mt-3">
              Blockchain networks may experience congestion, forks, or outages. Third-party dependencies — including stablecoin issuers (Tether), RPC providers, and wallet software — introduce additional points of failure outside Nila's control.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>5. Liquidity risk</h2>
            <p>
              Facilities operate on rolling 90-day cycles with a 2-week minimum hold period. After the minimum hold, you may request withdrawal at any cycle boundary, subject to facility liquidity. If your facility is fully deployed (i.e., all capital is lent out), your withdrawal will be queued for the next repayment event.
            </p>
            <p className="mt-3">
              This is agricultural lending with real crop cycles — not a money market fund. You should expect that capital may be locked for the duration of a crop cycle (typically 3–8 months). Typical wait times are disclosed per facility before you commit.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>6. Regulatory risk</h2>
            <p>
              The regulatory environment for digital assets, stablecoins, and cross-border lending is evolving. Changes in regulation — in the Netherlands, India, or any jurisdiction relevant to your situation — may restrict, tax, or prohibit activities related to your investment.
            </p>
            <p className="mt-3">
              Nila.land BV is incorporated in the Netherlands and operates under Dutch law. It is your responsibility to ensure that participating in Nila's facilities is lawful in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>7. First-loss reserve</h2>
            <p>
              Each facility carries a dynamic first-loss reserve, funded from union surplus. The reserve starts at 10% of facility value, increases quickly upon defaults, and decreases gradually to a 0.1% floor when repayment is steady. The reserve absorbs losses before your principal is affected.
            </p>
            <p className="mt-3">
              However, the first-loss reserve is finite. In a severe default scenario — for example, a widespread crop failure affecting an entire union — the reserve may be insufficient to cover all losses. In that case, your principal would be impaired proportionally.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>8. No guarantee of returns</h2>
            <p>
              Target APY of 5–8% (paid in USDt) is an estimate based on current interest spreads between SHG union borrowing rates and informal lending rates in rural India. Actual returns may be higher or lower than the target, and may be zero or negative in adverse scenarios.
            </p>
            <p className="mt-3">
              Nila does not guarantee any specific rate of return. The yield you receive depends on union repayment performance, crop receivable values, FX movements, reserve utilisation, and facility fees.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>9. Investor suitability</h2>
            <p>
              Nila facilities are intended for qualified investors who understand the risks of agricultural lending, digital assets, and emerging-market exposure. By investing, you represent that:
            </p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>You have read and understood this risk disclosure in full</li>
              <li>You are investing with funds you can afford to lose</li>
              <li>You understand the illiquid nature of agricultural loan cycles</li>
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
      </div>

      {/* Footer */}
      <div className="px-6 py-8 border-t text-xs" style={{ borderColor: "rgba(255,255,255,0.07)", color: "var(--color-text-soft)" }}>
        <div className="mx-auto max-w-3xl flex justify-between flex-wrap gap-3">
          <span>© 2026 Nila.land BV</span>
          <div className="flex gap-4">
            <a href="/privacy" className="underline hover:opacity-80">Privacy Policy</a>
            <a href="/terms" className="underline hover:opacity-80">Terms of Use</a>
          </div>
        </div>
      </div>
    </div>
  );
}
