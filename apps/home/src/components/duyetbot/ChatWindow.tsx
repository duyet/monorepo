import { ArrowRight, Bot, Plug, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatCards } from "./ChatCards";
import { ContactCard } from "./ContactCard";
import type { Msg } from "./chat-data";
import { answerFor, STARTER_PROMPTS } from "./chat-data";

function ChatWindow() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "bot",
      text: "Ask me anything about Duyet — work, writing, the stack, or what's running right now.",
      follow: STARTER_PROMPTS,
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{ name: string; arg: string } | null>(
    null
  );
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, busy]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const resp = answerFor(q);
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    setPending(resp.tool ?? null);
    const delay = resp.tool ? 1100 : 700;
    setTimeout(() => {
      setMsgs((m) => [...m, { role: "bot", ...resp }]);
      setBusy(false);
      setPending(null);
    }, delay);
  };

  return (
    <div className="flex min-h-0 flex-col">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-[var(--rd-border)] px-3 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--rd-bg-sub)]">
          <Bot size={22} />
          <span className="sr-only">live</span>
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[0.9rem] font-medium">
            duyetbot{" "}
            <span className="rounded-full border border-[var(--rd-border)] px-2 py-0.5 font-[var(--font-mono)] text-[9.5px]">
              beta
            </span>
          </div>
          <div className="text-[0.7rem] text-[var(--rd-text-3)]">
            claude-sonnet · via AnyRouter
          </div>
        </div>
        <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px] ml-auto inline-flex items-center gap-[6px]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> online
        </span>
      </div>

      {/* message thread */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3" ref={bodyRef}>
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`mb-3 flex gap-2 ${m.role === "bot" ? "" : "flex-row-reverse"}`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--rd-bg-sub)] text-[0.7rem]">
              {m.role === "bot" ? (
                <Bot size={16} />
              ) : (
                <span className="text-[12px] font-semibold">You</span>
              )}
            </span>
            <div className="min-w-0">
              <div className="rounded-2xl bg-[var(--rd-bg-sub)] px-3 py-2 text-[0.875rem] leading-[1.5]">
                {"tool" in m && m.tool && (
                  <div className="mb-1 inline-flex items-center gap-1 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--rd-text-3)]">
                    <Plug size={12} /> {m.tool.name}
                    {m.tool.arg ? `(${m.tool.arg})` : "()"}
                  </div>
                )}
                <div>{m.text}</div>
                {"cards" in m && m.cards && <ChatCards cards={m.cards} />}
                {"contact" in m && m.contact && <ContactCard />}
              </div>
              {"follow" in m && m.follow && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.follow.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--rd-border)] px-2.5 py-1 text-[0.75rem]"
                      onClick={() => send(f)}
                    >
                      {f}{" "}
                      <span>
                        <ArrowRight size={12} />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* typing indicator */}
        {busy && (
          <div className="mb-3 flex gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--rd-bg-sub)]">
              <Bot size={16} />
            </span>
            <div className="rounded-2xl bg-[var(--rd-bg-sub)] px-3 py-2 text-[0.875rem]">
              {pending && (
                <div className="mb-1 font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--rd-text-3)]">
                  {pending.name}
                  {pending.arg ? `(${pending.arg})` : "()"}
                </div>
              )}
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--rd-text-3)]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--rd-text-3)]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--rd-text-3)]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <div className="flex gap-2 border-t border-[var(--rd-border)] p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about Duyet's work, writing, or stack…"
        />
        <button
          className="grid h-10 w-10 place-items-center rounded-full bg-[var(--rd-text)] text-[var(--rd-bg)]"
          onClick={() => send(input)}
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export { ChatWindow };
