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
      {/* Bar chart with varying heights */}
      <rect
        x="12"
        y="36"
        width="8"
        height="20"
        rx="2"
        fill="currentColor"
        opacity="0.7"
      />
      <rect
        x="24"
        y="24"
        width="8"
        height="32"
        rx="2"
        fill="currentColor"
        opacity="0.85"
      />
      <rect x="36" y="16" width="8" height="40" rx="2" fill="currentColor" />
      <rect
        x="48"
        y="28"
        width="8"
        height="28"
        rx="2"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Trend line */}
      <path
        d="M16 40L28 28L40 20L52 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <circle cx="16" cy="40" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="28" cy="28" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="40" cy="20" r="2.5" fill="currentColor" opacity="0.6" />
      <circle cx="52" cy="32" r="2.5" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
