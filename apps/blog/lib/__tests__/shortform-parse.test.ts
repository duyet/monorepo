import { describe, expect, test } from "vitest";
import { shortformId } from "../shortform-parse";

describe("shortformId", () => {
  test("prefers explicit slug", () => {
    expect(shortformId("2026-06-08-ax", "ax")).toBe("ax");
  });

  test("strips YYYY-MM-DD prefix from filename", () => {
    expect(shortformId("2026-06-08-ax")).toBe("ax");
    expect(shortformId("2026-08-17-system-prompt-vs-tool-schema")).toBe(
      "system-prompt-vs-tool-schema",
    );
  });

  test("slugifies undated filenames", () => {
    expect(shortformId("Chrome Devtools MCP")).toBe("chrome-devtools-mcp");
  });
});
