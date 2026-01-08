import { test, expect } from "bun:test";
import { getSlug } from "./getSlug";

test("getSlug()", () => {
  expect(getSlug("Hello")).toBe("hello");
  expect(getSlug("Hello World")).toBe("hello-world");
  expect(getSlug(" Hello World")).toBe("hello-world");
  expect(getSlug(" Hello World ")).toBe("hello-world");
  expect(getSlug(" Hello World 😹")).toBe("hello-world");
  expect(getSlug("😆 Hello World 😹")).toBe("hello-world");
});
