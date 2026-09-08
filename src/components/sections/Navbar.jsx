import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar({ scrolled, onOpenUnions, hidden }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 md:px-10 ${
          scrolled
            ? "bg-primary/80 shadow-sm shadow-slate-950/60 backdrop-blur-md ring-1 ring-white/5"
            : "bg-transparent"
        }`}
        style={{
          visibility: hidden ? "hidden" : "visible",
          pointerEvents: hidden ? "none" : "auto",
        }}
      >
        <a href="#" className="flex items-center gap-2">
          <img src="/bw2.png" alt="Nila" className="h-7 w-auto" />
        </a>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#opportunity" className="text-sm text-slate-300 transition hover:text-white">About</a>
          <a href="#invest" className="text-sm text-slate-300 transition hover:text-white">Invest</a>
          <a href="#faq" className="text-sm text-slate-300 transition hover:text-white">FAQ</a>
        </div>

        <div className="hidden md:flex">
          <button
            onClick={onOpenUnions}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-accent-hover hover:-translate-y-0.5"
          >
            Meet the unions
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <button
          className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 md:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col gap-8 bg-slate-950 px-6 pt-6">
          <div className="flex items-center justify-between">
            <img src="/bw2.png" alt="Nila" className="h-7 w-auto" />
            <button
              className="rounded-xl p-2 text-slate-300 hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col gap-6 pt-4">
            {[
              { label: "About", href: "#opportunity" },
              { label: "Invest", href: "#invest" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-semibold text-slate-100 transition hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <button
            onClick={() => { setMobileOpen(false); onOpenUnions(); }}
            className="inline-flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-base font-bold text-white shadow-lg shadow-black/20 bg-primary"
          >
            Meet the unions
          </button>
        </div>
      )}
    </>
  );
}
