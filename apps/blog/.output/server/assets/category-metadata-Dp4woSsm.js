const colorRotation = [
  "cactus",
  "sage",
  "lavender",
  "oat",
  "ivory",
  "cream",
  "terracotta",
  "coral"
];
const illustrationRotation = [
  "wavy",
  "geometric",
  "blob"
];
function getCategoryMetadata(categoryName, postCount = 0, index = 0) {
  const color = colorRotation[index % colorRotation.length];
  const illustration = illustrationRotation[index % illustrationRotation.length];
  const description = generateCategoryDescription(categoryName, postCount);
  return {
    description,
    color,
    illustration
  };
}
function generateCategoryDescription(categoryName, postCount) {
  const lowerName = categoryName.toLowerCase();
  const countText = postCount > 0 ? ` ${postCount} ${postCount === 1 ? "post" : "posts"} about` : "";
  return `Explore${countText} ${lowerName}`;
}
function getCategoryColorClass(color, variant = "light") {
  const colorMap = {
    ivory: variant === "light" ? "bg-ivory" : "bg-ivory-medium",
    oat: variant === "light" ? "bg-oat-light" : "bg-oat",
    cream: variant === "light" ? "bg-cream" : "bg-cream-warm",
    cactus: variant === "light" ? "bg-cactus-light" : "bg-cactus",
    sage: variant === "light" ? "bg-sage-light" : "bg-sage",
    lavender: variant === "light" ? "bg-lavender-light" : "bg-lavender",
    terracotta: variant === "light" ? "bg-terracotta-light" : "bg-terracotta",
    coral: variant === "light" ? "bg-coral-light" : "bg-coral"
  };
  return colorMap[color];
}
export {
  getCategoryColorClass as a,
  getCategoryMetadata as g
};
