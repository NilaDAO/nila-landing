// "Coming soon" chip, bottom right, for pages not built yet (state: useComingSoon in util.js).
export default function ComingSoonChip({ on }) {
  if (!on) return null;
  return (
    <div role="status" aria-live="polite"
         style={{ position: "fixed", right: 16, bottom: 16, zIndex: 60, display: "inline-flex", alignItems: "center", height: 32,
                  padding: "0 14px", borderRadius: 9999, background: "var(--nl-surface-raised)", border: "1px solid #2A3442",
                  boxShadow: "var(--nl-shadow-card)", fontSize: 12, fontWeight: 700, color: "var(--nl-text)" }}>
      Coming soon
    </div>
  );
}
