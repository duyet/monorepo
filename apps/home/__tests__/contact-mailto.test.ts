import { describe, expect, it } from "vitest";
import {
  CONTACT_EMAIL,
  contactMailto,
} from "../src/components/duyetbot/contact-mailto";

describe("contactMailto", () => {
  it("builds a mailto to me@duyet.net with the typed body", () => {
    const href = contactMailto("hello from the site");
    expect(href.startsWith(`mailto:${CONTACT_EMAIL}?`)).toBe(true);
    expect(href).toContain(encodeURIComponent("hello from the site"));
    expect(href).not.toContain("queued");
  });
});
