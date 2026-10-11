import { describe, expect, test } from "vitest";
import { getPayloadConfigFromPayload } from "./utils";

describe("getPayloadConfigFromPayload", () => {
  test("returns the config entry for the payload key", () => {
    expect(
      getPayloadConfigFromPayload(
        { views: { label: "Views", color: "#111" } },
        { payload: { views: 12 } },
        "views"
      )
    ).toEqual({ label: "Views", color: "#111" });
  });
});
