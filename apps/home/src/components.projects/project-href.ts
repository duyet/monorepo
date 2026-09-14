import { addUtmParams } from "../../app/lib/utm";
import type { AppItem } from "../data/projects";

export function projectHref(item: AppItem): string {
  return addUtmParams(item.href, "projects", item.utmContent, item.host);
}

export function isExternalHref(href: string): boolean {
  return href.startsWith("http");
}
