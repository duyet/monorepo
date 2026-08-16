import type { Lang } from "../lib/types";

export function LangToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-border text-xs font-semibold overflow-hidden">
      {(["en", "vi"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`px-2.5 py-1 uppercase transition-colors ${
            lang === l
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted"
          }`}
          aria-pressed={lang === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
