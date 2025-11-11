export default function InsightsIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 ease-out group-hover:scale-110"
    >
      {/* Organic bar chart with fully rounded tops - Claude style */}
      <rect
        x="12"
        y="36"
        width="8"
        height="20"
        rx="4"
        fill="currentColor"
        opacity="0.7"
      />
      <rect
        x="24"
        y="24"
        width="8"
        height="32"
        rx="4"
        fill="currentColor"
        opacity="0.85"
      />
      <rect x="36" y="16" width="8" height="40" rx="4" fill="currentColor" />
      <rect
        x="48"
        y="28"
        width="8"
        height="28"
        rx="4"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Smooth trend line with curve */}
      <path
        d="M16 40Q20 34 28 28Q34 22 40 20Q46 24 52 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
        fill="none"
      />
      {/* Data points */}
      <circle cx="16" cy="40" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="28" cy="28" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="40" cy="20" r="3" fill="currentColor" opacity="0.7" />
      <circle cx="52" cy="32" r="3" fill="currentColor" opacity="0.7" />
    </svg>
  )
}
