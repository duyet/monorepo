import {
  AppCommandPalette,
  AppsDrawer,
  SiteNav,
} from "@duyet/components";
import Icons from "@duyet/components/Icons";
import { LayoutGrid, Sun, Moon, Mail } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { addUtmParams } from "../../app/lib/utm";

type NavItem = { name: string; href: string; external?: boolean };

const navigationItems: NavItem[] = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "About", href: "/about" },
  {
    name: "Blog",
    href: addUtmParams("https://blog.duyet.net", "site_header", "blog"),
    external: true,
  },
  {
    name: "CV",
    href: addUtmParams("https://cv.duyet.net", "site_header", "cv"),
    external: true,
  },
  {
    name: "Insights",
    href: addUtmParams(
      "https://insights.duyet.net",
      "site_header",
      "insights",
    ),
    external: true,
  },
  {
    name: "Agent",
    href: addUtmParams(
      "https://agents.duyet.net",
      "site_header",
      "agent",
    ),
    external: true,
  },
];

export function SiteHeader() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const location = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sync theme with the DOM class on mount to prevent SSR/Hydration mismatches
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const isActive = (href: string) => {
    if (href.startsWith("http") || href.startsWith("mailto")) return false;
    if (href === "/") return location.pathname === "/";
    return (
      location.pathname === href || location.pathname.startsWith(`${href}/`)
    );
  };

  // Render navigation links in the brand slot so they align left
  const brandSlot = (
    <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
      {navigationItems.map((item) => {
        const active = isActive(item.href);
        const linkClass = `text-[14px] font-normal transition-colors duration-200 cursor-pointer ${
          active
            ? "text-[color:var(--foreground)] font-medium"
            : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
        }`;

        if (item.external) {
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {item.name}
            </a>
          );
        }
        return (
          <Link
            key={item.name}
            to={item.href}
            className={linkClass}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  // Render triggers (Search, AppsDrawer, Moon/Sun toggle) in the links slot (right aligned)
  const linksSlot = (
    <div className="flex items-center gap-3 md:gap-4 ml-auto">
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="text-xs font-mono uppercase tracking-widest text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-all cursor-pointer flex items-center gap-1"
        aria-label="Open command palette"
      >
        <span>Search</span>
        <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded border border-[color:var(--hairline)] font-mono text-[color:var(--subtle)] select-none">
          ⌘K
        </span>
      </button>

      <button
        type="button"
        onClick={() => setAppsOpen(true)}
        className="text-[14px] font-normal text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors cursor-pointer flex items-center"
        aria-label="Open apps menu"
      >
        <LayoutGrid size={18} />
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className="text-[color:var(--muted)] hover:text-[color:var(--foreground)] transition-colors cursor-pointer flex items-center justify-center p-1 rounded-full hover:bg-[color:var(--faint)]"
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon size={18} />
        ) : (
          <Sun size={18} />
        )}
      </button>
    </div>
  );

  return (
    <>
      <SiteNav
        brand={brandSlot}
        links={linksSlot}
        onMobileMenuClick={() => setAppsOpen(true)}
      />
      <AppsDrawer
        isOpen={appsOpen}
        onClose={() => setAppsOpen(false)}
        activeApp="home"
      />
      <AppCommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        hideDefaultTrigger
      />
    </>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-[color:var(--hairline)] py-10">
      <div className="mx-auto max-w-[1040px] px-6 md:px-8 flex flex-col gap-6 text-sm text-[color:var(--muted)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-normal text-xs sm:text-[13px]">
          <span>&copy; {year} Duyet Le.</span>
          <span className="text-[color:var(--hairline)] hidden sm:inline">|</span>
          <div className="flex flex-wrap items-center gap-x-4">
            {navigationItems.map((item) => {
              if (item.external) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[color:var(--foreground)] transition-colors"
                  >
                    {item.name}
                  </a>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="hover:text-[color:var(--foreground)] transition-colors"
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Aligned Social Icons on the Right */}
        <div className="flex items-center gap-4 text-[color:var(--muted)]">
          <a
            href="https://x.com/_duyet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[color:var(--foreground)] transition-colors"
            aria-label="Twitter / X"
          >
            <Icons.Twitter className="w-[18px] h-[18px]" />
          </a>
          <a
            href="mailto:me@duyet.net"
            className="hover:text-[color:var(--foreground)] transition-colors"
            aria-label="Email"
          >
            <Mail size={18} />
          </a>
          <a
            href="https://github.com/duyet"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[color:var(--foreground)] transition-colors"
            aria-label="GitHub"
          >
            <Icons.Github className="w-[18px] h-[18px]" />
          </a>
        </div>
        </div>

        <p className="max-w-2xl text-xs leading-relaxed text-[color:var(--subtle)]">
          This site's codebase, look-and-feel, and deployment are managed by{" "}
          <Link
            to="/duyetbot"
            className="underline underline-offset-4 hover:text-[color:var(--foreground)]"
          >
            duyetbot
          </Link>
          , an autonomous agent — layout and copy are subject to change at
          any time without notice. Editorial content on the blog is written
          by Duyet Le.
        </p>
      </div>
    </footer>
  );
}
