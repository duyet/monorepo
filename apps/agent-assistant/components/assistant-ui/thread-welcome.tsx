import { SuggestionPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { Code, Compass, FileText, Sparkle } from "@phosphor-icons/react";
import { type FC, useState } from "react";

/**
 * The empty-thread state: a greeting and a set of clickable suggestions.
 *
 * Shown only while `s.thread.isEmpty`, so the whole file is unreachable once a
 * conversation starts.
 */

const getSuggestionIcon = (title: string) => {
  const t = title.toLowerCase();
  if (
    t.includes("code") ||
    t.includes("refactor") ||
    t.includes("write") ||
    t.includes("lint")
  ) {
    return <Code className="size-4 text-[color:var(--accent)]" />;
  }
  if (
    t.includes("audit") ||
    t.includes("explain") ||
    t.includes("readme") ||
    t.includes("document")
  ) {
    return <FileText className="size-4 text-[color:var(--accent)]" />;
  }
  if (t.includes("explore") || t.includes("search") || t.includes("find")) {
    return <Compass className="size-4 text-[color:var(--accent)]" />;
  }
  return <Sparkle className="size-4 text-[color:var(--accent)]" />;
};

export const ThreadWelcome: FC = () => {
  return (
    <div className="aui-thread-welcome-root flex flex-col justify-center items-start py-12 md:py-16 px-4 md:px-6 max-w-xl mx-auto w-full">
      <header className="fade-slide-up flex flex-col items-start text-left">
        <div className="text-[10px] uppercase tracking-widest font-mono text-[color:var(--accent)] mb-2 font-semibold">
          duyetbot v2
        </div>
        <h1
          className="font-serif text-4xl md:text-5xl tracking-tight text-[color:var(--foreground)] font-light leading-none"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Hello, Duyet.
        </h1>
        <p className="mt-3.5 text-xs text-[color:var(--muted-foreground)] max-w-md leading-relaxed font-sans">
          Your stateful personal engineering companion. Run codebase audits,
          sync metrics, and debug workflows in a clean, quiet, high-performance
          sandbox.
        </p>
      </header>

      <div className="w-full mt-10">
        <h2 className="text-[9px] uppercase tracking-wider font-mono text-[color:var(--muted-foreground)] mb-3 font-semibold">
          Suggested Actions
        </h2>
        <ThreadSuggestions />
      </div>
    </div>
  );
};

export const ThreadSuggestions: FC = () => {
  return (
    <div className="aui-thread-welcome-suggestions flex flex-col sm:flex-row sm:flex-wrap gap-3 pb-4 w-full">
      <ThreadPrimitive.Suggestions>
        {() => <ThreadSuggestionItem />}
      </ThreadPrimitive.Suggestions>
    </div>
  );
};

const ThreadSuggestionItem: FC = () => {
  const [title, setTitle] = useState("");
  return (
    <div className="aui-thread-welcome-suggestion-display fade-slide-up w-full sm:w-[calc(50%-0.375rem)]">
      <SuggestionPrimitive.Trigger send asChild>
        <button
          type="button"
          className="w-full text-left p-3.5 rounded-lg border border-[color:var(--hairline)] bg-[color:var(--background)] hover:border-[color:var(--accent)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs flex flex-col gap-2 group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            {getSuggestionIcon(title)}
            <SuggestionPrimitive.Title
              className="font-sans font-medium text-xs text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition-colors"
              ref={(el) => {
                if (el?.textContent && el.textContent !== title) {
                  setTitle(el.textContent);
                }
              }}
            />
          </div>
          <SuggestionPrimitive.Description className="font-sans text-[10px] text-[color:var(--muted-foreground)] leading-snug empty:hidden line-clamp-2" />
        </button>
      </SuggestionPrimitive.Trigger>
    </div>
  );
};
