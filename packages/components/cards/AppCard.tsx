import { cn } from "@duyet/libs/utils";
import Image from "next/image";
import Link from "next/link";

export type AppCardAccent =
  | "amber"
  | "slate"
  | "indigo"
  | "yellow"
  | "blue"
  | "neutral";

export interface AppCardProps {
  title: string;
  description: string;
  href: string;
  screenshot: string;
  accent?: AppCardAccent;
  className?: string;
  prefetch?: boolean;
}

const accentMap: Record<
  AppCardAccent,
  { bg: string; border: string; arrow: string; title: string; desc: string }
> = {
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    arrow: "text-amber-500",
    title: "text-neutral-900",
    desc: "text-neutral-600",
  },
  slate: {
    bg: "bg-slate-900",
    border: "border-slate-700",
    arrow: "text-slate-300",
    title: "text-white",
    desc: "text-slate-400",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    arrow: "text-indigo-500",
    title: "text-neutral-900",
    desc: "text-neutral-600",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    arrow: "text-yellow-600",
    title: "text-neutral-900",
    desc: "text-neutral-600",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    arrow: "text-blue-500",
    title: "text-neutral-900",
    desc: "text-neutral-600",
  },
  neutral: {
    bg: "bg-neutral-50",
    border: "border-neutral-200",
    arrow: "text-neutral-400",
    title: "text-neutral-900",
    desc: "text-neutral-500",
  },
};

export function AppCard({
  title,
  description,
  href,
  screenshot,
  accent = "neutral",
  className,
  prefetch = false,
}: AppCardProps) {
  const isExternal = href.startsWith("http");
  const a = accentMap[accent];

  return (
    <Link
      href={href}
      prefetch={prefetch}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border p-3",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
        "dark:focus:ring-amber-400 dark:focus:ring-offset-neutral-900",
        a.bg,
        a.border,
        className
      )}
      aria-label={isExternal ? `${title} (opens in new tab)` : title}
    >
      {/* Inset screenshot — shadow + ring creates depth over the tinted background */}
      <div className="relative mb-3 h-36 overflow-hidden rounded-lg shadow-md ring-1 ring-black/10">
        <Image
          src={screenshot}
          alt={`${title} screenshot`}
          fill
          unoptimized
          className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      {/* Info row */}
      <div className="flex items-start justify-between gap-2 px-1 pb-1">
        <div className="min-w-0">
          <p className={cn("truncate text-sm font-semibold", a.title)}>
            {title}
          </p>
          <p className={cn("mt-0.5 truncate text-xs", a.desc)}>{description}</p>
        </div>
        <svg
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 transition-all",
            "group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
            a.arrow
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </Link>
  );
}
