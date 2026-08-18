import { describe, expect, it } from "vitest";
import { notFoundCopy } from "./not-found";
import { SITE_TITLE } from "./site";

describe("notFoundCopy", () => {
  it("localizes body and home link to match the VI chrome", () => {
    const copy = notFoundCopy("vi");
    expect(copy.body).toBe("Không tìm thấy trang.");
    expect(copy.home).toBe("Về trang chính");
    expect(copy.documentTitle).toBe("Không tìm thấy trang | AI News");
    expect(copy.documentTitle).not.toBe(SITE_TITLE);
  });

  it("keeps the existing English 404 strings", () => {
    const copy = notFoundCopy("en");
    expect(copy.body).toBe("Page not found");
    expect(copy.home).toBe("Go home");
    expect(copy.documentTitle).toBe("Page not found | AI News");
    expect(copy.documentTitle).not.toBe(SITE_TITLE);
  });
});
