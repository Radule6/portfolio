// Small icon shown in the Payload admin nav.
// Server component.

export default function Icon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="RADULE.DEV"
      role="img"
    >
      <defs>
        <linearGradient id="radule-icon-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#59FFCE" />
          <stop offset="50%" stopColor="#B7FF03" />
          <stop offset="100%" stopColor="#FFFF00" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="28" height="28" rx="7" fill="url(#radule-icon-gradient)" />
      <text
        x="50%"
        y="56%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily='Syne, system-ui, -apple-system, sans-serif'
        fontWeight="800"
        fontSize="16"
        fill="#0a0a0a"
      >
        R
      </text>
    </svg>
  )
}
