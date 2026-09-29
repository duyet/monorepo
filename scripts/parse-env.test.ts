import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { parseEnvContent, parseEnvFile } from "./parse-env";

describe("parseEnvContent", () => {
  test("parses basic key=value pairs", () => {
    const result = parseEnvContent("FOO=bar\nBAZ=qux");
    expect(result).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  test("strips double-quoted values", () => {
    const result = parseEnvContent('KEY="hello world"');
    expect(result).toEqual({ KEY: "hello world" });
  });

  test("strips single-quoted values", () => {
    const result = parseEnvContent("KEY='hello world'");
    expect(result).toEqual({ KEY: "hello world" });
  });

  test("ignores comment lines", () => {
    const result = parseEnvContent("# this is a comment\nKEY=value");
    expect(result).toEqual({ KEY: "value" });
  });

  test("ignores blank lines", () => {
    const result = parseEnvContent("\nKEY=value\n");
    expect(result).toEqual({ KEY: "value" });
  });

  test("ignores lines without equals sign", () => {
    const result = parseEnvContent("NOVALUE\nKEY=value");
    expect(result).toEqual({ KEY: "value" });
  });

  test("handles values containing equals signs", () => {
    const result = parseEnvContent(
      "DATABASE_URL=postgres://user:pass@host/db?ssl=true",
    );
    expect(result).toEqual({
      DATABASE_URL: "postgres://user:pass@host/db?ssl=true",
    });
  });

  test("returns empty object for empty content", () => {
    expect(parseEnvContent("")).toEqual({});
  });

  test("trims whitespace around keys and values", () => {
    expect(parseEnvContent("  KEY  =  value  ")).toEqual({ KEY: "value" });
  });

  test("an empty value is kept, not dropped", () => {
    expect(parseEnvContent("KEY=")).toEqual({ KEY: "" });
  });

  test("does not expand variable references", () => {
    // Deploy tooling must not resolve $OTHER to another secret's value here;
    // each var is pushed to Cloudflare verbatim.
    expect(parseEnvContent("A=1\nB=$A")).toEqual({ A: "1", B: "$A" });
  });
});

describe("parseEnvFile", () => {
  test("reads and parses an existing file", () => {
    const dir = mkdtempSync(join(tmpdir(), "parse-env-"));
    const file = join(dir, ".env");
    writeFileSync(file, "# comment\nCLOUDFLARE_API_TOKEN=tok123\n");
    expect(parseEnvFile(file)).toEqual({ CLOUDFLARE_API_TOKEN: "tok123" });
  });

  test("treats a missing file as empty", () => {
    const dir = mkdtempSync(join(tmpdir(), "parse-env-"));
    expect(parseEnvFile(join(dir, ".env.does-not-exist"))).toEqual({});
  });
});
