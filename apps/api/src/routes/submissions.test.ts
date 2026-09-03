import { createHash } from "node:crypto";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  type MockInstance,
  vi,
} from "vitest";
import type { Env } from "../env.js";
import app from "../index.js";
import {
  POSTS_DATA_URL,
  resetPostSlugsCacheForTests,
} from "../lib/blog-posts.js";
import { resetRateLimits } from "../lib/rate-limit.js";
import type { Accepted } from "../lib/submissions.js";

const IP = "203.0.113.77";
const POST_SLUG = "2026/08/grok-bot";
const CONTACT = {
  name: "Ada Lovelace",
  email: "ada@example.test",
  message: "Hello from the privacy sentinel",
};
const JD_TEXT = { company: "Analytical Engines", text: "JD TEXT SENTINEL" };
const JD_URL = { url: "https://jobs.example.test/sentinel" };
const COMMENT = {
  post: `/${POST_SLUG}`,
  author: "Grace Hopper",
  body: "COMMENT BODY SENTINEL",
};
const SENSITIVE = [
  IP,
  POST_SLUG,
  ...Object.values(CONTACT),
  ...Object.values(JD_TEXT),
  ...Object.values(JD_URL),
  ...Object.values(COMMENT),
];

interface Run {
  sql: string;
  values: unknown[];
}

function fakeDb(): { db: D1Database; runs: Run[] } {
  const runs: Run[] = [];
  const db = {
    prepare(sql: string) {
      return {
        bind(...values: unknown[]) {
          return {
            run: async () => {
              runs.push({ sql, values });
              return { success: true };
            },
          };
        },
      };
    },
  };
  return { db: db as unknown as D1Database, runs };
}

interface SentMessage {
  to: string;
  subject: string;
}

function fakeEmail(send: (message: SentMessage) => Promise<unknown>) {
  const sendMock = vi.fn(send);
  return { email: { send: sendMock } as unknown as SendEmail, sendMock };
}

type FetchMock = Mock<(input: RequestInfo | URL) => Promise<Response>>;

