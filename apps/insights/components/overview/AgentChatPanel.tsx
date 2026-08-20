import { Eyebrow } from "@duyet/components";
import type { ReactElement } from "react";
import type { InsightSuggestion } from "./suggestions";

const AGENTS_URL = "https://agents.duyet.net";

interface SuggestionsAndChatProps {
  suggestions: InsightSuggestion[];
}

export function SuggestionsAndChat({
  suggestions,
}: SuggestionsAndChatProps): ReactElement {
  return (
    <div className="rd-g2 mt-3">
      <div className="rd-card p-[clamp(22px,2.6vw,30px)]">
        <Eyebrow>Insights · suggestions</Eyebrow>
        <h3 className="mt-[10px] text-[1.35rem] tracking-[-0.03em]">
          What to look at
        </h3>
        {suggestions.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--rd-text-3)]">
            No strong deltas in the current 30-day window.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {suggestions.map((card) => (
              <li
                key={card.id}
                className="rounded-[10px] border border-[var(--rd-line)] bg-[var(--rd-bg-sub)] px-4 py-3"
              >
                <div className="font-medium">{card.title}</div>
                <p className="mt-1 text-sm text-[var(--rd-text-2)]">
                  {card.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rd-card p-[clamp(22px,2.6vw,30px)]">
        <Eyebrow>Agent</Eyebrow>
        <h3 className="mt-[10px] text-[1.35rem] tracking-[-0.03em]">
          Ask about these metrics
        </h3>
        <p className="mt-2 text-sm text-[var(--rd-text-2)]">
          Reuses the agents.duyet.net chat surface rather than a second stack.
          Prefill a question from a suggestion, or open a blank thread.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {suggestions.slice(0, 3).map((card) => (
            <a
              className="rd-ulink text-sm"
              href={`${AGENTS_URL}/?q=${encodeURIComponent(card.title)}`}
              key={card.id}
            >
              Ask: {card.title} →
            </a>
          ))}
          <a className="rd-ulink text-sm" href={AGENTS_URL}>
            Open agents.duyet.net →
          </a>
        </div>
      </div>
    </div>
  );
}
