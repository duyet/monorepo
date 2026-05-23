import { AppCommandPalette } from "@duyet/components";
import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const className =
    "nav-link inline-flex h-8 items-center text-sm text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)] focus-visible:outline-none focus-visible:text-[color:var(--foreground)]";

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        data-active={active ? "true" : "false"}
      >
        {item.name}
      </a>
    );
  }

  return (
    <Link
      to={item.href}
      className={className}
      data-active={active ? "true" : "false"}
    >
      {item.name}
    </Link>
  );
}

export function SiteHeader() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href.startsWith("http") || href.startsWith("mailto")) return false;
    if (href === "/") return location.pathname === "/";
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 h-14 w-full transition-[background-color,backdrop-filter] duration-200",
        scrolled
          ? "backdrop-blur-sm bg-[color:var(--background)]/80"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6 md:px-8">
        <Link
          to="/"
          className="text-sm font-medium tracking-tight text-[color:var(--foreground)] no-underline"
        >
          Duyet Le
        </Link>
        <nav
          aria-label="Primary"
          className="flex items-center gap-5 md:gap-7"
        >
          {navigationItems.map((item) => (
            <NavLink key={item.name} item={item} active={isActive(item.href)} />
          ))}
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="hidden text-sm text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)] md:inline-flex"
            aria-label="Open command palette"
          >
            ⌘K
          </button>
        </nav>
      </div>
      <AppCommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        hideDefaultTrigger
      />
    </header>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-[color:var(--hairline)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-[color:var(--muted)] md:flex-row md:items-center md:justify-between md:px-8">
        <p className="tabular-nums">
          © {year} Duyet Le · duyet.net
        </p>
        <small className="italic text-[color:var(--muted)]">
          This site is auto-driven and auto-designed by{" "}
          <a
            href="https://github.com/duyetbot"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-[color:var(--foreground)]"
          >
            duyetbot
          </a>
          .
        </small>
      </div>
    </footer>
  );
}
