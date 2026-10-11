import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const headers = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../public/_headers"),
  "utf8"
);

// Pages joins Cache-Control from every matching rule with commas, so a path
// rule that does not detach the /* HTML default ships contradictory max-age
// values (browsers then skip the long cache).
function rules() {
  const out: { path: string; lines: string[] }[] = [];
  for (const line of headers.split("\n")) {
    if (/^\S/.test(line) && !line.startsWith("#")) out.push({ path: line.trim(), lines: [] });
    else if (/^\s+\S/.test(line) && out.length) out[out.length - 1].lines.push(line.trim());
  }
  return out;
}

describe("blog _headers cache policy", () => {
  it("detaches the /* Cache-Control before every path-specific one", () => {
    const specific = rules().filter(
      (r) => r.path !== "/*" && r.lines.some((l) => l.startsWith("Cache-Control:"))
    );
    expect(specific.length).toBeGreaterThan(0);
    for (const r of specific) {
      expect(r.lines.indexOf("! Cache-Control"), r.path).toBeGreaterThanOrEqual(0);
    }
  });

  it("serves hashed assets as immutable for a year", () => {
    const a = rules().find((r) => r.path === "/assets/*");
    expect(a?.lines).toContain("Cache-Control: public, max-age=31536000, immutable");
  });
});
