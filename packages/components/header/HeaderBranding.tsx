"use client";

import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";

interface HeaderBrandingProps {
  /** URL for the home link */
  homeUrl: string;
  /** Short text shown on small screens */
  shortText?: string;
  /** Long text shown on larger screens */
  longText?: string;
  /** Show logo (DuyetMark) */
  logo?: boolean;
  /** Center layout mode */
  center?: boolean;
  /** Optional CSS classes forwarded to the Link element */
  className?: string;
}

/**
 * DuyetMark: abstract 2x2 grid logo.
 */
function DuyetMark() {
  return (
    <span
      className="grid h-5 w-5 grid-cols-2 gap-0.5"
      aria-hidden="true"
    >
      <span className="bg-[#141413] dark:bg-[#f8f8f2]" />
      <span className="translate-y-1 bg-[#141413] dark:bg-[#f8f8f2]" />
      <span className="-translate-y-1 bg-[#141413] dark:bg-[#f8f8f2]" />
      <span className="bg-[#141413] dark:bg-[#f8f8f2]" />
    </span>
  );
}

/**
 * Logo + text link section of the Header.
 */
export function HeaderBranding({
  homeUrl,
  shortText,
  longText,
  logo = true,
  center,
  className,
}: HeaderBrandingProps) {
  const displayText = longText ?? shortText ?? "Duyet Le";

  const inner = (
    <>
      {logo && <DuyetMark />}
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          center && "md:text-4xl md:mt-5",
          className
        )}
      >
        {displayText}
      </span>
    </>
  );

  const linkClassName = cn(
    "flex items-center gap-3 whitespace-nowrap",
  );

  if (homeUrl.startsWith("http")) {
    return (
      <a href={homeUrl} className={linkClassName}>
        {inner}
      </a>
    );
  }

  return (
    <Link to={homeUrl} className={linkClassName}>
      {inner}
    </Link>
  );
}
