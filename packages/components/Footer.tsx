import { cn } from "@duyet/libs/utils";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import type { UrlsConfig } from "@duyet/urls";
import { duyetUrls } from "@duyet/urls";
import { Link } from "@tanstack/react-router";
import type { ReactElement, ReactNode } from "react";
import { AutoDesignedBadge } from "./auto-designed-badge";
import Container from "./Container";
import Social from "./Social";
import ThemeToggle from "./ThemeToggle";

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  const classes = cn(
    "text-sm text-[var(--on-dark-soft)]",
    "no-underline transition-colors hover:text-[var(--on-dark)]"
  );

  const isExternalHttp = /^https?:\/\//.test(href);
  const hasExplicitScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(href);
  const isRouterPath = href.startsWith("/") || href.startsWith(".");

  if (isExternalHttp) {
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

  if (hasExplicitScheme && !isRouterPath) {
    return (
      <a href={href} className={classes}>
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
  const links = [...navigation.general, ...navigation.profile];

  return (
    <Container>
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <h3 className="sr-only">Resources</h3>

      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-base font-semibold text-[var(--on-dark)]">
          {profile.personal.name}
        </p>
        <p className="max-w-md text-sm text-[var(--on-dark-soft)]">
          {profile.personal.bio}
        </p>

        <div className="flex items-center gap-4 text-[var(--on-dark-soft)]">
          <Social profile={profile} />
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {links.map((item) => (
            <FooterLink key={item.name} href={item.href}>
              {item.name}
            </FooterLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-xs text-[var(--on-dark-soft)]">
          <span>
            &copy; {new Date().getFullYear()} {profile.personal.name}
          </span>
          <ThemeToggle />
        </div>

        <AutoDesignedBadge />
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
        "bg-[var(--surface-dark)] text-[var(--on-dark)] px-5 py-10 sm:px-8 lg:px-10",
        className
      )}
    >
      <div className={cn("mx-auto max-w-[1280px]", containerClassName)}>
        <FooterContent profile={profile} urls={urls} />
      </div>
    </footer>
  );
}
