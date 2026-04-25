// Large brand mark used on the Payload login screen.
// Server component — no hooks, no events.

const GRADIENT_ID = "radule-logo-gradient"

export default function Logo() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.05em",
        fontFamily:
          'Syne, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        fontWeight: 800,
        fontSize: "2.25rem",
        letterSpacing: "-0.02em",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      <span style={{ color: "var(--theme-elevation-1000, #f0f0f0)" }}>RADULE</span>
      <span
        style={{
          background:
            "linear-gradient(to right, #59FFCE, #B7FF03, #FFFF00)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        }}
      >
        .DEV
      </span>
      {/* SVG kept as a hidden gradient definition source so light/dark modes work consistently */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#59FFCE" />
            <stop offset="50%" stopColor="#B7FF03" />
            <stop offset="100%" stopColor="#FFFF00" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
