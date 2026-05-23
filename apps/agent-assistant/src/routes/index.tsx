import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  type LangChainMessage,
  unstable_createLangGraphStream,
  useLangGraphRuntime,
} from "@assistant-ui/react-langgraph";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Thread } from "@/components/assistant-ui/thread";
import { createClient } from "@/lib/chatApi";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Trash2,
  MessageSquare,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: AssistantPage,
});

const ASSISTANT_ID = "agent";

interface SavedThread {
  id: string;
  title: string;
  updatedAt: string;
}

function AssistantPage() {
  const client = useMemo(() => createClient(), []);

  // State for active thread ID
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // State for thread history list
  const [threads, setThreads] = useState<SavedThread[]>([]);

  // Sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initialize state from local storage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedThreads = localStorage.getItem("duyetbot_threads");
      if (storedThreads) {
        try {
          const parsed = JSON.parse(storedThreads);
          setThreads(parsed);
        } catch (e) {
          console.error("Failed to parse threads", e);
        }
      }

      const storedActive = localStorage.getItem("duyetbot_active_thread_id");
      if (storedActive) {
        setActiveThreadId(storedActive);
      }

      // Auto-hide sidebar on small screens
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    }
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
        title: `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        updatedAt: now.toISOString(),
      };

      // Add to list and set active
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

      // Update thread title if first message exists
      if (state.values.messages && state.values.messages.length > 0) {
        const firstMessage = state.values.messages[0];
        let title = "Chat Thread";
        if (firstMessage && typeof firstMessage === "object") {
          const content = (firstMessage as any).content || "";
          if (content && typeof content === "string") {
            title = content.slice(0, 30) + (content.length > 30 ? "..." : "");
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
    if (window.innerWidth < 768) {
      setSidebarOpen(false); // Auto-hide sidebar on mobile after choosing
    }
  };

  const handleNewChat = () => {
    setActiveThreadId(null);
    localStorage.removeItem("duyetbot_active_thread_id");
    if (window.innerWidth < 768) {
      setSidebarOpen(false); // Close sidebar on mobile
    }
  };

  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Delete thread
    const updated = threads.filter((t) => t.id !== id);
    setThreads(updated);
    localStorage.setItem("duyetbot_threads", JSON.stringify(updated));

    if (activeThreadId === id) {
      setActiveThreadId(null);
      localStorage.removeItem("duyetbot_active_thread_id");
    }

    // Try deleting from backend (fire-and-forget or swallow error)
    client.threads.delete(id).catch((err) => {
      console.warn("Could not delete thread on backend", err);
    });
  };

  return (
    <div className="flex flex-1 flex-row relative h-[calc(100vh-140px)] min-h-[600px] max-w-full overflow-hidden border rounded-2xl bg-card text-card-foreground shadow-sm dark:border-zinc-800">
      {/* Sidebar */}
      <div
        className={`absolute md:relative z-20 h-full flex flex-col bg-zinc-50 border-r dark:bg-zinc-950 dark:border-zinc-800 transition-all duration-300 ${
          sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full md:w-0"
        } overflow-hidden`}
      >
        <div className="flex items-center justify-between p-3 border-b dark:border-zinc-800 shrink-0">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border bg-background hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full justify-start text-foreground cursor-pointer"
          >
            <Plus className="size-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden ml-2 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-muted-foreground cursor-pointer"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>

        {/* Thread History list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {threads.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-8">
              No chat history yet
            </div>
          ) : (
            threads.map((t) => {
              const isActive = activeThreadId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectThread(t.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors relative ${
                    isActive
                      ? "bg-zinc-200/60 dark:bg-zinc-800 text-foreground font-medium"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-6">
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground/75" />
                    <span className="truncate text-xs">{t.title}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteThread(t.id, e)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                    title="Delete chat"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
        {/* Top Navbar overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-lg border bg-background hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-foreground shadow-sm cursor-pointer"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          )}
        </div>

        {/* Floating panel toggle button inside sidebar open mode (on Desktop) */}
        {sidebarOpen && (
          <div className="absolute top-3 left-3 z-10 hidden md:block">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2.5 rounded-lg border bg-background hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-foreground shadow-sm cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </div>
        )}

        {/* Chat Widget Wrapper */}
        <div className="flex-1 h-full flex flex-col overflow-hidden">
          <AssistantRuntimeProvider key={activeThreadId || "new"} runtime={runtime}>
            <Thread />
          </AssistantRuntimeProvider>
        </div>
      </div>
    </div>
  );
}
