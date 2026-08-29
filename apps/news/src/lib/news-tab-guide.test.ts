import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CHROME_EXTENSIONS_HREF,
  GUIDE_COPY,
  NEWS_TAB_ZIP_ERROR_IMG,
} from "./news-tab-guide";
import {
  NEWS_TAB_UNPACKED_DIR,
  NEWS_TAB_ZIP_ERROR_IMG_HEIGHT,
  NEWS_TAB_ZIP_ERROR_IMG_WIDTH,
  NEWS_TAB_ZIP_FILENAME,
} from "./news-tab-public";

const here = dirname(fileURLToPath(import.meta.url));

describe("news-tab install guide copy", () => {
  it("uses a chrome://extensions href and a real zip-load screenshot", () => {
    expect(CHROME_EXTENSIONS_HREF).toBe("chrome://extensions");
    expect(NEWS_TAB_ZIP_ERROR_IMG).toBe(
      "/media/chrome-load-unpacked-zip-error.png"
    );
    const png = join(
      here,
      "../../public",
      NEWS_TAB_ZIP_ERROR_IMG.replace(/^\//, "")
    );
    expect(existsSync(png)).toBe(true);
    expect(readFileSync(png).subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
    expect(NEWS_TAB_ZIP_ERROR_IMG_WIDTH).toBe(600);
    expect(NEWS_TAB_ZIP_ERROR_IMG_HEIGHT).toBe(360);
  });

  it("tells people to unzip then pick the news-tab folder, never the zip", () => {
    const blobs = [
      GUIDE_COPY.unzipFirst.en,
      GUIDE_COPY.unzipFirst.vi,
      GUIDE_COPY.unzipDetail.en,
      GUIDE_COPY.unzipDetail.vi,
      GUIDE_COPY.loadFolder.en,
      GUIDE_COPY.loadFolder.vi,
    ].join("\n");
    expect(GUIDE_COPY.unzipFirst.en).toMatch(/Unzip first/i);
    expect(GUIDE_COPY.unzipFirst.en).toMatch(/Do not Load unpacked the \.zip/i);
    expect(blobs).toContain(NEWS_TAB_ZIP_FILENAME);
    expect(blobs).toContain(NEWS_TAB_UNPACKED_DIR);
    expect(blobs).toMatch(/manifest\.json/);
    expect(GUIDE_COPY.unzipDetail.en).toMatch(/Chrome cannot load a zip/i);
    expect(GUIDE_COPY.loadFolder.en).toMatch(/Not the \.zip/);
    expect(blobs).not.toMatch(/chrome\.google\.com\/webstore/);
  });

  it("keeps every chrome://extensions mention on /extension as an href", () => {
    const src = readFileSync(join(here, "../routes/extension.tsx"), "utf8");
    const linkRe =
      /<a\b[^>]*href=\{CHROME_EXTENSIONS_HREF\}[^>]*>\s*chrome:\/\/extensions\s*<\/a>/g;
    expect(src).toMatch(linkRe);
    expect(src).toContain("NEWS_TAB_ZIP_ERROR_IMG");
    expect(src).toContain("GUIDE_COPY");
    const stripped = src.replace(linkRe, "");
    expect(stripped).not.toContain("chrome://extensions");
    expect(GUIDE_COPY.pasteExtensions.en).not.toContain("chrome://extensions");
    expect(GUIDE_COPY.pasteExtensions.vi).not.toContain("chrome://extensions");
  });
});
