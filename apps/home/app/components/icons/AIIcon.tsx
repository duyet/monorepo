export default function AIIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 ease-out group-hover:scale-110"
    >
      {/* Friendly rounded chat bubble - Claude style */}
      <path
        d="M14 16C14 12.6863 16.6863 10 20 10H44C47.3137 10 50 12.6863 50 16V36C50 39.3137 47.3137 42 44 42H30L18 50V42H20C16.6863 42 14 39.3137 14 36V16Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Organic dots representing AI */}
      <circle cx="24" cy="26" r="2.5" fill="currentColor" />
      <circle cx="32" cy="26" r="2.5" fill="currentColor" />
      <circle cx="40" cy="26" r="2.5" fill="currentColor" />
      {/* Sparkle accent */}
      <path
        d="M46 18L47 20L49 21L47 22L46 24L45 22L43 21L45 20L46 18Z"
        fill="currentColor"
      />
    </svg>
  )
}
