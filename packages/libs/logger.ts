/**
 * Development-aware logging utility.
 *
 * Debug, info, and warn logs only output in development environment.
 * Error logs always output for production debugging.
 */

const isDevelopment =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log("[DEBUG]", ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDevelopment) {
      console.info("[INFO]", ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn("[WARN]", ...args);
    }
  },
  error: (...args: unknown[]) => {
    // Always log errors in production for debugging
    console.error("[ERROR]", ...args);
  },
};
