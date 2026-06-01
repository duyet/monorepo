export function NowDeco() {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className="pointer-events-none absolute -right-5 -top-[30px] h-[180px] w-[180px] opacity-45"
    >
      <circle
        cx="160"
        cy="40"
        r="70"
        fill="none"
        stroke="var(--rd-border)"
        strokeWidth="1"
      />
      <circle
        cx="160"
        cy="40"
        r="46"
        fill="none"
        stroke="var(--rd-border)"
        strokeWidth="1"
      />
      <circle
        cx="160"
        cy="40"
        r="22"
        fill="none"
        stroke="var(--rd-accent)"
        strokeWidth="1.4"
        strokeDasharray="3 5"
        className="rd-flow"
      />
      <circle cx="160" cy="40" r="5" fill="var(--rd-accent)" className="rd-hd-pulse" />
    </svg>
  );
}
