import { describe, it, expect } from "vitest";
import { findSimilar } from "@lib/fuzzy-match";

const SLUGS = [
  "/",
  "/articles/",
  "/notes/",
  "/works/",
  "/illustrations/",
  "/bibliophilediaries/",
  "/saasguide/",
  "/faqs/",
  "/articles/aws-terms/",
  "/articles/start-with-deno/",
  "/contact/",
  "/terms/",
  "/whatsapp/",
  "/services/ai-workflow-integration/",
];

describe("fuzzy-match: findSimilar", () => {
  it("suggests the articles index for a misspelled /articels/", () => {
    const results = findSimilar("/articels/", SLUGS);
    expect(results).toContain("/articles/");
  });

  it("ranks the closest match first", () => {
    const results = findSimilar("/articels/", SLUGS);
    expect(results[0]).toBe("/articles/");
  });

  it("returns no suggestions for a dissimilar garbage path", () => {
    expect(findSimilar("/qwerty-garbage-path/", SLUGS)).toEqual([]);
  });

  it("matches the last path segment of the requested URL", () => {
    expect(findSimilar("/articles/aws-terms/", SLUGS)).toContain("/articles/aws-terms/");
  });

  it("suggests a collection page for a misspelled slug", () => {
    expect(findSimilar("/saas-gude/", SLUGS)).toContain("/saasguide/");
  });

  it("returns at most max results", () => {
    expect(findSimilar("/articles/aws-terms/", SLUGS, 1).length).toBeLessThanOrEqual(1);
    expect(findSimilar("/articles/aws-terms/", SLUGS, 3).length).toBeLessThanOrEqual(3);
  });

  it("returns nothing for the root path (no segment to compare)", () => {
    expect(findSimilar("/", SLUGS)).toEqual([]);
  });

  it("handles inputs without a trailing slash", () => {
    expect(findSimilar("/articels", SLUGS)).toContain("/articles/");
  });
});
