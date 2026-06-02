import { describe, expect, test } from "vitest";
import { appConfig, getVarsForApp, parseEnvContent } from "./sync-app-secrets";

describe("parseEnvContent", () => {
  test("parses basic key=value pairs", () => {
    const result = parseEnvContent("FOO=bar\nBAZ=qux");
    expect(result).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  test("strips double-quoted values", () => {
    const result = parseEnvContent('KEY="hello world"');
    expect(result).toEqual({ KEY: "hello world" });
  });

  test("strips single-quoted values", () => {
    const result = parseEnvContent("KEY='hello world'");
    expect(result).toEqual({ KEY: "hello world" });
  });

  test("ignores comment lines", () => {
    const result = parseEnvContent("# this is a comment\nKEY=value");
    expect(result).toEqual({ KEY: "value" });
  });

  test("ignores blank lines", () => {
    const result = parseEnvContent("\nKEY=value\n");
    expect(result).toEqual({ KEY: "value" });
  });

  test("ignores lines without equals sign", () => {
    const result = parseEnvContent("NOVALUE\nKEY=value");
    expect(result).toEqual({ KEY: "value" });
  });

  test("handles values containing equals signs", () => {
    const result = parseEnvContent(
      "DATABASE_URL=postgres://user:pass@host/db?ssl=true"
    );
    expect(result).toEqual({
      DATABASE_URL: "postgres://user:pass@host/db?ssl=true",
    });
  });

  test("returns empty object for empty content", () => {
    expect(parseEnvContent("")).toEqual({});
  });
});

describe("getVarsForApp", () => {
  const env = {
    CLERK_SECRET_KEY: "sk_test_abc123",
    CLERK_JWT_KEY: "jwt-public-key",
    NEXT_PUBLIC_DUYET_BLOG_URL: "https://blog.duyet.net",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_xyz",
    AGENT_API_TOKEN: "agent-secret",
    CLOUDFLARE_ACCOUNT_ID: "acc123",
    CLOUDFLARE_API_TOKEN: "tok456",
  };

  test("returns correct secrets for agent-api", () => {
    const { secrets } = getVarsForApp("duyet-agent-api", env);
    expect(secrets).toHaveProperty("AGENT_API_TOKEN", "agent-secret");
    expect(secrets).toHaveProperty("CLERK_SECRET_KEY", "sk_test_abc123");
    expect(secrets).toHaveProperty("CLERK_JWT_KEY", "jwt-public-key");
    expect(secrets).toHaveProperty("CLOUDFLARE_ACCOUNT_ID", "acc123");
    expect(secrets).toHaveProperty("CLOUDFLARE_API_TOKEN", "tok456");
  });

  test("agent-api does not need Pages build vars", () => {
    const { buildVars } = getVarsForApp("duyet-agent-api", env);
    expect(buildVars).toEqual({});
  });

  test("returns missing list for vars not in env", () => {
    const { missing } = getVarsForApp("duyet-agent-api", {
      CLERK_SECRET_KEY: "sk_test_abc123",
    });
    expect(missing).toContain("AGENT_API_TOKEN");
    expect(missing).toContain("CLOUDFLARE_ACCOUNT_ID");
    expect(missing).toContain("CLOUDFLARE_API_TOKEN");
    expect(missing).not.toContain("CLERK_JWT_KEY or CLERK_SECRET_KEY");
  });

  test("requires one Clerk verification secret for agent-api", () => {
    const { missing } = getVarsForApp("duyet-agent-api", {
      AGENT_API_TOKEN: "agent-secret",
      CLOUDFLARE_ACCOUNT_ID: "acc123",
      CLOUDFLARE_API_TOKEN: "tok456",
    });
    expect(missing).toContain("CLERK_JWT_KEY or CLERK_SECRET_KEY");
  });

  test("returns empty result for unknown app", () => {
    const result = getVarsForApp("duyet-unknown", env);
    expect(result.secrets).toEqual({});
    expect(result.buildVars).toEqual({});
    expect(result.missing).toEqual([]);
  });

  test("does not include missing vars in secrets or buildVars", () => {
    const { secrets, buildVars } = getVarsForApp("duyet-agent-api", {});
    expect(Object.keys(secrets)).toHaveLength(0);
    expect(Object.keys(buildVars)).toHaveLength(0);
  });
});

describe("appConfig", () => {
  test("duyet-agent-api includes API, Clerk, and CF deployment secrets", () => {
    const config = appConfig["duyet-agent-api"];
    expect(config).toBeDefined();
    expect(config.secrets).toContain("AGENT_API_TOKEN");
    expect(config.optionalSecrets ?? []).toContain("CLERK_JWT_KEY");
    expect(config.optionalSecrets ?? []).toContain("CLERK_SECRET_KEY");
    expect(config.secrets).toContain("CLOUDFLARE_ACCOUNT_ID");
    expect(config.secrets).toContain("CLOUDFLARE_API_TOKEN");
  });

  test("all apps have secrets and buildVars arrays", () => {
    for (const [_name, config] of Object.entries(appConfig)) {
      expect(Array.isArray(config.secrets)).toBe(true);
      expect(Array.isArray(config.buildVars)).toBe(true);
      // Ensure no empty string entries
      for (const s of config.secrets) {
        expect(s.length).toBeGreaterThan(0);
      }
      for (const s of config.optionalSecrets ?? []) {
        expect(s.length).toBeGreaterThan(0);
      }
    }
  });
});
