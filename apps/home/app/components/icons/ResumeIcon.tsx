export default function ResumeIcon() {
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
        x="18"
        y="8"
        width="28"
        height="48"
        rx="8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Profile circle - softer */}
      <circle
        cx="32"
        cy="22"
        r="6"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Shoulders/body with organic curve */}
      <path
        d="M23 36C23 32 27 30 32 30C37 30 41 32 41 36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Info lines with varying thickness */}
      <line
        x1="24"
        y1="44"
        x2="40"
        y2="44"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="50"
        x2="36"
        y2="50"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
