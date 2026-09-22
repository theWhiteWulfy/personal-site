import { describe, it, expect, vi } from "vitest";
import * as astroContent from "astro:content";
import { buildSlugIndex } from "@lib/slug-index";

vi.mocked(astroContent.getCollection).mockImplementation(async (name: string) => {
  switch (name) {
    case "articles":
      return [
        { id: "aws-terms", collection: "articles", data: { draft: false } },
        { id: "draft-post", collection: "articles", data: { draft: true } },
      ] as any;
    case "notes":
      return [{ id: "day-0", collection: "notes", data: {} }] as any;
    default:
      return [];
  }
});

describe("slug-index: buildSlugIndex", () => {
  it("includes published collection entries with trailing slashes", async () => {
    const index = await buildSlugIndex();
    expect(index).toContain("/articles/aws-terms/");
    expect(index).toContain("/notes/day-0/");
  });

  it("excludes draft entries", async () => {
    const index = await buildSlugIndex();
    expect(index).not.toContain("/articles/draft-post/");
  });

  it("includes static pages", async () => {
    const index = await buildSlugIndex();
    expect(index).toContain("/");
    expect(index).toContain("/about/");
    expect(index).toContain("/contact/");
    expect(index).toContain("/terms/");
  });

  it("includes collection index pages", async () => {
    const index = await buildSlugIndex();
    expect(index).toContain("/articles/");
    expect(index).toContain("/notes/");
    expect(index).toContain("/faqs/");
  });

  it("queries all routed collections", async () => {
    await buildSlugIndex();
    for (const collection of [
      "articles",
      "notes",
      "works",
      "illustrations",
      "bibliophilediaries",
      "saasguide",
      "faqs",
    ]) {
      expect(astroContent.getCollection).toHaveBeenCalledWith(collection);
    }
  });

  it("returns a deduplicated index", async () => {
    const index = await buildSlugIndex();
    expect(new Set(index).size).toBe(index.length);
  });
});
