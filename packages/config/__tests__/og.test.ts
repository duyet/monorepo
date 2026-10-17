import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BAYER } from "@duyet/dither-kit/dither-cell";
import {
  BAYER_4X4,
  OG_HEIGHT,
  OG_WIDTH,
  cardToPng,
  cardToSvg,
  loadCardImage,
  ogHeadLinks,
  ogMeta,
  ogMetaFromConfig,
  type OgMetaTag,
} from "../src";

const prop = (m: OgMetaTag[], k: string) =>
  m.find((t) => t.property === k)?.content;
const name = (m: OgMetaTag[], k: string) => m.find((t) => t.name === k)?.content;

describe("ogMeta", () => {
  const base = {
    url: "https://blog.duyet.net/2026/09/i-dont-read-code-anymore",
    title: "I don't read code anymore",
    description: "It's been a year or two.",
    image: "https://blog.duyet.net/og/2026-09-i-dont-read-code-anymore.png",
  };

  it("emits the full card set with an image", () => {
    const m = ogMeta(base);
    expect(prop(m, "og:type")).toBe("website");
    expect(prop(m, "og:url")).toBe(base.url);
    expect(prop(m, "og:title")).toBe(base.title);
    expect(prop(m, "og:description")).toBe(base.description);
    expect(prop(m, "og:site_name")).toBe("duyet.net");
    expect(prop(m, "og:image")).toBe(base.image);
    expect(prop(m, "og:image:width")).toBe("1200");
    expect(prop(m, "og:image:height")).toBe("630");
    expect(prop(m, "og:image:alt")).toBe(base.title);
    expect(name(m, "twitter:card")).toBe("summary_large_image");
    expect(name(m, "twitter:title")).toBe(base.title);
    expect(name(m, "twitter:image")).toBe(base.image);
    expect(name(m, "twitter:creator")).toBe("@_duyet");
  });

  it("omits every image tag when there is no image", () => {
    const m = ogMeta({ ...base, image: undefined });
    expect(prop(m, "og:image")).toBeUndefined();
    expect(prop(m, "og:image:width")).toBeUndefined();
    expect(prop(m, "og:image:alt")).toBeUndefined();
    expect(name(m, "twitter:image")).toBeUndefined();
    // a card with no image must not claim summary_large_image
    expect(name(m, "twitter:card")).toBe("summary");
  });

  it("honours type, dimensions and creator overrides", () => {
    const m = ogMeta({
      ...base,
      type: "article",
      imageWidth: 1920,
      imageHeight: 1080,
      creator: "someone",
      locale: "en_US",
    });
    expect(prop(m, "og:type")).toBe("article");
    expect(prop(m, "og:image:width")).toBe("1920");
    expect(prop(m, "og:image:height")).toBe("1080");
    expect(prop(m, "og:locale")).toBe("en_US");
    expect(name(m, "twitter:creator")).toBe("@someone");
  });

  it("can suppress image dimensions", () => {
    const m = ogMeta({ ...base, imageDimensions: false });
    expect(prop(m, "og:image")).toBe(base.image);
    expect(prop(m, "og:image:width")).toBeUndefined();
  });

  it("never emits an empty og:image string", () => {
    const m = ogMeta({ ...base, image: "" });
    expect(prop(m, "og:image")).toBeUndefined();
  });
});

