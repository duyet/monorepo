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
      {/* Chat bubble */}
      <path
        d="M12 10C10.8954 10 10 10.8954 10 12V40C10 41.1046 10.8954 42 12 42H36L48 52V42H52C53.1046 42 54 41.1046 54 40V12C54 10.8954 53.1046 10 52 10H12Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Dots inside (representing AI thinking/typing) */}
      <circle cx="22" cy="26" r="2.5" fill="currentColor" />
      <circle cx="32" cy="26" r="2.5" fill="currentColor" />
      <circle cx="42" cy="26" r="2.5" fill="currentColor" />
    </svg>
  )
}
