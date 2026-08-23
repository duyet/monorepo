import { describe, expect, it } from "vitest";
import {
  organizationJsonLd,
  personJsonLd,
  websiteJsonLd,
} from "../src/lib/jsonld";

describe("homepage JSON-LD builders", () => {
  it("tags every object with the schema.org context", () => {
    for (const obj of [websiteJsonLd(), personJsonLd(), organizationJsonLd()]) {
      // Structured data without a context is dropped by search engines.
      expect(obj["@context"]).toBe("https://schema.org");
    }
  });

  it("describes the website with name, url, and language", () => {
    const website = websiteJsonLd();
    expect(website["@type"]).toBe("WebSite");
    expect(website.name).toBe("duyet.net");
    expect(website.url).toBe("https://duyet.net");
    expect(website.inLanguage).toBe("en");
  });

  it("gives the person a sameAs profile list", () => {
    const person = personJsonLd();
    expect(person["@type"]).toBe("Person");
    expect(person.name).toBe("Duyet");
    expect(Array.isArray(person.sameAs)).toBe(true);
    // Identity disambiguation depends on sameAs pointing at real profiles.
    for (const url of person.sameAs) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  it("makes the organization reachable via contactPoint and address", () => {
    const org = organizationJsonLd();
    expect(org["@type"]).toBe("Organization");
    expect(Array.isArray(org.contactPoint)).toBe(true);
    expect(
      org.contactPoint.some((point) => point.email === "me@duyet.net")
    ).toBe(true);
    expect(org.address.addressCountry).toBe("VN");
  });
});
