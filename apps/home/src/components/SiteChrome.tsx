import {
  AppCommandPalette,
  Footer,
  Header,
} from "@duyet/components";
import { addUtmParams } from "../../app/lib/utm";

const navigationItems = [
  { name: "Home", href: "/" },
  {
    name: "Blog",
    href: addUtmParams("https://blog.duyet.net", "site_header", "blog"),
  },
  {
    name: "Experience",
    href: addUtmParams("https://cv.duyet.net", "site_header", "cv"),
  },
  { name: "About", href: "/about" },
];

const statusHref = addUtmParams(
  "https://status.duyet.net",
  "site_header",
  "status"
);

export function SiteHeader() {
  return (
    <Header
      shortText="Duyet Le"
      longText="Duyet Le"
      navigationItems={navigationItems}
      showAuthButtons={false}
      actions={
        <div className="hidden items-center gap-2 md:flex">
          <AppCommandPalette />
          <a
            href={statusHref}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-24 items-center justify-end gap-2 text-sm font-medium"
          >
            <span className="h-3 w-3 rounded-full bg-orange-500" />
            <span>Status</span>
          </a>
        </div>
      }
    />
  );
}

export function SiteFooter() {
  return <Footer />;
}
