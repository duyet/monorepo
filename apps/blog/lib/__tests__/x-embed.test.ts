import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  embedXPosts,
  parseTweetId,
  parseTweetUrl,
  TWEET_EMBED_WRAP_CLASS,
  TWEET_ROW_CLASS,
} from "../x-embed";

describe("parseTweetId", () => {
  test("parses x.com status URLs", () => {
    expect(
      parseTweetId("https://x.com/_duyet/status/2089665924454633766")
    ).toBe("2089665924454633766");
  });

  test("parses twitter.com status URLs", () => {
    expect(
      parseTweetId("https://twitter.com/_duyet/status/2089665924454633766")
    ).toBe("2089665924454633766");
  });

  test("parses /i/web/status URLs", () => {
    expect(parseTweetId("https://x.com/i/web/status/2089665924454633766")).toBe(
      "2089665924454633766"
    );
    expect(
      parseTweetId("https://twitter.com/i/web/status/2089665924454633766")
    ).toBe("2089665924454633766");
  });

  test("parses mobile and www hosts, query strings, and photo suffixes", () => {
    expect(
      parseTweetId(
        "https://mobile.twitter.com/_duyet/status/2089665924454633766?s=20"
      )
    ).toBe("2089665924454633766");
    expect(
      parseTweetId(
        "https://www.x.com/_duyet/status/2089665924454633766/photo/1"
      )
    ).toBe("2089665924454633766");
  });

  test("parses scheme-less URLs and raw ids", () => {
    expect(parseTweetId("x.com/_duyet/status/2089665924454633766")).toBe(
      "2089665924454633766"
    );
    expect(parseTweetId("2089665924454633766")).toBe("2089665924454633766");
  });

  test("rejects non-status URLs", () => {
    expect(parseTweetId("https://x.com/_duyet")).toBeNull();
    expect(parseTweetId("https://example.com/status/123")).toBeNull();
    expect(parseTweetId("")).toBeNull();
    expect(parseTweetId("not-a-url")).toBeNull();
  });
});

describe("parseTweetUrl", () => {
  test("keeps the original permalink and handle", () => {
    const parsed = parseTweetUrl(
      "https://x.com/_duyet/status/2089665924454633766"
    );
    expect(parsed).toEqual({
      id: "2089665924454633766",
      url: "https://x.com/_duyet/status/2089665924454633766",
      handle: "_duyet",
    });
  });

  test("does not treat /i/ as a handle", () => {
    const parsed = parseTweetUrl(
      "https://x.com/i/web/status/2089665924454633766"
    );
    expect(parsed?.id).toBe("2089665924454633766");
    expect(parsed?.handle).toBeUndefined();
  });
});

