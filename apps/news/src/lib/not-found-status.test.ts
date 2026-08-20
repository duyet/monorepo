import { describe, expect, it } from "vitest";
import {
  applyNotFoundHttpStatus,
  NOT_FOUND_HEADER,
} from "./not-found-status";

describe("applyNotFoundHttpStatus", () => {
  it("rewrites a marked 200 into HTTP 404", async () => {
    const res = applyNotFoundHttpStatus(
      new Response("<title>Không tìm thấy trang | AI News</title>", {
        status: 200,
        headers: {
          [NOT_FOUND_HEADER]: "1",
          "cache-control": "private, no-store",
          "content-type": "text/html",
        },
      })
    );
    expect(res.status).toBe(404);
    expect(res.headers.get(NOT_FOUND_HEADER)).toBeNull();
    expect(res.headers.get("cache-control")).toBe("private, no-store");
    expect(await res.text()).toContain("Không tìm thấy trang | AI News");
  });

  it("leaves unmarked 200 pages alone", () => {
    const res = applyNotFoundHttpStatus(new Response("ok", { status: 200 }));
    expect(res.status).toBe(200);
  });
});
