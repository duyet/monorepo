import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PUBLIC_API_PATH } from "../../worker/public-cors.js";

const newsTab = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../news-tab"
);

describe("news-tab extension contract", () => {
  it("loads as an unpacked MV3 new-tab and points at /api/public", () => {
    const manifest = JSON.parse(
      readFileSync(path.join(newsTab, "manifest.json"), "utf-8")
    );
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.chrome_url_overrides.newtab).toBe("newtab.html");
    expect(manifest.host_permissions).toEqual(
      expect.arrayContaining(["https://news.duyet.net/*"])
    );

    const config = readFileSync(path.join(newsTab, "config.js"), "utf-8");
    expect(config).toContain(`https://news.duyet.net${PUBLIC_API_PATH}`);
    expect(config).toContain("http://localhost:3014/api/public");
  });
});
