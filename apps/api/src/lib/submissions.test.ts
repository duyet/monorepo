import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  ERROR_BODY,
  hashIp,
  isHoneypotTripped,
  normalizePostSlug,
  parseComment,
  parseContact,
  parseJd,
  readJsonBody,
  SUBMISSION_KIND_LIST,
  SUBMISSION_KINDS,
} from "./submissions.js";

const CONTACT = {
  name: "  Ada  ",
  email: "ada@example.test",
  message: "hello",
};
const SLUGS = { knownPostSlugs: new Set(["/2026/08/grok-bot"]) };

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function jsonRequest(
  body: BodyInit | null,
  headers: Record<string, string> = { "Content-Type": "application/json" }
): Request {
  return new Request("https://api.duyet.net/api/contact", {
    method: "POST",
    headers,
    body,
  });
}

describe("parseContact", () => {
  it("trims strings and returns a payload without the honeypot key", () => {
    const result = parseContact({ ...CONTACT, website: "" });
    expect(result).toEqual({
      ok: true,
      value: { name: "Ada", email: "ada@example.test", message: "hello" },
    });
  });

  it.each([
    ["missing email", { name: "Ada", message: "hi" }],
    ["invalid email", { ...CONTACT, email: "not-an-email" }],
    ["email over 254 chars", { ...CONTACT, email: `${"a".repeat(250)}@x.io` }],
    ["empty name after trim", { ...CONTACT, name: "   " }],
    ["name over 200 chars", { ...CONTACT, name: "a".repeat(201) }],
    ["message over 8000 chars", { ...CONTACT, message: "a".repeat(8001) }],
    ["non-string message", { ...CONTACT, message: 42 }],
    ["unknown key", { ...CONTACT, phone: "123" }],
  ])("rejects %s with 400", (_label, raw) => {
    expect(parseContact(raw)).toEqual({ ok: false, status: 400 });
  });
});

describe("parseJd", () => {
  it("accepts text with optional company and note", () => {
    expect(
      parseJd({ company: " ACME ", note: "", text: " role ", website: "" })
    ).toEqual({ ok: true, value: { company: "ACME", text: "role" } });
  });

  it("accepts an https url", () => {
    expect(parseJd({ url: "https://jobs.example.test/1" })).toEqual({
      ok: true,
      value: { url: "https://jobs.example.test/1" },
    });
  });

  it("accepts text of exactly 32768 bytes", () => {
    const result = parseJd({ text: "a".repeat(32_768) });
    expect(result.ok).toBe(true);
  });

  it.each([
    ["both text and url", { text: "x", url: "https://example.test" }],
    ["neither text nor url", { company: "ACME" }],
    ["http url", { url: "http://example.test" }],
    ["unparseable url", { url: "https://" }],
    ["url over 2048 chars", { url: `https://e.test/${"a".repeat(2048)}` }],
    ["empty text", { text: "  " }],
    ["text over 32768 bytes", { text: "é".repeat(16_385) }],
    ["non-string text", { text: ["a"] }],
    ["company over 200 chars", { text: "x", company: "a".repeat(201) }],
    ["note over 2000 chars", { text: "x", note: "a".repeat(2001) }],
    ["non-string note", { text: "x", note: 1 }],
    ["unknown key", { text: "x", salary: "1" }],
  ])("rejects %s with 400", (_label, raw) => {
    expect(parseJd(raw)).toEqual({ ok: false, status: 400 });
  });
});

describe("parseComment", () => {
  it("normalizes the post slug and keeps a valid optional email", () => {
    expect(
      parseComment(
        {
          post: "2026/08/grok-bot.html",
          author: "Ada",
          email: "ada@example.test",
          body: "nice",
        },
        SLUGS
      )
    ).toEqual({
      ok: true,
      value: {
        post: "/2026/08/grok-bot",
        author: "Ada",
        email: "ada@example.test",
        body: "nice",
      },
    });
  });

  it("omits an empty optional email", () => {
    const result = parseComment(
      { post: "/2026/08/grok-bot", author: "Ada", email: "", body: "nice" },
      SLUGS
    );
    expect(result).toEqual({
      ok: true,
      value: { post: "/2026/08/grok-bot", author: "Ada", body: "nice" },
    });
  });

  it("returns 404 only for an unknown post slug", () => {
    expect(
      parseComment(
        { post: "/2026/08/missing", author: "Ada", body: "nice" },
        SLUGS
      )
    ).toEqual({ ok: false, status: 404 });
  });

  it.each([
    ["empty body", { post: "/2026/08/grok-bot", author: "Ada", body: " " }],
    ["missing author", { post: "/2026/08/grok-bot", body: "nice" }],
    [
      "author over 100 chars",
      { post: "/2026/08/grok-bot", author: "a".repeat(101), body: "x" },
    ],
    [
      "body over 4000 chars",
      { post: "/2026/08/grok-bot", author: "Ada", body: "a".repeat(4001) },
    ],
    [
      "invalid email",
      { post: "/2026/08/grok-bot", author: "Ada", email: "nope", body: "x" },
    ],
    ["non-string post", { post: 7, author: "Ada", body: "x" }],
    [
      "unknown key",
      { post: "/2026/08/grok-bot", author: "Ada", body: "x", rating: 5 },
    ],
  ])("rejects %s with 400 before consulting slugs", (_label, raw) => {
    expect(parseComment(raw, SLUGS)).toEqual({ ok: false, status: 400 });
  });
});

