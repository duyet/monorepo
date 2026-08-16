import { useState } from "react";
import type { AdminState } from "../../lib/admin";

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
  const [status, setStatus] = useState<unknown>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [calls, setCalls] = useState<LlmCall[]>([]);
  const [callsBusy, setCallsBusy] = useState(false);
  const [refreshError, setRefreshError] = useState(false);

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

  async function refreshAll() {
    setRefreshError(false);
    try {
      await Promise.all([loadStatus(), loadCalls()]);
    } catch {
      setRefreshError(true);
    }
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

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Admin</h3>
        <button
          type="button"
          onClick={refreshAll}
          disabled={statusBusy || callsBusy}
          className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {statusBusy || callsBusy ? "Refreshing…" : "Refresh"}
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

      {refreshError && (
        <p className="mt-2 text-xs text-muted-foreground">
          Refresh failed.
        </p>
      )}

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
    </div>
  );
}
