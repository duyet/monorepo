import { AuthButtons, ErrorBoundary } from "@duyet/components";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Moon, Plus, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
  COMPACT_CHROME_CLASS,
  PHONE_PREFS_TRIGGER_CLASS,
  PHONE_TAP_TARGET_CLASS,
  WIDE_HEADER_ROW_CLASS,
} from "../lib/chrome";
import { useClerkModule } from "../lib/clerk-user";
import type { Lang } from "../lib/types";
import { LangToggle } from "./LangToggle";
import { PrefsPanel } from "./PrefsPanel";
import { SearchBox } from "./SearchBox";

// Routes whose content is English-only — the EN|VI toggle is disabled
// while on one of these, rather than offering a translation that doesn't
// exist.
const LANG_TOGGLE_DISABLED_PATHS = new Set(["/system", "/about", "/mail"]);

const SITE_LINKS = [
  { href: "/", label: "News", internal: true },
  { href: "/about", label: "About", internal: true },
  { href: "/mcp", label: "MCP", internal: true },
  { href: "/subscribe", label: "Subscribe", internal: true },
  { href: "/system", label: "Analytics", internal: true },
  { href: "/submit", label: "Submit", internal: true },
  { href: "https://duyet.net", label: "Home", internal: false },
  { href: "https://blog.duyet.net", label: "Blog", internal: false },
] as const;

function PhoneThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={`${PHONE_TAP_TARGET_CLASS} rounded-md text-muted-foreground hover:bg-muted hover:text-foreground`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden />
      ) : (
        <Moon className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}

function PhoneMenu({
  lang,
  onLangChange,
  langToggleDisabled,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  langToggleDisabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { mod: clerkModule } = useClerkModule();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={`${PHONE_TAP_TARGET_CLASS} rounded-md text-muted-foreground hover:bg-muted hover:text-foreground`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-border bg-background p-2 shadow-lg"
        >
          <div className="flex h-11 items-center justify-between px-2">
            <span className="text-xs text-muted-foreground">
              {lang === "vi" ? "Ngôn ngữ" : "Language"}
            </span>
            <LangToggle
              lang={lang}
              onChange={onLangChange}
              disabled={langToggleDisabled}
              buttonClassName="min-h-[44px] min-w-[44px] px-3"
            />
          </div>
          {SITE_LINKS.map((link) =>
            link.internal ? (
              <Link
                key={link.href}
                to={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex h-11 items-center rounded-md px-3 text-sm hover:bg-muted"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex h-11 items-center rounded-md px-3 text-sm hover:bg-muted"
              >
                {link.label}
              </a>
            )
          )}
          <div className="mt-1 flex h-11 items-center justify-between border-t border-border px-2 pt-1">
            <ErrorBoundary fallback={null}>
              <AuthButtons
                wrapWithProvider={false}
                clerkModule={clerkModule}
                signInClassName={`${PHONE_TAP_TARGET_CLASS} rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors`}
                avatarSize="h-11 w-11"
              />
            </ErrorBoundary>
          </div>
        </div>
      )}
    </div>
  );
}

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
  const searchPlaceholder = lang === "vi" ? "Tìm kiếm..." : "Search AI news...";

  return (
    <div className="border-b border-border bg-background">
      <div
        className={`${WIDE_HEADER_ROW_CLASS} mx-auto max-w-[1080px] flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-1.5 sm:px-6 lg:px-8`}
      >
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
        <div className="flex flex-1 justify-center">
          <SearchBox placeholder={searchPlaceholder} lang={lang} />
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

      <div
        className={`${COMPACT_CHROME_CLASS} mx-auto max-w-[1080px] items-center gap-1 px-3 py-1`}
      >
        <div className="min-w-0 flex-1">
          <SearchBox placeholder={searchPlaceholder} lang={lang} compact />
        </div>
        <PrefsPanel triggerClassName={PHONE_PREFS_TRIGGER_CLASS} />
        <PhoneThemeButton />
        <PhoneMenu
          lang={lang}
          onLangChange={onLangChange}
          langToggleDisabled={langToggleDisabled}
        />
      </div>
    </div>
  );
}
