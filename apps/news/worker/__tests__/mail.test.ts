import { describe, expect, it } from "vitest";
import { markdownToEmailHtml, markdownToPlainText } from "../mail/markdown.js";
import {
  applyPlaceholders,
  applyTemplate,
  templateById,
} from "../mail/templates.js";
import { parseWrapJson } from "../mail/compose.js";
import { previewCampaign } from "../mail/campaigns.js";
import { listUnsubscribeHeaders, renderNoteEmail } from "../mail/render.js";
import { parseRssItems } from "../mail/content.js";
import { isAllowedOrigin } from "../subscribe/cors.js";

describe("markdownToEmailHtml", () => {
  it("escapes HTML then restores links, bold, and lists", () => {
    const html = markdownToEmailHtml(
      `Hello **world**\n\n- one\n- [two](https://duyet.net)\n\n<script>x</script>`
    );
    expect(html).toContain("<strong>world</strong>");
    expect(html).toContain('href="https://duyet.net/"');
    expect(html).toContain("<li");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("rejects javascript: links", () => {
    const html = markdownToEmailHtml("[x](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
    expect(html).toContain("x");
  });

  it("renders headings", () => {
    const html = markdownToEmailHtml("# Title\n\n## Sub");
    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
  });
});

describe("markdownToPlainText", () => {
  it("strips marks and keeps link URLs", () => {
    expect(markdownToPlainText("**Hi** [a](https://x.com)")).toBe(
      "Hi a (https://x.com)"
    );
  });
});

describe("templates", () => {
  it("fills placeholders on the post template", () => {
    const post = templateById("post");
    expect(post).toBeDefined();
    const applied = applyTemplate(post!, {
      title: "A post",
      excerpt: "Lede.",
      url: "https://blog.duyet.net/2026/08/a-post",
    });
    expect(applied.subject).toBe("A post");
    expect(applied.cta_url).toBe("https://blog.duyet.net/2026/08/a-post");
    expect(applied.body_md).toContain("Lede.");
  });

  it("drops unknown placeholders", () => {
    expect(applyPlaceholders("x {{missing}} y", {})).toBe("x  y");
  });
});

describe("parseWrapJson", () => {
  it("accepts a JSON object with body_md", () => {
    const parsed = parseWrapJson(
      '{"subject":"S","preheader":"P","body_md":"Hello","cta_label":"Go","cta_url":"https://duyet.net"}'
    );
    expect(parsed).toEqual({
      subject: "S",
      preheader: "P",
      body_md: "Hello",
      cta_label: "Go",
      cta_url: "https://duyet.net",
    });
  });

  it("extracts JSON from surrounding text", () => {
    const parsed = parseWrapJson(
      'noise {"subject":"S","body_md":"Hi"} trailing'
    );
    expect(parsed).toEqual({
      subject: "S",
      preheader: "",
      body_md: "Hi",
      cta_label: "",
      cta_url: "",
    });
  });

  it("rejects missing body", () => {
    expect(parseWrapJson('{"subject":"S"}')).toBeNull();
  });

  it("rejects missing subject", () => {
    expect(parseWrapJson('{"body_md":"Hi"}')).toBeNull();
  });
});

describe("renderNoteEmail", () => {
  it("emits a 520px table layout with wordmark, CTA, and unsubscribe", () => {
    const { html, text } = renderNoteEmail({
      subject: "A note",
      preheader: "Inbox preview",
      bodyMd: "Hello **friend**.",
      cta: { label: "Read", url: "https://blog.duyet.net/x" },
      unsubscribeUrl: "https://news.duyet.net/subscribe?unsubscribe=tok",
    });
    expect(html).toContain("max-width:520px");
    expect(html).toContain("Duyet");
    expect(html).toContain("Inbox preview");
    expect(html).toContain("Read");
    expect(html).toContain("Unsubscribe");
    expect(html).toContain("Inter");
    expect(html).toContain("#0a0a0a");
    expect(text).toContain("Hello friend.");
    expect(text).toContain("Read: https://blog.duyet.net/x");
  });
});

describe("previewCampaign", () => {
  it("renders campaign markdown", () => {
    const { html } = previewCampaign({
      subject: "Hi",
      preheader: "",
      body_md: "Body",
      cta_label: "",
      cta_url: "",
    });
    expect(html).toContain("Body");
  });
});

describe("listUnsubscribeHeaders", () => {
  it("includes one-click POST and the page URL", () => {
    const headers = listUnsubscribeHeaders("abc");
    expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(headers["List-Unsubscribe"]).toContain("/api/subscribe?token=abc");
    expect(headers["List-Unsubscribe"]).toContain("/subscribe?unsubscribe=abc");
  });
});

describe("cors origins", () => {
  it("allows blog, home, news, and local dev", () => {
    expect(isAllowedOrigin("https://blog.duyet.net")).toBe(true);
    expect(isAllowedOrigin("https://duyet.net")).toBe(true);
    expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
    expect(isAllowedOrigin("https://evil.example")).toBe(false);
    expect(isAllowedOrigin("https://duyet-blog.pages.dev")).toBe(true);
    expect(isAllowedOrigin("https://random.pages.dev")).toBe(false);
  });
});

describe("parseRssItems", () => {
  it("reads title, link, and stripped description", () => {
    const xml = `<?xml version="1.0"?><rss><channel>
      <item>
        <title><![CDATA[Post & notes]]></title>
        <link>https://blog.duyet.net/2026/08/post</link>
        <description><![CDATA[<p>Hello</p>]]></description>
      </item>
    </channel></rss>`;
    expect(parseRssItems(xml)).toEqual([
      {
        kind: "blog",
        title: "Post & notes",
        url: "https://blog.duyet.net/2026/08/post",
        excerpt: "Hello",
      },
    ]);
  });
});
