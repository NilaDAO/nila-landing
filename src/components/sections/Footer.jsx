const NAV_LINKS = [
  { label: "About", href: "#opportunity" },
  { label: "Invest", href: "#invest" },
  { label: "FAQ", href: "#faq" },
];

export default function Footer() {
  return (
    <footer className="px-6 pb-8 pt-16" style={{ backgroundColor: "#0f172a" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 border-b pb-12 sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {/* Col 1: Brand */}
          <div>

            <a href="#" className="flex items-center gap-2">
              <img src="/bw2.png" alt="Nila" className="mb-4 h-8 w-auto" />
            </a>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(243,239,231,0.5)" }}>
              Agricultural Finance, On-Chain. Connecting global capital to smallholder farmers in India via satellite-verified on-chain collateral.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(243,239,231,0.35)" }}>
              Platform
            </p>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm transition"
                    style={{ color: "rgba(243,239,231,0.6)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F3EFE7")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(243,239,231,0.6)")}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(243,239,231,0.35)" }}>
              Legal
            </p>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Use", href: "/terms" },
                { label: "Risk Disclosure", href: "/risk" },
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm"
                    style={{ color: "rgba(243,239,231,0.6)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#F3EFE7")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(243,239,231,0.6)")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(243,239,231,0.35)" }}>
              Contact
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@nila.land"
                  className="text-sm"
                  style={{ color: "rgba(243,239,231,0.6)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F3EFE7")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(243,239,231,0.6)")}
                >
                  info@nila.land
                </a>
              </li>
              <li>
                <a
                  href="https://nila.land"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm"
                  style={{ color: "rgba(243,239,231,0.6)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F3EFE7")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(243,239,231,0.6)")}
                >
                  nila.land
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-xs sm:flex-row" style={{ color: "rgba(243,239,231,0.3)" }}>
          <span>© 2026 Nila.land BV · All rights reserved · Netherlands Chamber of Commerce</span>
          <span>Not a public offering. For qualified investors only.</span>
        </div>
      </div>
    </footer>
  );
}
