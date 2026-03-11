/**
 * Get slug from string
 * Example: "Hello World!" => "hello-world", "Hello World 😊" => "hello-world"
 *
 * @param name
 * @param maxLength - Maximum length of slug (will truncate at word boundary)
 * @returns slug
 */
export const getSlug = (name?: string, maxLength = 100): string => {
  if (!name) {
    return "";
  }

  let slug = name
    .toLowerCase()
    // Remove emoji https://stackoverflow.com/a/41543705
    .replace(
      /([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    )
    .replace(/ /g, "-")
    // Replace "-" at the beginning and end of the string, e.g. "-slug-" => "slug"
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  // Truncate to maxLength, ensuring we don't cut mid-word
  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength).replace(/-[^-]*$/, "");
  }

  return slug;
};

export default getSlug;
