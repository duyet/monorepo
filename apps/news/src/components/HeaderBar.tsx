import { AuthButtons } from "@duyet/components";
import { Link } from "@tanstack/react-router";
import type { Lang } from "../lib/types";
import { LangToggle } from "./LangToggle";
import { PrefsPanel } from "./PrefsPanel";
import { SearchBox } from "./SearchBox";

export function HeaderBar({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}) {
  const tagline =
    lang === "vi" ? "Hôm nay AI có gì mới?" : "What is happening in AI today?";

  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1040px] flex-wrap items-center gap-4 px-4 py-4 md:px-6">
        <Link to="/" className="flex shrink-0 items-baseline gap-2">
          <span className="font-serif text-2xl italic tracking-tight text-foreground">
            AI News
          </span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {tagline}
          </span>
        </Link>
        <div className="flex-1" />
        <div className="hidden flex-1 justify-center sm:flex">
          <SearchBox
            placeholder={lang === "vi" ? "Tìm kiếm..." : "Search AI news..."}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PrefsPanel />
          <LangToggle lang={lang} onChange={onLangChange} />
          <AuthButtons
            signInClassName="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            avatarSize="h-7 w-7"
          />
        </div>
      </div>
    </div>
  );
}
