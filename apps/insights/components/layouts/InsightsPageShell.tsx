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
    <header className="mb-16">
      {badge ? (
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {badge}
        </p>
      ) : null}
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground">
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
    <section className={cn("py-12", className)}>
      <div className="mb-8 flex flex-col gap-1 border-t pt-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        {description ? (
          <p className="text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
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
        "flex flex-col gap-2 border-l-2 py-3 pl-5",
        tone === "error" ? "border-destructive" : "border-muted-foreground"
      )}
    >
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {tone === "error" ? "Error" : "Notice"}
      </p>
      <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}
