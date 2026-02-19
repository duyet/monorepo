import { ValidationError } from "./errors";

export const clearUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove query parameters and hash by only using origin and pathname
    const { origin, pathname } = urlObj;
    // Remove trailing slashes and collapse multiple slashes
    const cleanedPathname = pathname
      .replace(/\/+$/, "")
      .replace(/\/+/g, "/")
      .replace(/^\/+/, "");
    return cleanedPathname ? `${origin}/${cleanedPathname}` : origin;
  } catch (error) {
    throw new ValidationError("Invalid URL provided", {
      input: url,
      cause: error instanceof Error ? error.message : String(error),
    });
  }
};

export default clearUrl;
