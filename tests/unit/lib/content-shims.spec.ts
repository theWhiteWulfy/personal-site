import { describe, it, expect, vi } from "vitest";
import * as astroContent from "astro:content";
import {
  getEntrySlug,
  entryPath,
  renderEntry,
  getAdjacentEntries,
  getAdjacentPosts,
} from "@lib/content-shims";

describe("content-shims: getEntrySlug", () => {
  it("returns clean slug for entry with slug property", () => {
    const entry = { slug: "aws-terms", id: "aws-terms.md" };
    expect(getEntrySlug(entry)).toBe("aws-terms");
  });

  it("strips markdown extensions from entry with id property", () => {
    const entry = { id: "deep-dive.mdx" };
    expect(getEntrySlug(entry)).toBe("deep-dive");
  });

  it("handles data entry without extensions", () => {
    const entry = { id: "cards" };
    expect(getEntrySlug(entry)).toBe("cards");
  });

  it("handles string inputs and strips extensions", () => {
    expect(getEntrySlug("getting-started.md")).toBe("getting-started");
    expect(getEntrySlug("data.yaml")).toBe("data");
    expect(getEntrySlug("info.json")).toBe("info");
  });

  it("returns empty string for null, undefined, or empty entry", () => {
    expect(getEntrySlug(null)).toBe("");
    expect(getEntrySlug(undefined)).toBe("");
    expect(getEntrySlug({})).toBe("");
  });
});

describe("content-shims: entryPath", () => {
  it("generates path from entry object with collection", () => {
    const entry = { collection: "articles", slug: "migrating-to-astro" };
    expect(entryPath(entry)).toBe("/articles/migrating-to-astro");
  });

  it("supports trailing slash option", () => {
    const entry = { collection: "articles", slug: "migrating-to-astro" };
    expect(entryPath(entry, { trailingSlash: true })).toBe("/articles/migrating-to-astro/");
  });

  it("supports collection as first argument signature", () => {
    const entry = { id: "cards" };
    expect(entryPath("illustrations", entry)).toBe("/illustrations/cards");
    expect(entryPath("illustrations", entry, { trailingSlash: true })).toBe(
      "/illustrations/cards/"
    );
  });

  it("computes canonical path for works entries with output: false", () => {
    const entry = {
      collection: "works",
      slug: "illustrations",
      data: {
        output: false,
        path: "/illustrations/",
      },
    };
    expect(entryPath(entry)).toBe("/works/illustrations");
    expect(entryPath(entry, { trailingSlash: true })).toBe("/works/illustrations/");
  });

  it("handles path with id when slug is missing", () => {
    const entry = { collection: "notes", id: "day-0.md" };
    expect(entryPath(entry)).toBe("/notes/day-0");
  });
});

describe("content-shims: renderEntry", () => {
  it("calls entry.render() if available (Astro 4 pattern)", async () => {
    const mockContent = { Content: () => "Rendered", headings: [], remarkPluginFrontmatter: {} };
    const entry = {
      slug: "test-post",
      render: vi.fn().mockResolvedValue(mockContent),
    };

    const result = await renderEntry(entry);
    expect(entry.render).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockContent);
  });

  it("throws descriptive error when entry is null or undefined", async () => {
    await expect(renderEntry(null)).rejects.toThrow("renderEntry called with null or undefined entry");
  });

  it("falls back to astro:content render(entry) if entry.render is not available", async () => {
    const entry = { slug: "content-layer-entry" };
    const result = await renderEntry(entry);
    expect(result).toHaveProperty("Content");
    expect(result).toHaveProperty("headings");
    expect(result).toHaveProperty("remarkPluginFrontmatter");
  });

  it("throws error when neither entry.render nor astro:content render is available", async () => {
    const entry = { slug: "no-renderer" };
    const origRender = (astroContent as any).render;
    try {
      delete (astroContent as any).render;
      await expect(renderEntry(entry)).rejects.toThrow(
        'Unable to render entry "no-renderer": neither entry.render() nor astro:content render(entry) is available.'
      );
    } finally {
      (astroContent as any).render = origRender;
    }
  });
});

describe("content-shims: getAdjacentEntries", () => {
  const posts = [
    { slug: "post-1", id: "post-1.md", data: { title: "Post 1" } },
    { slug: "post-2", id: "post-2.md", data: { title: "Post 2" } },
    { slug: "post-3", id: "post-3.md", data: { title: "Post 3" } },
  ];

  it("returns next and prev posts for middle element", () => {
    const { prevPost, nextPost } = getAdjacentEntries(posts, "post-2");
    expect(prevPost?.slug).toBe("post-1");
    expect(nextPost?.slug).toBe("post-3");
  });

  it("returns undefined prevPost for first element", () => {
    const { prevPost, nextPost } = getAdjacentEntries(posts, "post-1");
    expect(prevPost).toBeUndefined();
    expect(nextPost?.slug).toBe("post-2");
  });

  it("returns undefined nextPost for last element", () => {
    const { prevPost, nextPost } = getAdjacentEntries(posts, "post-3");
    expect(prevPost?.slug).toBe("post-2");
    expect(nextPost).toBeUndefined();
  });

  it("handles identifier matching with .md extension", () => {
    const { prevPost, nextPost } = getAdjacentEntries(posts, "post-2.md");
    expect(prevPost?.slug).toBe("post-1");
    expect(nextPost?.slug).toBe("post-3");
  });

  it("returns undefined for unknown identifier", () => {
    const { prevPost, nextPost } = getAdjacentEntries(posts, "unknown");
    expect(prevPost).toBeUndefined();
    expect(nextPost).toBeUndefined();
  });

  it("handles undefined identifier or empty posts array", () => {
    expect(getAdjacentEntries([], "post-1")).toEqual({ nextPost: undefined, prevPost: undefined });
    expect(getAdjacentEntries(posts, undefined)).toEqual({ nextPost: undefined, prevPost: undefined });
  });

  it("exports getAdjacentPosts as alias for getAdjacentEntries", () => {
    expect(getAdjacentPosts).toBe(getAdjacentEntries);
  });
});
