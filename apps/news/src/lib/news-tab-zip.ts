import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { deflateRawSync } from "node:zlib";
import {
  NEWS_TAB_UNPACKED_DIR,
  NEWS_TAB_ZIP_FILENAME,
} from "./news-tab-public";

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "scripts",
  ".git",
  ".turbo",
  ".wrangler",
]);

const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c >>> 0;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    const mixed = CRC_TABLE[(crc ^ byte) & 0xff] ?? 0;
    crc = mixed ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toPosix(rel: string): string {
  return rel.split(sep).join("/");
}

function skipFile(base: string): boolean {
  if (base.startsWith(".")) return true;
  if (base.endsWith(".test.js") || base.endsWith(".test.ts")) return true;
  if (base.endsWith(".md")) return true;
  if (base === "package.json") return true;
  return false;
}

function dosDateTime(date: Date): { time: number; date: number } {
  const year = date.getFullYear();
  const clampedYear = year < 1980 ? 1980 : year > 2107 ? 2107 : year;
  return {
    time:
      (date.getSeconds() >> 1) |
      (date.getMinutes() << 5) |
      (date.getHours() << 11),
    date:
      date.getDate() |
      ((date.getMonth() + 1) << 5) |
      ((clampedYear - 1980) << 9),
  };
}

export function listUnpackedRelPaths(root: string): string[] {
  if (!existsSync(root)) {
    throw new Error(`news-tab root missing: ${root}`);
  }
  if (existsSync(join(root, "wrangler.toml"))) {
    throw new Error("do not add wrangler.toml; news-tab is not a Worker");
  }

  const out: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!dir) continue;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        stack.push(join(dir, entry.name));
        continue;
      }
      if (!entry.isFile()) continue;
      if (skipFile(entry.name)) continue;
      out.push(toPosix(relative(root, join(dir, entry.name))));
    }
  }
  out.sort();
  if (!out.includes("manifest.json")) {
    throw new Error("news-tab zip is missing manifest.json");
  }
  if (!out.includes("newtab.html")) {
    throw new Error("news-tab zip is missing newtab.html");
  }
  return out;
}

interface ZipEntry {
  name: string;
  data: Buffer;
  crc: number;
  compressed: Buffer;
  method: 0 | 8;
  time: number;
  date: number;
}

function zipEntry(relPosix: string, abs: string): ZipEntry {
  const data = readFileSync(abs);
  const crc = crc32(data);
  const deflated = deflateRawSync(data);
  const store = deflated.length >= data.length;
  const mtime = statSync(abs).mtime;
  const { time, date } = dosDateTime(mtime);
  return {
    name: `${NEWS_TAB_UNPACKED_DIR}/${relPosix}`,
    data,
    crc,
    compressed: store ? data : deflated,
    method: store ? 0 : 8,
    time,
    date,
  };
}

function u16(n: number): Buffer {
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(n);
  return buf;
}

function u32(n: number): Buffer {
  const buf = Buffer.alloc(4);
  buf.writeUInt32LE(n);
  return buf;
}

/** PKZIP of the unpacked MV3 tree (manifest.json at `news-tab/manifest.json`). */
export function buildNewsTabZip(root: string): Buffer {
  const rels = listUnpackedRelPaths(root);
  const entries = rels.map((rel) => zipEntry(rel, join(root, rel)));

  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const flags = 0x0800;
    const local = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]),
      u16(20),
      u16(flags),
      u16(entry.method),
      u16(entry.time),
      u16(entry.date),
      u32(entry.crc),
      u32(entry.compressed.length),
      u32(entry.data.length),
      u16(nameBuf.length),
      u16(0),
      nameBuf,
      entry.compressed,
    ]);
    const central = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
      u16(20),
      u16(20),
      u16(flags),
      u16(entry.method),
      u16(entry.time),
      u16(entry.date),
      u32(entry.crc),
      u32(entry.compressed.length),
      u32(entry.data.length),
      u16(nameBuf.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBuf,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }

  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    u16(0),
    u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);
  return Buffer.concat([...locals, centralDir, eocd]);
}

export function writeNewsTabZip(opts: { root: string; dest: string }): {
  bytes: number;
  files: number;
  dest: string;
} {
  const files = listUnpackedRelPaths(opts.root).length;
  const zip = buildNewsTabZip(opts.root);
  mkdirSync(dirname(opts.dest), { recursive: true });
  writeFileSync(opts.dest, zip);
  return { bytes: zip.length, files, dest: opts.dest };
}

export function defaultNewsTabRoot(fromNewsAppDir: string): string {
  return join(fromNewsAppDir, "..", "news-tab");
}

export function defaultNewsTabZipDest(fromNewsAppDir: string): string {
  return join(fromNewsAppDir, "public", NEWS_TAB_ZIP_FILENAME);
}
