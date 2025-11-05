export default function HomelabIcon() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 ease-out group-hover:scale-110"
    >
      {/* Server rack - 3 servers */}
      {/* Top server */}
      <rect
        x="14"
        y="14"
        width="36"
        height="10"
        rx="2"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="20" cy="19" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="25" cy="19" r="1.5" fill="currentColor" opacity="0.3" />
      <rect x="32" y="17" width="14" height="4" rx="1" fill="currentColor" opacity="0.3" />

      {/* Middle server */}
      <rect
        x="14"
        y="27"
        width="36"
        height="10"
        rx="2"
        fill="currentColor"
      />
      <circle cx="20" cy="32" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="25" cy="32" r="1.5" fill="currentColor" opacity="0.3" />
      <rect x="32" y="30" width="14" height="4" rx="1" fill="currentColor" opacity="0.3" />

      {/* Bottom server */}
      <rect
        x="14"
        y="40"
        width="36"
        height="10"
        rx="2"
        fill="currentColor"
        opacity="0.7"
      />
      <circle cx="20" cy="45" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="25" cy="45" r="1.5" fill="currentColor" opacity="0.3" />
      <rect x="32" y="43" width="14" height="4" rx="1" fill="currentColor" opacity="0.3" />

      {/* Activity indicators (blinking lights) */}
      <circle cx="20" cy="19" r="1.5" fill="#22c55e" opacity="0.8" />
      <circle cx="20" cy="32" r="1.5" fill="#22c55e" opacity="0.8" />
      <circle cx="20" cy="45" r="1.5" fill="#ef4444" opacity="0.8" />
    </svg>
  )
}
