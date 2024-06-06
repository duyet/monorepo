export const clearUrl = (url: string) => {
  const { origin, pathname } = new URL(url);
  const cleanedPathname = pathname.replace(/\/+$/, "").replace(/^\/+/, "");
  return cleanedPathname ? `${origin}/${cleanedPathname}` : origin;
};

export default clearUrl;
