"use client";

import { cn } from "@duyet/libs/utils";
import { Menu as MenuIcon } from "lucide-react";
import type {
  AnchorHTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import { useEffect, useState } from "react";

export interface SiteNavProps {
  /** Brand / logo node, rendered on the left. */
  brand?: ReactNode;
  /** Link nodes, rendered on the right on desktop. */
  links?: ReactNode;
  /**
   * Invoked when the mobile menu button is tapped. Consumers wire
   * this to their own command palette or drawer.
   */
  onMobileMenuClick?: () => void;
  /** Optional extra classes appended to the <header>. */
  className?: string;
  /**
   * Force the scrolled visual state. Useful for SSR snapshots or
   * pages that always want the bar to read as scrolled.
   */
  alwaysScrolled?: boolean;
  /** Accessible label for the mobile menu trigger. */
  mobileMenuLabel?: string;
}

/**
 * Editorial site navigation primitive.
 *
 * - Slim sticky top bar (h-14)
 * - Transparent until the page is scrolled, then a hairline +
 *   translucent backdrop-blur reveal
 * - Brand slot left, links slot right
 * - Mobile: links collapse into a single icon button that fires
 *   onMobileMenuClick — leaves the drawer/palette implementation
 *   to the consumer so this component stays a primitive
 */
export function SiteNav({
  brand,
  links,
  onMobileMenuClick,
  className,
  alwaysScrolled = false,
  mobileMenuLabel = "Open menu",
}: SiteNavProps = {}): ReactElement {
  const [scrolled, setScrolled] = useState(alwaysScrolled);

  useEffect(() => {
    // When the parent locks the bar to the scrolled treatment we
    // still need to push that state through — otherwise toggling
    // alwaysScrolled at runtime from false -> true would leave the
    // bar visually transparent.
    if (alwaysScrolled) {
      setScrolled(true);
      return;
    }
    if (typeof window === "undefined") return;

    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [alwaysScrolled]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14 w-full transition-[background-color,border-color] duration-200",
        scrolled
          ? "border-b border-[color:var(--editorial-hairline)] bg-[color-mix(in_oklch,_var(--editorial-bg)_80%,_transparent)] backdrop-blur-sm"
          : "border-b border-transparent bg-transparent",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <div className="flex items-center font-[var(--editorial-font-serif)] text-[color:var(--editorial-fg)]">
          {brand}
        </div>

        {/* Desktop links */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-6 md:flex"
        >
          {links}
        </nav>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={onMobileMenuClick}
          aria-label={mobileMenuLabel}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md md:hidden",
            "text-[color:var(--editorial-muted)] transition-colors",
            "hover:text-[color:var(--editorial-fg)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--editorial-accent)]"
          )}
        >
          <MenuIcon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

export interface SiteNavLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** When true, the link is rendered as the current page. */
  active?: boolean;
}

/**
 * Plain anchor variant of a SiteNav link. Used when the consumer
 * does not need framework routing. For TanStack routing, wrap the
 * router's <Link> with the same className recipe via
 * {@link siteNavLinkClassName}.
 */
export function SiteNavLink({
  active = false,
  className,
  children,
  ...rest
}: SiteNavLinkProps): ReactElement {
  return (
    <a
      {...rest}
      aria-current={active ? "page" : undefined}
      className={siteNavLinkClassName(active, className)}
    >
      {children}
    </a>
  );
}

/**
 * Tailwind recipe for a SiteNav link. Exposed so consumers can
 * apply the same look to framework-specific Link components.
 */
export function siteNavLinkClassName(
  active: boolean,
  extra?: string
): string {
  return cn(
    "relative text-sm font-medium tracking-tight transition-colors",
    "text-[color:var(--editorial-muted)] hover:text-[color:var(--editorial-fg)]",
    // 2px accent underline for the active item, via ::after so the
    // link itself does not change height when toggling state.
    "after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full",
    "after:bg-[color:var(--editorial-accent)] after:transition-opacity",
    active
      ? "text-[color:var(--editorial-fg)] after:opacity-100"
      : "after:opacity-0",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--editorial-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--editorial-bg)]",
    extra
  );
}

export default SiteNav;
