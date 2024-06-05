export const getSlug = (name?: string) => {
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
  );
};

export default getSlug;
