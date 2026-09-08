export default function TermsOfUse() {
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
          Terms of Use
        </h1>
        <p className="mb-12 text-sm" style={{ color: "var(--color-text-soft)" }}>
          Last updated: 1 February 2026 · Nila.land BV · Amsterdam, Netherlands
        </p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>1. Acceptance of terms</h2>
            <p>
              By accessing the website nila.land (the "Site"), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Site. These terms apply to all visitors, users, and others who access or use the Site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>2. About Nila</h2>
            <p>
              Nila.land BV ("Nila", "we", "us") is a company incorporated in the Netherlands (KvK: [XXXXXXXX]) with its registered office at [Address], Amsterdam. We operate the website nila.land and related investor services providing agricultural finance infrastructure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>3. Not financial advice</h2>
            <p>
              Nothing on the Site constitutes financial, investment, legal, or tax advice. The information presented is for informational purposes only. Investment in financial instruments carries risk, including loss of principal. Past performance does not guarantee future results.
            </p>
            <p className="mt-3">
              The Site is directed exclusively at qualified investors as defined under applicable law. It does not constitute a public offering of securities in any jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>4. Eligibility</h2>
            <p>
              Access to certain sections of the Site and to the Information Memorandum is restricted to qualified or professional investors. By requesting the Information Memorandum, you represent and warrant that you meet the applicable investor qualification criteria in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>5. Intellectual property</h2>
            <p>
              All content on the Site — including text, graphics, logos, images, and software — is the property of Nila.land BV or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>6. Prohibited uses</h2>
            <p>You agree not to:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Use the Site for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the Site or its related systems</li>
              <li>Transmit any unsolicited commercial communications</li>
              <li>Impersonate any person or entity</li>
              <li>Engage in any conduct that restricts or inhibits anyone's use of the Site</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>7. Disclaimers and limitation of liability</h2>
            <p>
              The Site is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. To the fullest extent permitted by law, Nila.land BV shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>8. Third-party links</h2>
            <p>
              The Site may contain links to third-party websites. These links are provided for convenience only. Nila.land BV has no control over, and assumes no responsibility for, the content or practices of any third-party sites.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>9. Governing law</h2>
            <p>
              These Terms of Use are governed by and construed in accordance with the laws of the Netherlands. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Amsterdam.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>10. Changes to these terms</h2>
            <p>
              We may revise these Terms of Use at any time. The current version is always available at nila.land/terms. Continued use of the Site after any changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>11. Contact</h2>
            <p>
              For questions about these terms, contact us at{" "}
              <a href="mailto:info@nila.land" className="underline" style={{ color: "var(--color-accent)" }}>
                info@nila.land
              </a>.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 border-t text-xs" style={{ borderColor: "rgba(255,255,255,0.07)", color: "var(--color-text-soft)" }}>
        <div className="mx-auto max-w-3xl flex justify-between flex-wrap gap-3">
          <span>© 2026 Nila.land BV</span>
          <span><a href="/privacy" className="underline hover:opacity-80">Privacy Policy</a></span>
        </div>
      </div>
    </div>
  );
}
