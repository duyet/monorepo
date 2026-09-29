import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkLockfile, stalenessMessage } from "./check-lockfile";

/**
 * These tests do not re-run the pnpm check (that is `check-lockfile`'s job at
 * commit time, and re-running it here would make the suite depend on the
 * network). They pin the *presentation* and the safety properties, which are
 * the parts that can silently rot.
 */
describe("stalenessMessage", () => {
  it("names the failure, the consequence, and the fix", () => {
    // The three things a developer needs without reading the CI log.
    const message = stalenessMessage("ERR_PNPM_OUTDATED_LOCKFILE")
    expect(message).toContain("pnpm-lock.yaml is out of date")
    expect(message).toContain("--frozen-lockfile")
    expect(message).toMatch(/\n {2}pnpm install\n/)
  })

  it("includes what pnpm actually said", () => {
    // Without this the message asserts a diagnosis it has not verified, and
    // the real reason stays hidden behind a generic complaint.
    expect(stalenessMessage("ERR_PNPM_OUTDATED_LOCKFILE")).toContain(
      "ERR_PNPM_OUTDATED_LOCKFILE"
    )
  })

  it("copes with pnpm producing no output at all", () => {
    const message = stalenessMessage("")
    expect(message).toContain("pnpm-lock.yaml is out of date")
    expect(message).not.toContain("undefined")
    expect(message).not.toContain("[object Object]")
  })
})

describe("checkLockfile", () => {
  it("passes on the current working tree", () => {
    // The real assertion: the committed lockfile is consistent right now.
    // This fails the moment someone adds a workspace dependency without
    // regenerating it, which is the drift that broke all 18 CI workflows.
    const result = checkLockfile()
    expect(
      result.ok ? "ok" : stalenessMessage(result.output)
    ).toBe("ok")
  })

  it("detects a real stale lockfile, which is the drift it exists to catch", () => {
    // Builds the actual failure mode rather than a proxy for it: a two-package
    // workspace, installed so the lockfile exists, then a workspace dependency
    // added without regenerating it — exactly what commit `c46eb10b` did.
    //
    // Note the case this rules out: pointing the check at a directory with a
    // `package.json` and *no* lockfile passes, because pnpm is happy to create
    // one. So "missing lockfile" is not what CI rejects; "lockfile that no
    // longer matches" is, and only this scenario exercises that.
    const ws = mkdtempSync(join(tmpdir(), "lockfile-check-"));
    const write = (rel: string, body: unknown) => {
      const path = join(ws, rel);
      mkdirSync(dirname(path), { recursive: true });
      // Raw text for the YAML, JSON for the manifests — going through
      // `JSON.stringify` for the workspace file yields a quoted scalar rather
      // than a list, which pnpm rejects with a confusing error instead of the
      // clean "no projects" one.
      writeFileSync(
        path,
        typeof body === "string" ? body : JSON.stringify(body, null, 2)
      );
    };

    try {
      write("pnpm-workspace.yaml", 'packages:\n  - "packages/*"\n');
      write("package.json", { name: "root", version: "1.0.0", private: true });
      write("packages/a/package.json", { name: "a", version: "1.0.0" });
      write("packages/b/package.json", { name: "b", version: "1.0.0" });

      // First install produces a lockfile that matches.
      expect(checkLockfile(ws).ok).toBe(true);

      // Now the drift: `b` starts depending on `a`, and nothing regenerates.
      write("packages/b/package.json", {
        name: "b",
        version: "1.0.0",
        dependencies: { a: "workspace:*" },
      });

      const stale = checkLockfile(ws);
      expect(stale.ok).toBe(false);
      expect(stale.output).toMatch(/lockfile/i);
    } finally {
      rmSync(ws, { recursive: true, force: true });
    }
  });
});
