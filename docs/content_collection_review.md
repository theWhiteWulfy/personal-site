# Content Collection Usage Review

This document audits how content collections are utilized across the repository, mapping out the touchpoints that will be affected by the Astro 5/6 Content Layer API migration.

## 1. Detail Pages (Dynamic Routes)
Dynamic routing heavily relies on `getCollection()` and legacy collection APIs.
- **Pattern**: `src/pages/[collection]/[...slug].astro`
- **Usage**:
  - `export async function getStaticPaths()` calls `getCollection("collection_name")`.
  - Filters out draft items using `!post.data.draft`.
  - Returns paths mapping `params: { slug: post.slug }`.
  - Content rendering relies on `const { Content, headings, remarkPluginFrontmatter } = await post.render()`.
- **Affected Collections**: `articles`, `notes`, `works`, `bibliophilediaries`, `saasguide`, `illustrations`, `faqs`.

## 2. List Pages (Indexes)
List pages aggregate and display collections, typically sorting them by date.
- **Pattern**: `src/pages/[collection]/index.astro`
- **Usage**:
  - Uses `getCollection("collection_name")` to retrieve all entries.
  - Sorts arrays using `data.date.valueOf()`.
  - Filters using `!post.data.draft`.
- **Affected Collections**: All content-type collections.

## 3. Taxonomy and Tags
- **Pattern**: `src/pages/tag/[...slug].astro` and `src/pages/tag/index.astro`
- **Usage**:
  - `getStaticPaths` aggregates tags across multiple collections (`articles`, `notes`, `works`, etc.).
  - Extracts arrays of `post.data.tags`.
  - Uses `slugify()` on tag strings to generate paths.
- **Risk**: Tag extraction relies on the `post.data` object structure. Any change to how frontmatter is parsed in the new Content Layer needs to be validated against this aggregation logic.

## 4. RSS Feed
- **Pattern**: `src/pages/rss.xml.js`
- **Usage**:
  - Merges entries from `articles`, `works`, `notes`, `bibliophilediaries`, and `saasguide`.
  - Explicitly excludes `faqs` and `illustrations`.
  - Sorts by date descending.
  - Formats output for `@astrojs/rss` using `item.collection` and `item.slug` to generate links.
- **Risk**: The RSS feed generator accesses `item.collection` and `item.slug`. If the new loader API changes how these implicitly injected properties are accessed (e.g., `id` instead of `slug`), the feed links will break.

## 5. Galleries (Data Collections)
- **Pattern**: `src/content/albums/` and data schemas
- **Usage**:
  - The `albums` collection is defined as `type: 'data'` in `src/content/config.ts`.
  - It uses YAML files representing galleries with Astro image helper schemas (`cover: image()`).
- **Risk**: Data collections also have changes in the new Content Layer API. The image resolution pipeline through YAML and Astro's `image()` schema needs verification.

## Conclusion
The legacy `getCollection` API, `entry.slug`, `entry.render()`, and `entry.data` properties are deeply embedded across routing, taxonomy, and syndication. The Astro 6 upgrade must be preceded by a targeted branch that updates `src/content/config.ts` with modern loaders and refactors these specific access patterns without altering the final HTML output.
