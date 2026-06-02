import { cn } from "@duyet/libs/utils";
import { Building2, Sparkles } from "lucide-react";
import { Card } from "./ui/card";

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
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {stats.map(({ label, value, icon: Icon, view }) => {
          const isActive = view !== undefined && activeView === view;
          const isClickable = view !== undefined;

          return (
            <Card
              key={label}
              className={cn(
                "p-5",
                isActive ? "" : "hover:-translate-y-0.5",
                isClickable
                  ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rd-ring)] focus-visible:ring-offset-2"
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
              <div className="mb-8 inline-flex rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)] p-2.5">
                <Icon className="h-4 w-4 text-[var(--rd-text)]" />
              </div>
              <div className="text-3xl font-semibold">
                {value.toLocaleString()}
              </div>
              <div className="mt-1 font-[family-name:var(--font-mono)] text-[11.5px] uppercase tracking-[0.14em] text-[var(--rd-text-3)]">
                {label}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Source breakdown */}
      {sourceStats && Object.keys(sourceStats).length > 0 && (
        <div className="mt-3 text-xs text-[var(--rd-text-2)]">
          Data sources:{" "}
          {Object.entries(sourceStats).map(([name, count], i) => (
            <span key={name}>
              {i > 0 && " + "}
              <span className="font-medium text-[var(--rd-text)]">
                {count.toLocaleString()}
              </span>{" "}
              {name === "epoch" ? (
                <>
                  from{" "}
                  <a
                    href="https://epoch.ai/data"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-[var(--rd-border)] underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rd-ring)] focus-visible:ring-offset-2"
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
