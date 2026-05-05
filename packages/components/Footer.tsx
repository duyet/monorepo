import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import { Link } from "@tanstack/react-router";
import type { ReactElement, ReactNode } from "react";
import Container from "./Container";
import Logo from "./Logo";
import Social from "./Social";
import ThemeToggle from "./ThemeToggle";

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const classes = cn(
    "text-sm text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70",
    "no-underline transition-colors hover:text-[#1a1a1a] dark:hover:text-[#f8f8f2]"
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
    <Link to={href} className={classes}>
      {children}
    </Link>
  );
}

function FooterHeader({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
      {children}
    </h3>
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
      { name: "/archives", href: `${urls.apps.blog}/archives` },
      { name: "/series", href: `${urls.apps.blog}/series` },
      { name: "/tags", href: `${urls.apps.blog}/tags` },
      { name: "Status", href: "https://status.duyet.net" },
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
  const localDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return (
    <Container>
      <div aria-labelledby="footer-heading">
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>

        <div className="grid gap-12 border-t border-[#1a1a1a]/10 py-10 dark:border-white/10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)] md:gap-14 md:py-14">
          <div className="space-y-5">
            <Logo className="p-0" />
            <p className="max-w-sm text-sm leading-6 text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
              Build useful systems, then explain them clearly.
            </p>
            <div className="pt-2">
              <FooterLink href={`mailto:${profile.personal.email}`}>
                Contact via email
              </FooterLink>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <FooterHeader>Resources</FooterHeader>
              <ul className="ml-0 mt-4 list-none space-y-2.5">
                {navigation.general.map((item) => (
                  <li key={item.name}>
                    <FooterLink href={item.href}>{item.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <FooterHeader>{profile.personal.email}</FooterHeader>
              <div className="mt-4 text-sm text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
                <Social profile={profile} />
              </div>
              <ul className="ml-0 mt-4 list-none space-y-2.5">
                {navigation.profile.map((item) => (
                  <li key={item.name}>
                    <FooterLink href={item.href}>{item.name}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-[#1a1a1a]/10 pt-6 text-xs text-[#1a1a1a]/55 dark:border-white/10 dark:text-[#f8f8f2]/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {urls.apps.home.replace(/^https?:\/\//, "")} | {" "}
            {profile.personal.title} | {localDate}
          </p>
          <ThemeToggle />
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
        "bg-white px-5 pb-10 pt-14 dark:bg-[#1a1a1a] sm:px-8 lg:px-10 lg:pb-12 lg:pt-16",
        className
      )}
    >
      <div className={cn("mx-auto max-w-[1280px]", containerClassName)}>
        <FooterContent profile={profile} urls={urls} />
      </div>
    </footer>
  );
}
