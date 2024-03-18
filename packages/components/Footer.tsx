import Link from "next/link";
import { ReactNode, ReactElement } from "react";

import { cn } from "@duyet/libs/utils";
import Container from "./Container";
import ThemeToggle from "./ThemeToggle";
import Social from "./Social";

const BLOG_URL =
  process.env.NEXT_PUBLIC_DUYET_BLOG_URL || "https://blog.duyet.net";
const INSIGHTS_URL =
  process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || "https://insights.duyet.net";
const CV_URL = process.env.NEXT_PUBLIC_DUYET_CV_URL || "https://cv.duyet.net";

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const classes = cn(
    "text-sm text-[#666666] dark:text-[#888888]",
    "no-underline hover:text-gray-700",
    "hover:dark:text-white transition",
  );

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

function FooterHeader({ children }: { children: ReactNode }): ReactElement {
  return <h3 className="text-sm text-black dark:text-white">{children}</h3>;
}

const navigation = {
  general: [
    {
      name: "Rust Tiếng Việt (Book)",
      href: "https://rust-tieng-viet.github.io/?utm_source=blog&utm_medium=footer&utm_campaign=rust_tieng_viet",
    },
    { name: "pageview.js", href: "https://pageview.duyet.net" },
    { name: "/archives", href: `${BLOG_URL}/archives` },
    { name: "/insights", href: INSIGHTS_URL },
    { name: "/comments", href: `${BLOG_URL}/comments` },
  ],
  profile: [
    { name: "Linkedin", href: "https://linkedin.com/in/duyet" },
    { name: "Resume (PDF)", href: CV_URL },
    { name: "Projects", href: "https://github.com/duyet?tab=repositories" },
  ],
};

export function FooterContent(): ReactElement {
  return (
    <Container>
      <div aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="w-full py-8 mx-auto">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="grid grid-cols-1 gap-8 xl:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 md:gap-8">
                <div className="mt-12 md:!mt-0">
                  <FooterHeader>Resources</FooterHeader>
                  <ul role="list" className="mt-4 space-y-1.5 list-none ml-0">
                    {navigation.general.map((item) => (
                      <li key={item.name}>
                        <FooterLink href={item.href}>{item.name}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-12 md:!mt-0">
                  <FooterHeader>me@duyet.net</FooterHeader>
                  <div className="mt-4 text-sm text-gray-600 dark:text-[#888888]">
                    <Social />
                  </div>
                  <ul role="list" className="mt-4 space-y-1.5 list-none ml-0">
                    {navigation.profile.map((item) => (
                      <li key={item.name}>
                        <FooterLink href={item.href}>{item.name}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 sm:flex sm:items-center sm:justify-between">
            <div className="mt-5">
              <p className="mt-4 text-xs text-gray-500 dark:text-[#888888]">
                &copy; {new Date().getFullYear()} duyet.net | Data Engineer
              </p>
            </div>
            <div className="mt-5">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function Footer(): ReactElement {
  return (
    <footer className="bg-[#FAFAFA] pb-[env(safe-area-inset-bottom)] relative dark:bg-slate-900">
      <hr className="dark:border-neutral-700" />
      <div
        className={cn(
          "mx-auto max-w-[90rem] py-12 flex justify-center md:justify-center text-black dark:text-white",
          "pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)]",
        )}
      >
        <FooterContent />
      </div>
    </footer>
  );
}
