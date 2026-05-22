import { AppCommandPalette, Footer, Header } from "@duyet/components";
import { useState } from "react";
import { addUtmParams } from "../../app/lib/utm";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  {
    name: "Blog",
    href: addUtmParams("https://blog.duyet.net", "site_header", "blog"),
  },
  {
    name: "CV",
    href: addUtmParams("https://cv.duyet.net", "site_header", "cv"),
  },
  { name: "About", href: "/about" },
  {
    name: "Contact",
    href: "mailto:me@duyet.net",
  },
];

export function SiteHeader() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50">
      <Header
        shortText="Duyet Le"
        longText="Duyet Le"
        navigationItems={navigationItems}
        homeUrl="/"
        showAuthButtons
        authButtonsWrapWithProvider={false}
        onMobileMenuClick={() => setPaletteOpen(true)}
        className="border-none bg-[var(--background)]/95 backdrop-blur-sm h-16"
        containerClassName="max-w-[1200px]"
      />
      <div className="h-px w-full bg-[var(--hairline)]" />
      <AppCommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        hideDefaultTrigger
      />
    </div>
  );
}


export function SiteFooter() {
  return <Footer />;
}
