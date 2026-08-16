import type { Lang } from "../lib/types";

export function LangToggle({
  lang,
  onChange,
  disabled,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center rounded-full border border-border text-xs font-semibold overflow-hidden ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      title={
        disabled
          ? lang === "vi"
            ? "Trang này chỉ có tiếng Anh"
            : "English only"
          : undefined
      }
    >
      {(["en", "vi"] as Lang[]).map((l) => (
        <button
          key={l}
          type="button"
          disabled={disabled}
          onClick={() => onChange(l)}
          className={`px-2.5 py-1 uppercase transition-colors ${
            disabled ? "cursor-not-allowed" : ""
          } ${
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
