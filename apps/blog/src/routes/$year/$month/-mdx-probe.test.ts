import { describe, expect, it } from "vitest";

describe("mdx probe", () => {
  it("compiles the fixture source", async () => {
    const [
      { compile, run },
      highlightLanguages,
      rehypeHighlight,
      rehypeKatex,
      rehypeSlug,
      remarkGfm,
      remarkMath,
    ] = await Promise.all([
      import("@mdx-js/mdx"),
      import("lowlight").then(({ common }) => common),
      import("rehype-highlight").then((m) => m.default),
      import("rehype-katex").then((m) => m.default),
      import("rehype-slug").then((m) => m.default),
      import("remark-gfm").then((m) => m.default),
      import("remark-math").then((m) => m.default),
      import("katex/dist/contrib/mhchem.min.js"),
      import("katex/dist/katex.min.css"),
      import("@/styles/highlight.css"),
    ]);

    const code = await compile(
      "export const Inline = () => <span id='mdx'>mdx</span>\n\n<Inline />\n",
      {
        outputFormat: "function-body",
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [
          rehypeSlug,
          rehypeKatex,
          [rehypeHighlight, { detect: false, languages: highlightLanguages }],
        ],
      },
    );
    console.log("COMPILED CODE:", String(code).slice(0, 400));
    const runtime = await import("react/jsx-runtime");
    const React = await import("react");
    const mod = await run(String(code), {
      ...runtime,
      Fragment: React.Fragment,
      baseUrl: import.meta.url,
    });
    console.log("RUN OK:", typeof mod.default);
    expect(mod.default).toBeTruthy();
  }, 30000);
});
