import { cn } from "@duyet/libs/utils";
import type { ReactNode } from "react";

export function InsightsPageHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <header className="rounded-xl border border-[#1a1a1a]/10 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[#171815]">
      {badge ? (
        <p className="mb-3 inline-flex rounded-md bg-[#1a1a1a] px-3 py-1.5 text-xs font-semibold tracking-wide text-white dark:bg-[#f8f8f2] dark:text-[#0d0e0c]">
          {badge}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[#1a1a1a]/65 dark:text-[#f8f8f2]/65">
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
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-[#1a1a1a]/10 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[#171815] lg:p-6",
        className
      )}
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60">
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
}: {
  title: string;
  body: string;
  tone?: "warning" | "error";
}) {
  const toneClasses =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
      : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100";

  return (
    <div className={cn("rounded-xl border p-5", toneClasses)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6">{body}</p>
    </div>
  );
}
