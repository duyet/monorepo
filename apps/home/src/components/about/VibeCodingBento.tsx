import { Flame } from "lucide-react";

function VibeCodingBento() {
  return (
    <div className="rd-card rd-vibe-lead mt-3 p-[clamp(24px,3vw,34px)]">
      <div className="rd-vibe-badge">
        <Flame size={12} />
        <a
          href="https://blog.duyet.net/2026/01/coding-agent/"
          className="no-underline text-inherit hover:text-[var(--rd-accent)] transition-colors"
        >
          Deep in vibe-coding mode
        </a>
      </div>
      <p className="mt-5 max-w-[40ch] text-[clamp(0.95rem,1.3vw,1.08rem)] leading-[1.6] text-[var(--rd-text-2)]">
        Most code here ships with coding agents; I steer.
      </p>
      <p className="mt-4 font-[var(--font-mono)] text-[var(--rd-text-3)] text-[13px]">
        Python · Rust · TypeScript
      </p>
    </div>
  );
}

export { VibeCodingBento };
