import { slugify as sharedSlugify } from "./slugify";

/**
 * Get slug from string
 * Example: "Hello World!" => "hello-world", "Hello World 😊" => "hello-world"
 *
 * @param name
 * @param maxLength - Maximum length of slug (will truncate at word boundary)
 * @returns slug
 */

export const getSlug = (name?: string, maxLength = 100): string => {
  return sharedSlugify(name, { mode: "punct", maxLength });
};

export default getSlug;
