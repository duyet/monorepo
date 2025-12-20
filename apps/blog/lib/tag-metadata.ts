// Shared tag metadata for consistent styling and descriptions across the blog
// Fully dynamic with intelligent tag description generation

export interface TagMetadata {
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
const colorRotation: Array<TagMetadata["color"]> = [
  "sage",
  "lavender",
  "cactus",
  "coral",
  "terracotta",
  "oat",
  "cream",
  "ivory",
];

const illustrationRotation: Array<TagMetadata["illustration"]> = [
  "geometric",
  "blob",
  "wavy",
];

/**
 * Dynamically generate metadata for any tag
 * @param tagName - The display name of the tag
 * @param postCount - Number of posts with this tag
 * @param index - Optional index for rotating colors/illustrations
 */
export function getTagMetadata(
  tagName: string,
  postCount = 0,
  index = 0
): TagMetadata {
  const color = colorRotation[index % colorRotation.length];
  const illustration =
    illustrationRotation[index % illustrationRotation.length];

  // Generate intelligent description based on tag name
  const description = generateTagDescription(tagName, postCount);

  return {
    description,
    color,
    illustration,
  };
}

/**
 * Generate a contextual and intelligent description for any tag
 * Uses pattern matching to provide relevant descriptions for common tech topics
 */
function generateTagDescription(tagName: string, postCount: number): string {
  const lowerTag = tagName.toLowerCase();
  const countText =
    postCount > 0
      ? `${postCount} ${postCount === 1 ? "article" : "articles"} exploring`
      : "Deep dive into";

  // Pattern-based intelligent descriptions
  const patterns: Array<{ regex: RegExp; template: (tag: string) => string }> =
    [
      // Programming languages
      {
        regex:
          /^(python|javascript|typescript|go|rust|java|scala|kotlin|ruby|php|c\+\+|c#)/i,
        template: (tag) =>
          `${countText} ${tag} programming, patterns, and best practices`,
      },
      // Frameworks & libraries
      {
        regex:
          /(react|vue|angular|svelte|next\.?js|django|flask|spring|express)/i,
        template: (tag) => `${countText} building applications with ${tag}`,
      },
      // Data & ML
      {
        regex:
          /(machine learning|deep learning|data|analytics|bigquery|spark|flink|kafka|airflow)/i,
        template: (tag) => `${countText} ${tag} engineering and architecture`,
      },
      // Cloud & Infrastructure
      {
        regex: /(aws|azure|gcp|cloud|kubernetes|docker|terraform|helm)/i,
        template: (tag) => `${countText} ${tag} infrastructure and deployment`,
      },
      // Databases
      {
        regex:
          /(postgres|mysql|mongodb|redis|elasticsearch|clickhouse|cassandra)/i,
        template: (tag) =>
          `${countText} ${tag} optimization and design patterns`,
      },
      // Tools & Practices
      {
        regex: /(git|ci\/cd|testing|monitoring|observability|performance)/i,
        template: (tag) => `${countText} ${tag} techniques and workflows`,
      },
      // Career & Soft Skills
      {
        regex: /(career|interview|leadership|management|productivity)/i,
        template: (tag) => `${countText} ${tag} insights and experiences`,
      },
    ];

  // Try to match patterns
  for (const { regex, template } of patterns) {
    if (regex.test(lowerTag)) {
      return template(tagName);
    }
  }

  // Default fallback description
  return `${countText} ${tagName.toLowerCase()}`;
}

/**
 * Get color class for Tailwind CSS based on context (light/default)
 */
export function getTagColorClass(
  color: TagMetadata["color"],
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
