"use client";

import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import Logo from "../Logo";

interface HeaderBrandingProps {
  /** URL for the home link */
  homeUrl: string;
  /** Short text shown on small screens */
  shortText?: string;
  /** Long text shown on larger screens */
  longText?: string;
  /** Show logo */
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
  center = false,
  className,
}: HeaderBrandingProps) {
  const linkClassName = cn(
    "font-serif text-xl sm:text-2xl font-normal text-neutral-900 dark:text-neutral-100",
    className
  );
  const textContent =
    shortText && longText ? (
      <>
        <span className="block sm:hidden">{shortText}</span>
        <span
          className={cn("hidden sm:block", center && "md:text-7xl md:mt-5")}
        >
          {longText}
        </span>
      </>
    ) : (
      <span>{shortText || longText}</span>
    );

  return (
    <div className={cn("flex flex-row items-center gap-2")}>
      {logo && (
        <Logo
          className={center ? "md:flex-col" : ""}
          logoClassName={center ? "md:w-40 md:h-40" : ""}
        />
      )}

      {homeUrl.startsWith("http") ? (
        <a href={homeUrl} className={linkClassName}>
          {textContent}
        </a>
      ) : (
        <Link to={homeUrl} className={linkClassName}>
          {textContent}
        </Link>
      )}
    </div>
  );
}
