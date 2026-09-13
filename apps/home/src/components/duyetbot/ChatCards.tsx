import { ArrowUpRight, BookOpen } from "lucide-react";
import type { Card } from "./chat-data";

function ChatCards({ cards }: { cards: Card[] }) {
  return (
    <div className="flex flex-col gap-2">
      {cards.map((c) => (
        <a
          key={c.t}
          className="rounded-xl border border-[var(--rd-border)] flex items-center gap-[10px] no-underline text-inherit"
          href={`https://blog.duyet.net`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="grid place-items-center w-[30px] h-[30px] rounded-lg bg-[var(--rd-accent-bg)] text-[var(--rd-accent-ink)] shrink-0">
            <BookOpen size={14} />
          </span>
          <span className="min-w-0 flex-1">
            <div className="truncate text-[0.85rem] font-medium">{c.t}</div>
            <div className="text-[0.75rem] text-[var(--rd-text-3)]">
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
