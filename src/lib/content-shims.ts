/**
 * src/lib/content-shims.ts
 *
 * Content Collection and SEO Preservation Shims for Astro 4 -> Astro 6 Migration.
 * Insulates page routes, feeds, and navigation components from:
 * 1. entry.slug -> entry.id renaming
 * 2. entry.render() -> render(entry) API deprecation
 * 3. URL path drift between static build and RSS/sitemap feeds
 */

import * as astroContent from "astro:content";

export interface EntryLike {
  id?: string;
  slug?: string;
  collection?: string;
  data?: {
    output?: boolean;
    path?: string;
    [key: string]: any;
  };
  render?: () => Promise<{
    Content: any;
    headings: any[];
    remarkPluginFrontmatter: Record<string, any>;
  }>;
  [key: string]: any;
}

export interface EntryPathOptions {
  /**
   * When true, ensures the returned path terminates with a trailing slash ('/').
   * When false, strips trailing slash (except for root '/').
   * Default is false (matching existing index page card links).
   */
  trailingSlash?: boolean;
}

export interface RenderResult {
  Content: any;
  headings: any[];
  remarkPluginFrontmatter: Record<string, any>;
}

/**
 * Extracts a normalized, URL-friendly slug/identifier from a collection entry or string.
 *
 * In Astro 4:
 * - Content entries have `entry.slug` (e.g. "aws-terms"), while `entry.id` has ".md" ("aws-terms.md").
 * - Data entries (e.g. albums) have `entry.id` without extension ("cards").
 *
 * In Astro 6:
 * - Content Layer entries with glob loaders have `entry.id` without extension ("aws-terms").
 *
 * This helper guarantees a clean slug across all environments.
 */
export function getEntrySlug(entry: EntryLike | string | undefined | null): string {
  if (!entry) return "";
  if (typeof entry === "string") {
    return entry.replace(/\.(mdx?|markdown|ya?ml|json)$/i, "");
  }
  if (entry.slug) {
    return String(entry.slug);
  }
  if (entry.id) {
    return String(entry.id).replace(/\.(mdx?|markdown|ya?ml|json)$/i, "");
  }
  return "";
}

/**
 * Constructs the canonical URL path for a collection entry.
 *
 * Supports both signatures:
 *   1. entryPath(entry, options?)
 *   2. entryPath(collection, entry, options?)
 *
 * Examples:
 *   entryPath(article)                       => "/articles/aws-terms"
 *   entryPath(article, { trailingSlash: true }) => "/articles/aws-terms/"
 *   entryPath("articles", article)           => "/articles/aws-terms"
 *   entryPath("illustrations", album)        => "/illustrations/cards"
 */
export function entryPath(
  collectionOrEntry: string | EntryLike,
  entryOrOptions?: EntryLike | string | EntryPathOptions,
  maybeOptions?: EntryPathOptions
): string {
  let collection = "";
  let entry: any = null;
  let options: EntryPathOptions = {};

  if (typeof collectionOrEntry === "string") {
    collection = collectionOrEntry;
    if (
      typeof entryOrOptions === "string" ||
      (entryOrOptions &&
        typeof entryOrOptions === "object" &&
        ("slug" in entryOrOptions || "id" in entryOrOptions || "data" in entryOrOptions))
    ) {
      entry = entryOrOptions;
      options = maybeOptions || {};
    } else if (entryOrOptions && typeof entryOrOptions === "object") {
      options = entryOrOptions as EntryPathOptions;
    }
  } else if (collectionOrEntry && typeof collectionOrEntry === "object") {
    entry = collectionOrEntry;
    collection = entry.collection || "";
    if (
      entryOrOptions &&
      typeof entryOrOptions === "object" &&
      !("id" in entryOrOptions) &&
      !("slug" in entryOrOptions) &&
      !("data" in entryOrOptions)
    ) {
      options = entryOrOptions as EntryPathOptions;
    } else {
      options = maybeOptions || {};
    }
  }

  const slug = getEntrySlug(entry);
  const cleanCollection = collection.replace(/^\/+|\/+$/g, "");
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");

  const basePath = cleanCollection ? `/${cleanCollection}/${cleanSlug}` : `/${cleanSlug}`;

  if (options.trailingSlash) {
    return basePath.endsWith("/") ? basePath : `${basePath}/`;
  }
  return basePath;
}

/**
 * Renders a content entry across Astro 4, Astro 5, and Astro 6.
 *
 * Dispatch order:
 * 1. `entry.render()` (Astro 4 and Astro 5/6 with legacy.collectionsBackwardsCompat: true)
 * 2. `astro:content.render(entry)` (Astro 6 Content Layer)
 * 3. Dynamic import fallback for isolated bundle contexts
 */
export async function renderEntry(entry: any): Promise<RenderResult> {
  if (!entry) {
    throw new Error("renderEntry called with null or undefined entry");
  }

  // 1. Astro 4 / backwards compat mode: entry has render() method
  if (typeof entry.render === "function") {
    return await entry.render();
  }

  // 2. Astro 6 Content Layer: imported render() function
  if (typeof (astroContent as any).render === "function") {
    return await (astroContent as any).render(entry);
  }

  // 3. Dynamic import fallback
  try {
    const mod = await import("astro:content");
    if (typeof (mod as any).render === "function") {
      return await (mod as any).render(entry);
    }
  } catch {
    // Continue to error throw below
  }

  throw new Error(
    `Unable to render entry "${getEntrySlug(entry) || "unknown"}": neither entry.render() nor astro:content render(entry) is available.`
  );
}

/**
 * Computes adjacent entries for pagination / previous-next navigation.
 * Matches entries by either `slug` or `id`.
 */
export function getAdjacentEntries<T extends EntryLike>(
  entries: T[],
  currentIdentifier: string | undefined
): { nextPost: T | undefined; prevPost: T | undefined } {
  if (!currentIdentifier || !entries || entries.length === 0) {
    return { nextPost: undefined, prevPost: undefined };
  }

  const cleanCurrent = currentIdentifier.replace(/\.(mdx?|markdown|ya?ml|json)$/i, "");

  const entryIndex = entries.findIndex((entry) => {
    const slug = getEntrySlug(entry);
    return (
      slug === cleanCurrent ||
      entry.slug === cleanCurrent ||
      entry.id === cleanCurrent ||
      entry.id?.replace(/\.(mdx?|markdown|ya?ml|json)$/i, "") === cleanCurrent
    );
  });

  if (entryIndex === -1) {
    return { nextPost: undefined, prevPost: undefined };
  }

  return {
    nextPost: entries[entryIndex + 1],
    prevPost: entries[entryIndex - 1],
  };
}

// Backwards-compatible alias for existing imports
export const getAdjacentPosts = getAdjacentEntries;
