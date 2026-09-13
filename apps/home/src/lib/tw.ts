export const tw = {
  page: "bg-[var(--rd-bg)] text-[var(--rd-text)]",
  wrap: "mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)]",
  display:
    "font-[family-name:var(--font-display)] font-normal tracking-[-0.035em] leading-[0.95] text-[clamp(2.35rem,6.4vw,4.15rem)] text-[var(--rd-text)] text-balance",
  title:
    "font-sans text-[clamp(1.08rem,1.7vw,1.28rem)] font-medium tracking-[-0.02em] leading-[1.35] text-[var(--rd-text-2)] text-pretty",
  lead: "mt-[clamp(1.1rem,2vw,1.5rem)] max-w-[58ch] text-[clamp(0.98rem,1.25vw,1.0625rem)] leading-[1.65] text-[var(--rd-text-2)]",
  story:
    "mt-[clamp(1.1rem,2vw,1.5rem)] grid max-w-[62ch] gap-[0.85rem] text-[clamp(0.98rem,1.25vw,1.0625rem)] leading-[1.65] text-[var(--rd-text-2)]",
  link: "inline-flex items-center gap-1 text-[0.875rem] text-[var(--rd-text-2)] no-underline hover:text-[var(--rd-text)]",
  btn: "inline-flex items-center justify-center rounded-full px-4 py-2 text-[0.8125rem] font-medium tracking-[-0.01em] no-underline",
  btnPrimary:
    "inline-flex items-center justify-center rounded-full bg-[var(--rd-text)] px-4 py-2 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--rd-bg)] no-underline hover:opacity-90",
  btnGhost:
    "inline-flex items-center justify-center rounded-full border border-[var(--rd-border)] bg-transparent px-4 py-2 text-[0.8125rem] font-medium tracking-[-0.01em] text-[var(--rd-text)] no-underline hover:bg-[var(--rd-surface-2)]",
  ulink:
    "text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]",
  label:
    "inline-flex items-center rounded-full px-2 py-0.5 text-[0.68rem] font-medium tracking-[0.04em]",
  labelPlum:
    "bg-[var(--rd-label-plum)] text-[var(--rd-label-plum-fg)]",
  labelPine:
    "bg-[var(--rd-label-pine)] text-[var(--rd-label-pine-fg)]",
  labelSlate:
    "bg-[var(--rd-label-slate)] text-[var(--rd-label-slate-fg)]",
  secHead: "mb-6 flex flex-wrap items-end justify-between gap-3",
  secTitle:
    "m-0 font-[family-name:var(--font-display)] text-[clamp(1.45rem,2.4vw,1.75rem)] font-normal tracking-[-0.03em] leading-[1.1] text-[var(--rd-text)]",
  eyebrow:
    "m-0 mb-1 text-[0.7rem] font-medium tracking-[0.08em] text-[var(--rd-text-3)] uppercase",
  displayBase:
    "font-[family-name:var(--font-display)] font-normal tracking-[-0.025em] leading-[1.05]",
  leadBare: "text-[1.05rem] leading-[1.65] text-[var(--rd-text-2)]",
  card: "rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)]",
  time: "font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--rd-text-3)]",
} as const;
