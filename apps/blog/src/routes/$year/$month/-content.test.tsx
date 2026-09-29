/**
 * The post body must never paint blank.
 *
 * The static export ships a pre-built article body, and MDX then compiles on
 * the client for Mermaid and JSX. The bug this guards against is a Suspense
 * boundary around the MDX compile: prerendered HTML would be swapped out for a
 * fallback for the whole time `compile()` resolves, so a slow compile flashed an
 * empty page. Asserting on the rendered output rather than on the source text
 * keeps the guarantee even if the component is restructured.
 */
import { render, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { TWITTER_WIDGETS_SRC } from "@/lib/x-embed";
import Content from "./-content";
import type { LoadedPost } from "./-types";

const STATIC_HTML = '<p id="prerendered">already in the HTML</p>';

const base: LoadedPost = {
  slug: "/2026/08/mdx-test",
  title: "MDX test",
  date: new Date("2026-08-01"),
  category: "dev",
  category_slug: "dev",
  tags: [],
  tags_slug: [],
  featured: false,
  content: STATIC_HTML,
  isMDX: false,
};

beforeAll(() => {
  // Pretend widgets.js already loaded so the body does not append the remote
  // <script> — happy-dom cannot fetch it and logs a NotSupportedError. That
  // this component injects the script is covered separately; here it is noise.
  (window as Window & { twttr?: unknown }).twttr = { widgets: { load() {} } };
});

describe("post content static HTML", () => {
  it("renders the prebuilt HTML for a markdown post", () => {
    const { container } = render(<Content post={base} />);
    expect(container.querySelector("article")?.innerHTML).toBe(STATIC_HTML);
  });

  it("renders the prebuilt HTML for an MDX post before the compile resolves", () => {
    // The MDX compile is async, so on the first paint (this is what ships in
    // the static export) there is no component to render yet and the article
    // has to fall back to the same prebuilt body.
    const { container } = render(
      <Content post={{ ...base, isMDX: true, mdxSource: "# Heading" }} />,
    );
    const article = container.querySelector("article");
    expect(article).not.toBeNull();
    expect(article?.innerHTML).toBe(STATIC_HTML);
  });

  it("does not paint blank once the MDX component replaces the static body", async () => {
    const { container } = render(
      <Content
        post={{
          ...base,
          isMDX: true,
          // A component that needs no provider or plugin, so this exercises the
          // swap from static HTML to compiled MDX without a full remark chain.
          mdxSource:
            "export const Inline = () => <span id='mdx'>mdx</span>\n\n<Inline />\n",
        }}
      />,
    );
    // Before the compile settles: the static body.
    expect(container.querySelector("article")?.innerHTML).toBe(STATIC_HTML);
    // After: the compiled component, and the article is still there.
    await waitFor(() => expect(container.querySelector("#mdx")).not.toBeNull());
    expect(container.querySelector("article")).not.toBeNull();
  });
});

describe("post body X embeds", () => {
  it("injects widgets.js when it is not already on the page", () => {
    // X embeds in a post body only become live iframes once widgets.js runs,
    // so the body has to pull it in itself. Pre-set by the suite-level stub
    // above, so clear it for this one case.
    delete (window as Window & { twttr?: unknown }).twttr;
    render(<Content post={base} />);
    const script = document.querySelector<HTMLScriptElement>(
      `script[src="${TWITTER_WIDGETS_SRC}"]`,
    );
    expect(script).not.toBeNull();
    expect(script?.async).toBe(true);
  });

  it("does not inject a second copy when widgets.js is already loaded", () => {
    const before = document.querySelectorAll(
      `script[src="${TWITTER_WIDGETS_SRC}"]`,
    ).length;
    render(<Content post={base} />);
    expect(
      document.querySelectorAll(`script[src="${TWITTER_WIDGETS_SRC}"]`).length,
    ).toBe(before);
  });
});
