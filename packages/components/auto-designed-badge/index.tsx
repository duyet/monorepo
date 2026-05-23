import { cn } from "@duyet/libs/utils";
import type { ReactElement } from "react";

export interface AutoDesignedBadgeProps {
  /** Optional extra classes appended after the defaults. */
  className?: string;
}

/**
 * Site-wide credit indicating that the site is auto-driven and
 * auto-designed by the duyetbot agent. Intentionally tiny, italic,
 * and muted so it sits unobtrusively in a footer or page edge.
 */
export function AutoDesignedBadge({
  className,
}: AutoDesignedBadgeProps = {}): ReactElement {
  // Inherit color from the surrounding context so the credit works
  // on both light (--editorial-fg over --editorial-bg) and dark
  // surfaces (e.g. the Footer's --surface-dark background). The
  // 60% opacity gives the muted feel without locking us to a single
  // palette.
  return (
    <p
      className={cn(
        "text-xs italic text-current opacity-60",
        className
      )}
    >
      This site is auto-driven and auto-designed by{" "}
      <a
        href="https://github.com/duyetbot"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-current/40 underline-offset-4 transition-colors hover:text-[color:var(--editorial-accent)] hover:decoration-[color:var(--editorial-accent)]"
      >
        duyetbot
      </a>
      .
    </p>
  );
}

export default AutoDesignedBadge;
