/**
 * Custom error types for photo fetching operations
 * These errors carry metadata to help display appropriate UI messages
 */

/**
 * Base error class for all photo fetching errors
 */
export abstract class PhotoFetchError extends Error {
  abstract readonly type: "rate_limit" | "auth" | "network" | "api" | "unknown";
  abstract readonly userMessage: string;
  abstract readonly retryable: boolean;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Rate limit error - Unsplash API quota exceeded
 */
export class RateLimitError extends PhotoFetchError {
  readonly type = "rate_limit" as const;
  readonly userMessage: string;
  readonly retryable = true;
  readonly provider: "unsplash" | "cloudinary" | "both";
  readonly retryAfter?: number; // seconds until retry

  constructor(
    provider: "unsplash" | "cloudinary" | "both",
    retryAfter?: number
  ) {
    const providerName =
      provider === "unsplash"
        ? "Unsplash"
        : provider === "cloudinary"
          ? "Cloudinary"
          : "photo providers";

    super(
      `Rate limit exceeded for ${providerName}. Maximum 50 requests/hour for Unsplash demo applications.`
    );

    this.provider = provider;
    this.retryAfter = retryAfter;

    // Set user-friendly message
    if (retryAfter) {
      const minutes = Math.ceil(retryAfter / 60);
      this.userMessage = `Photo API rate limit reached. Please check back in approximately ${minutes} minute${minutes > 1 ? "s" : ""}.`;
    } else {
      this.userMessage = `Photo API rate limit reached. The photo gallery will update automatically within an hour.`;
    }
  }
}

/**
 * Authentication error - API key missing or invalid
 */
export class AuthError extends PhotoFetchError {
  readonly type = "auth" as const;
  readonly userMessage: string;
  readonly retryable = false;
  readonly provider: "unsplash" | "cloudinary";

  constructor(provider: "unsplash" | "cloudinary") {
    const providerName =
      provider === "unsplash" ? "Unsplash" : "Cloudinary";
    super(`Authentication failed for ${providerName}. Check API credentials.`);

    this.provider = provider;
    this.userMessage = `Photo service is currently unavailable due to a configuration issue. Please try again later.`;
  }
}

/**
 * Network error - connectivity issues
 */
export class NetworkError extends PhotoFetchError {
  readonly type = "network" as const;
  readonly userMessage =
    "Unable to load photos due to a network error. Please check your connection and try again.";
  readonly retryable = true;
  readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.originalError = originalError;
  }
}

/**
 * API error - server-side errors from photo providers
 */
export class ApiError extends PhotoFetchError {
  readonly type = "api" as const;
  readonly userMessage: string;
  readonly retryable = true;
  readonly statusCode?: number;
  readonly provider: "unsplash" | "cloudinary";

  constructor(
    provider: "unsplash" | "cloudinary",
    message: string,
    statusCode?: number
  ) {
    super(message);
    this.provider = provider;
    this.statusCode = statusCode;

    const providerName = provider === "unsplash" ? "Unsplash" : "Cloudinary";
    if (statusCode === 500) {
      this.userMessage = `${providerName} is currently experiencing issues. Please try again later.`;
    } else if (statusCode === 404) {
      this.userMessage = `Photo collection not found on ${providerName}.`;
    } else {
      this.userMessage = `Failed to load photos from ${providerName}. Please try again later.`;
    }
  }
}

/**
 * Unknown error - catch-all for unexpected errors
 */
export class UnknownPhotoError extends PhotoFetchError {
  readonly type = "unknown" as const;
  readonly userMessage =
    "An unexpected error occurred while loading photos. Please try again later.";
  readonly retryable = true;
  readonly originalError?: unknown;

  constructor(originalError?: unknown) {
    super("Unexpected error during photo fetch");
    this.originalError = originalError;
  }
}

/**
 * Result type for photo fetching operations
 */
export type PhotoFetchResult<T> =
  | { success: true; data: T }
  | { success: false; error: PhotoFetchError };

/**
 * Helper to create a success result
 */
export function photoSuccess<T>(data: T): PhotoFetchResult<T> {
  return { success: true, data };
}

/**
 * Helper to create an error result
 */
export function photoError<T>(error: PhotoFetchError): PhotoFetchResult<T> {
  return { success: false, error };
}

/**
 * Check if an error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return (
    error instanceof RateLimitError ||
    (error instanceof Error &&
      (error.message.includes("expected JSON response") ||
        error.message.includes("Rate Limit Exceeded") ||
        error.message.includes("429") ||
        ("response" in error && (error as any).response?.status === 429)))
  );
}
