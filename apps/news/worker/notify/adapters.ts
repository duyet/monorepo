import {
  type AlertAdapter,
  type AlertEvent,
  escapeHtml,
  formatHealthFooter,
  severityEmoji,
  severityLabel,
} from "./alert.js";

/** Telegram HTML. User-controlled title/summary/metrics are escaped. */
export function renderTelegramHtml(event: AlertEvent): string {
  const lines: string[] = [
    `${severityEmoji(event.severity)} <b>${escapeHtml(event.title)}</b>`,
    `<i>${escapeHtml(severityLabel(event.severity))} · ${escapeHtml(event.source)}</i>`,
    escapeHtml(event.summary),
  ];
  if (event.metrics && event.metrics.length > 0) {
    for (const metric of event.metrics) {
      lines.push(
        `• ${escapeHtml(metric.label)}: <code>${escapeHtml(metric.value)}</code>`
      );
    }
  }
  if (event.health) {
    lines.push(escapeHtml(formatHealthFooter(event.health)));
  }
  if (event.links && event.links.length > 0) {
    const parts = event.links.map(
      (link) =>
        `<a href="${escapeHtml(link.url)}">${escapeHtml(link.label)}</a>`
    );
    lines.push(parts.join(" · "));
  }
  return lines.join("\n\n");
}

export const telegramAlertAdapter: AlertAdapter = {
  id: "telegram",
  render: renderTelegramHtml,
};

/** Slack incoming-webhook JSON (text + attachments). */
export function renderSlackPayload(event: AlertEvent): {
  text: string;
  attachments: Array<Record<string, unknown>>;
} {
  const color =
    event.severity === "critical" || event.severity === "error"
      ? "#e11d48"
      : event.severity === "warning"
        ? "#f59e0b"
        : "#2563eb";
  const fields = (event.metrics ?? []).map((metric) => ({
    title: metric.label,
    value: metric.value,
    short: true,
  }));
  if (event.health) {
    fields.push({
      title: "Health",
      value: formatHealthFooter(event.health),
      short: false,
    });
  }
  return {
    text: `${severityEmoji(event.severity)} ${event.title}`,
    attachments: [
      {
        color,
        text: event.summary,
        fields,
        footer: event.source,
        ts: Math.floor(event.timestamp / 1000),
        actions: (event.links ?? []).map((link) => ({
          type: "button",
          text: link.label,
          url: link.url,
        })),
      },
    ],
  };
}

export const slackAlertAdapter: AlertAdapter = {
  id: "slack",
  render: renderSlackPayload,
};

export const jsonAlertAdapter: AlertAdapter = {
  id: "json",
  render: (event: AlertEvent) => event,
};

export const alertAdapters: AlertAdapter[] = [
  telegramAlertAdapter,
  slackAlertAdapter,
  jsonAlertAdapter,
];

export function adapterById(id: string): AlertAdapter | undefined {
  return alertAdapters.find((adapter) => adapter.id === id);
}
