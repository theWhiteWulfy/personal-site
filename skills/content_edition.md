# Content Edition SOP

Use this guide when adding or changing Markdown, MDX, YAML gallery data, or static content assets.

## Scope

- Content lives primarily in `src/content/`, `src/pages/`, `src/images/`, and `public/`.
- Content collection schemas live in `src/content/config.ts`.
- Albums use data collections and image assets under `src/content/albums/`.

## Required Practices

- Preserve frontmatter fields used for routing, SEO, tags, RSS, and listing pages.
- Keep existing slug and path conventions unless Alok assigns a content migration.
- Verify changed content builds with `npm run build`.
- Use the `Content/` branch prefix for content additions.

## Out Of Scope

- Do not change collection architecture during content edits.
- Do not rewrite HTML embedded in legacy Markdown unless a specific cleanup is assigned.
- Do not move image assets without checking all references.
