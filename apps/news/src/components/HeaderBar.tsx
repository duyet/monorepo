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
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="shrink-0 text-sm text-muted-foreground hover:text-foreground"
        >
          {tagline}
        </Link>
        <div className="flex-1" />
        <div className="hidden flex-1 justify-center sm:flex">
          <SearchBox
            placeholder={lang === "vi" ? "Tìm kiếm..." : "Search AI news..."}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/submit"
            className="rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:border-accent hover:text-accent"
          >
            {lang === "vi" ? "+ Gửi bài" : "+ Submit"}
          </Link>
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
