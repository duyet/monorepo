/**
 * Custom error types for @duyet/libs
 *
 * Provides typed error classes for better error handling and type safety.
 */

/**
 * Base error class for all library errors
 *
 * @example
 * ```ts
 * throw new LibError("Something went wrong", { code: "ERR_001" })
 * ```
 */
export class LibError extends Error {
  readonly code?: string;
  readonly context?: Record<string, unknown>;

  constructor(message: string, options?: { code?: string; context?: Record<string, unknown> }) {
    super(message);
    this.name = "LibError";
    this.code = options?.code;
    this.context = options?.context;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LibError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
    };
  }
}

/**
 * Validation error for invalid input
 *
 * @example
 * ```ts
 * if (!isValid(input)) {
 *   throw new ValidationError("Invalid input format", { field: "email" })
 * }
 * ```
 */
export class ValidationError extends LibError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, { code: "VALIDATION_ERROR", context });
    this.name = "ValidationError";
  }
}

/**
 * Network/fetch error with HTTP status information
 *
 * @example
 * ```ts
 * throw new NetworkError("Failed to fetch", {
 *   status: 404,
 *   statusText: "Not Found",
 *   url: "https://example.com"
 * })
 * ```
 */
export class NetworkError extends LibError {
  readonly status?: number;
  readonly statusText?: string;
  readonly url?: string;

  constructor(
    message: string,
    context?: {
      status?: number;
      statusText?: string;
      url?: string;
      info?: unknown;
    }
  ) {
    super(message, {
      code: "NETWORK_ERROR",
      context,
    });
    this.name = "NetworkError";
    this.status = context?.status;
    this.statusText = context?.statusText;
    this.url = context?.url;
  }
}

/**
 * File system error
 *
 * @example
 * ```ts
 * throw new FileSystemError("Failed to read file", { path: "/path/to/file" })
 * ```
 */
export class FileSystemError extends LibError {
  readonly path?: string;

  constructor(message: string, context?: { path?: string; cause?: Error }) {
    super(message, { code: "FILE_SYSTEM_ERROR", context });
    this.name = "FileSystemError";
    this.path = context?.path;
  }
}

/**
 * Type guard to check if an error is our Library error
 *
 * @example
 * ```ts
 * try {
 *   // ...
 * } catch (error) {
 *   if (isLibError(error)) {
 *     console.log(error.code) // TypeScript knows this exists
 *   }
 * }
 * ```
 */
export function isLibError(error: unknown): error is LibError {
  return error instanceof LibError;
}

/**
 * Type guard for NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard for ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard for FileSystemError
 */
export function isFileSystemError(error: unknown): error is FileSystemError {
  return error instanceof FileSystemError;
}
