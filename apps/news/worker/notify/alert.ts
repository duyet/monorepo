/** Normalized incident/digest event. Adapters render this; they do not
 * invent a second internal shape. */

export type AlertSeverity = "info" | "warning" | "error" | "critical";

export interface AlertMetric {
  label: string;
  value: string;
}

export interface AlertLink {
  label: string;
  url: string;
}

export interface HealthService {
  name: string;
  ok: boolean;
  detail?: string;
}

export interface HealthSnapshot {
  checkedAt: number;
  services: HealthService[];
}

export interface AlertEvent {
  severity: AlertSeverity;
  source: string;
  title: string;
  summary: string;
  metrics?: AlertMetric[];
  links?: AlertLink[];
  timestamp: number;
  health?: HealthSnapshot;
}

export interface AlertAdapter {
  id: string;
  render(event: AlertEvent): unknown;
}

const SEVERITY_EMOJI: Record<AlertSeverity, string> = {
  info: "ℹ️",
  warning: "⚠️",
  error: "❌",
  critical: "🚨",
};

export function severityEmoji(severity: AlertSeverity): string {
  return SEVERITY_EMOJI[severity];
}

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function healthOk(snapshot: HealthSnapshot): boolean {
  return snapshot.services.every((service) => service.ok);
}

/** Compact one-line health footer for Telegram / Slack. */
export function formatHealthFooter(snapshot: HealthSnapshot): string {
  if (snapshot.services.length === 0) return "health: n/a";
  const down = snapshot.services.filter((service) => !service.ok);
  if (down.length === 0) {
    return `health: all ${snapshot.services.length} ok`;
  }
  return `health: ${down
    .map((service) => `${service.name}${service.detail ? ` (${service.detail})` : ""}`)
    .join(", ")} down`;
}

export function buildHealthSnapshot(input: {
  lastRunError?: string | null;
  lastRunFinishedAt?: number | null;
  translationCoverage?: number | null;
  now?: number;
}): HealthSnapshot {
  const now = input.now ?? Date.now();
  const ingestOk = !input.lastRunError;
  const coverage = input.translationCoverage;
  const translationsOk = coverage === null || coverage === undefined || coverage >= 0.8;
  return {
    checkedAt: now,
    services: [
      {
        name: "ingest",
        ok: ingestOk,
        detail: ingestOk
          ? input.lastRunFinishedAt
            ? "last run ok"
            : "no run yet"
          : input.lastRunError ?? "failed",
      },
      {
        name: "translations",
        ok: translationsOk,
        detail:
          coverage === null || coverage === undefined
            ? "unknown"
            : `${Math.round(coverage * 100)}% title_vi`,
      },
    ],
  };
}

export function assertNever(value: never): never {
  throw new Error(`unhandled alert variant: ${String(value)}`);
}

export function severityLabel(severity: AlertSeverity): string {
  switch (severity) {
    case "info":
      return "info";
    case "warning":
      return "warning";
    case "error":
      return "error";
    case "critical":
      return "critical";
    default:
      return assertNever(severity);
  }
}
