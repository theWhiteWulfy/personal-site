# Content Edition SOP

Use this guide when adding or changing Markdown, MDX, YAML gallery data, or static content assets.

## Scope

- Content lives in `src/content/`, `src/pages/`, `src/images/`, and `public/`.
- Content collection schemas live in `src/content/config.ts` and `src/content.config.ts`.
- Albums use data collections and image assets under `src/content/albums/`.

## Astro 6 Content Layer (Current)

All 8 collections use `glob()` loaders from `astro/loaders`. Schemas use `astro/zod`.

When adding a new collection:
1. Add the `glob()` loader definition to **both** `src/content.config.ts` and `src/content/config.ts`
2. Create the content directory: `src/content/{collection-name}/`
3. Create a dynamic route in `src/pages/{collection-name}/[...id].astro`
4. Use `entry.id` (not `entry.slug`) and `renderEntry(entry)` from `src/lib/content-shims.ts`

## Required Frontmatter Fields

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Page title, used in `<head>` |
| `path` | yes | Canonical URL path (e.g. `/articles/my-post`) |
| `date` | yes | ISO 8601 date |
| `last_modified_at` | yes | ISO 8601 datetime |
| `excerpt` | yes | Used for meta description, RSS, and listing cards |

## Required Practices

- Preserve frontmatter fields used for routing, SEO, tags, RSS, and listing pages.
- Keep existing `path` conventions — changing a `path` breaks existing URLs and SEO.
- Verify changed content builds with `npm run build`.
- Use the `content/` branch prefix for content additions.
- For new images, place them relative to the Markdown file and use relative paths.

## Out Of Scope

- Do not change collection architecture (schemas, loaders) during routine content edits.
- Do not rewrite HTML embedded in legacy Markdown unless a specific cleanup task is assigned.
- Do not move image assets without checking all references.
