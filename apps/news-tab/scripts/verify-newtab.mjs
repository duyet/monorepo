#!/usr/bin/env node
/**
 * CLI lever for .cursor/skills/verify-news-tab
 *
 * Fetches live news.duyet.net, paints the unpacked new-tab with the same
 * digest, screenshots both, and writes a JSON feature map.
 *
 *   pnpm --filter news-tab verify
 *   node apps/news-tab/scripts/verify-newtab.mjs --out /tmp/verify-news-tab
 */
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { enrichDigest, normalizeDigest } from "../js/api.js";
import { highlightTitle, tagsForHighlight } from "../js/highlight.js";
import { topicColor } from "../js/topic-color.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://news.duyet.net";
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
};

function argValue(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

function chromeBin() {
  return (
    process.env.CHROME_BIN ||
    ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome"].find(existsSync)
  );
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

function expectedMap(digest) {
  const bullets = (digest.tldr?.bullets_vi || []).filter((b) => b.text);
  const shown = bullets.slice(0, 8);
  return {
    brand: "Hôm nay AI có gì mới?",
    searchPlaceholder: "Tìm kiếm...",
    chromeTab: "Tab Chrome",
    submit: "Gửi bài",
    langSelected: "vi",
    allChip: "Tất cả",
    categories: digest.categories.map((c) => `${c.name}:${c.count}`),
    trending: digest.trending.map((t) => `${t.tag}:${t.count}`),
    aidrHeading: "AI;DR",
    aidrDate: digest.tldr?.date || "",
    layout: "a",
    columns: 2,
    shownBullets: shown.length,
    firstBullet: shown[0]
      ? (() => {
          const tags = digest.items?.[shown[0].item_ids?.[0]]?.tags || [];
          const segments = highlightTitle(
            shown[0].text,
            tagsForHighlight(tags)
          );
          const highlighted = segments
            .filter((s) => s.highlighted && s.tag)
            .map((s) => ({
              text: s.text,
              tag: s.tag,
              color: topicColor(s.tag).light,
            }));
          const topic =
            digest.items?.[shown[0].item_ids?.[0]]?.tags?.[0] ||
            highlighted[0]?.tag ||
            null;
          return {
            hasThumb: Boolean(shown[0].image_url),
            topic,
            topicColor: topic ? topicColor(topic).light : null,
            highlights: highlighted,
            lineClamp: 2,
          };
        })()
      : null,
  };
}

function featureMapFromHtml(html) {
  const pick = (re) => html.match(re)?.[1]?.trim() || "";
  const chips = [...html.matchAll(/class="chip[\s"][^>]*>([\s\S]*?)<\/button>/g)].map(
    (m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
  );
  const trends = [
    ...html.matchAll(/class="trend-chip[\s"][^>]*>([\s\S]*?)<\/button>/g),
  ].map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  const thumbs = (html.match(/class="thumb"/g) || []).length;
  const topicTags = (html.match(/class="topic-tag/g) || []).length;
  const colored = (html.match(/topic-colored/g) || []).length;
  const lists = (html.match(/class="tldr-list"/g) || []).length;
  return {
    brand: pick(/id="brand"[^>]*>([\s\S]*?)<\/a>/),
    searchPlaceholder: pick(/id="search"[^>]*placeholder="([^"]+)"/),
    chromeTab: pick(/id="chrome-tab"[^>]*>([\s\S]*?)<\/a>/),
    submit: pick(/id="submit-label"[^>]*>([\s\S]*?)<\/span>/),
    langSelected: /data-lang="vi"[^>]*aria-pressed="true"/.test(html)
      ? "vi"
      : "en",
    allChip: chips[0] || "",
    categoryCount: chips.length,
    trendingCount: trends.length,
    aidrHeading: /<h1>\s*AI;DR\s*<\/h1>/.test(html),
    aidrDate: pick(/id="tldr-meta"[^>]*>([\s\S]*?)<\/span>/),
    layoutA: /data-aidr-layout="a"/.test(html),
    columns: lists,
    thumbs,
    topicTags,
    colored,
    twoColumn: lists === 2,
    numbered: /class="tldr-list"/.test(html),
  };
}

function siteMapFromHtml(html) {
  return {
    brand: /Hôm nay AI có gì mới\?/.test(html),
    search: /Tìm kiếm\.\.\./.test(html),
    chromeTab: /Tab Chrome/.test(html),
    submit: /Gửi bài/.test(html),
    allChip: /Tất cả/.test(html),
    trending: /Xu hướng/i.test(html),
    aidr: />AI;DR</.test(html),
    topicColored: /topic-colored/.test(html),
  };
}

function runChrome(args) {
  const bin = chromeBin();
  if (!bin) throw new Error("google-chrome not found");
  return new Promise((resolve, reject) => {
    const child = spawn(
      bin,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--hide-scrollbars",
        "--window-size=1280,900",
        "--virtual-time-budget=12000",
        ...args,
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d;
    });
    child.stderr.on("data", (d) => {
      stderr += d;
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`chrome ${code}: ${stderr.slice(0, 400)}`));
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function startServer(digest) {
  const html = readFileSync(join(root, "newtab.html"), "utf8").replace(
    '<script type="module" src="js/boot.js"></script>',
    `<script>window.__NEWS_TAB_DIGEST__=${JSON.stringify(digest)};</script>\n    <script type="module" src="js/boot.js"></script>`
  );
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url, "http://127.0.0.1");
      if (url.pathname === "/digest.json") {
        res.writeHead(200, { "content-type": MIME[".json"] });
        res.end(JSON.stringify(digest));
        return;
      }
      if (url.pathname === "/" || url.pathname === "/newtab.html") {
        res.writeHead(200, { "content-type": MIME[".html"] });
        res.end(html);
        return;
      }
      const rel = url.pathname.replace(/^\/+/, "");
      const file = join(root, rel);
      if (!file.startsWith(root) || !existsSync(file)) {
        res.writeHead(404);
        res.end("missing");
        return;
      }
      res.writeHead(200, {
        "content-type": MIME[extname(file)] || "application/octet-stream",
      });
      res.end(readFileSync(file));
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

function dumpDom(url) {
  return new Promise((resolve, reject) => {
    const bin = chromeBin();
    const child = spawn(
      bin,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--dump-dom",
        "--virtual-time-budget=12000",
        url,
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d;
    });
    child.stderr.on("data", (d) => {
      stderr += d;
    });
    child.on("close", (code) => {
      if (!stdout.includes("<html")) {
        reject(new Error(`dump-dom failed ${code}: ${stderr.slice(0, 400)}`));
        return;
      }
      resolve(stdout);
    });
  });
}

async function main() {
  const outDir = argValue("--out", "/tmp/verify-news-tab");
  mkdirSync(outDir, { recursive: true });

  const [publicRaw, feedRaw] = await Promise.all([
    fetchJson(`${SITE}/api/public`),
    fetchJson(`${SITE}/api/feed?days=3`),
  ]);
  const digest = enrichDigest(normalizeDigest(publicRaw), feedRaw);
  const expected = expectedMap(digest);
  writeFileSync(join(outDir, "digest.json"), JSON.stringify(digest, null, 2));
  writeFileSync(join(outDir, "expected.json"), JSON.stringify(expected, null, 2));

  const { server, port } = await startServer(digest);
  const newtabUrl = `http://127.0.0.1:${port}/newtab.html`;
  const siteUrl = `${SITE}/`;

  try {
    const newtabPng = join(outDir, "newtab.png");
    const sitePng = join(outDir, "site.png");
    await runChrome([`--screenshot=${newtabPng}`, newtabUrl]);
    await runChrome([`--screenshot=${sitePng}`, siteUrl]);

    const newtabHtml = await dumpDom(newtabUrl);
    const siteHtml = await dumpDom(siteUrl);
    writeFileSync(join(outDir, "newtab.html"), newtabHtml);
    writeFileSync(join(outDir, "site.html"), siteHtml);

    const observed = featureMapFromHtml(newtabHtml);
    const site = siteMapFromHtml(siteHtml);

    const checks = {
      brand: observed.brand === expected.brand,
      searchPlaceholder: observed.searchPlaceholder === expected.searchPlaceholder,
      chromeTab: observed.chromeTab === expected.chromeTab,
      submit: observed.submit === expected.submit,
      langSelected: observed.langSelected === "vi",
      allChip: observed.allChip.startsWith(expected.allChip),
      aidrHeading: observed.aidrHeading === true,
      aidrDate: observed.aidrDate === expected.aidrDate,
      layoutA: observed.layoutA,
      twoColumn: observed.twoColumn,
      numbered: observed.numbered,
      thumbs: observed.thumbs >= Math.min(4, expected.shownBullets),
      topicTags: observed.topicTags >= 1,
      colored: observed.colored >= 1,
      trendingPresent: observed.trendingCount === expected.trending.length,
      categoriesPresent: observed.categoryCount === expected.categories.length + 1,
      siteBrand: site.brand,
      siteSearch: site.search,
      siteAidr: site.aidr,
      siteHighlights: site.topicColored,
    };

    const failed = Object.entries(checks)
      .filter(([, ok]) => !ok)
      .map(([name]) => name);
    const verdict = failed.length === 0 ? "VERIFIED" : "NOT VERIFIED";
    const report = {
      verdict,
      failed,
      expected,
      observed,
      site,
      checks,
      screenshots: { newtab: newtabPng, site: sitePng },
      urls: { newtab: newtabUrl, site: siteUrl },
    };
    writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ verdict, failed, outDir, checks }, null, 2));
    if (failed.length) process.exitCode = 1;
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
