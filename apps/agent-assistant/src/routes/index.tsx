import { AssistantRuntimeProvider, type AssistantRuntime } from "@assistant-ui/react";
import {
  type LangChainMessage,
  unstable_createLangGraphStream,
  useLangGraphRuntime,
} from "@assistant-ui/react-langgraph";
import { createFileRoute } from "@tanstack/react-router";
import { PanelLeftClose, PanelLeftOpen, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Thread } from "@/components/assistant-ui/thread";
import { createClient } from "@/lib/chatApi";

export const Route = createFileRoute("/")({
  component: AssistantPage,
});

const ASSISTANT_ID = "agent";

function groupThreads(threads: SavedThread[]) {
  const groups: {
    today: SavedThread[];
    yesterday: SavedThread[];
    older: SavedThread[];
  } = {
    today: [],
    yesterday: [],
    older: [],
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  for (const t of threads) {
    const threadDate = new Date(t.updatedAt);
    if (threadDate >= startOfToday) {
      groups.today.push(t);
    } else if (threadDate >= startOfYesterday) {
      groups.yesterday.push(t);
    } else {
      groups.older.push(t);
    }
  }

  return groups;
}

interface SavedThread {
  id: string;
  title: string;
  updatedAt: string;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) return "just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function AssistantPage() {
  const client = useMemo(() => createClient(), []);

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<SavedThread[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const grouped = useMemo(() => groupThreads(threads), [threads]);

  const renderThreadRow = (t: SavedThread) => {
    const isActive = activeThreadId === t.id;
    return (
      <li
        key={t.id}
        className="group/row relative transition-transform duration-150 ease-out hover:-translate-y-px"
      >
        <button
          type="button"
          onClick={() => handleSelectThread(t.id)}
          className={`relative block w-full text-left pl-4 pr-9 py-2 text-xs transition-colors duration-150 ease-out ${
            isActive
              ? "text-[color:var(--foreground)] font-medium"
              : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]"
          }`}
        >
          {isActive ? (
            <span
              aria-hidden
              className="absolute left-0 top-1 bottom-1 w-[2px] bg-[color:var(--accent)]"
            />
          ) : null}
          <span className="block truncate">{t.title}</span>
          <time
            dateTime={t.updatedAt}
            className="mt-0.5 block text-[10px] tabular-nums text-[color:var(--muted-foreground)] opacity-0 transition-opacity duration-150 group-hover/row:opacity-100"
          >
            {formatRelative(t.updatedAt)}
          </time>
        </button>

        <button
          type="button"
          onClick={(e) => handleDeleteThread(t.id, e)}
          className="absolute right-2 top-1.5 -translate-x-2 opacity-0 p-1 text-[color:var(--muted-foreground)] transition-[transform,opacity,color] duration-150 ease-out hover:text-[color:var(--accent)] group-hover/row:translate-x-0 group-hover/row:opacity-100 focus-visible:translate-x-0 focus-visible:opacity-100"
          title="Delete conversation"
          aria-label={`Delete ${t.title}`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </li>
    );
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedThreads = localStorage.getItem("duyetbot_threads");
    if (storedThreads) {
      try {
        setThreads(JSON.parse(storedThreads));
      } catch (e) {
        console.error("Failed to parse threads", e);
      }
    }

    const storedActive = localStorage.getItem("duyetbot_active_thread_id");
    if (storedActive) setActiveThreadId(storedActive);

    if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const stream = useMemo(
    () =>
      unstable_createLangGraphStream({
        client,
        assistantId: ASSISTANT_ID,
      }),
    [client]
  );

  const runtime = useLangGraphRuntime({
    unstable_allowCancellation: true,
    stream,
    create: async () => {
      const { thread_id } = await client.threads.create();

      const now = new Date();
      const newThread: SavedThread = {
        id: thread_id,
        title: `New conversation`,
        updatedAt: now.toISOString(),
      };

      setTimeout(() => {
        setThreads((prev) => {
          const updated = [newThread, ...prev];
          localStorage.setItem("duyetbot_threads", JSON.stringify(updated));
          return updated;
        });
        setActiveThreadId(thread_id);
        localStorage.setItem("duyetbot_active_thread_id", thread_id);
      }, 0);

      return { externalId: thread_id };
    },
    load: async (externalId) => {
      const state = await client.threads.getState<{
        messages: LangChainMessage[];
      }>(externalId);

      if (state.values.messages && state.values.messages.length > 0) {
        const firstMessage = state.values.messages[0];
        let title = "Conversation";
        if (firstMessage && typeof firstMessage === "object") {
          const content = (firstMessage as { content?: unknown }).content ?? "";
          if (content && typeof content === "string") {
            title = content.slice(0, 40) + (content.length > 40 ? "…" : "");
          }
        }

        setTimeout(() => {
          setThreads((prev) => {
            const threadIndex = prev.findIndex((t) => t.id === externalId);
            if (threadIndex > -1 && prev[threadIndex].title !== title) {
              const updated = [...prev];
              updated[threadIndex] = { ...updated[threadIndex], title };
              localStorage.setItem("duyetbot_threads", JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
        }, 0);
      }

      return {
        messages: state.values.messages || [],
        interrupts: state.tasks?.[0]?.interrupts || [],
      };
    },
  });

  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    localStorage.setItem("duyetbot_active_thread_id", id);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleNewChat = () => {
    setActiveThreadId(null);
    localStorage.removeItem("duyetbot_active_thread_id");
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = threads.filter((t) => t.id !== id);
    setThreads(updated);
    localStorage.setItem("duyetbot_threads", JSON.stringify(updated));

    if (activeThreadId === id) {
      setActiveThreadId(null);
      localStorage.removeItem("duyetbot_active_thread_id");
    }

    client.threads.delete(id).catch((err) => {
      console.warn("Could not delete thread on backend", err);
    });
  };

  return (
    <div className="flex flex-1 flex-row relative h-[calc(100vh-3.5rem-4rem)] min-h-[560px] max-w-6xl mx-auto w-full overflow-hidden">
      {/* Sidebar: borderless editorial column */}
      <aside
        className={`absolute md:relative z-20 h-full flex flex-col bg-[color:var(--background)] transition-[width,transform] duration-200 ease-out ${
          sidebarOpen
            ? "w-64 translate-x-0 border-r border-[color:var(--hairline)]"
            : "w-0 -translate-x-full md:w-0 border-r-0"
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <button
            type="button"
            onClick={handleNewChat}
            className="group inline-flex items-center gap-2 text-sm text-[color:var(--foreground)] transition-transform duration-150 ease-out hover:-translate-y-px"
          >
            <Plus className="size-4 text-[color:var(--muted-foreground)] transition-colors group-hover:text-[color:var(--accent)]" />
            <span className="underline-offset-4 group-hover:underline group-hover:decoration-[color:var(--accent)]">
              New conversation
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden ml-2 p-1.5 text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin space-y-4">
          {threads.length === 0 ? (
            <p className="px-3 py-6 text-xs italic text-[color:var(--muted-foreground)]">
              No conversations yet.
            </p>
          ) : (
            <div className="space-y-4">
              {grouped.today.length > 0 && (
                <div>
                  <h3 className="px-3 text-[10px] font-semibold tracking-wider text-[color:var(--muted-foreground)] uppercase mb-1.5 font-mono">
                    Today
                  </h3>
                  <ul className="flex flex-col">
                    {grouped.today.map((t) => renderThreadRow(t))}
                  </ul>
                </div>
              )}
              {grouped.yesterday.length > 0 && (
                <div>
                  <h3 className="px-3 text-[10px] font-semibold tracking-wider text-[color:var(--muted-foreground)] uppercase mb-1.5 font-mono">
                    Yesterday
                  </h3>
                  <ul className="flex flex-col">
                    {grouped.yesterday.map((t) => renderThreadRow(t))}
                  </ul>
                </div>
              )}
              {grouped.older.length > 0 && (
                <div>
                  <h3 className="px-3 text-[10px] font-semibold tracking-wider text-[color:var(--muted-foreground)] uppercase mb-1.5 font-mono">
                    Older
                  </h3>
                  <ul className="flex flex-col">
                    {grouped.older.map((t) => renderThreadRow(t))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main canvas */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Top-left sidebar toggle (no border, ghost) */}
        <div className="absolute top-3 left-3 z-10">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </button>
        </div>

        <div className="flex-1 h-full flex flex-col overflow-hidden">
          <AssistantRuntimeProvider
            key={activeThreadId || "new"}
            runtime={runtime as AssistantRuntime}
          >
            <Thread />
          </AssistantRuntimeProvider>
        </div>
      </div>
    </div>
  );
}