function stubPostsData(status = 200): FetchMock {
  const fetchMock: FetchMock = vi.fn(
    async () =>
      new Response(JSON.stringify([{ slug: `/${POST_SLUG}` }]), {
        status,
        headers: { "Content-Type": "application/json" },
      })
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function postsFetches(fetchMock: FetchMock): number {
  return fetchMock.mock.calls.filter(([input]) =>
    String(input).includes(POSTS_DATA_URL)
  ).length;
}

function init(
  body: string,
  headers: Record<string, string> = { "Content-Type": "application/json" }
): RequestInit {
  return {
    method: "POST",
    headers: { "CF-Connecting-IP": IP, ...headers },
    body,
  };
}

function jsonInit(body: unknown): RequestInit {
  return init(JSON.stringify(body));
}

async function request(
  path: string,
  requestInit: RequestInit,
  env: Env
): Promise<Response> {
  const background: Promise<unknown>[] = [];
  const executionCtx = {
    waitUntil: (promise: Promise<unknown>) => {
      background.push(promise);
    },
    passThroughOnException: () => {},
    props: {},
  } as unknown as ExecutionContext;
  const res = await app.request(path, requestInit, env, executionCtx);
  await Promise.all(background);
  return res;
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function rowOf(run: Run): {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  ipHash: string;
  createdAt: number;
  status: string;
} {
  const [id, kind, payloadJson, ipHash, createdAt, status] = run.values;
  return {
    id: String(id),
    kind: String(kind),
    payload: JSON.parse(String(payloadJson)),
    ipHash: String(ipHash),
    createdAt: Number(createdAt),
    status: String(status),
  };
}

describe("submission routes", () => {
  let consoleSpies: MockInstance[] = [];
  let store: ReturnType<typeof fakeDb>;
  let env: Env;

  beforeEach(() => {
    resetRateLimits();
    resetPostSlugsCacheForTests();
    stubPostsData();
    store = fakeDb();
    env = { SUBMISSIONS_DB: store.db };
    consoleSpies = (["info", "log", "warn", "error"] as const).map((level) =>
      vi.spyOn(console, level).mockImplementation(() => {})
    );
  });

  afterEach(() => {
    const logged = consoleSpies.flatMap((spy) =>
      spy.mock.calls.flatMap((args) => args.map((arg) => String(arg)))
    );
    for (const secret of SENSITIVE) {
      for (const line of logged) {
        expect(line, `log line leaks ${secret}`).not.toContain(secret);
      }
    }
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("honeypot", () => {
    it.each([
      ["/api/contact", CONTACT],
      ["/api/jd", JD_TEXT],
      ["/api/comments", COMMENT],
    ])("%s returns 202 and drops the submission", async (path, body) => {
      const fetchMock = stubPostsData();
      const { email, sendMock } = fakeEmail(async () => ({}));
      const res = await request(
        path,
        jsonInit({ ...body, website: "https://spam.example.test" }),
        { ...env, NOTIFY_EMAIL: email }
      );

      expect(res.status).toBe(202);
      const json = (await res.json()) as Accepted;
      expect(json.status).toBe("pending");
      expect(json.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(store.runs).toHaveLength(0);
      expect(postsFetches(fetchMock)).toBe(0);
      expect(sendMock).not.toHaveBeenCalled();
    });
  });

  describe("content negotiation and size caps", () => {
    it("returns 415 for text/plain", async () => {
      const res = await request(
        "/api/contact",
        init(JSON.stringify(CONTACT), { "Content-Type": "text/plain" }),
        env
      );
      expect(res.status).toBe(415);
      expect(await res.json()).toEqual({ error: "Unsupported Media Type" });
    });

    it("returns 415 without a Content-Type", async () => {
      const res = await request(
        "/api/contact",
        init(JSON.stringify(CONTACT), {}),
        env
      );
      expect(res.status).toBe(415);
    });

    it("returns 413 from a Content-Length of 9000 on contact", async () => {
      const res = await request(
        "/api/contact",
        init(JSON.stringify(CONTACT), {
          "Content-Type": "application/json",
          "Content-Length": "9000",
        }),
        env
      );
      expect(res.status).toBe(413);
      expect(await res.json()).toEqual({ error: "Payload Too Large" });
      expect(store.runs).toHaveLength(0);
    });

    it("returns 413 for a 9 KB contact body without Content-Length", async () => {
      const res = await request(
        "/api/contact",
        jsonInit({ ...CONTACT, message: "a".repeat(9_000) }),
        env
      );
      expect(res.status).toBe(413);
    });

    it("returns 413 for a 41 KB jd body", async () => {
      const res = await request(
        "/api/jd",
        jsonInit({ text: "a".repeat(41 * 1024) }),
        env
      );
      expect(res.status).toBe(413);
    });

    it("returns 400 for a 33 KB jd text inside a 36 KB body", async () => {
      const res = await request(
        "/api/jd",
        jsonInit({ note: "n".repeat(2_000), text: "a".repeat(33 * 1024) }),
        env
      );
      expect(res.status).toBe(400);
      expect(store.runs).toHaveLength(0);
    });
  });

  describe("400 responses", () => {
    it.each([
      ["malformed JSON", "/api/contact", "{"],
      ["array root", "/api/contact", "[]"],
      [
        "contact missing email",
        "/api/contact",
        JSON.stringify({ name: CONTACT.name, message: CONTACT.message }),
      ],
      [
        "jd with both text and url",
        "/api/jd",
        JSON.stringify({ ...JD_TEXT, ...JD_URL }),
      ],
      ["jd with neither", "/api/jd", JSON.stringify({ company: "ACME" })],
      [
        "jd http url",
        "/api/jd",
        JSON.stringify({ url: "http://jobs.example.test/sentinel" }),
      ],
      [
        "comment empty body",
        "/api/comments",
        JSON.stringify({ ...COMMENT, body: "   " }),
      ],
      [
        "unknown key",
        "/api/contact",
        JSON.stringify({ ...CONTACT, phone: "+1" }),
      ],
    ])("%s", async (_label, path, body) => {
      const res = await request(path, init(body), env);
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Bad Request" });
      expect(store.runs).toHaveLength(0);
    });
  });

  describe("comments slug validation", () => {
    it("returns 404 for an unknown slug without inserting", async () => {
      const res = await request(
        "/api/comments",
        jsonInit({ ...COMMENT, post: "/2026/08/not-a-post" }),
        env
      );
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "Not Found" });
      expect(store.runs).toHaveLength(0);
    });

    it("accepts a slug without the leading slash", async () => {
      const res = await request(
        "/api/comments",
        jsonInit({ ...COMMENT, post: POST_SLUG }),
        env
      );
      expect(res.status).toBe(202);
      expect(rowOf(store.runs[0]).payload.post).toBe(`/${POST_SLUG}`);
    });
  });

  describe("rate limiting", () => {
    it("returns 429 on the 6th request from one IP on one route", async () => {
      let last: Response | undefined;
      for (let i = 0; i < 6; i += 1) {
        last = await request("/api/contact", jsonInit(CONTACT), env);
        if (i < 5) {
          expect(last.status).toBe(202);
          expect(last.headers.get("RateLimit-Limit")).toBe("5");
          expect(last.headers.get("RateLimit-Remaining")).toBe(String(4 - i));
        }
      }

      expect(last?.status).toBe(429);
      expect(await last?.json()).toEqual({ error: "Too Many Requests" });
      expect(Number(last?.headers.get("Retry-After"))).toBeGreaterThan(0);
      expect(last?.headers.get("RateLimit-Limit")).toBe("5");
      expect(last?.headers.get("RateLimit-Remaining")).toBe("0");
      expect(store.runs).toHaveLength(5);

      const other = await request("/api/jd", jsonInit(JD_URL), env);
      expect(other.status).toBe(202);
    });
  });

  describe("accepted contact", () => {
    it("stores a pending row with a hashed IP and no honeypot key", async () => {
      const res = await request(
        "/api/contact",
        jsonInit({ ...CONTACT, website: "" }),
        env
      );
      expect(res.status).toBe(202);
      const json = (await res.json()) as Accepted;

      expect(store.runs).toHaveLength(1);
      const row = rowOf(store.runs[0]);
      expect(store.runs[0].sql).toContain("INSERT INTO submissions");
      expect(row.id).toBe(json.id);
      expect(row.kind).toBe("contact");
      expect(row.status).toBe("pending");
      expect(row.ipHash).toMatch(/^[0-9a-f]{64}$/);
      expect(row.ipHash).not.toContain(IP);
      expect(row.ipHash).toBe(sha256Hex(IP));
      expect(row.payload).toEqual(CONTACT);
      expect(row.payload).not.toHaveProperty("website");
      expect(row.createdAt).toBeGreaterThan(0);
    });

    it("keys the IP hash with SUBMISSIONS_IP_SALT", async () => {
      const res = await request("/api/contact", jsonInit(CONTACT), {
        ...env,
        SUBMISSIONS_IP_SALT: "s",
      });
      expect(res.status).toBe(202);
      expect(rowOf(store.runs[0]).ipHash).toBe(sha256Hex(`s:${IP}`));
    });
  });

  describe("notification", () => {
    it("stores the row when NOTIFY_EMAIL is absent", async () => {
      const res = await request("/api/contact", jsonInit(CONTACT), env);
      expect(res.status).toBe(202);
      expect(store.runs).toHaveLength(1);
    });

    it("stores the row when send rejects", async () => {
      const { email, sendMock } = fakeEmail(async () => {
        throw new Error("smtp down");
      });
      const res = await request("/api/contact", jsonInit(CONTACT), {
        ...env,
        NOTIFY_EMAIL: email,
      });
      expect(res.status).toBe(202);
      expect(store.runs).toHaveLength(1);
      expect(sendMock).toHaveBeenCalledTimes(1);
    });

    it("emails the owner once when send resolves", async () => {
      const { email, sendMock } = fakeEmail(async () => ({}));
      const res = await request("/api/jd", jsonInit(JD_TEXT), {
        ...env,
        NOTIFY_EMAIL: email,
      });
      expect(res.status).toBe(202);
      expect(sendMock).toHaveBeenCalledTimes(1);
      const [message] = sendMock.mock.calls[0];
      expect(message.to).toBe("me@duyet.net");
      expect(message.subject).toBe(
        `[jd] submission ${rowOf(store.runs[0]).id}`
      );
    });
  });

  describe("posts-data cache", () => {
    it("fetches posts-data once across two comment requests", async () => {
      const fetchMock = stubPostsData();
      await request("/api/comments", jsonInit(COMMENT), env);
      await request("/api/comments", jsonInit(COMMENT), env);
      expect(postsFetches(fetchMock)).toBe(1);
    });

    it("refetches after the cache is reset", async () => {
      const fetchMock = stubPostsData();
      await request("/api/comments", jsonInit(COMMENT), env);
      resetPostSlugsCacheForTests();
      await request("/api/comments", jsonInit(COMMENT), env);
      expect(postsFetches(fetchMock)).toBe(2);
    });

    it("reuses the stale set when the refresh fails", async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      const first = await request("/api/comments", jsonInit(COMMENT), env);
      expect(first.status).toBe(202);

      vi.setSystemTime(Date.now() + 2 * 60 * 60_000);
      const fetchMock = stubPostsData(500);
      resetRateLimits();
      const second = await request("/api/comments", jsonInit(COMMENT), env);
      expect(postsFetches(fetchMock)).toBe(1);
      expect(second.status).toBe(202);
      expect(store.runs).toHaveLength(2);
    });

    it("returns 503 when the cache is cold and upstream fails", async () => {
      stubPostsData(500);
      const res = await request("/api/comments", jsonInit(COMMENT), env);
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "Service Unavailable" });
      expect(store.runs).toHaveLength(0);
    });
  });

  describe("store binding", () => {
    it("returns 503 when SUBMISSIONS_DB is missing", async () => {
      const res = await request("/api/contact", jsonInit(CONTACT), {});
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "Service Unavailable" });
    });
  });
});
