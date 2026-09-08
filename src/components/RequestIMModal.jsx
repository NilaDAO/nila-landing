import { useEffect } from "react";
import { X } from "lucide-react";

export default function RequestIMModal({
  form,
  setForm,
  submitted,
  submitting,
  error,
  onSubmit,
  onClose,
}) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="pointer-events-auto w-full max-w-md rounded-3xl bg-[--color-primary] px-6 py-7 text-[--color-text-on-dark] shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[--color-primary-light]">
              Investor Access
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[--color-text-on-dark]">
              Request Information Memorandum
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="ml-4 mt-1 rounded-full p-1 transition hover:bg-white/10"
          >
            <X className="h-4 w-4 text-[--color-text-on-dark]/60" />
          </button>
        </div>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-[--color-primary-light]/40 bg-[--color-primary-light]/10 px-4 py-5 text-sm text-[--color-text-on-dark]">
            Thank you — you will receive the IM within 2 business days.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-[--color-text-on-dark]/60">
                Full Name
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Jane Smith"
                disabled={submitting}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-[--color-text-on-dark] placeholder:text-white/30 focus:border-[--color-accent] focus:outline-none focus:ring-1 focus:ring-[--color-accent] disabled:opacity-60"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-[--color-text-on-dark]/60">
                Email
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
                placeholder="you@fund.com"
                disabled={submitting}
                className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-[--color-text-on-dark] placeholder:text-white/30 focus:border-[--color-accent] focus:outline-none focus:ring-1 focus:ring-[--color-accent] disabled:opacity-60"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-[--color-accent] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[--color-accent-hover] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Request IM"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
