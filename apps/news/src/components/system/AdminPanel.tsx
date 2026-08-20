import { useState } from "react";
import type { AdminState } from "../../lib/admin";

interface RunStepInfo {
  name: string;
  action: string;
  reason?: string;
}

interface WorkflowRun {
  stats?: string | { steps?: RunStepInfo[] } | null;
}

function lastRunSteps(status: unknown): RunStepInfo[] {
  if (!status || typeof status !== "object") return [];
  const runs = (status as { runs?: WorkflowRun[] }).runs;
  const stats = runs?.[0]?.stats;
  if (!stats) return [];
  const parsed = typeof stats === "string" ? safeParse(stats) : stats;
  const steps = (parsed as { steps?: unknown })?.steps;
  return Array.isArray(steps) ? (steps as RunStepInfo[]) : [];
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

interface LlmCall {
  ts: string;
  task: string;
  model: string;
  ok: boolean;
  tokens?: number;
  duration_ms?: number;
  error?: string | null;
  response_snippet?: string | null;
}

interface ModerationItem {
  id: string;
  source_id: string;
  title: string;
  url: string;
  status: string;
  published_at: number;
  llm_relevance: number | null;
  llm_importance: number | null;
  llm_quality: number | null;
  category: string | null;
  tags: string | null;
  rank_score: number;
  points: number | null;
  comments: number | null;
}

// Mirrors worker/ranking.ts's rankScore formula — kept in sync manually for
// this client-side "analyze" breakdown display.
function rankBreakdown(item: ModerationItem) {
  const now = Date.now();
  const ageHours = Math.max(0, (now - item.published_at * 1000) / 3_600_000);
  const importance = item.llm_importance ?? 0;
  const quality = item.llm_quality ?? 0;
  const qualityFactor = 0.6 + 0.4 * (quality / 10);
  const decay = Math.exp(-ageHours / 36);
  const engagement =
    1 + Math.log10(1 + (item.points ?? 0) + 0.5 * (item.comments ?? 0));
  return {
    ageHours,
    qualityFactor,
    decay,
    engagement,
    computed: importance * qualityFactor * decay * engagement,
  };
}

function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function authedFetch(
  admin: AdminState,
  url: string,
  init?: RequestInit
): Promise<Response> {
  const token = await admin.getToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}

export function AdminPanel({ admin }: { admin: AdminState }) {
  const [ingestBusy, setIngestBusy] = useState(false);
  const [ingestResult, setIngestResult] = useState<string | null>(null);
  const [rescoreBusy, setRescoreBusy] = useState(false);
  const [rescoreResult, setRescoreResult] = useState<string | null>(null);
  const [retranslateBusy, setRetranslateBusy] = useState(false);
  const [retranslateResult, setRetranslateResult] = useState<string | null>(
    null
  );
  const [tldrBusy, setTldrBusy] = useState(false);
  const [tldrResult, setTldrResult] = useState<string | null>(null);
  const [notifyBusy, setNotifyBusy] = useState(false);
  const [notifyResult, setNotifyResult] = useState<string | null>(null);
  const [audit, setAudit] = useState<
    { ts: number; action: string; detail?: string | null }[]
  >([]);
  const [status, setStatus] = useState<unknown>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [calls, setCalls] = useState<LlmCall[]>([]);
  const [callsBusy, setCallsBusy] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [itemsBusy, setItemsBusy] = useState(false);
  const [itemActionBusyId, setItemActionBusyId] = useState<string | null>(
    null
  );
  const [rateDrafts, setRateDrafts] = useState<
    Record<string, { importance: string; quality: string }>
  >({});

  async function loadStatus() {
    setStatusBusy(true);
    try {
      const res = await authedFetch(admin, "/api/admin/status");
      if (res.ok) setStatus(await res.json());
    } catch {
      // leave previous status in place
    } finally {
      setStatusBusy(false);
    }
  }

  async function loadCalls() {
    setCallsBusy(true);
    try {
      const res = await authedFetch(admin, "/api/admin/llm-calls?limit=100");
      if (res.ok) {
        const data = (await res.json()) as { calls?: LlmCall[] };
        setCalls(Array.isArray(data.calls) ? data.calls : []);
      }
    } catch {
      // leave previous calls in place
    } finally {
      setCallsBusy(false);
    }
  }

  async function loadAudit() {
    try {
      const res = await authedFetch(admin, "/api/admin/audit");
      if (res.ok) {
        const data = (await res.json()) as {
          audit?: { ts: number; action: string; detail?: string | null }[];
        };
        setAudit(Array.isArray(data.audit) ? data.audit : []);
      }
    } catch {
      // keep previous
    }
  }

  async function loadItems() {
    setItemsBusy(true);
    try {
      const res = await authedFetch(admin, "/api/admin/items?limit=50");
      if (res.ok) {
        const data = (await res.json()) as { items?: ModerationItem[] };
        setItems(Array.isArray(data.items) ? data.items : []);
      }
    } catch {
      // leave previous items in place
    } finally {
      setItemsBusy(false);
    }
  }

  async function refreshAll() {
    setRefreshError(false);
    try {
      await Promise.all([loadStatus(), loadCalls(), loadItems(), loadAudit()]);
    } catch {
      setRefreshError(true);
    }
  }

  async function moderateItem(
    id: string,
    body: Record<string, unknown>
  ): Promise<void> {
    setItemActionBusyId(id);
    try {
      const res = await authedFetch(admin, "/api/admin/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (res.ok) {
        const updated = (await res.json()) as ModerationItem;
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
        );
      }
    } catch {
      // leave item state unchanged on failure
    } finally {
      setItemActionBusyId(null);
    }
  }

  function rateDraft(id: string) {
    return rateDrafts[id] ?? { importance: "", quality: "" };
  }

  function setRateDraft(
    id: string,
    field: "importance" | "quality",
    value: string
  ) {
    setRateDrafts((prev) => ({
      ...prev,
      [id]: { ...rateDraft(id), [field]: value },
    }));
  }

  async function applyRate(id: string) {
    const draft = rateDraft(id);
    const payload: Record<string, unknown> = { action: "rate" };
    if (draft.importance !== "") payload.importance = Number(draft.importance);
    if (draft.quality !== "") payload.quality = Number(draft.quality);
    await moderateItem(id, payload);
  }

  async function triggerIngest() {
    setIngestBusy(true);
    setIngestResult(null);
    try {
      const res = await authedFetch(admin, "/api/admin/ingest", {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      setIngestResult(
        res.ok
          ? `ok — ${JSON.stringify(data)}`
          : `error (${res.status}) — ${JSON.stringify(data)}`
      );
      await loadStatus();
    } catch {
      setIngestResult("error — request failed");
    } finally {
      setIngestBusy(false);
    }
  }

  async function reprocess(
    steps: ("score" | "translate")[],
    setBusy: (busy: boolean) => void,
    setResult: (result: string | null) => void
  ) {
    setBusy(true);
    setResult(null);
    try {
      const res = await authedFetch(admin, "/api/admin/reprocess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });
      const data = await res.json().catch(() => null);
      setResult(
        res.ok
          ? `ok — ${JSON.stringify(data)}`
          : `error (${res.status}) — ${JSON.stringify(data)}`
      );
      await loadStatus();
    } catch {
      setResult("error — request failed");
    } finally {
      setBusy(false);
    }
  }

  async function sendTelegramDigest() {
    setNotifyBusy(true);
    setNotifyResult(null);
    try {
      const res = await authedFetch(admin, "/api/admin/notify/digest", {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      setNotifyResult(
        res.ok
          ? `ok — ${JSON.stringify(data)}`
          : `error (${res.status}) — ${JSON.stringify(data)}`
      );
      await loadStatus();
    } catch {
      setNotifyResult("error — request failed");
    } finally {
      setNotifyBusy(false);
    }
  }

  async function regenerateTldr() {
    setTldrBusy(true);
    setTldrResult(null);
    try {
      const res = await authedFetch(admin, "/api/admin/tldr/regenerate", {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      setTldrResult(
        res.ok
          ? `ok — ${JSON.stringify(data)}`
          : `error (${res.status}) — ${JSON.stringify(data)}`
      );
    } catch {
      setTldrResult("error — request failed");
    } finally {
      setTldrBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Admin</h3>
        <button
          type="button"
          onClick={refreshAll}
          disabled={statusBusy || callsBusy || itemsBusy}
          className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {statusBusy || callsBusy || itemsBusy ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={triggerIngest}
          disabled={ingestBusy}
          className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-50"
        >
          {ingestBusy ? "Triggering…" : "Trigger ingest"}
        </button>
        {ingestResult && (
          <span className="text-xs text-muted-foreground">
            {ingestResult}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() =>
            reprocess(["score"], setRescoreBusy, setRescoreResult)
          }
          disabled={rescoreBusy}
          className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-50"
        >
          {rescoreBusy ? "Re-scoring…" : "Re-score today"}
        </button>
        {rescoreResult && (
          <span className="text-xs text-muted-foreground">
            {rescoreResult}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() =>
            reprocess(["translate"], setRetranslateBusy, setRetranslateResult)
          }
          disabled={retranslateBusy}
          className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-50"
        >
          {retranslateBusy ? "Re-translating…" : "Re-translate today"}
        </button>
        {retranslateResult && (
          <span className="text-xs text-muted-foreground">
            {retranslateResult}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={regenerateTldr}
          disabled={tldrBusy}
          className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-50"
        >
          {tldrBusy ? "Regenerating…" : "Regenerate TL;DR"}
        </button>
        {tldrResult && (
          <span className="text-xs text-muted-foreground">{tldrResult}</span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={sendTelegramDigest}
          disabled={notifyBusy}
          className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-50"
        >
          {notifyBusy ? "Sending…" : "Send Telegram digest"}
        </button>
        {notifyResult && (
          <span className="text-xs text-muted-foreground">{notifyResult}</span>
        )}
      </div>

      {refreshError && (
        <p className="mt-2 text-xs text-muted-foreground">
          Refresh failed.
        </p>
      )}

      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">
          Telegram / TL;DR
        </p>
        <pre className="mt-1 max-h-32 overflow-auto rounded border border-border p-2 text-xs text-muted-foreground">
          {status
            ? JSON.stringify(
                {
                  telegram: (status as { telegram?: unknown }).telegram,
                  latestTldr: (status as { latestTldr?: unknown }).latestTldr,
                  notifications: (status as { notifications?: unknown })
                    .notifications,
                },
                null,
                2
              )
            : "No status loaded."}
        </pre>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">Audit log</p>
        {audit.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">No audit rows.</p>
        ) : (
          <ul className="mt-1 space-y-0.5 text-xs">
            {audit.map((row) => (
              <li key={`${row.ts}-${row.action}`}>
                <span className="tabular-nums text-muted-foreground">
                  {new Date(row.ts).toISOString()}
                </span>{" "}
                <span className="font-medium">{row.action}</span>
                {row.detail ? (
                  <span className="text-muted-foreground"> — {row.detail}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">
          Last run steps
        </p>
        {lastRunSteps(status).length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            No step detail loaded.
          </p>
        ) : (
          <ul className="mt-1 space-y-0.5 text-xs">
            {lastRunSteps(status).map((step, i) => (
              <li key={`${step.name}-${i}`} className="text-foreground">
                <span className="font-medium">{step.name}</span>
                {": "}
                <span>{step.action}</span>
                {step.reason && (
                  <span className="text-muted-foreground"> — {step.reason}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">Status</p>
        <pre className="mt-1 max-h-64 overflow-auto rounded border border-border p-2 text-xs text-muted-foreground">
          {status ? JSON.stringify(status, null, 2) : "No status loaded."}
        </pre>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium text-muted-foreground">
          LLM calls
        </p>
        {calls.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            No calls loaded.
          </p>
        ) : (
          <div className="mt-1 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-1 pr-2 font-normal">ts</th>
                  <th className="py-1 pr-2 font-normal">task</th>
                  <th className="py-1 pr-2 font-normal">model</th>
                  <th className="py-1 pr-2 font-normal">ok</th>
                  <th className="py-1 pr-2 font-normal text-right tabular-nums">
                    tokens
                  </th>
                  <th className="py-1 pr-2 font-normal text-right tabular-nums">
                    duration
                  </th>
                  <th className="py-1 pr-2 font-normal">error/snippet</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call, i) => (
                  <tr
                    key={`${call.ts}-${i}`}
                    className="border-b border-border/50 align-top"
                  >
                    <td className="py-1 pr-2 whitespace-nowrap tabular-nums text-muted-foreground">
                      {call.ts}
                    </td>
                    <td className="py-1 pr-2">{call.task}</td>
                    <td className="py-1 pr-2">{call.model}</td>
                    <td className="py-1 pr-2">
                      <span
                        className={
                          call.ok
                            ? "rounded bg-green-500/15 px-1.5 py-0.5 text-green-600 dark:text-green-400"
                            : "rounded bg-red-500/15 px-1.5 py-0.5 text-red-600 dark:text-red-400"
                        }
                      >
                        {call.ok ? "ok" : "fail"}
                      </span>
                    </td>
                    <td className="py-1 pr-2 text-right tabular-nums">
                      {call.tokens ?? "—"}
                    </td>
                    <td className="py-1 pr-2 text-right tabular-nums">
                      {call.duration_ms != null ? `${call.duration_ms}ms` : "—"}
                    </td>
                    <td className="py-1 pr-2">
                      {call.error || call.response_snippet ? (
                        <details>
                          <summary className="cursor-pointer text-muted-foreground">
                            {call.error ? "error" : "snippet"}
                          </summary>
                          <pre className="mt-1 max-w-xs overflow-auto whitespace-pre-wrap text-muted-foreground">
                            {call.error ?? call.response_snippet}
                          </pre>
                        </details>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">Items</p>
          <button
            type="button"
            onClick={loadItems}
            disabled={itemsBusy}
            className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {itemsBusy ? "Refreshing…" : "Refresh"}
          </button>
        </div>
        {items.length === 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            No items loaded.
          </p>
        ) : (
          <div className="mt-1 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-1 pr-2 font-normal">time</th>
                  <th className="py-1 pr-2 font-normal">source</th>
                  <th className="py-1 pr-2 font-normal">title</th>
                  <th className="py-1 pr-2 font-normal">status</th>
                  <th className="py-1 pr-2 font-normal text-right tabular-nums">
                    rel
                  </th>
                  <th className="py-1 pr-2 font-normal text-right tabular-nums">
                    imp
                  </th>
                  <th className="py-1 pr-2 font-normal text-right tabular-nums">
                    qual
                  </th>
                  <th className="py-1 pr-2 font-normal text-right tabular-nums">
                    rank
                  </th>
                  <th className="py-1 pr-2 font-normal">actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const draft = rateDraft(item.id);
                  const busy = itemActionBusyId === item.id;
                  const breakdown = rankBreakdown(item);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border/50 align-top"
                    >
                      <td className="py-1 pr-2 whitespace-nowrap tabular-nums text-muted-foreground">
                        {item.published_at
                          ? new Date(item.published_at * 1000).toISOString()
                          : "—"}
                      </td>
                      <td className="py-1 pr-2">{item.source_id ?? "—"}</td>
                      <td className="py-1 pr-2 max-w-xs">
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-foreground hover:underline"
                          >
                            {item.title ?? item.url}
                          </a>
                        ) : (
                          (item.title ?? "—")
                        )}
                        <details className="mt-1">
                          <summary className="cursor-pointer text-muted-foreground">
                            analyze
                          </summary>
                          <div className="mt-1 space-y-0.5 text-muted-foreground">
                            <div>category: {item.category ?? "—"}</div>
                            <div>
                              tags: {parseTags(item.tags).join(", ") || "—"}
                            </div>
                            <div>
                              points: {item.points ?? 0}, comments:{" "}
                              {item.comments ?? 0}
                            </div>
                            <div>ageHours: {breakdown.ageHours.toFixed(2)}</div>
                            <div>
                              qualityFactor: {breakdown.qualityFactor.toFixed(3)}
                            </div>
                            <div>decay: {breakdown.decay.toFixed(3)}</div>
                            <div>
                              engagement: {breakdown.engagement.toFixed(3)}
                            </div>
                            <div>
                              computed rank: {breakdown.computed.toFixed(3)}{" "}
                              (stored: {item.rank_score?.toFixed?.(3) ?? "—"})
                            </div>
                          </div>
                        </details>
                      </td>
                      <td className="py-1 pr-2">
                        <span
                          className={
                            item.status === "published"
                              ? "rounded bg-green-500/15 px-1.5 py-0.5 text-green-600 dark:text-green-400"
                              : item.status === "rejected"
                                ? "rounded bg-red-500/15 px-1.5 py-0.5 text-red-600 dark:text-red-400"
                                : "rounded bg-muted px-1.5 py-0.5 text-muted-foreground"
                          }
                        >
                          {item.status ?? "—"}
                        </span>
                      </td>
                      <td className="py-1 pr-2 text-right tabular-nums">
                        {item.llm_relevance ?? "—"}
                      </td>
                      <td className="py-1 pr-2 text-right tabular-nums">
                        {item.llm_importance ?? "—"}
                      </td>
                      <td className="py-1 pr-2 text-right tabular-nums">
                        {item.llm_quality ?? "—"}
                      </td>
                      <td className="py-1 pr-2 text-right tabular-nums">
                        {item.rank_score?.toFixed?.(2) ?? "—"}
                      </td>
                      <td className="py-1 pr-2">
                        <div className="flex flex-wrap items-center gap-1">
                          {item.status === "rejected" ? (
                            <button
                              type="button"
                              onClick={() =>
                                moderateItem(item.id, { action: "restore" })
                              }
                              disabled={busy}
                              className="rounded border border-border px-1.5 py-0.5 text-xs text-foreground hover:bg-muted disabled:opacity-50"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                moderateItem(item.id, { action: "reject" })
                              }
                              disabled={busy}
                              className="rounded border border-border px-1.5 py-0.5 text-xs text-foreground hover:bg-muted disabled:opacity-50"
                            >
                              Reject
                            </button>
                          )}
                          <input
                            type="number"
                            min={0}
                            max={10}
                            placeholder="imp"
                            value={draft.importance}
                            onChange={(e) =>
                              setRateDraft(item.id, "importance", e.target.value)
                            }
                            className="w-12 rounded border border-border bg-transparent px-1 py-0.5 text-xs tabular-nums"
                          />
                          <input
                            type="number"
                            min={0}
                            max={10}
                            placeholder="qual"
                            value={draft.quality}
                            onChange={(e) =>
                              setRateDraft(item.id, "quality", e.target.value)
                            }
                            className="w-12 rounded border border-border bg-transparent px-1 py-0.5 text-xs tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={() => applyRate(item.id)}
                            disabled={busy}
                            className="rounded border border-border px-1.5 py-0.5 text-xs text-foreground hover:bg-muted disabled:opacity-50"
                          >
                            Rate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