describe("ogMetaFromConfig", () => {
  it("revives the AppMetadata.openGraph config that no app read", () => {
    const m = ogMetaFromConfig({
      title: "Homelab | duyet.net",
      description: "MicroK8s cluster monitoring dashboard",
      openGraph: {
        title: "Homelab Dashboard | duyet.net",
        description: "MicroK8s cluster monitoring",
        url: "https://homelab.duyet.net",
        siteName: "duyet.net",
        images: [
          {
            url: "https://homelab.duyet.net/og-image.png",
            width: 1200,
            height: 630,
            alt: "Homelab Dashboard",
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Homelab Dashboard | duyet.net",
        description: "MicroK8s cluster monitoring",
        images: ["https://homelab.duyet.net/og-image.png"],
        creator: "@_duyet",
      },
    });
    expect(prop(m, "og:url")).toBe("https://homelab.duyet.net");
    expect(prop(m, "og:title")).toBe("Homelab Dashboard | duyet.net");
    expect(prop(m, "og:image")).toBe("https://homelab.duyet.net/og-image.png");
    expect(prop(m, "og:locale")).toBe("en_US");
    expect(name(m, "twitter:card")).toBe("summary_large_image");
    // the @ must be normalized, not doubled
    expect(name(m, "twitter:creator")).toBe("@_duyet");
  });

  it("lets a per-page override win over config defaults", () => {
    const m = ogMetaFromConfig(
      {
        title: "T",
        description: "D",
        openGraph: {
          title: "Config title",
          description: "Config description",
          url: "https://blog.duyet.net",
          siteName: "duyet.net",
          images: [{ url: "https://blog.duyet.net/og/config.png", width: 1200, height: 630, alt: "a" }],
          locale: "en_US",
          type: "website",
        },
      },
      { title: "Page title", url: "https://blog.duyet.net/2026/09/x" },
    );
    expect(prop(m, "og:title")).toBe("Page title");
    expect(prop(m, "og:url")).toBe("https://blog.duyet.net/2026/09/x");
    // image still inherited from config
    expect(prop(m, "og:image")).toBe("https://blog.duyet.net/og/config.png");
  });

  it("falls back to plain title/description when config has no openGraph", () => {
    const m = ogMetaFromConfig({ title: "Photos", description: "Photos of things" });
    expect(prop(m, "og:title")).toBe("Photos");
    expect(prop(m, "og:description")).toBe("Photos of things");
    expect(prop(m, "og:image")).toBeUndefined();
    expect(name(m, "twitter:card")).toBe("summary");
  });
});

describe("ogHeadLinks", () => {
  it("puts canonical in links, not meta", () => {
    const links = ogHeadLinks({
      url: "https://cv.duyet.net/pdf",
      icon: "https://duyet.net/brand/logo.svg",
      apple: "https://duyet.net/brand/logo-512.png",
      manifest: "/manifest.json",
    });
    expect(links).toContainEqual({ rel: "canonical", href: "https://cv.duyet.net/pdf" });
    expect(links.some((l) => l.rel === "icon" && l.type === "image/svg+xml")).toBe(true);
    expect(links).toContainEqual({ rel: "manifest", href: "/manifest.json" });
  });

  it("omits canonical when url is empty", () => {
    const links = ogHeadLinks({ url: "" });
    expect(links).toEqual([]);
  });
});

describe("dither card", () => {
  const input = {
    title: "I don't read code anymore",
    eyebrow: "AI · AI Harness Engineering",
    description: "It's been a year or two. Disagree or debate me all you want.",
    meta: "Sep 26, 2026 · 5 min read",
    siteName: "blog.duyet.net",
  };

  it("uses dither-kit's Bayer matrix, not a copy of it", () => {
    // The claim in the test name used to be checked by asserting the *shape*
    // (4x4, 16 distinct values in (0,1)) — which a hand-copied duplicate also
    // satisfies. It is an identity claim, so compare against the real thing.
    // `og-card.ts` re-exports dither-kit's `BAYER` under the older name, so
    // this is a reference check, and it fails if the two ever drift apart.
    expect(BAYER_4X4).toBe(BAYER);

    // Kept as a property check: a 4x4 matrix of 16 distinct thresholds in the
    // open unit interval, so no cell is unconditionally lit or unlit.
    expect(BAYER_4X4.length).toBe(4);
    for (const row of BAYER_4X4) {
      expect(row.length).toBe(4);
      for (const v of row) {
        expect(v).toBeGreaterThan(0);
        expect(v).toBeLessThan(1);
      }
    }
    expect(new Set(BAYER_4X4.flat()).size).toBe(16);
  });

  it("renders a type-only card at 1200x630 with no image", () => {
    const svg = cardToSvg(input);
    expect(svg).toContain(`width="${OG_WIDTH}"`);
    expect(svg).toContain(`height="${OG_HEIGHT}"`);
    // the approved fallback look: no dither rects, just the paper ground
    expect(svg).not.toContain("<g><rect");
    // the apostrophe is XML-escaped and the title is wrapped across two lines
    expect(svg).toContain("I don&apos;t read code");
    expect(svg).toContain("anymore");
  });

  it("escapes HTML in titles and descriptions", () => {
    const svg = cardToSvg({ ...input, title: '<script>alert("x")</script>' });
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });

  it("escapes ampersands that would break XML", () => {
    const svg = cardToSvg({ ...input, title: "Rust & Go" });
    expect(svg).toContain("Rust &amp; Go");
  });

  /**
   * The invariant that actually matters: no rendered title line may cross into
   * the dither region. Measured with the same per-character ratio table the
   * renderer uses, so the test fails if the layout math regresses.
   */
  const titleLinesWithinPanel = (svg: string, panelFrac = 0.62) => {
    const pad = 1200 * 0.055;
    const budget = 1200 * panelFrac - pad * 2;
    const re = /<text x="([\d.]+)" y="([\d.]+)" font-family="[^"]*" font-size="(\d+)" fill="#0c0c0c"[^>]*>([^<]*)<\/text>/g;
    const over: Array<{ text: string; width: number }> = [];
    for (let m = re.exec(svg); m !== null; m = re.exec(svg)) {
      const [, , , sizeStr, text] = m;
      const size = Number(sizeStr);
      const width = [...text].reduce(
        (w, ch) =>
          w +
          ({
            " ": 0.26, i: 0.28, j: 0.3, l: 0.3, I: 0.34, t: 0.34, f: 0.36,
            r: 0.38, ".": 0.28, ",": 0.28, "'": 0.22, "’": 0.22, ":": 0.3,
            ";": 0.3, m: 0.86, w: 0.74, M: 0.9, W: 0.88, "-": 0.36,
            "—": 0.9, "/": 0.4, "(": 0.36, ")": 0.36,
          })[ch as string] ?? 0.52,
        0,
      ) * size;
      if (width > budget) over.push({ text, width: Math.round(width) });
    }
    return { over, budget: Math.round(budget) };
  };

  it("never lets a title line overflow into the dither panel", () => {
    const titles = [
      "Claws",
      "I don't read code anymore",
      "Autonomous Claude Code Migrate Nextjs to Tanstack Start",
      "Letting Claude Code work overnight, 2026",
      "www.some-very-long-hostname.example.com/path/to/thing",
      "MWMWMWMWMWMW mwmwmmm Supercalifragilisticexpialidocious",
      "x".repeat(200),
      "A",
    ];
    for (const title of titles) {
      const { over, budget } = titleLinesWithinPanel(cardToSvg({ ...input, title }));
      expect(over, `"${title.slice(0, 40)}" overflowed ${budget}px: ${JSON.stringify(over)}`)
        .toEqual([]);
    }
  });

  it("scales a single short title up so it is not lost in whitespace", () => {
    const sizeOf = (title: string) => {
      const svg = cardToSvg({ ...input, title, description: undefined });
      const m = svg.match(/font-family="Libertinus[^"]*" font-size="(\d+)"/);
      return m ? Number(m[1]) : 0;
    };
    expect(sizeOf("Claws")).toBeGreaterThan(sizeOf("I don't read code anymore"));
  });

  it("clamps a runaway title rather than overflowing", () => {
    const huge = cardToSvg({ ...input, title: "x".repeat(200) });
    expect(huge).toContain("…");
  });

  it("wraps a long description to at most 3 lines", () => {
    const svg = cardToSvg({
      ...input,
      description: "word ".repeat(120).trim(),
    });
    // description text nodes are 25px; count them
    const descLines = svg.match(/font-size="25"/g) ?? [];
    expect(descLines.length).toBeLessThanOrEqual(3);
  });

  it("emits dither rects when an image is supplied", () => {
    // 1x1 png
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    const svg = cardToSvg({ ...input, image: png });
    expect(svg).toContain("<rect");
  });

  it("rasterizes to a real 1200x630 PNG", async () => {
    const png = await cardToPng(input);
    // PNG IHDR: width/height are big-endian uint32 at bytes 16 and 20
    expect(png.readUInt32BE(16)).toBe(OG_WIDTH);
    expect(png.readUInt32BE(20)).toBe(OG_HEIGHT);
  }, 20_000);
});

describe("loadCardImage", () => {
  it("returns undefined for an unreachable host instead of throwing", async () => {
    const buf = await loadCardImage(
      "https://og-lab.invalid/does-not-exist.png",
      { retries: 0, timeoutMs: 3000 },
    );
    expect(buf).toBeUndefined();
  }, 10_000);

  it("reads a local file", async () => {
    const buf = await loadCardImage(
      new URL("../../../apps/home/public/brand/logo.svg", import.meta.url).pathname,
    );
    expect(buf?.length).toBeGreaterThan(0);
  });
});

describe("ogMeta shape matches the reference implementation", () => {
  it("covers the tag set apps/x-algo already emits", () => {
    const src = readFileSync(
      new URL("../../../apps/x-algo/src/routes/__root.tsx", import.meta.url),
      "utf8",
    );
    // the reference app is the canonical shape; these keys must all be
    // expressible through the helper
    const m = ogMeta({
      url: "https://x-algo.duyet.net",
      title: "T",
      description: "D",
      image: "https://x-algo.duyet.net/og.jpg",
      imageWidth: 1280,
      imageHeight: 720,
      creator: "_duyet",
    });
    for (const key of [
      "og:type",
      "og:site_name",
      "og:title",
      "og:description",
      "og:url",
      "og:image",
      "og:image:alt",
      "og:image:width",
      "og:image:height",
    ]) {
      expect(src, `x-algo emits ${key}`).toContain(key);
      expect(prop(m, key), `helper emits ${key}`).toBeDefined();
    }
    for (const key of [
      "twitter:card",
      "twitter:title",
      "twitter:description",
      "twitter:image",
      "twitter:creator",
    ]) {
      expect(src, `x-algo emits ${key}`).toContain(key);
      expect(name(m, key), `helper emits ${key}`).toBeDefined();
    }
  });
});
