export default function WaveDivider({ direction = "dark-to-light" }) {
  const isDarkToLight = direction === "dark-to-light";
  return (
    <div
      className="w-full overflow-hidden leading-[0]"
      style={{ lineHeight: 0, backgroundColor: isDarkToLight ? "#1e293b" : "#e2e8f0" }}
    >
      <svg
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ display: "block", width: "100%", height: "64px" }}
      >
        {isDarkToLight ? (
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="var(--color-bg-light)"
          />
        ) : (
          <path
            d="M0,40 C360,0 1080,80 1440,40 L1440,0 L0,0 Z"
            fill="var(--color-primary)"
          />
        )}
      </svg>
    </div>
  );
}
