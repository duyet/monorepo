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
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {stats.map(({ label, value, icon: Icon, view }) => {
          const isActive = view !== undefined && activeView === view;
          const isClickable = view !== undefined;

          return (
            <div
              key={label}
              className={cn(
                "rounded-xl border bg-card p-5 transition-all",
                isActive
                  ? "border-border"
                  : "border-border hover:-translate-y-0.5",
                isClickable
                  ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              <div className="mb-8 inline-flex rounded-lg bg-muted p-2.5">
                <Icon className="h-4 w-4 text-foreground" />
              </div>
              <div className="text-3xl font-semibold">
                {value.toLocaleString()}
              </div>
              <div className="mt-1 text-sm font-medium text-muted-foreground">
                {label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Source breakdown */}
      {sourceStats && Object.keys(sourceStats).length > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          Data sources:{" "}
          {Object.entries(sourceStats).map(([name, count], i) => (
            <span key={name}>
              {i > 0 && " + "}
              <span className="font-medium text-foreground">
                {count.toLocaleString()}
              </span>{" "}
              {name === "epoch" ? (
                <>
                  from{" "}
                  <a
                    href="https://epoch.ai/data"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-border underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
