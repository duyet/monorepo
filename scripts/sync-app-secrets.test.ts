import { describe, expect, test } from "bun:test";
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
    NEXT_PUBLIC_DUYET_BLOG_URL: "https://blog.duyet.net",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_xyz",
    CLOUDFLARE_ACCOUNT_ID: "acc123",
    CLOUDFLARE_API_TOKEN: "tok456",
  };

  test("returns correct secrets for known app", () => {
    const { secrets } = getVarsForApp("duyet-agents", env);
    expect(secrets).toHaveProperty("CLERK_SECRET_KEY", "sk_test_abc123");
    expect(secrets).toHaveProperty("CLOUDFLARE_ACCOUNT_ID", "acc123");
    expect(secrets).toHaveProperty("CLOUDFLARE_API_TOKEN", "tok456");
  });

  test("returns correct buildVars for known app", () => {
    const { buildVars } = getVarsForApp("duyet-agents", env);
    expect(buildVars).toHaveProperty(
      "NEXT_PUBLIC_DUYET_BLOG_URL",
      "https://blog.duyet.net"
    );
    expect(buildVars).toHaveProperty(
      "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
      "pk_test_xyz"
    );
  });

  test("returns missing list for vars not in env", () => {
    const { missing } = getVarsForApp("duyet-agents", {
      CLERK_SECRET_KEY: "sk_test_abc123",
    });
    expect(missing).toContain("CLOUDFLARE_ACCOUNT_ID");
    expect(missing).toContain("CLOUDFLARE_API_TOKEN");
    expect(missing).toContain("NEXT_PUBLIC_DUYET_BLOG_URL");
  });

  test("returns empty result for unknown app", () => {
    const result = getVarsForApp("duyet-unknown", env);
    expect(result.secrets).toEqual({});
    expect(result.buildVars).toEqual({});
    expect(result.missing).toEqual([]);
  });

  test("does not include missing vars in secrets or buildVars", () => {
    const { secrets, buildVars } = getVarsForApp("duyet-agents", {});
    expect(Object.keys(secrets)).toHaveLength(0);
    expect(Object.keys(buildVars)).toHaveLength(0);
  });
});

describe("appConfig", () => {
  test("duyet-agents includes CF credentials for Workers AI binding", () => {
    const config = appConfig["duyet-agents"];
    expect(config).toBeDefined();
    expect(config.secrets).toContain("CLOUDFLARE_ACCOUNT_ID");
    expect(config.secrets).toContain("CLOUDFLARE_API_TOKEN");
    expect(config.secrets).toContain("CLERK_SECRET_KEY");
  });

  test("all apps have secrets and buildVars arrays", () => {
    for (const [_name, config] of Object.entries(appConfig)) {
      expect(Array.isArray(config.secrets)).toBe(true);
      expect(Array.isArray(config.buildVars)).toBe(true);
      // Ensure no empty string entries
      for (const s of config.secrets) {
        expect(s.length).toBeGreaterThan(0);
      }
    }
  });
});
