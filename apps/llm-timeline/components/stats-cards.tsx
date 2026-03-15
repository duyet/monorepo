import { cn } from "@duyet/libs/utils";
import { Building2, Sparkles } from "lucide-react";
import Link from "next/link";

interface StatsCardsProps {
  models: number;
  organizations: number;
  activeView?: "models" | "organizations";
  sourceStats?: Record<string, number>;
}

export function StatsCards({
  models,
  organizations,
  activeView,
  sourceStats,
}: StatsCardsProps) {
  const stats: Array<{
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    view: "models" | "organizations";
  }> = [
    {
      label: "Models",
      value: models,
      icon: Sparkles,
      href: "/",
      view: "models",
    },
    {
      label: "Organizations",
      value: organizations,
      icon: Building2,
      href: "/org",
      view: "organizations",
    },
  ];

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-4">
        {stats.map(({ label, value, icon: Icon, href, view }) => {
          const isActive = activeView === view;

          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "rounded-xl border p-4 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm",
                isActive
                  ? "border-neutral-400 dark:border-white/20 bg-neutral-50 dark:bg-white/5"
                  : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111]"
              )}
            >
              {/* Icon badge */}
              <div className="mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
                <Icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </div>

              {/* Number */}
              <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 font-[family-name:var(--font-mono)]">
                {value.toLocaleString()}
              </div>

              {/* Label */}
              <div className="mt-1 text-sm font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Source breakdown */}
      {sourceStats && Object.keys(sourceStats).length > 0 && (
        <div className="mb-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Data sources:{" "}
          {Object.entries(sourceStats).map(([name, count], i) => (
            <span key={name}>
              {i > 0 && " + "}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {count.toLocaleString()}
              </span>{" "}
              {name === "epoch" ? (
                <>
                  from{" "}
                  <a
                    href="https://epoch.ai/data"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                  >
                    Epoch AI
                  </a>
                </>
              ) : (
                name
              )}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
