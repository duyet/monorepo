/**
 * @duyet/profile
 *
 * Centralized profile and identity configuration.
 * Separates personal identity from infrastructure code.
 *
 * This enables the monorepo to be open-source and forkable:
 * - Components become generic and reusable
 * - Personal data is isolated and easily replaceable
 * - Anyone can create their own profile without modifying components
 *
 * @example
 * ```ts
 * import { createProfile, duyetProfile } from '@duyet/profile'
 *
 * // Use default profile
 * const profile = duyetProfile
 *
 * // Or customize it
 * const myProfile = createProfile({
 *   personal: {
 *     name: "Jane Doe",
 *     email: "jane@example.com"
 *   }
 * })
 * ```
 */

/**
 * Personal information about the profile owner
 */
export interface PersonalInfo {
  /** Full name */
  name: string;
  /** Short name (used in header, navbar) */
  shortName: string;
  /** Primary email address */
  email: string;
  /** Professional title or role */
  title: string;
  /** Short bio or tagline */
  bio: string;
  /** Years of professional experience */
  experience?: string;
  /** Current location (optional) */
  location?: string;
}

/**
 * Social media and professional network links
 */
export interface SocialLinks {
  /** GitHub profile URL */
  github?: string;
  /** Twitter/X profile URL */
  twitter?: string;
  /** LinkedIn profile URL */
  linkedin?: string;
  /** Unsplash profile URL (for photographers) */
  unsplash?: string;
  /** TikTok profile URL */
  tiktok?: string;
  /** Medium profile URL */
  medium?: string;
  /** Dev.to profile URL */
  devto?: string;
  /** Custom social links */
  [key: string]: string | undefined;
}

/**
 * Visual appearance and branding
 */
export interface Appearance {
  /** Avatar image URL or path */
  avatar?: string;
  /** Favicon URL or path */
  favicon?: string;
  /** Color theme */
  theme: {
    /** Primary brand color (hex) */
    primary: string;
    /** Secondary brand color (hex) */
    secondary: string;
    /** Accent color (hex) */
    accent: string;
    /** Additional custom colors */
    [key: string]: string;
  };
}

/**
 * Complete profile configuration
 */
export interface Profile {
  /** Personal information */
  personal: PersonalInfo;
  /** Social media links */
  social: SocialLinks;
  /** Visual appearance and branding */
  appearance: Appearance;
}

/**
 * Deep partial type for profile overrides
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep merge two objects
 * Later values override earlier values
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      // Recursively merge objects
      result[key] = deepMerge(targetValue, sourceValue as any) as any;
    } else if (sourceValue !== undefined) {
      // Override primitive values
      result[key] = sourceValue as any;
    }
  }

  return result;
}

/**
 * Create a new profile by merging overrides with a base profile
 *
 * @param base - Base profile to start with
 * @param overrides - Partial profile to merge in
 * @returns Merged profile
 *
 * @example
 * ```ts
 * const myProfile = createProfile(duyetProfile, {
 *   personal: {
 *     name: "Jane Doe",
 *     email: "jane@example.com"
 *   }
 * })
 * ```
 */
export function createProfile(
  base: Profile,
  overrides?: DeepPartial<Profile>
): Profile {
  if (!overrides) return base;
  return deepMerge(base, overrides);
}

// Re-export Duyet's profile as the default example
export { duyetProfile } from "./duyet.profile";
export { duyetProfile as defaultProfile } from "./duyet.profile";
