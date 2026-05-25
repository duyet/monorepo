import { cn } from "@duyet/libs/utils";
import type { JSX, ReactNode } from "react";

interface InsightsPageHeaderProps {
  title: string;
  description: string;
  badge?: string;
}

interface InsightsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

interface InsightsNoticeProps {
  title: string;
  body: string;
  tone?: "warning" | "error";
}

export function InsightsPageHeader({
  title,
  description,
  badge,
}: InsightsPageHeaderProps): JSX.Element {
  return (
    <header className="editorial-fade-up mb-16">
      {badge ? <p className="eyebrow-mono">{badge}</p> : null}
      <h1 className="display-tight mt-4 text-5xl sm:text-6xl md:text-7xl">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-[color:var(--muted)]">
        {description}
      </p>
    </header>
  );
}

export function InsightsSection({
  title,
  description,
  children,
  className,
}: InsightsSectionProps): JSX.Element {
  return (
    <section className={cn("editorial-fade-up py-12", className)}>
      <div className="mb-8 flex flex-col gap-1 border-t border-[color:var(--hairline)] pt-8">
        <p className="eyebrow-mono">{title}</p>
        {description ? (
          <p className="display-tight text-2xl leading-snug text-[color:var(--foreground)] md:text-3xl">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function InsightsNotice({
  title,
  body,
  tone = "warning",
}: InsightsNoticeProps): JSX.Element {
  return (
    <div
      className={cn(
        "editorial-fade-up flex flex-col gap-2 border-l-2 py-3 pl-5",
        tone === "error"
          ? "border-[color:var(--accent)]"
          : "border-[color:var(--muted)]"
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted)]">
        {tone === "error" ? "Error" : "Notice"}
      </p>
      <h2 className="font-sans font-medium text-2xl tracking-tight">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
        {body}
      </p>
    </div>
  );
}
