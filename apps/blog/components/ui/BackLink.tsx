interface BackLinkProps {
  href: string;
  text: string;
}

export function BackLink({ href, text }: BackLinkProps) {
  return (
    <a
      href={href}
      className="inline-flex cursor-pointer items-center text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)] dark:hover:text-[var(--on-dark)]"
    >
      <svg
        className="mr-2 h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      {text}
    </a>
  );
}
