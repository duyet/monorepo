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
      {/* Document outline */}
      <rect
        x="18"
        y="8"
        width="28"
        height="48"
        rx="3"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Profile circle */}
      <circle
        cx="32"
        cy="20"
        r="5"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Shoulders/body */}
      <path
        d="M24 34C24 30.6863 27 28 32 28C37 28 40 30.6863 40 34"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Info lines */}
      <line
        x1="24"
        y1="42"
        x2="40"
        y2="42"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="48"
        x2="36"
        y2="48"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
