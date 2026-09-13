import { describe, expect, it } from "vitest";
import {
  isFirstPartyHref,
  PROJECT_BACKLINKS,
  referralRel,
  withReferral,
} from "../referral";

describe("referral", () => {
  it("tags first-party URLs with utm + ref", () => {
    const href = withReferral("https://anyrouter.dev/", {
      source: "blog.duyet.net",
      campaign: "footer-projects",
    });
    expect(href).toContain("utm_source=blog.duyet.net");
    expect(href).toContain("utm_medium=referral");
    expect(href).toContain("ref=blog.duyet.net");
  });

  it("does not add nofollow/noreferrer on first-party hosts", () => {
    expect(isFirstPartyHref("https://chmonitor.dev")).toBe(true);
    expect(referralRel("https://chmonitor.dev")).toBeUndefined();
    expect(referralRel("https://github.com/duyet")).toBe("noopener noreferrer");
  });

  it("lists the public products", () => {
    const labels = PROJECT_BACKLINKS.map((p) => p.label);
    expect(labels).toEqual(
      expect.arrayContaining(["AnyRouter", "ClickHouse Monitor", "AI;DR"]),
    );
  });
});
