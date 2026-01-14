export const clearUrl = (url: string) => {
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
  } catch (_error) {
    throw new Error("Invalid URL");
  }
};

export default clearUrl;
