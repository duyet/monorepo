import { cn } from "@duyet/libs/utils";
import { Building2, Sparkles } from "lucide-react";

type View = "models" | "organizations";

interface StatsHeaderProps {
  models: number;
  organizations: number;
  activeView: View;
  onViewChange: (v: View) => void;
  sourceStats?: Record<string, number>;
}

export function StatsHeader({
  models,
  organizations,
  activeView,
  onViewChange,
  sourceStats,
}: StatsHeaderProps) {
  const stats: Array<{
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    view?: View;
  }> = [
    { label: "Models", value: models, icon: Sparkles, view: "models" },
    {
      label: "Organizations",
      value: organizations,
      icon: Building2,
      view: "organizations",
    },
  ];

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-2">
        {stats.map(({ label, value, icon: Icon, view }) => {
          const isActive = view !== undefined && activeView === view;
          const isClickable = view !== undefined;

          return (
            <div
              key={label}
              className={cn(
                "rounded-xl border p-4 transition-all",
                isActive
                  ? "border-neutral-300 dark:border-white/20 bg-white dark:bg-[#111] shadow-sm"
                  : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm",
                isClickable
                  ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
                  : "cursor-default"
              )}
              onClick={isClickable ? () => onViewChange(view) : undefined}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={
                isClickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ")
                        onViewChange(view);
                    }
                  : undefined
              }
            >
              <div className="mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
                <Icon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
              </div>
              <div className="text-2xl font-semibold font-[family-name:var(--font-mono)] text-neutral-900 dark:text-neutral-100">
                {value.toLocaleString()}
              </div>
              <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Source breakdown */}
      {sourceStats && Object.keys(sourceStats).length > 0 && (
        <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
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
                    className="underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2"
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
