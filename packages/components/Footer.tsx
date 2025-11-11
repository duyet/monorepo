import Link from "next/link";
import { ReactNode, ReactElement } from "react";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls, createNavigation } from "@duyet/urls";

import { cn } from "@duyet/libs/utils";
import Container from "./Container";
import ThemeToggle from "./ThemeToggle";
import Social from "./Social";
import Logo from "./Logo";

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const classes = cn(
    "text-sm text-[#666666] dark:text-[#888888]",
    "no-underline hover:text-gray-700",
    "dark:hover:text-white transition",
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

function FooterHeader({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm text-black dark:text-white font-bold">{children}</h3>
  );
}

/**
 * Create footer navigation from URLs and profile configuration
 */
function createFooterNavigation(urls: UrlsConfig, profile: Profile) {
  return {
    general: [
      urls.external.rust && {
        name: "Rust Tiếng Việt",
        href: `${urls.external.rust}?utm_source=blog&utm_medium=footer&utm_campaign=rust_tieng_viet`,
      },
      { name: "/ai", href: `${urls.apps.blog}/ai` },
      { name: "/archives", href: `${urls.apps.blog}/archives` },
      { name: "/series", href: `${urls.apps.blog}/series` },
      { name: "/tags", href: `${urls.apps.blog}/tags` },
    ].filter(Boolean) as Array<{ name: string; href: string }>,
    profile: [
      { name: "About", href: `${urls.apps.home}/about` },
      profile.social.linkedin && {
        name: "LinkedIn",
        href: profile.social.linkedin,
      },
      { name: "Resume", href: urls.apps.cv },
      profile.social.github && {
        name: "Projects",
        href: `${profile.social.github}?tab=repositories`,
      },
    ].filter(Boolean) as Array<{ name: string; href: string }>,
  };
}

export interface FooterContentProps {
  profile?: Profile;
  urls?: UrlsConfig;
}

export function FooterContent({
  profile = duyetProfile,
  urls = duyetUrls,
}: FooterContentProps = {}) {
  const navigation = createFooterNavigation(urls, profile);
  return (
    <Container>
      <div aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="w-full py-8 mx-auto">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="grid grid-cols-1 gap-8 xl:col-span-2">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 md:gap-8">
                <div className="mt-6 md:mt-0">
                  <Logo className="p-0" />
                </div>

                <div className="mt-6 sm:mt-12 md:mt-0">
                  <FooterHeader>Resources</FooterHeader>
                  <ul role="list" className="mt-4 space-y-1.5 list-none ml-0">
                    {navigation.general.map((item) => (
                      <li key={item.name}>
                        <FooterLink href={item.href}>{item.name}</FooterLink>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 sm:mt-12 md:mt-0">
                  <FooterHeader>{profile.personal.email}</FooterHeader>
                  <div className="mt-4 text-sm text-gray-600 dark:text-[#888888]">
                    <Social profile={profile} />
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
                &copy; {new Date().getFullYear()}{" "}
                {urls.apps.home.replace(/^https?:\/\//, "")} |{" "}
                {profile.personal.title}
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

export interface FooterProps {
  /** Profile configuration (defaults to duyetProfile) */
  profile?: Profile;
  /** URLs configuration (defaults to duyetUrls) */
  urls?: UrlsConfig;
  /** Optional CSS classes */
  className?: string;
  /** Container CSS classes */
  containerClassName?: string;
}

/**
 * Footer component with navigation, social links, and branding
 *
 * Accepts profile and URL configuration to display personalized content.
 * Falls back to Duyet's profile if none provided.
 *
 * @example
 * ```tsx
 * import { Footer } from '@duyet/components'
 * import { duyetProfile } from '@duyet/profile'
 * import { duyetUrls } from '@duyet/urls'
 *
 * <Footer profile={duyetProfile} urls={duyetUrls} />
 * ```
 */
export default function Footer({
  profile = duyetProfile,
  urls = duyetUrls,
  className,
  containerClassName,
}: FooterProps): ReactElement {
  return (
    <footer
      className={cn(
        "bg-[#FAFAFA] pb-[env(safe-area-inset-bottom)] relative dark:bg-slate-900",
        className,
      )}
    >
      <hr className="dark:border-neutral-700" />
      <div
        className={cn(
          "mx-auto max-w-[90rem] py-12 flex justify-center md:justify-center text-black dark:text-white",
          "pl-[max(env(safe-area-inset-left),1.5rem)] pr-[max(env(safe-area-inset-right),1.5rem)]",
          containerClassName,
        )}
      >
        <FooterContent profile={profile} urls={urls} />
      </div>
    </footer>
  );
}
