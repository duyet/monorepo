/** Native Tailwind only — no custom CSS class names. */
export const twHeader = {
  wordmark:
    "text-[0.9375rem] font-medium lowercase tracking-[-0.03em] text-(--rd-text)",
  link: "inline-flex h-8 items-center rounded-full px-[0.7rem] text-[0.875rem] tracking-[-0.01em] text-(--rd-text-3) no-underline whitespace-nowrap hover:text-(--rd-text) data-[active=true]:text-(--rd-text)",
  cta: "inline-flex h-9 max-lg:hidden items-center justify-center rounded-full bg-(--rd-text) px-[1.05rem] text-[0.8125rem] font-medium tracking-[-0.01em] text-(--rd-bg) no-underline hover:opacity-90",
} as const;
