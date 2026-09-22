import { getCollection } from "astro:content";
import { entryPath } from "./content-shims";

const COLLECTIONS = [
  "articles",
  "notes",
  "works",
  "illustrations",
  "bibliophilediaries",
  "saasguide",
  "faqs",
] as const;

const STATIC_PATHS = [
  "/",
  "/about/",
  "/meet-me/",
  "/mod/",
  "/whatsapp/",
  "/contact/",
  "/services/",
  "/services/ai-workflow-integration/",
  "/services/custom-automation/",
  "/services/whitelabel-solutions/",
  "/support/",
  "/sitemap/",
  "/terms/",
  "/offers/expired/",
  "/tag/",
  "/articles/",
  "/notes/",
  "/works/",
  "/illustrations/",
  "/bibliophilediaries/",
  "/saasguide/",
  "/faqs/",
];

/**
 * Builds the static list of valid site URLs embedded in the 404 page at
 * build time. The 404 page is fully static, so suggestions must be matched
 * client-side against this index.
 */
export async function buildSlugIndex(): Promise<string[]> {
  const collections = await Promise.all(COLLECTIONS.map((collection) => getCollection(collection)));
  const entryPaths = collections.flatMap((entries) =>
    entries
      .filter((entry) => !entry.data.draft)
      .map((entry) => entryPath(entry, { trailingSlash: true }))
  );
  return [...new Set([...entryPaths, ...STATIC_PATHS])];
}
