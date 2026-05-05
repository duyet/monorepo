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
    <Header
      shortText="Duyet Le"
      longText="Duyet Le"
      navigationItems={navigationItems}
      showAuthButtons
      authButtonsWrapWithProvider={false}
      actions={<AppCommandPalette />}
    />
  );
}

export function SiteFooter() {
  return <Footer />;
}
