/**
 * @duyet/config
 *
 * Centralized configuration package for the monorepo.
 * Export all configuration modules for easy consumption by apps.
 */

// Re-export all API configuration
export * from "./api.config";
// Re-export all app configuration
export * from "./app.config";
// Re-export Open Graph / Twitter card helpers
export * from "./og";
// Re-export the build-time dither OG card renderer
export * from "./og-card";

// Re-export all UI configuration
export * from "./ui.config";
