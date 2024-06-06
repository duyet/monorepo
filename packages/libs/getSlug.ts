/**
 * Get slug from string
 * Example: "Hello World!" => "hello-world", "Hello World 😊" => "hello-world"
 *
 * @param name
 * @returns slug
 */
export const getSlug = (name?: string): string => {
  if (!name) {
    return "";
  }

  return (
    name
      .toLowerCase()
      // Remove emoji https://stackoverflow.com/a/41543705
      .replace(
        /([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
        "",
      )
      .replace(/ /g, "-")
      // Replace "-" at the beginning and end of the string, e.g. "-slug-" => "slug"
      .replace(/^-+/, "")
      .replace(/-+$/, "")
  );
};

export default getSlug;
