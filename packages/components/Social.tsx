import { ReactElement } from "react";
import type { Profile } from "@duyet/profile";
import { duyetProfile } from "@duyet/profile";
import {
  Github,
  Twitter,
  LinkedIn,
  Unsplash,
  TikTok,
  Medium,
  DevTo,
} from "./Icons";
import { cn } from "@duyet/libs";

export interface SocialProps {
  /** Profile containing social links */
  profile?: Profile;
  /** Optional CSS classes */
  className?: string;
  /** Icon size classes (default: w-4 h-4) */
  iconSize?: string;
}

/**
 * Social media links component
 *
 * Displays social media icons based on the profile configuration.
 * Only shows icons for links that are defined in the profile.
 *
 * @example
 * ```tsx
 * import { Social } from '@duyet/components'
 * import { duyetProfile } from '@duyet/profile'
 *
 * <Social profile={duyetProfile} />
 * ```
 */
export default function Social({
  profile = duyetProfile,
  className,
  iconSize = "w-4 h-4",
}: SocialProps): ReactElement {
  const iconClasses = cn(
    iconSize,
    "text-slate-400 hover:text-slate-600",
    "dark:text-gray-500 dark:hover:text-white",
  );

  // Map social links to icons
  const socialLinks = [
    {
      url: profile.social.github,
      Icon: Github,
      label: "GitHub",
    },
    {
      url: profile.social.twitter,
      Icon: Twitter,
      label: "Twitter",
    },
    {
      url: profile.social.linkedin,
      Icon: LinkedIn,
      label: "LinkedIn",
    },
    {
      url: profile.social.unsplash,
      Icon: Unsplash,
      label: "Unsplash",
    },
    {
      url: profile.social.tiktok,
      Icon: TikTok,
      label: "TikTok",
    },
    {
      url: profile.social.medium,
      Icon: Medium,
      label: "Medium",
    },
    {
      url: profile.social.devto,
      Icon: DevTo,
      label: "Dev.to",
    },
  ].filter((link) => link.url); // Only include links that are defined

  return (
    <div className={cn("flex flex-row gap-4", className)}>
      {socialLinks.map(({ url, Icon, label }) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
        >
          <Icon className={iconClasses} />
        </a>
      ))}
    </div>
  );
}
