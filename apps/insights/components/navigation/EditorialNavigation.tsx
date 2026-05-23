"use client";

import { cn } from "@duyet/libs";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface NavItem {
  text: string;
  href: string;
}

const navItems: NavItem[] = [
  { text: "Overview", href: "/" },
  { text: "Blog", href: "/blog" },
  { text: "GitHub", href: "/github" },
  { text: "WakaTime", href: "/wakatime" },
  { text: "AI", href: "/ai" },
];

const externalItems: NavItem[] = [
  { text: "duyet.net", href: "https://duyet.net" },
  { text: "Blog", href: "https://blog.duyet.net" },
  { text: "CV", href: "https://cv.duyet.net" },
];

function basePath(path: string): string {
  const segments = path.split("/").filter(Boolean);
  return segments[0] ? `/${segments[0]}` : "/";
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || basePath(pathname) === href;
}

export function EditorialNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-14 w-full transition-colors",
        scrolled
          ? "border-b border-[color:var(--hairline)] bg-[color:var(--background)]/80 backdrop-blur-sm"
          : "bg-[color:var(--background)]"
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6 md:px-8">
        <Link
          to="/"
          className="font-serif text-base tracking-tight text-[color:var(--foreground)] transition-colors hover:text-[color:var(--accent)]"
        >
          <span className="italic">Insights</span>{" "}
          <span className="text-[color:var(--muted)]">/ duyet</span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] md:flex">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative transition-colors",
                  active
                    ? "text-[color:var(--foreground)]"
                    : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                )}
              >
                {item.text}
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-1 h-px bg-[color:var(--accent)]"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <nav className="hidden items-center gap-5 text-[12px] text-[color:var(--muted)] lg:flex">
          {externalItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer noopener"
              className="transition-colors hover:text-[color:var(--foreground)]"
            >
              {item.text}
            </a>
          ))}
        </nav>

        {/* Mobile in-page anchor scroll */}
        <nav className="flex items-center gap-4 text-[12px] md:hidden">
          {navItems.slice(0, 4).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "transition-colors",
                  active
                    ? "text-[color:var(--foreground)]"
                    : "text-[color:var(--muted)]"
                )}
              >
                {item.text}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
