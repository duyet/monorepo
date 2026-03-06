import Link from "next/link";
import { Building2, Sparkles } from "lucide-react";

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
              className="rounded-lg border p-4 transition-all hover:bg-muted hover:text-accent-foreground"
              style={{
                borderColor: isActive ? "var(--primary)" : "var(--border)",
                backgroundColor: isActive ? "var(--accent)" : "var(--card)",
              }}
            >
              {/* Number */}
              <div
                className="text-3xl font-bold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text)",
                }}
              >
                {value.toLocaleString()}
              </div>

              {/* Label with icon */}
              <div
                className="mt-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Source breakdown */}
      {sourceStats && Object.keys(sourceStats).length > 0 && (
        <div
          className="mb-2 text-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Data sources:{" "}
          {Object.entries(sourceStats).map(([name, count], i) => (
            <span key={name}>
              {i > 0 && " + "}
              <span className="font-medium" style={{ color: "var(--text)" }}>
                {count.toLocaleString()}
              </span>{" "}
              {name === "epoch" ? (
                <>
                  from{" "}
                  <a
                    href="https://epoch.ai/data"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: "var(--accent)" }}
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
