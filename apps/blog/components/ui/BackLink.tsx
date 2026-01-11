import Link from "next/link";

interface BackLinkProps {
  href: string;
  text: string;
}

export function BackLink({ href, text }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
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
    </Link>
  );
}
