export default function PhotosIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 ease-out group-hover:scale-110"
    >
      {/* Camera body */}
      <rect
        x="12"
        y="20"
        width="40"
        height="32"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Lens */}
      <circle
        cx="32"
        cy="36"
        r="8"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <circle
        cx="32"
        cy="36"
        r="4"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Top viewfinder */}
      <rect
        x="24"
        y="12"
        width="16"
        height="8"
        rx="2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Flash indicator */}
      <circle cx="44" cy="26" r="1.5" fill="currentColor" />
    </svg>
  )
}
