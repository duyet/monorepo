import { cn } from "@duyet/libs"
import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

import { externalLinkClassName } from "./link-styles"

type ResumeLinkProps = {
  href: string
  className?: string
  children: ReactNode
  external?: boolean
}

export function ResumeLink({
  className,
  children,
  external = false,
  href,
  ...props
}: ResumeLinkProps) {
  const externalProps = external
    ? {
        target: "_blank" as const,
        rel: "noopener noreferrer" as const,
      }
    : {}

  return (
    <Link
      to={href}
      className={cn(externalLinkClassName, className)}
      {...externalProps}
      {...props}
    >
      {children}
    </Link>
  )
}
