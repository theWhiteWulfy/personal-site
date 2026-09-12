# Astro Content Layer SOP

Use this guide when adding or modifying content collections using Astro 6 Content Layer API.

## Overview

All collections use `glob()` loaders from `astro/loaders`. Schemas use Zod from `astro/zod`.
Collection configs are defined in **both**:
- `src/content.config.ts` — Astro 6 primary entrypoint
- `src/content/config.ts` — legacy path (maintained for compatibility)

## Adding a New Collection

### 1. Define in both config files

```typescript
// src/content.config.ts (and src/content/config.ts)
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const myCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/my-collection",
  }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date(),
    excerpt: z.string(),
    // optional fields...
  }),
});

export const collections = { myCollection };
```

### 2. Create the content directory

```
src/content/my-collection/
  my-first-post.md
```

### 3. Create the dynamic route

```astro
---
// src/pages/my-collection/[...id].astro
import { getCollection } from "astro:content";
import { entryPath, renderEntry } from "@lib/content-shims";

export async function getStaticPaths() {
  const entries = await getCollection("myCollection");
  return entries.map((entry) => ({
    params: { id: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content, headings, remarkPluginFrontmatter } = await renderEntry(entry);
---
```

## Key Rules

- Always use `entry.id` — not `entry.slug` (removed in Astro 6).
- Always use `renderEntry(entry)` from `src/lib/content-shims.ts` — not `entry.render()`.
- Always use `entryPath(collection, entry)` for generating canonical URLs.
- Always import schemas from `astro/zod`, not from `zod` directly.
- YAML data collections (like `albums`) use `glob({ pattern: "**/*.yaml", ... })`.

## Shim API Reference

```typescript
import { entryPath, renderEntry, getAdjacentEntries } from "@lib/content-shims";

// Get canonical URL path for an entry
entryPath("articles", entry) // => "/articles/my-post-id"

// Render entry content (handles both Astro 4 and 6 APIs)
const { Content, headings, remarkPluginFrontmatter } = await renderEntry(entry);

// Get adjacent entries for prev/next navigation
const { prev, next } = await getAdjacentEntries("articles", entry);
```

## Verification

After adding a collection:
1. `npm run build` — must pass with 0 errors
2. `npx astro check` — 0 type errors
3. `npm run test:unit` — tests must still pass
