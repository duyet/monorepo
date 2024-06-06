export const clearUrl = (url: string) => {
  const { origin, pathname } = new URL(url);

  let cleanedPathname = pathname.replace(/\/+$/, "").replace(/^\/+/, "");

  if (cleanedPathname === "" || cleanedPathname === "/") {
    return origin;
  }

  return `${origin}/${cleanedPathname}`;
};

export default clearUrl;
