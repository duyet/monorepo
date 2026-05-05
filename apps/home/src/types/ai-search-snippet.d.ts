import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "search-bar-snippet": DetailedHTMLProps<
        HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        apiUrl: string;
        placeholder?: string;
        maxResults?: number;
        maxRenderResults?: number;
        "show-url"?: "true" | "false";
        "show-date"?: "true" | "false";
      };
    }
  }
}
