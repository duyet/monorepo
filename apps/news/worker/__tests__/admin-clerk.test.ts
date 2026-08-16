import { describe, expect, it, vi } from "vitest";
import { isClerkAdmin, type ClerkPayload } from "../admin/clerk.js";
import type { Env } from "../types.js";

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    DB: {} as D1Database,
    NEWS_INGEST: {} as Workflow,
    ANYROUTER_BASE_URL: "https://anyrouter.dev/api/v1",
    ANYROUTER_MODEL: "test-model",
    ANYROUTER_API_KEY: "test-key",
    NEWS_ADMIN_TOKEN: "secret-token",
    ...overrides,
  };
}

function makePayload(overrides: Partial<ClerkPayload> = {}): ClerkPayload {
  return {
    sub: "user_123",
    iss: "https://clerk.duyet.net",
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

describe("isClerkAdmin", () => {
  it("is false with no allowlist and no role claim", () => {
    const env = makeEnv();
    expect(isClerkAdmin(makePayload(), env)).toBe(false);
  });

  it("is true when sub is in the comma-separated NEWS_ADMIN_USER_IDS allowlist", () => {
    const env = makeEnv({ NEWS_ADMIN_USER_IDS: "user_abc, user_123 ,user_xyz" });
    expect(isClerkAdmin(makePayload({ sub: "user_123" }), env)).toBe(true);
  });

  it("is false when sub is not in the allowlist", () => {
    const env = makeEnv({ NEWS_ADMIN_USER_IDS: "user_abc,user_xyz" });
    expect(isClerkAdmin(makePayload({ sub: "user_123" }), env)).toBe(false);
  });

  it("is true for metadata.role === 'admin'", () => {
    const env = makeEnv();
    const payload = makePayload({ metadata: { role: "admin" } });
    expect(isClerkAdmin(payload, env)).toBe(true);
  });

  it("is true for publicMetadata.role === 'admin'", () => {
    const env = makeEnv();
    const payload = makePayload({ publicMetadata: { role: "admin" } });
    expect(isClerkAdmin(payload, env)).toBe(true);
  });

  it("is true for the shortened o.rol === 'admin' claim", () => {
    const env = makeEnv();
    const payload = makePayload({ o: { rol: "admin" } });
    expect(isClerkAdmin(payload, env)).toBe(true);
  });

  it("is false when a role claim is present but not 'admin'", () => {
    const env = makeEnv();
    const payload = makePayload({ metadata: { role: "member" } });
    expect(isClerkAdmin(payload, env)).toBe(false);
  });
});

vi.mock("../admin/clerk.js", async () => {
  const actual = await vi.importActual<typeof import("../admin/clerk.js")>(
    "../admin/clerk.js"
  );
  return {
    ...actual,
    verifyClerkToken: vi.fn(),
  };
});

describe("checkAdminAuth / isRequestAdmin (Clerk path mocked, no real JWKS fetch)", () => {
  it("checkAuth-style bearer still passes checkAdminAuth", async () => {
    const { checkAdminAuth } = await import("../admin/auth.js");
    const env = makeEnv();
    const req = new Request("https://x/", {
      headers: { Authorization: "Bearer secret-token" },
    });
    expect(await checkAdminAuth(req, env)).toBeNull();
  });

  it("rejects when bearer is neither the static token nor a valid Clerk JWT", async () => {
    const clerk = await import("../admin/clerk.js");
    vi.mocked(clerk.verifyClerkToken).mockResolvedValueOnce(null);
    const { checkAdminAuth } = await import("../admin/auth.js");
    const env = makeEnv();
    const req = new Request("https://x/", {
      headers: { Authorization: "Bearer garbage" },
    });
    const res = await checkAdminAuth(req, env);
    expect(res?.status).toBe(401);
  });

  it("passes when the Clerk JWT verifies and resolves to an admin", async () => {
    const clerk = await import("../admin/clerk.js");
    vi.mocked(clerk.verifyClerkToken).mockResolvedValueOnce(
      makePayload({ sub: "user_123" })
    );
    const { checkAdminAuth } = await import("../admin/auth.js");
    const env = makeEnv({ NEWS_ADMIN_USER_IDS: "user_123" });
    const req = new Request("https://x/", {
      headers: { Authorization: "Bearer some.clerk.jwt" },
    });
    expect(await checkAdminAuth(req, env)).toBeNull();
  });

  it("rejects when the Clerk JWT verifies but the user is not an admin", async () => {
    const clerk = await import("../admin/clerk.js");
    vi.mocked(clerk.verifyClerkToken).mockResolvedValueOnce(
      makePayload({ sub: "user_not_admin" })
    );
    const { checkAdminAuth } = await import("../admin/auth.js");
    const env = makeEnv({ NEWS_ADMIN_USER_IDS: "user_123" });
    const req = new Request("https://x/", {
      headers: { Authorization: "Bearer some.clerk.jwt" },
    });
    const res = await checkAdminAuth(req, env);
    expect(res?.status).toBe(401);
  });

  it("isRequestAdmin returns false (not a thrown error) with no Authorization header", async () => {
    const { isRequestAdmin } = await import("../admin/auth.js");
    const env = makeEnv();
    const req = new Request("https://x/");
    expect(await isRequestAdmin(req, env)).toBe(false);
  });
});
