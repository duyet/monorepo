import type { Category } from "../../../app/config/categories";

export type ViewMode = "list" | "grid";

export interface UrlEntry {
  path: string;
  target: string;
  desc?: string;
  category?: Category;
}
