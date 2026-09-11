import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const brandDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../public/brand"
);

const files = [
  "logo.svg",
  "logo.png",
  "logo-64.png",
  "logo-512.png",
  "logo-light.svg",
  "logo-light-64.png",
  "logo-light-512.png",
  "logo-dark.svg",
  "logo-dark-64.png",
  "logo-dark-512.png",
  "logo-on-light.svg",
  "logo-on-light-64.png",
  "logo-on-light-512.png",
  "logo-on-dark.svg",
  "logo-on-dark-64.png",
  "logo-on-dark-512.png",
];

describe("brand kit assets", () => {
  it("ships every public /brand file", () => {
    for (const file of files) {
      expect(existsSync(join(brandDir, file)), `missing ${file}`).toBe(true);
    }
  });
});
