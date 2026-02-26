export type Category = "Apps" | "Social" | "Tools" | "Other";

export const CATEGORY_ORDER: Category[] = ["Apps", "Social", "Tools", "Other"];

export const CATEGORY_MAP: Record<string, Category> = {
  "/": "Apps",
  "/blog": "Apps",
  "/cv": "Apps",
  "/about": "Apps",
  "/ai": "Apps",
  "/claw": "Apps",
  "/i": "Apps",
  "/insights": "Apps",
  "/photos": "Apps",
  "/mcp": "Apps",
  "/github": "Social",
  "/in": "Social",
  "/x": "Social",
  "/un": "Social",
  "/tiktok": "Social",
  "/tt": "Social",
  "/ni": "Social",
  "/rs": "Tools",
  "/rust": "Tools",
  "/monitor": "Tools",
  "/clickhouse": "Tools",
  "/ch": "Tools",
  "/mo": "Tools",
  "/numi": "Tools",
};

export const DEFAULT_CATEGORY: Category = "Other";
