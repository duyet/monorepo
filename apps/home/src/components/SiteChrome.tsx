import {
  AppCommandPalette,
  AppsDrawer,
} from "@duyet/components";
import Icons from "@duyet/components/Icons";
import { LayoutGrid, Sun, Moon, Mail } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { Button } from "./ui/button";

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

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="mx-auto flex h-14 max-w-[1040px] items-center gap-6 px-6 md:px-8">
          {/* Nav links */}
          <div className="flex items-center gap-1 flex-wrap flex-1">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              if (item.external) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.name}
                  </a>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="text-xs text-muted-foreground gap-1"
              aria-label="Open command palette"
            >
              <span>Search</span>
              <span className="hidden sm:inline-block text-[10px] font-mono border border-border rounded px-1 py-0.5">
                ⌘K
              </span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAppsOpen(true)}
              aria-label="Open apps menu"
              className="text-muted-foreground"
            >
              <LayoutGrid size={16} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="text-muted-foreground"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </Button>
          </div>
        </div>
      </nav>

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
    <footer className="mt-20 border-t py-10">
      <div className="mx-auto max-w-[1040px] px-6 md:px-8 flex flex-col gap-6 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-[13px]">
            <span>&copy; {year} Duyet Le.</span>
            <span className="text-border hidden sm:inline">|</span>
            <div className="flex flex-wrap items-center gap-x-4">
              {navigationItems.map((item) => {
                if (item.external) {
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      {item.name}
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://x.com/_duyet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="Twitter / X"
            >
              <Icons.Twitter className="w-[18px] h-[18px]" />
            </a>
            <a
              href="mailto:me@duyet.net"
              className="hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
            <a
              href="https://github.com/duyet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Icons.Github className="w-[18px] h-[18px]" />
            </a>
          </div>
        </div>

        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
          This site's codebase, look-and-feel, and deployment are managed by{" "}
          <Link
            to="/duyetbot"
            className="underline underline-offset-4 hover:text-foreground"
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
