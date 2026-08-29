import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { NEWS_TAB_UNPACKED_DIR } from "./news-tab-public";
import { buildNewsTabZip, listUnpackedRelPaths } from "./news-tab-zip";

const here = dirname(fileURLToPath(import.meta.url));
const realRoot = join(here, "../../../news-tab");

function writeTree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "news-tab-zip-"));
  for (const [rel, body] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, body);
  }
  return root;
}

function zipNames(buf: Buffer): string[] {
  const sig = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  const eocd = buf.lastIndexOf(sig);
  if (eocd < 0) throw new Error("missing EOCD");
  const count = buf.readUInt16LE(eocd + 8);
  let offset = buf.readUInt32LE(eocd + 16);
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("bad central directory");
    }
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    names.push(
      buf.subarray(offset + 46, offset + 46 + nameLen).toString("utf8")
    );
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return names;
}

function zipFileBytes(buf: Buffer, name: string): Buffer {
  let offset = 0;
  while (offset + 30 <= buf.length && buf.readUInt32LE(offset) === 0x04034b50) {
    const method = buf.readUInt16LE(offset + 8);
    const compSize = buf.readUInt32LE(offset + 18);
    const nameLen = buf.readUInt16LE(offset + 26);
    const extraLen = buf.readUInt16LE(offset + 28);
    const entryName = buf
      .subarray(offset + 30, offset + 30 + nameLen)
      .toString("utf8");
    const dataStart = offset + 30 + nameLen + extraLen;
    const data = buf.subarray(dataStart, dataStart + compSize);
    if (entryName === name) {
      return method === 8 ? inflateRawSync(data) : Buffer.from(data);
    }
    offset = dataStart + compSize;
  }
  throw new Error(`missing zip entry ${name}`);
}

describe("listUnpackedRelPaths", () => {
  it("keeps the MV3 tree and drops tests, docs, and node_modules", () => {
    const root = writeTree({
      "manifest.json": '{"manifest_version":3}',
      "newtab.html": "<html></html>",
      "options.html": "<html></html>",
      "css/newtab.css": "body{}",
      "js/api.js": "export {}",
      "js/api.test.js": "throw new Error('test')",
      "js/boot.js": "import './preview-shim.js'",
      "icons/icon.svg": "<svg></svg>",
      "_locales/en/messages.json": "{}",
      "README.md": "docs",
      "package.json": '{"name":"news-tab"}',
      "node_modules/left-pad/index.js": "nope",
      "scripts/build.js": "nope",
      "dist/.valid": "nope",
    });
    const rels = listUnpackedRelPaths(root);
    expect(rels).toContain("manifest.json");
    expect(rels).toContain("newtab.html");
    expect(rels).toContain("js/api.js");
    expect(rels).toContain("js/boot.js");
    expect(rels).toContain("_locales/en/messages.json");
    expect(rels).not.toContain("js/api.test.js");
    expect(rels).not.toContain("README.md");
    expect(rels).not.toContain("package.json");
    expect(rels.some((r) => r.startsWith("node_modules/"))).toBe(false);
    expect(rels.some((r) => r.startsWith("scripts/"))).toBe(false);
    expect(rels.some((r) => r.startsWith("dist/"))).toBe(false);
  });

  it("refuses a wrangler.toml next to the extension", () => {
    const root = writeTree({
      "manifest.json": "{}",
      "newtab.html": "<html></html>",
      "wrangler.toml": "name = 'nope'",
    });
    expect(() => listUnpackedRelPaths(root)).toThrow(/wrangler/);
  });
});

describe("buildNewsTabZip", () => {
  it("zips files under news-tab/ so Load unpacked can pick that folder", () => {
    const root = writeTree({
      "manifest.json": '{"name":"AI News"}',
      "newtab.html": "<title>tab</title>",
      "js/api.js": "export const ok = 1;\n",
    });
    const zip = buildNewsTabZip(root);
    expect(zip.subarray(0, 2).toString("ascii")).toBe("PK");
    const names = zipNames(zip);
    expect(names).toContain(`${NEWS_TAB_UNPACKED_DIR}/manifest.json`);
    expect(names).toContain(`${NEWS_TAB_UNPACKED_DIR}/newtab.html`);
    expect(names).toContain(`${NEWS_TAB_UNPACKED_DIR}/js/api.js`);
    expect(names.every((n) => n.startsWith(`${NEWS_TAB_UNPACKED_DIR}/`))).toBe(
      true
    );
    expect(
      zipFileBytes(zip, `${NEWS_TAB_UNPACKED_DIR}/manifest.json`).toString(
        "utf8"
      )
    ).toBe('{"name":"AI News"}');
  });

  it("packs the real apps/news-tab tree without tests", () => {
    const rels = listUnpackedRelPaths(realRoot);
    expect(rels).toEqual(
      expect.arrayContaining([
        "manifest.json",
        "newtab.html",
        "options.html",
        "css/newtab.css",
        "js/api.js",
        "js/boot.js",
        "js/newtab.js",
        "icons/icon128.png",
        "_locales/en/messages.json",
        "_locales/vi/messages.json",
      ])
    );
    expect(rels.some((r) => r.endsWith(".test.js"))).toBe(false);
    const zip = buildNewsTabZip(realRoot);
    const names = zipNames(zip);
    expect(names).toContain(`${NEWS_TAB_UNPACKED_DIR}/manifest.json`);
    const manifest = JSON.parse(
      zipFileBytes(zip, `${NEWS_TAB_UNPACKED_DIR}/manifest.json`).toString(
        "utf8"
      )
    );
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.chrome_url_overrides.newtab).toBe("newtab.html");
  });
});
