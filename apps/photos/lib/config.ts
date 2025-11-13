/**
 * Application configuration
 *
 * Note: Only use environment variables that are safe to expose to the client
 * For client components, use NEXT_PUBLIC_ prefix
 */

// Owner username - used to exclude from attribution
// This can be set via PHOTOS_OWNER_USERNAME or defaults to '_duyet'
export const OWNER_USERNAME = process.env.PHOTOS_OWNER_USERNAME || '_duyet'

// Unsplash username (may differ from owner username)
export const UNSPLASH_USERNAME = process.env.UNSPLASH_USERNAME || process.env.PHOTOS_OWNER_USERNAME || '_duyet'
