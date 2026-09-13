import { compile } from "@mdx-js/mdx";
import { common } from "lowlight";
import rehypeHighlight from "rehype-highlight";
import { describe, expect, it } from "vitest";

function promptLanguage() {
  return {
    name: "prompt",
    disableAutodetect: true,
    case_insensitive: false,
    contains: [{ scope: "built_in", begin: /^\/[A-Za-z][\w:-]*/ }],
  };
}

const source = `
# Goal

\`\`\`prompt
/goal ship it
\`\`\`
`;

describe("MDX prompt highlight registration", () => {
  it("compiles when prompt is a highlight.js factory", async () => {
    await expect(
      compile(source, {
        outputFormat: "function-body",
        rehypePlugins: [
          [rehypeHighlight, { detect: false, languages: { ...common, prompt: promptLanguage } }],
        ],
      })
    ).resolves.toBeTruthy();
  });

  it("throws r.bind / is not a function when prompt is a bare object", async () => {
    await expect(
      Promise.resolve().then(() =>
        compile(source, {
          outputFormat: "function-body",
          rehypePlugins: [
            [
              rehypeHighlight,
              {
                detect: false,
                languages: { ...common, prompt: promptLanguage() },
              },
            ],
          ],
        })
      )
    ).rejects.toThrow(/bind is not a function/);
  });
});
