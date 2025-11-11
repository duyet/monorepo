export default function BlogIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 ease-out group-hover:scale-110"
    >
      {/* Document with extra rounded corners - Claude style */}
      <rect
        x="16"
        y="6"
        width="32"
        height="52"
        rx="8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Text lines with varying lengths and softer feel */}
      <line
        x1="24"
        y1="20"
        x2="40"
        y2="20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="28"
        x2="40"
        y2="28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="36"
        x2="34"
        y2="36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Decorative organic dot */}
      <circle cx="24" cy="44" r="1.5" fill="currentColor" />
      <circle cx="29" cy="44" r="1.5" fill="currentColor" />
      <circle cx="34" cy="44" r="1.5" fill="currentColor" />
    </svg>
  )
}
