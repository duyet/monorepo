import { describe, test, expect } from "bun:test";
import { getTagMetadata, getTagColorClass } from "../tag-metadata";

describe("getTagMetadata", () => {
  test("returns object with required fields", () => {
    const meta = getTagMetadata("python", 5, 0);
    expect(meta).toHaveProperty("description");
    expect(meta).toHaveProperty("color");
    expect(meta).toHaveProperty("illustration");
  });

  test("color rotates by index modulo rotation length", () => {
    const colors = [
      "sage",
      "lavender",
      "cactus",
      "coral",
      "terracotta",
      "oat",
      "cream",
      "ivory",
    ] as const;
    for (let i = 0; i < colors.length; i++) {
      const meta = getTagMetadata("tag", 0, i);
      expect(meta.color).toBe(colors[i]);
    }
    // Wraparound
    const wrapped = getTagMetadata("tag", 0, colors.length);
    expect(wrapped.color).toBe(colors[0]);
  });

  test("illustration rotates by index modulo rotation length", () => {
    const illustrations = ["geometric", "blob", "wavy"] as const;
    for (let i = 0; i < illustrations.length; i++) {
      const meta = getTagMetadata("tag", 0, i);
      expect(meta.illustration).toBe(illustrations[i]);
    }
    // Wraparound
    const wrapped = getTagMetadata("tag", 0, illustrations.length);
    expect(wrapped.illustration).toBe(illustrations[0]);
  });

  test("defaults index to 0 when omitted", () => {
    const withDefault = getTagMetadata("tag", 0);
    const withZero = getTagMetadata("tag", 0, 0);
    expect(withDefault.color).toBe(withZero.color);
    expect(withDefault.illustration).toBe(withZero.illustration);
  });

  test("defaults postCount to 0 when omitted", () => {
    const withDefault = getTagMetadata("tag");
    const withZero = getTagMetadata("tag", 0, 0);
    expect(withDefault.description).toBe(withZero.description);
  });

  describe("description pattern matching", () => {
    test("programming languages match language pattern", () => {
      const langs = ["python", "javascript", "typescript", "go", "rust"];
      for (const lang of langs) {
        const meta = getTagMetadata(lang, 0, 0);
        expect(meta.description.toLowerCase()).toMatch(
          /programming|patterns|practices/
        );
      }
    });

    test("frameworks match framework pattern", () => {
      const frameworks = ["react", "vue", "angular", "nextjs", "django"];
      for (const fw of frameworks) {
        const meta = getTagMetadata(fw, 0, 0);
        expect(meta.description.toLowerCase()).toContain("building");
      }
    });

    test("data/ML topics match data pattern", () => {
      const dataTopics = ["machine learning", "data", "bigquery", "spark"];
      for (const topic of dataTopics) {
        const meta = getTagMetadata(topic, 0, 0);
        expect(meta.description.toLowerCase()).toMatch(
          /engineering|architecture/
        );
      }
    });

    test("cloud/infra topics match cloud pattern", () => {
      const cloudTopics = ["aws", "gcp", "kubernetes", "docker", "terraform"];
      for (const topic of cloudTopics) {
        const meta = getTagMetadata(topic, 0, 0);
        expect(meta.description.toLowerCase()).toMatch(
          /infrastructure|deployment/
        );
      }
    });

    test("databases match database pattern", () => {
      const dbs = ["postgres", "redis", "clickhouse", "mongodb"];
      for (const db of dbs) {
        const meta = getTagMetadata(db, 0, 0);
        expect(meta.description.toLowerCase()).toMatch(
          /optimization|design patterns/
        );
      }
    });

    test("tools/practices match tools pattern", () => {
      const tools = ["git", "testing", "monitoring", "performance"];
      for (const tool of tools) {
        const meta = getTagMetadata(tool, 0, 0);
        expect(meta.description.toLowerCase()).toMatch(/techniques|workflows/);
      }
    });

    test("career/soft skills match career pattern", () => {
      const skills = ["career", "interview", "leadership", "productivity"];
      for (const skill of skills) {
        const meta = getTagMetadata(skill, 0, 0);
        expect(meta.description.toLowerCase()).toMatch(/insights|experiences/);
      }
    });

    test("unknown tags get fallback description", () => {
      const meta = getTagMetadata("somecustomtag", 0, 0);
      expect(meta.description.toLowerCase()).toContain("somecustomtag");
    });

    test("postCount > 0 includes article count", () => {
      const meta = getTagMetadata("python", 7, 0);
      expect(meta.description).toContain("7");
      expect(meta.description).toContain("articles");
    });

    test("postCount = 1 uses singular 'article'", () => {
      const meta = getTagMetadata("python", 1, 0);
      expect(meta.description).toContain("1");
      expect(meta.description).toContain("article");
      expect(meta.description).not.toContain("articles");
    });

    test("postCount = 0 uses 'Deep dive into'", () => {
      const meta = getTagMetadata("somecustomtag", 0, 0);
      expect(meta.description).toContain("Deep dive into");
    });
  });
});

describe("getTagColorClass", () => {
  test("returns light variant class by default", () => {
    expect(getTagColorClass("sage")).toBe("bg-sage-light");
    expect(getTagColorClass("lavender")).toBe("bg-lavender-light");
    expect(getTagColorClass("cactus")).toBe("bg-cactus-light");
  });

  test("returns light variant class when variant is 'light'", () => {
    expect(getTagColorClass("ivory", "light")).toBe("bg-ivory");
    expect(getTagColorClass("oat", "light")).toBe("bg-oat-light");
    expect(getTagColorClass("cream", "light")).toBe("bg-cream");
    expect(getTagColorClass("coral", "light")).toBe("bg-coral-light");
    expect(getTagColorClass("terracotta", "light")).toBe("bg-terracotta-light");
  });

  test("returns default variant class when variant is 'default'", () => {
    expect(getTagColorClass("ivory", "default")).toBe("bg-ivory-medium");
    expect(getTagColorClass("oat", "default")).toBe("bg-oat");
    expect(getTagColorClass("cream", "default")).toBe("bg-cream-warm");
    expect(getTagColorClass("cactus", "default")).toBe("bg-cactus");
    expect(getTagColorClass("sage", "default")).toBe("bg-sage");
    expect(getTagColorClass("lavender", "default")).toBe("bg-lavender");
    expect(getTagColorClass("terracotta", "default")).toBe("bg-terracotta");
    expect(getTagColorClass("coral", "default")).toBe("bg-coral");
  });
});
