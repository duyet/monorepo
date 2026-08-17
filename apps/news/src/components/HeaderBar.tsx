import { AuthButtons, ErrorBoundary } from "@duyet/components";
import { Link, useRouterState } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useClerkModule } from "../lib/clerk-user";
import type { Lang } from "../lib/types";
import { LangToggle } from "./LangToggle";
import { PrefsPanel } from "./PrefsPanel";
import { SearchBox } from "./SearchBox";

// Routes whose content is English-only — the EN|VI toggle is disabled
// while on one of these, rather than offering a translation that doesn't
// exist.
const LANG_TOGGLE_DISABLED_PATHS = new Set(["/system", "/about"]);

export function HeaderBar({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // The single app-wide <ClerkProvider> lives in __root.tsx; hand AuthButtons
  // that exact module so it never renders Clerk primitives before the
  // provider is mounted.
  const { mod: clerkModule } = useClerkModule();
  const langToggleDisabled = LANG_TOGGLE_DISABLED_PATHS.has(pathname);
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-1.5 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="w-full shrink-0 text-sm font-medium leading-snug text-muted-foreground hover:text-foreground sm:w-auto md:text-base"
        >
          {lang === "vi" ? (
            "Hôm nay AI có gì mới?"
          ) : (
            <>
              What is happening
              <br className="sm:hidden" />
              {" in AI today?"}
            </>
          )}
        </Link>
        <div className="flex-1" />
        <div className="hidden flex-1 justify-center sm:flex">
          <SearchBox
            placeholder={lang === "vi" ? "Tìm kiếm..." : "Search AI news..."}
            lang={lang}
          />
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to="/submit"
            className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground hover:border-accent hover:text-accent"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            {lang === "vi" ? "Gửi bài" : "Submit"}
          </Link>
          <PrefsPanel />
          <LangToggle
            lang={lang}
            onChange={onLangChange}
            disabled={langToggleDisabled}
          />
          <ErrorBoundary fallback={null}>
            <AuthButtons
              wrapWithProvider={false}
              clerkModule={clerkModule}
              signInClassName="h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              avatarSize="h-6 w-6"
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
