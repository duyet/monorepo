import { cn } from "@duyet/libs";
import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";

import { externalLinkClassName } from "./link-styles";

type ResumeLinkProps = LinkProps & {
  className?: string;
  children: ReactNode;
  external?: boolean;
};

export function ResumeLink({
  className,
  children,
  external = false,
  ...props
}: ResumeLinkProps) {
  const externalProps = external
    ? {
        target: "_blank" as const,
        rel: "noopener noreferrer" as const,
      }
    : {};

  return (
    <Link
      className={cn(externalLinkClassName, className)}
      {...externalProps}
      {...props}
    >
      {children}
    </Link>
  );
}
