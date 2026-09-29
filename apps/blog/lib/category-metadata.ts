// Shared category metadata for consistent styling and descriptions across the blog
// Fully dynamic - no hardcoded category descriptions

/** The eight pastel surface variants a category accent can take. */
type ColorVariant =
  | "ivory"
  | "oat"
  | "cream"
  | "cactus"
  | "sage"
  | "lavender"
  | "terracotta"
  | "coral";

export interface CategoryMetadata {
  description: string;
  color: ColorVariant;
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
