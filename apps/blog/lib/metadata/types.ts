// Shared metadata types for tags and categories
// Extracted from tag-metadata.ts and category-metadata.ts

export type ColorVariant =
  | "ivory"
  | "oat"
  | "cream"
  | "cactus"
  | "sage"
  | "lavender"
  | "terracotta"
  | "coral";

export type IllustrationType = "wavy" | "geometric" | "blob" | "none";

export interface BaseMetadata {
  description: string;
  color: ColorVariant;
  illustration: IllustrationType;
}

export type TagMetadata = BaseMetadata;
export type CategoryMetadata = BaseMetadata;
