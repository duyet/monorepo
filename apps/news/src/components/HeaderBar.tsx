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
      className="rounded-full p-1.5 text-black/70 hover:bg-black/10"
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
    <header className="bg-brand">
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-black text-sm font-bold text-brand">
            AI
          </span>
          <span className="text-lg font-bold tracking-tight text-black">
            AI News
          </span>
        </Link>
        <span className="hidden shrink-0 border-l border-black/20 pl-4 text-sm text-black/80 md:block">
          {tagline}
        </span>
        <div className="flex-1" />
        <div className="hidden flex-1 justify-center sm:flex">
          <SearchBox
            placeholder={lang === "vi" ? "Tìm tin AI..." : "Search AI news..."}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <a
            href="https://duyet.net"
            className="hidden text-sm font-semibold text-black/80 hover:text-black md:block"
          >
            duyet.net
          </a>
          <LangToggle lang={lang} onChange={onLangChange} />
          <DarkToggle />
        </div>
      </div>
    </header>
  );
}
