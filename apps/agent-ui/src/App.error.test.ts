import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const app = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "App.tsx"),
  "utf8",
);

describe("ChatScreen error UI", () => {
  it("renders a Retry that calls regenerate and hides raw error.message", () => {
    expect(app).toContain("userFacingChatError(error)");
    expect(app).toContain("void regenerate()");
    expect(app).toMatch(/Retry/);
    expect(app).not.toContain("{error.message}");
  });
});
