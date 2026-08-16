import { AuthButtons } from "@duyet/components";
import { Link } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { Lang } from "../lib/types";
import { LangToggle } from "./LangToggle";
import { SearchBox } from "./SearchBox";

function DarkToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        try {
          localStorage.setItem("theme", next ? "dark" : "light");
        } catch {
          // ignore
        }
      }}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

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
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-sm font-bold text-foreground">
            AI
          </span>
          <span className="font-serif text-lg font-semibold italic tracking-tight text-foreground">
            AI News
          </span>
        </Link>
        <span className="hidden shrink-0 border-l border-border pl-4 text-sm text-muted-foreground md:block">
          {tagline}
        </span>
        <div className="flex-1" />
        <div className="hidden flex-1 justify-center sm:flex">
          <SearchBox
            placeholder={lang === "vi" ? "Tìm kiếm..." : "Search AI news..."}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LangToggle lang={lang} onChange={onLangChange} />
          <DarkToggle />
          <AuthButtons
            signInClassName="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            avatarSize="h-7 w-7"
          />
        </div>
      </div>
    </header>
  );
}
