import { describe, expect, it } from "vitest";
import { slugify as dateSlugify } from "./date";
import { getSlug } from "./getSlug";
import { kbSlugify, slugify } from "./slugify";

const INPUTS = [
  "Hello, World!",
  "Hello & World!",
  " Çést tést ",
  "a[[b]]c",
  "😆 Hello World 😹",
  "a---b",
  "",
  "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
] as const;

describe("slugify golden tests", () => {
  it("preserves getSlug (punct mode) behavior", () => {
    for (const input of INPUTS) {
      expect(slugify(input, { mode: "punct" })).toBe(getSlug(input));
    }
  });

  it("preserves date.slugify (collapse mode) behavior", () => {
    for (const input of INPUTS) {
      expect(slugify(input, { mode: "collapse" })).toBe(dateSlugify(input));
    }
  });

  it("preserves kb slugify behavior", () => {
    const kbExpectations: Record<string, string> = {
      "Hello, World!": "hello-world",
      "Hello & World!": "hello-world",
      " Çést tést ": "st-t-st",
      "a[[b]]c": "abc",
      "😆 Hello World 😹": "hello-world",
      "a---b": "a-b",
      "": "",
      "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz":
        "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz",
    };

    for (const [input, expected] of Object.entries(kbExpectations)) {
      expect(kbSlugify(input)).toBe(expected);
    }
  });

  it("preserves blog shortform collapse behavior without maxLength", () => {
    const blogExpectations: Record<string, string> = {
      "Hello, World!": "hello-world",
      " Çést tést ": "st-t-st",
      "a[[b]]c": "a-b-c",
      "note-file.md": "note-file-md",
    };

    for (const [input, expected] of Object.entries(blogExpectations)) {
      expect(slugify(input, { mode: "collapse" })).toBe(expected);
    }
  });
});
