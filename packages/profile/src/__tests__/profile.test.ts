import { describe, expect, test } from "vitest";
import { createProfile, duyetProfile } from "../index";
import type { Profile } from "../index";

/**
 * `createProfile` has **zero in-repo callers**, and that is by design: the
 * package's stated purpose is that "anyone can create their own profile without
 * modifying components", so this is the forkability seam, not dead code.
 *
 * Which makes the lack of any test more surprising, not less — it is the one
 * function here that does anything, it is the documented extension point, and
 * `packages/profile` had no `test` script at all, so `turbo test` never ran a
 * line of it.
 *
 * It is a thin wrapper over `@duyet/libs`' `deepMerge`, so most of what is worth
 * pinning is the *composition*: that the merge is deep through
 * `personal` / `social` / `appearance.theme`, that it does not mutate the base,
 * and what it does with `undefined`.
 */

/** A minimal valid profile, so each test states only what it cares about. */
const base = (): Profile => ({
  personal: {
    name: "Base Name",
    shortName: "Base",
    email: "base@example.com",
    title: "Base Title",
    bio: "Base bio",
  },
  social: { github: "https://github.com/base" },
  appearance: { theme: { primary: "#000", secondary: "#111", accent: "#222" } },
});

describe("createProfile", () => {
  test("returns the base unchanged when there are no overrides", () => {
    const p = base();
    expect(createProfile(p)).toBe(p);
  });

  test("merges one nested field and keeps its siblings", () => {
    const out = createProfile(base(), { personal: { name: "Jane Doe" } });

    expect(out.personal.name).toBe("Jane Doe");
    expect(out.personal.email).toBe("base@example.com");
    expect(out.personal.title).toBe("Base Title");
  });

  test("merges every level of the appearance.theme tree", () => {
    // The nesting is three deep here (appearance -> theme -> color). A shallow
    // merge would drop `secondary` and `accent`, so this is the case that
    // actually distinguishes deepMerge from `{...a, ...b}`.
    const out = createProfile(base(), {
      appearance: { theme: { primary: "#fff" } },
    });

    expect(out.appearance.theme).toEqual({
      primary: "#fff",
      secondary: "#111",
      accent: "#222",
    });
  });

  test("does not mutate the base profile", () => {
    const p = base();
    createProfile(p, { personal: { name: "Jane Doe" } });

    // The forkability seam depends on this: `duyetProfile` is a module-level
    // singleton, so an in-place merge would corrupt it for every later reader.
    expect(p.personal.name).toBe("Base Name");
    expect(p.appearance.theme.primary).toBe("#000");
  });

  test("adds a key the base does not have", () => {
    const out = createProfile(base(), {
      social: { unsplash: "https://unsplash.com/@jane" },
    });

    expect(out.social.unsplash).toBe("https://unsplash.com/@jane");
    expect(out.social.github).toBe("https://github.com/base");
  });

  test("accepts a profile that omits every optional field", () => {
    // `personal.location`, `appearance.avatar` and `appearance.favicon` are all
    // optional, so a minimal override must typecheck and merge.
    const out = createProfile(base(), {
      personal: { location: "Saigon" },
      appearance: { avatar: "/a.png" },
    });

    expect(out.personal.location).toBe("Saigon");
    expect(out.appearance.avatar).toBe("/a.png");
    expect(out.appearance.theme.secondary).toBe("#111");
  });
});

describe("duyetProfile", () => {
  test("is a complete, self-consistent profile", () => {
    // This is the value every app renders, so a missing required field would be
    // a blank header or a broken avatar on a live site.
    expect(duyetProfile.personal.name).toBeTruthy();
    expect(duyetProfile.personal.shortName).toBeTruthy();
    expect(duyetProfile.personal.email).toContain("@");
    expect(duyetProfile.personal.title).toBeTruthy();
    expect(duyetProfile.personal.bio).toBeTruthy();
    expect(duyetProfile.social.github).toMatch(/^https:\/\//);
    expect(duyetProfile.appearance.theme.primary).toMatch(/^#[0-9a-f]{3,8}$/i);
  });

  test("can be forked without touching the original", () => {
    // The documented use case, run end to end.
    const forked = createProfile(duyetProfile, {
      personal: { name: "Jane Doe", email: "jane@example.com" },
    });

    expect(forked.personal.name).toBe("Jane Doe");
    expect(forked.personal.email).toBe("jane@example.com");
    // Untouched fields survive, so a fork only has to state what it changes.
    expect(forked.personal.title).toBe(duyetProfile.personal.title);
    expect(duyetProfile.personal.name).not.toBe("Jane Doe");
  });
});
