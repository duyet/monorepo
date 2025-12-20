export default function AboutIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 ease-out group-hover:scale-110"
    >
      {/* User circle */}
      <circle
        cx="32"
        cy="32"
        r="20"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      {/* User head */}
      <circle
        cx="32"
        cy="28"
        r="6"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      {/* User body */}
      <path
        d="M20 48C20 40 24 36 32 36C40 36 44 40 44 48"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