describe("normalizePostSlug", () => {
  it.each([
    ["/2026/08/grok-bot", "/2026/08/grok-bot"],
    ["2026/08/grok-bot", "/2026/08/grok-bot"],
    ["/2026/08/grok-bot.html", "/2026/08/grok-bot"],
    ["2026/08/grok-bot.html", "/2026/08/grok-bot"],
  ])("%s -> %s", (input, expected) => {
    expect(normalizePostSlug(input)).toBe(expected);
  });
});

describe("readJsonBody", () => {
  it("parses an object body under the cap", async () => {
    const result = await readJsonBody(jsonRequest('{"a":1}'), 8_192);
    expect(result).toEqual({ ok: true, raw: { a: 1 } });
  });

  it("accepts a media type with parameters", async () => {
    const result = await readJsonBody(
      jsonRequest('{"a":1}', {
        "Content-Type": "application/json; charset=utf-8",
      }),
      8_192
    );
    expect(result.ok).toBe(true);
  });

  it("returns 415 for a non-JSON media type or a missing Content-Type", async () => {
    expect(
      await readJsonBody(
        jsonRequest("x", { "Content-Type": "text/plain" }),
        8_192
      )
    ).toEqual({ ok: false, status: 415 });
    expect(await readJsonBody(jsonRequest("{}", {}), 8_192)).toEqual({
      ok: false,
      status: 415,
    });
  });

  it("returns 413 from Content-Length before reading the body", async () => {
    const request = jsonRequest("{}", {
      "Content-Type": "application/json",
      "Content-Length": "9000",
    });
    expect(await readJsonBody(request, 8_192)).toEqual({
      ok: false,
      status: 413,
    });
    expect(request.bodyUsed).toBe(false);
  });

  it("returns 413 when the body bytes exceed the cap", async () => {
    const body = JSON.stringify({ a: "a".repeat(9_000) });
    expect(await readJsonBody(jsonRequest(body), 8_192)).toEqual({
      ok: false,
      status: 413,
    });
  });

  it("measures bytes, not characters", async () => {
    const body = JSON.stringify({ a: "é".repeat(4_100) });
    expect(body.length).toBeLessThan(8_192);
    expect(await readJsonBody(jsonRequest(body), 8_192)).toEqual({
      ok: false,
      status: 413,
    });
  });

  it.each([
    ["malformed JSON", "{"],
    ["array root", "[1]"],
    ["null root", "null"],
    ["string root", '"x"'],
  ])("returns 400 for %s", async (_label, body) => {
    expect(await readJsonBody(jsonRequest(body), 8_192)).toEqual({
      ok: false,
      status: 400,
    });
  });
});

describe("isHoneypotTripped", () => {
  it.each([
    [{ website: "https://spam.test" }, true],
    [{ website: " x " }, true],
    [{ website: "" }, false],
    [{ website: "   " }, false],
    [{ website: 1 }, false],
    [{}, false],
  ])("%j -> %s", (raw, expected) => {
    expect(isHoneypotTripped(raw)).toBe(expected);
  });
});

describe("hashIp", () => {
  it("returns sha256 hex of the IP without a salt", async () => {
    const hash = await hashIp("203.0.113.9");
    expect(hash).toBe(sha256Hex("203.0.113.9"));
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("keys the hash with the salt when one is configured", async () => {
    const salted = await hashIp("203.0.113.9", "s");
    expect(salted).toBe(sha256Hex("s:203.0.113.9"));
    expect(salted).not.toBe(await hashIp("203.0.113.9"));
  });

  it("ignores an empty salt", async () => {
    expect(await hashIp("203.0.113.9", "")).toBe(await hashIp("203.0.113.9"));
  });
});

describe("SUBMISSION_KINDS", () => {
  it("maps every kind to a distinct /api path", () => {
    const paths = SUBMISSION_KIND_LIST.map(
      (kind) => SUBMISSION_KINDS[kind].path
    );
    expect(paths).toEqual(["/api/contact", "/api/jd", "/api/comments"]);
    expect(SUBMISSION_KINDS.jd.maxBodyBytes).toBe(40_960);
    expect(SUBMISSION_KINDS.contact.maxBodyBytes).toBe(8_192);
  });

  it("uses fixed generic error bodies", () => {
    expect(
      Object.values(ERROR_BODY).every((b) => typeof b.error === "string")
    ).toBe(true);
  });
});
