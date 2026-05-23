import { AppCommandPalette, SiteNav, siteNavLinkClassName } from "@duyet/components";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
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

export function SiteHeader() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href.startsWith("http") || href.startsWith("mailto")) return false;
    if (href === "/") return location.pathname === "/";
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const brandSlot = (
    <Link
      to="/"
      className="text-sm font-medium tracking-tight text-[color:var(--foreground)] no-underline hover:opacity-80 transition-opacity"
    >
      Duyet Le
    </Link>
  );

  const linksSlot = (
    <>
      {navigationItems.map((item) => {
        const active = isActive(item.href);
        if (item.external) {
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={siteNavLinkClassName(active)}
            >
              {item.name}
            </a>
          );
        }
        return (
          <Link
            key={item.name}
            to={item.href}
            className={siteNavLinkClassName(active)}
          >
            {item.name}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className={`${siteNavLinkClassName(false)} flex items-center gap-1.5 cursor-pointer`}
        aria-label="Open command palette"
      >
        <span>Search</span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-[color:var(--editorial-faint)] border border-[color:var(--editorial-hairline)] font-mono text-[color:var(--editorial-muted)] select-none">
          ⌘K
        </span>
      </button>
    </>
  );

  return (
    <>
      <SiteNav
        brand={brandSlot}
        links={linksSlot}
        onMobileMenuClick={() => setPaletteOpen(true)}
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
    <footer className="mt-24 border-t border-[color:var(--hairline)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-[color:var(--muted)] md:flex-row md:items-center md:justify-between md:px-8">
        <p className="tabular-nums text-[color:var(--muted)]">
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
