/**
 * Duyet Le's Profile Configuration
 *
 * This is the default profile used across all apps.
 * It serves as both the production configuration and an example
 * for others who want to fork this monorepo.
 */

import type { Profile } from "./index";

/**
 * Duyet Le's complete profile
 *
 * @example
 * ```ts
 * import { duyetProfile } from '@duyet/profile/duyet'
 *
 * // Use in components
 * <Header profile={duyetProfile} />
 * ```
 */
export const duyetProfile: Profile = {
  personal: {
    name: "Duyet Le",
    shortName: "Duyệt",
    email: "me@duyet.net",
    title: "Duyệt",
    bio: "Data Engineering, Rustacean at night",
    experience: "6+ years",
    location: "Vietnam",
  },

  social: {
    github: "https://github.com/duyet",
    twitter: "https://x.com/_duyet",
    linkedin: "https://linkedin.com/in/duyet",
    unsplash: "https://unsplash.com/@_duyet",
    tiktok: "https://www.tiktok.com/@duyet.net",
  },

  appearance: {
    avatar: "/avatar.jpg",
    favicon: "/favicon.ico",
    theme: {
      // Claude-inspired color palette
      primary: "#f5dcd0", // Claude peach
      secondary: "#a8d5ba", // Claude mint
      accent: "#c5c5ff", // Claude lavender

      // Extended palette (used in home page cards)
      coral: "#ff9999", // Coral
      yellow: "#f0d9a8", // Soft yellow
      sky: "#b3d9ff", // Sky blue
    },
  },
};

/**
 * Export as default for convenience
 */
export default duyetProfile;