describe("embedXPosts", () => {
  test("turns a blockquote whose last line is a bare status URL into an embed", () => {
    const html = `<blockquote>
<p>Wait, I can install Tailscale on the Grok Bot Computer.
https://x.com/_duyet/status/2089665924454633766</p>
</blockquote>`;
    const out = embedXPosts(html);
    expect(out).toContain(`class="${TWEET_EMBED_WRAP_CLASS}"`);
    expect(out).not.toContain(`class="${TWEET_ROW_CLASS}"`);
    expect(out).toContain('class="twitter-tweet"');
    expect(out).toContain("Wait, I can install Tailscale");
    expect(out).toContain(
      'href="https://x.com/_duyet/status/2089665924454633766"'
    );
    expect(out).toContain("2089665924454633766");
  });

  test("turns a blockquote whose last line is a status link into an embed", () => {
    const html = `<blockquote>
<p>The network is also very fast.</p>
<p><a href="https://x.com/_duyet/status/2089665924454633766">https://x.com/_duyet/status/2089665924454633766</a></p>
</blockquote>`;
    const out = embedXPosts(html);
    expect(out).toContain(`class="${TWEET_EMBED_WRAP_CLASS}"`);
    expect(out).toContain('class="twitter-tweet"');
    expect(out).toContain("The network is also very fast.");
    expect(out).toContain(
      'href="https://x.com/_duyet/status/2089665924454633766"'
    );
  });

  test("turns a paragraph that is only a status URL into an embed", () => {
    const html = `<p>https://twitter.com/_duyet/status/2070880670852005898</p>`;
    const out = embedXPosts(html);
    expect(out).toContain(`class="${TWEET_EMBED_WRAP_CLASS}"`);
    expect(out).not.toContain(`class="${TWEET_ROW_CLASS}"`);
    expect(out).toContain('<blockquote class="twitter-tweet">');
    expect(out).toContain("2070880670852005898");
    expect(out).toContain("<p>");
  });

  test("turns a paragraph that is only a status link into an embed", () => {
    const html = `<p><a href="https://x.com/i/web/status/2069746255333654869">tweet</a></p>`;
    const out = embedXPosts(html);
    expect(out).toContain(`class="${TWEET_EMBED_WRAP_CLASS}"`);
    expect(out).toContain('class="twitter-tweet"');
    expect(out).toContain("2069746255333654869");
    expect(out).toContain(">tweet</a>");
  });

  test("does not embed a casual in-sentence x.com mention", () => {
    const html = `<p>Comment on this post <a href="https://x.com/_duyet/status/2089665924454633766">there</a>.</p>`;
    const out = embedXPosts(html);
    expect(out).not.toContain("twitter-tweet");
    expect(out).not.toContain("x-embed");
    expect(out).toContain("Comment on this post");
    expect(out).toContain(">there</a>.");
  });

  test("does not embed a regular blockquote without a status URL", () => {
    const html = `<blockquote><p>Just a quote about Grok Bot.</p></blockquote>`;
    expect(embedXPosts(html)).toBe(html);
  });

  test("is idempotent on already-embedded tweets", () => {
    const html = `<blockquote class="twitter-tweet"><p>hi</p><a href="https://x.com/_duyet/status/1">1</a></blockquote>`;
    const once = embedXPosts(html);
    expect(once).toContain(`class="${TWEET_EMBED_WRAP_CLASS}"`);
    expect(once).not.toContain(`class="${TWEET_ROW_CLASS}"`);
    expect(once).toContain('<blockquote class="twitter-tweet">');
    expect(embedXPosts(once)).toBe(once);
  });

  test("puts two consecutive embeds in one tweet-row", () => {
    const html = `<blockquote>
<p>Every company still needs some drama.
https://x.com/_duyet/status/2093007340824035383</p>
</blockquote>
<blockquote>
<p>Since the Grok bot has its own desktop computer.
https://x.com/_duyet/status/2089687655458259272</p>
</blockquote>`;
    const out = embedXPosts(html);
    expect(out.match(/twitter-tweet/g) ?? []).toHaveLength(2);
    expect(out.match(/x-embed/g) ?? []).toHaveLength(2);
    expect(
      out.match(new RegExp(`class="${TWEET_ROW_CLASS}"`, "g")) ?? []
    ).toHaveLength(1);
    expect(out).toMatch(
      new RegExp(
        `<div class="${TWEET_ROW_CLASS}">[\\s\\S]*x-embed[\\s\\S]*x-embed[\\s\\S]*</div>`
      )
    );
    expect(embedXPosts(out)).toBe(out);
  });

  test("rows consecutive embeds when a converted quote contains a nested div", () => {
    const html = `<blockquote>
<p>Quote with <div class="inner">nested</div> markup.
https://x.com/_duyet/status/2093007340824035383</p>
</blockquote>
<blockquote>
<p>Second.
https://x.com/_duyet/status/2089687655458259272</p>
</blockquote>`;
    const out = embedXPosts(html);
    expect(out.match(/twitter-tweet/g) ?? []).toHaveLength(2);
    expect(out.match(/x-embed/g) ?? []).toHaveLength(2);
    expect(
      out.match(new RegExp(`class="${TWEET_ROW_CLASS}"`, "g")) ?? []
    ).toHaveLength(1);
    expect(out).toContain('class="inner"');
    expect(out).toContain("nested");
    expect(out).toContain("2093007340824035383");
    expect(out).toContain("2089687655458259272");
    expect(out).toMatch(
      new RegExp(
        `<div class="${TWEET_ROW_CLASS}">[\\s\\S]*x-embed[\\s\\S]*x-embed[\\s\\S]*</div>`
      )
    );
    expect(embedXPosts(out)).toBe(out);
  });

  test("does not row a single embed or embeds split by prose", () => {
    const html = `<blockquote>
<p>Quote one.
https://x.com/_duyet/status/2093007340824035383</p>
</blockquote>
<p>They have schedules.</p>
<blockquote>
<p>Quote two.
https://x.com/_duyet/status/2089687655458259272</p>
</blockquote>`;
    const out = embedXPosts(html);
    expect(out.match(/twitter-tweet/g) ?? []).toHaveLength(2);
    expect(out).not.toContain(`class="${TWEET_ROW_CLASS}"`);
    expect(out).toContain("They have schedules.");
  });

  test("leaves an explicit tweet-row wrapper alone", () => {
    const html = `<div class="${TWEET_ROW_CLASS}">
<blockquote>
<p>Quote one.
https://x.com/_duyet/status/2093007340824035383</p>
</blockquote>
<blockquote>
<p>Quote two.
https://x.com/_duyet/status/2089687655458259272</p>
</blockquote>
</div>`;
    const out = embedXPosts(html);
    expect(
      out.match(new RegExp(`class="${TWEET_ROW_CLASS}"`, "g")) ?? []
    ).toHaveLength(1);
    expect(out.match(/x-embed/g) ?? []).toHaveLength(2);
    expect(embedXPosts(out)).toBe(out);
  });

  test("converts grok-bot-style quotes and leaves the lead and inline link alone", () => {
    const html = `
<p>I was on SuperGrok Heavy because of Grok Bot.</p>
<p>My first impression was just: wow.</p>
<p>Comment on this post <a href="https://x.com/_duyet/status/2089665924454633766">there</a>.</p>
<blockquote>
<p>Wait, I can install @Tailscale and @herdrdev on the Grok Bot Computer. I will ask it to install Grok Build and then work on some repos first. The network is also very fast.
<a href="https://x.com/_duyet/status/2089665924454633766">https://x.com/_duyet/status/2089665924454633766</a></p>
</blockquote>
<blockquote>
<p>Since the Grok bot has its own desktop computer.
<a href="https://x.com/_duyet/status/2089687655458259272">https://x.com/_duyet/status/2089687655458259272</a></p>
</blockquote>
<blockquote>
<p>I migrated chmonitor.dev from Nextjs 15 to Tanstack Start.
<a href="https://x.com/_duyet/status/2070880670852005898">https://x.com/_duyet/status/2070880670852005898</a></p>
</blockquote>
<blockquote>
<p>You give your AI a prompt, the AI spits out an output.
<a href="https://x.com/_duyet/status/2069746255333654869">https://x.com/_duyet/status/2069746255333654869</a></p>
</blockquote>
<blockquote>
<p>I run Claude inside agent sandboxes on a Kubernetes cluster.
<a href="https://x.com/_duyet/status/2070201703241281789">https://x.com/_duyet/status/2070201703241281789</a></p>
</blockquote>
<blockquote>
<p>I am building AnyRouter to solve my problem.
<a href="https://x.com/_duyet/status/2078848270064066623">https://x.com/_duyet/status/2078848270064066623</a></p>
</blockquote>`;
    const out = embedXPosts(html);
    const embeds = out.match(/twitter-tweet/g) ?? [];
    expect(embeds).toHaveLength(6);
    expect(out.match(/x-embed/g) ?? []).toHaveLength(6);
    expect(
      out.match(new RegExp(`class="${TWEET_ROW_CLASS}"`, "g")) ?? []
    ).toHaveLength(1);
    expect(out).toContain("I was on SuperGrok Heavy because of Grok Bot.");
    expect(out).toContain("Wait, I can install @Tailscale");
    expect(out).toContain("I am building AnyRouter");
    // inline mention stays a sentence, not a 7th embed
    expect(out).toMatch(
      /Comment on this post <a href="https:\/\/x\.com\/_duyet\/status\/2089665924454633766">there<\/a>\./
    );
  });
});

describe("CSP", () => {
  test("allows platform.twitter.com widgets.js and tweet iframes", () => {
    const headers = readFileSync(
      join(import.meta.dirname!, "../../public/_headers"),
      "utf8"
    );
    expect(headers).toMatch(/script-src[^;]*https:\/\/platform\.twitter\.com/);
    expect(headers).toMatch(/frame-src[^;]*https:\/\/platform\.twitter\.com/);
  });
});

describe("post page widgets.js", () => {
  test("widgets.js is loaded on post pages", () => {
    const route = readFileSync(
      join(
        import.meta.dirname!,
        "../../src/routes/$year/$month/$slug/index.tsx"
      ),
      "utf8"
    );
    const content = readFileSync(
      join(import.meta.dirname!, "../../src/routes/$year/$month/-content.tsx"),
      "utf8"
    );
    expect(route).toContain("TWITTER_WIDGETS_SRC");
    expect(content).toContain("TWITTER_WIDGETS_SRC");
    expect(content).toContain("useTwitterWidgets");
  });
});
