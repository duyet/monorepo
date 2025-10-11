/**
 * Error handling utilities for ChatKit application
 *
 * This module provides utilities for extracting error details from API responses
 * and handling error states throughout the application.
 *
 * @module lib/errors
 */

/**
 * Represents the error state of the ChatKit application
 *
 * @property script - Error message related to ChatKit script loading
 * @property session - Error message related to session creation/management
 * @property integration - Error message related to ChatKit integration
 * @property retryable - Whether the error can be retried by the user
 */
export type ErrorState = {
  script: string | null;
  session: string | null;
  integration: string | null;
  retryable: boolean;
};

/**
 * Creates an initial error state with all errors set to null
 *
 * @returns A clean ErrorState object with no active errors
 *
 * @example
 * ```ts
 * const errors = createInitialErrors()
 * // { script: null, session: null, integration: null, retryable: false }
 * ```
 */
export function createInitialErrors(): ErrorState {
  return {
    script: null,
    session: null,
    integration: null,
    retryable: false,
  };
}

/**
 * Extracts a human-readable error message from an API response payload
 *
 * This function attempts to extract error details from various common API
 * response formats, checking multiple possible error field locations.
 *
 * It checks in the following order:
 * 1. payload.error (string or object with message)
 * 2. payload.details (string or nested error object)
 * 3. payload.message
 * 4. Falls back to the provided fallback string
 *
 * @param payload - The API response payload that may contain error information
 * @param fallback - Fallback message if no error details are found
 * @returns Human-readable error message
 *
 * @example
 * ```ts
 * // Example with nested error object
 * const payload = {
 *   error: {
 *     message: "Authentication failed"
 *   }
 * }
 * const message = extractErrorDetail(payload, "Unknown error")
 * // Returns: "Authentication failed"
 *
 * // Example with fallback
 * const emptyPayload = {}
 * const message = extractErrorDetail(emptyPayload, "Request failed")
 * // Returns: "Request failed"
 * ```
 */
export function extractErrorDetail(
  payload: Record<string, unknown> | undefined,
  fallback: string,
): string {
  if (!payload) {
    return fallback;
  }

  // Check payload.error field
  const error = payload.error;
  if (typeof error === "string") {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  // Check payload.details field
  const details = payload.details;
  if (typeof details === "string") {
    return details;
  }

  if (details && typeof details === "object" && "error" in details) {
    const nestedError = (details as { error?: unknown }).error;
    if (typeof nestedError === "string") {
      return nestedError;
    }
    if (
      nestedError &&
      typeof nestedError === "object" &&
      "message" in nestedError &&
      typeof (nestedError as { message?: unknown }).message === "string"
    ) {
      return (nestedError as { message: string }).message;
    }
  }

  // Check payload.message field
  if (typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

/**
 * Type guard to check if an error is an Error instance
 *
 * @param error - Unknown error object
 * @returns True if the error is an Error instance
 *
 * @example
 * ```ts
 * try {
 *   throw new Error("Something went wrong")
 * } catch (err) {
 *   if (isErrorInstance(err)) {
 *     console.log(err.message) // Type-safe access to message
 *   }
 * }
 * ```
 */
export function isErrorInstance(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Extracts a safe error message from any thrown value
 *
 * @param error - Error value of unknown type
 * @param fallback - Fallback message if error cannot be converted
 * @returns Safe error message string
 *
 * @example
 * ```ts
 * try {
 *   throw new Error("Network failure")
 * } catch (err) {
 *   const message = getErrorMessage(err, "Unknown error occurred")
 *   // Returns: "Network failure"
 * }
 *
 * try {
 *   throw "string error"
 * } catch (err) {
 *   const message = getErrorMessage(err, "Unknown error occurred")
 *   // Returns: "Unknown error occurred"
 * }
 * ```
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return isErrorInstance(error) ? error.message : fallback;
}
