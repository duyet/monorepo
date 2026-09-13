"use client";

import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import { DuyetLogo } from "../brand/DuyetLogo";

interface HeaderBrandingProps {
  /** URL for the home link */
  homeUrl: string;
  /** Short text shown on small screens */
  shortText?: string;
  /** Long text shown on larger screens */
  longText?: string;
  /** Show logo (brand mark from duyet.net/brand) */
  logo?: boolean;
  /** Center layout mode */
  center?: boolean;
  /** Optional CSS classes forwarded to the Link element */
  className?: string;
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
      {logo ? (
        <DuyetLogo
          tone="auto"
          format="svg"
          className="inline-flex h-5 w-5 shrink-0"
          imgClassName="h-full w-full object-contain"
          alt=""
        />
      ) : null}
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

  const linkClassName = cn("flex items-center gap-3 whitespace-nowrap");

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
