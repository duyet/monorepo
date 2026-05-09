import { AppCommandPalette, Footer, Header } from "@duyet/components";
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
];

export function SiteHeader() {
  return (
    <div className="sticky top-0 z-50">
      <Header
        shortText="Duyet Le"
        longText="Duyet Le"
        navigationItems={navigationItems}
        showAuthButtons
        authButtonsWrapWithProvider={false}
        actions={<AppCommandPalette />}
        className="border-none bg-[var(--background)]/80 backdrop-blur-md py-2"
        containerClassName="max-w-[1200px]"
      />
      {/* Visual divider matching Claude's hairline */}
      <div className="h-px w-full bg-[var(--hairline)] opacity-50" />
    </div>
  );
}


export function SiteFooter() {
  return <Footer />;
}

