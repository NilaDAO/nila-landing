export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="mb-12 text-sm" style={{ color: "var(--color-text-soft)" }}>
          Last updated: 1 February 2026 · Nila.land BV · Amsterdam, Netherlands
        </p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: "var(--color-text-soft)" }}>
          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>1. Who we are</h2>
            <p>
              Nila.land BV ("Nila", "we", "us") is incorporated in the Netherlands (KvK: [XXXXXXXX]) with its registered office at [Address], Amsterdam. We operate the website nila.land and related investor services.
            </p>
            <p className="mt-3">
              For questions about this policy, contact us at <a href="mailto:info@nila.land" className="underline" style={{ color: "var(--color-accent)" }}>info@nila.land</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>2. What data we collect</h2>
            <p>When you submit the Information Memorandum request form, we collect:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Your name or organisation name</li>
              <li>Your email address</li>
              <li>The date and time of your submission</li>
            </ul>
            <p className="mt-3">
              We do not collect payment data, passport data, or any sensitive personal data at this stage. We do not use cookies beyond what is technically necessary to serve the website.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>3. How we use your data</h2>
            <p>We use your data solely to:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Send you the requested Information Memorandum</li>
              <li>Follow up on your investor enquiry</li>
            </ul>
            <p className="mt-3">We do not sell, rent, or share your data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>4. Legal basis (GDPR)</h2>
            <p>
              We process your data on the basis of legitimate interest (Art. 6(1)(f) GDPR) — specifically, to respond to your voluntary enquiry — and, where applicable, to comply with legal obligations (Art. 6(1)(c) GDPR).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>5. Data retention</h2>
            <p>
              We retain your contact data for as long as necessary to manage your investor enquiry, and for a maximum of 5 years thereafter unless a longer retention period is required by law. You may request deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>6. Your rights</h2>
            <p>Under GDPR, you have the right to:</p>
            <ul className="mt-3 list-disc pl-5 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion ("right to be forgotten")</li>
              <li>Object to processing</li>
              <li>Lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens)</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, email <a href="mailto:info@nila.land" className="underline" style={{ color: "var(--color-accent)" }}>info@nila.land</a>.</p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold" style={{ color: "var(--color-text-on-dark)" }}>7. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The current version is always available at nila.land/privacy. Material changes will be communicated by email to active investors.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 border-t text-xs" style={{ borderColor: "rgba(255,255,255,0.07)", color: "var(--color-text-soft)" }}>
        <div className="mx-auto max-w-3xl flex justify-between flex-wrap gap-3">
          <span>© 2026 Nila.land BV</span>
          <span><a href="/terms" className="underline hover:opacity-80">Terms of Use</a></span>
        </div>
      </div>
    </div>
  );
}
