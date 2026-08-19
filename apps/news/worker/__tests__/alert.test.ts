import { describe, expect, it, vi } from "vitest";
import {
  alertAdapters,
  jsonAlertAdapter,
  renderSlackPayload,
  renderTelegramHtml,
  slackAlertAdapter,
  telegramAlertAdapter,
} from "../notify/adapters.js";
import {
  buildHealthSnapshot,
  type AlertEvent,
  formatHealthFooter,
  healthOk,
} from "../notify/alert.js";
import {
  webhookDeliveryId,
  webhookNotifier,
  webhookTarget,
} from "../notify/webhook.js";
import type { Env } from "../types.js";

const event: AlertEvent = {
  severity: "warning",
  source: "news.duyet.net",
  title: "GPT-6 <beats> humans & robots",
  summary: "A <script>alert(1)</script> summary",
  metrics: [{ label: "rank", value: "31" }],
  links: [{ label: "open", url: "https://news.duyet.net/llm/abc" }],
  timestamp: Date.UTC(2026, 7, 19, 8, 0, 0),
  health: buildHealthSnapshot({
    lastRunError: null,
    lastRunFinishedAt: Date.UTC(2026, 7, 19, 7, 0, 0),
    translationCoverage: 0.92,
    now: Date.UTC(2026, 7, 19, 8, 0, 0),
  }),
};

describe("AlertEvent adapters", () => {
  it("registers telegram, slack, and json adapters", () => {
    expect(alertAdapters.map((adapter) => adapter.id)).toEqual([
      "telegram",
      "slack",
      "json",
    ]);
  });

  it("escapes HTML in the Telegram payload", () => {
    const html = renderTelegramHtml(event);
    expect(html).toContain("⚠️");
    expect(html).toContain("GPT-6 &lt;beats&gt; humans &amp; robots");
    expect(html).not.toContain("<script>");
    expect(html).toContain("A &lt;script&gt;alert(1)&lt;/script&gt; summary");
    expect(html).toContain("rank");
    expect(html).toContain("health: all 2 ok");
    expect(html).toContain('href="https://news.duyet.net/llm/abc"');
    expect(telegramAlertAdapter.render(event)).toBe(html);
  });

  it("escapes quotes inside Telegram href attributes", () => {
    const html = renderTelegramHtml({
      ...event,
      links: [
        {
          label: 'say "hi"',
          url: 'https://news.duyet.net/x?q="quoted"&s=\'s\'',
        },
      ],
    });
    expect(html).toContain(
      'href="https://news.duyet.net/x?q=&quot;quoted&quot;&amp;s=&#39;s&#39;"'
    );
    expect(html).toContain("say &quot;hi&quot;");
    expect(html).not.toContain('href="https://news.duyet.net/x?q="');
  });

  it("renders a Slack attachment with metrics and health", () => {
    const payload = renderSlackPayload(event);
    expect(payload.text).toContain("GPT-6 <beats> humans & robots");
    expect(payload.attachments[0].fields).toEqual(
      expect.arrayContaining([
        { title: "rank", value: "31", short: true },
        { title: "Health", value: "health: all 2 ok", short: false },
      ])
    );
    expect(slackAlertAdapter.render(event)).toEqual(payload);
  });

  it("JSON adapter returns the event unchanged", () => {
    expect(jsonAlertAdapter.render(event)).toBe(event);
  });
});

describe("health snapshot", () => {
  it("marks ingest down when the last run errored", () => {
    const snapshot = buildHealthSnapshot({
      lastRunError: "timeout",
      translationCoverage: 0.4,
    });
    expect(healthOk(snapshot)).toBe(false);
    expect(formatHealthFooter(snapshot)).toContain("ingest");
    expect(formatHealthFooter(snapshot)).toContain("translations");
  });
});

describe("webhookTarget", () => {
  it("stores origin only, never the secret path", () => {
    expect(
      webhookTarget(
        "https://hooks.slack.com/services/T00/B00/secrettoken"
      )
    ).toBe("https://hooks.slack.com");
    expect(webhookTarget("")).toBe("");
    expect(webhookTarget("not-a-url")).toBe("webhook");
  });
});

describe("webhookDeliveryId", () => {
  it("is stable for the same digest date or story id", () => {
    expect(webhookDeliveryId("digest", "2026-08-19")).toBe(
      "news:digest:2026-08-19"
    );
    expect(webhookDeliveryId("story", "abc123")).toBe("news:story:abc123");
  });

  it("sends Idempotency-Key and skips retry after timeout", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error("The operation was aborted due to timeout"), {
          name: "TimeoutError",
        })
      );
    vi.stubGlobal("fetch", fetchMock);
    const result = await webhookNotifier.sendDigest(
      { NOTIFY_WEBHOOK_URL: "https://example.com/hook" } as Env,
      { date: "2026-08-19", bullets: [] }
    );
    expect(result.ok).toBe(true);
    expect(result.messageId).toBe(
      "news:digest:2026-08-19:ambiguous-timeout"
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/hook",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Idempotency-Key": "news:digest:2026-08-19",
        }),
      })
    );
    vi.unstubAllGlobals();
  });
});
