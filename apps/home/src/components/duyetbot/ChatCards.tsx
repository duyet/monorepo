import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Card } from "./chat-data";

function ChatCards({ cards }: { cards: Card[] }) {
  return (
    <div className="rd-chat-cards">
      {cards.map((c) => (
        <a
          key={c.t}
          className="rd-chat-card flex items-center gap-[10px] no-underline text-inherit"
          href={`https://blog.duyet.net`}
          target="_blank"
          rel="noreferrer"
        >
          <span
            className="grid place-items-center w-[30px] h-[30px] rounded-lg bg-[var(--rd-accent-bg)] text-[var(--rd-accent-ink)] shrink-0"
          >
            <BookOpen size={14} />
          </span>
          <span className="min-w-0 flex-1">
            <div className="rd-cc-t">{c.t}</div>
            <div className="rd-cc-m">
              {c.c} · {c.d} · {c.r}
            </div>
          </span>
          <span className="text-[var(--rd-text-4)] shrink-0">
            <ArrowUpRight size={14} />
          </span>
        </a>
      ))}
    </div>
  );
}

export { ChatCards };
