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
    <div className="rd-chat-window">
      {/* header */}
      <div className="rd-chat-head">
        <span className="rd-chat-avatar">
          <Bot size={22} />
          <span className="rd-live-ping" />
        </span>
        <div className="min-w-0">
          <div className="rd-ch-name">
            duyetbot{" "}
            <span className="rd-chip font-[var(--font-mono)] text-[9.5px]">
              beta
            </span>
          </div>
          <div className="rd-ch-model">claude-sonnet · via AnyRouter</div>
        </div>
        <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11.5px] ml-auto inline-flex items-center gap-[6px]">
          <span className="rd-dot rd-ok rd-pulse" /> online
        </span>
      </div>

      {/* message thread */}
      <div className="rd-chat-body" ref={bodyRef}>
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`rd-msg ${m.role === "bot" ? "rd-bot" : "rd-user"}`}
          >
            <span className="rd-msg-ic">
              {m.role === "bot" ? (
                <Bot size={16} />
              ) : (
                <span className="text-[12px] font-semibold">You</span>
              )}
            </span>
            <div className="min-w-0">
              <div className="rd-msg-bubble">
                {"tool" in m && m.tool && (
                  <div className="rd-tool-call">
                    <Plug size={12} /> {m.tool.name}
                    {m.tool.arg ? `(${m.tool.arg})` : "()"}
                  </div>
                )}
                <div>{m.text}</div>
                {"cards" in m && m.cards && <ChatCards cards={m.cards} />}
                {"contact" in m && m.contact && <ContactCard />}
              </div>
              {"follow" in m && m.follow && (
                <div className="rd-follow-row">
                  {m.follow.map((f) => (
                    <button
                      key={f}
                      className="rd-follow-chip"
                      onClick={() => send(f)}
                    >
                      {f}{" "}
                      <span className="rd-fc-arr">
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
          <div className="rd-msg rd-bot">
            <span className="rd-msg-ic">
              <Bot size={16} />
            </span>
            <div className="rd-msg-bubble">
              {pending && (
                <div className="rd-tool-call">
                  <span className="rd-tc-spin" /> {pending.name}
                  {pending.arg ? `(${pending.arg})` : "()"}
                </div>
              )}
              <div className="rd-typing">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* input */}
      <div className="rd-chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Ask about Duyet's work, writing, or stack…"
        />
        <button
          className="rd-chat-send"
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
