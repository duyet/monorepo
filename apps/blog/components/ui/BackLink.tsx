interface BackLinkProps {
  href: string;
  text: string;
}

export function BackLink({ href, text }: BackLinkProps) {
  return (
    <a
      href={href}
      className="inline-flex cursor-pointer items-center text-sm font-medium text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 transition-colors hover:text-[#1a1a1a] dark:hover:text-[#f8f8f2]"
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
