import { cn } from "@duyet/libs";
import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";

const baseClassName =
  "underline decoration-neutral-300 decoration-1 underline-offset-2 transition-colors hover:decoration-neutral-500 dark:decoration-neutral-600 dark:hover:decoration-neutral-400";

type ResumeLinkProps = LinkProps & {
  className?: string;
  children: ReactNode;
};

export function ResumeLink({
  className,
  children,
  ...props
}: ResumeLinkProps) {
  return (
    <Link
      className={cn(baseClassName, className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </Link>
  );
}
