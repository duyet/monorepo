import { cn } from "@duyet/libs/utils";
import { Suspense, use } from "react";

const sanitizeHtmlPromise = import("sanitize-html");

async function getSanitizeOptions() {
  const sanitizeHtml = (await sanitizeHtmlPromise).default;
  return {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "math",
      "semantics",
      "mrow",
      "mi",
      "mn",
      "mo",
      "mtext",
      "mfrac",
      "msup",
      "msub",
      "msubsup",
      "img",
      "svg",
      "path",
      "g",
      "circle",
      "rect",
      "line",
      "polyline",
      "polygon",
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["class", "id", "aria-hidden", "focusable", "xmlns"],
      a: ["href", "name", "target", "rel", "class", "id"],
      img: ["src", "alt", "title", "width", "height", "loading", "class"],
      svg: ["width", "height", "viewBox", "fill", "stroke", "class"],
      path: ["d", "fill", "stroke", "stroke-width", "class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  };
}

const sanitizeOptionsPromise = getSanitizeOptions();

function SanitizedSnippet({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const [sanitizeHtml, options] = use(
    Promise.all([sanitizeHtmlPromise, sanitizeOptionsPromise]).then(
      ([module, sanitizeOptions]) => [module.default, sanitizeOptions] as const
    )
  );

  const sanitized = sanitizeHtml(html, options);

  return (
    <div
      className={cn(className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
      suppressHydrationWarning
    />
  );
}

export function Snippet({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  if (!html) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <SanitizedSnippet html={html} className={className} />
    </Suspense>
  );
}
