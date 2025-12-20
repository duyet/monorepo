// Shared category metadata for consistent styling and descriptions across the blog
// Fully dynamic - no hardcoded category descriptions

export interface CategoryMetadata {
  description: string;
  color:
    | "ivory"
    | "oat"
    | "cream"
    | "cactus"
    | "sage"
    | "lavender"
    | "terracotta"
    | "coral";
  illustration: "wavy" | "geometric" | "blob" | "none";
}

// Rotating color and illustration scheme
const colorRotation: Array<CategoryMetadata["color"]> = [
  "cactus",
  "sage",
  "lavender",
  "oat",
  "ivory",
  "cream",
  "terracotta",
  "coral",
];

const illustrationRotation: Array<CategoryMetadata["illustration"]> = [
  "wavy",
  "geometric",
  "blob",
];

/**
 * Dynamically generate metadata for any category
 * @param categoryName - The display name of the category
 * @param postCount - Number of posts in the category (optional, for dynamic descriptions)
 * @param index - Optional index for rotating colors/illustrations
 */
export function getCategoryMetadata(
  categoryName: string,
  postCount = 0,
  index = 0
): CategoryMetadata {
  const color = colorRotation[index % colorRotation.length];
  const illustration =
    illustrationRotation[index % illustrationRotation.length];

  // Generate dynamic description based on category name
  const description = generateCategoryDescription(categoryName, postCount);

  return {
    description,
    color,
    illustration,
  };
}

/**
 * Generate a contextual description for any category
 */
function generateCategoryDescription(
  categoryName: string,
  postCount: number
): string {
  const lowerName = categoryName.toLowerCase();
  const countText =
    postCount > 0
      ? ` ${postCount} ${postCount === 1 ? "post" : "posts"} about`
      : "";

  return `Explore${countText} ${lowerName}`;
}

/**
 * Get color class for Tailwind CSS based on context (light/default)
 */
export function getCategoryColorClass(
  color: CategoryMetadata["color"],
  variant: "light" | "default" = "light"
): string {
  const colorMap = {
    ivory: variant === "light" ? "bg-ivory" : "bg-ivory-medium",
    oat: variant === "light" ? "bg-oat-light" : "bg-oat",
    cream: variant === "light" ? "bg-cream" : "bg-cream-warm",
    cactus: variant === "light" ? "bg-cactus-light" : "bg-cactus",
    sage: variant === "light" ? "bg-sage-light" : "bg-sage",
    lavender: variant === "light" ? "bg-lavender-light" : "bg-lavender",
    terracotta: variant === "light" ? "bg-terracotta-light" : "bg-terracotta",
    coral: variant === "light" ? "bg-coral-light" : "bg-coral",
  };

  return colorMap[color];
}
