# Coding Patterns & Conventions

## Astro Component Patterns

### Standard Component Structure
```astro
---
// TypeScript frontmatter
import type { ComponentProps } from 'astro:types';
import style from '@styles/component.module.css';

interface Props {
  title: string;
  optional?: boolean;
}

const { title, optional = false } = Astro.props;
---

<div class={style.wrapper}>
  <h1 class={style.title}>{title}</h1>
  <slot />
</div>
```

### Dynamic Route Pattern
```astro
---
// src/pages/[collection]/[...slug].astro
import { type CollectionEntry, getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = (await getCollection("articles"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: post,
  }));
}

type Props = CollectionEntry<"articles">;
const post = Astro.props;
const { Content, headings, remarkPluginFrontmatter } = await post.render();
---
```

## CSS Patterns

### CSS Module Usage
```astro
---
import style from '@styles/component.module.css';
---
<div class={style.wrapper}>
  <h1 class={`${style.heading} p-name`}>Title</h1>
</div>
```

### Design Token Usage
```css
/* Use CSS custom properties from variables.modules.css */
.component {
  color: var(--text-color);
  font-family: var(--sans-serif-font);
  font-size: var(--text-lg);
  transition: var(--global-transition);
}

/* Responsive with custom media queries */
@media (--medium-up) {
  .component {
    font-size: var(--text-xl);
  }
}
```

### Theme Support Pattern
```css
/* Light mode (default) */
.component {
  background: var(--background-color);
  color: var(--text-color);
}

/* Dark mode automatically handled via CSS custom properties */
[data-theme="dark"] .component {
  /* Variables automatically switch values */
}
```

## Content Processing Patterns

### Collection Query Pattern
```typescript
// Get filtered and sorted collection
const posts = (await getCollection("articles"))
  .filter((post) => !post.data.draft)
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
```

### Multi-Collection RSS Pattern
```javascript
// src/pages/rss.xml.js
const articles = (await getCollection("articles")).filter((article) => !article.data.draft);
const works = (await getCollection("works")).filter((work) => !work.data.draft);
const notes = (await getCollection("notes")).filter((note) => !note.data.draft);

const items = [...articles, ...works, ...notes].sort(
  (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
);
```

### Tag Processing Pattern
```astro
---
import { slugify } from '@lib/slugify.mjs';
---
{post.data.tags?.map((tag: string) => (
  <Link to={`/tag/${slugify(tag)}/`}>
    <span>#{tag}</span>
  </Link>
))}
```

## API Endpoint Patterns

### Cloudflare D1 Database Pattern
```typescript
// src/pages/api/endpoint.ts
export const prerender = false;

import type { APIRoute, APIContext } from 'astro';

export const POST: APIRoute = async ({ request, locals }: APIContext) => {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!locals?.runtime?.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { DB } = locals.runtime.env;
  const query = 'INSERT INTO table (email) VALUES (?1)';
  await DB.prepare(query).bind(email).run();

  return new Response(JSON.stringify({ message: 'Success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

## SEO & Meta Patterns

### Schema.org JSON-LD Pattern
```astro
---
// In Head.astro
const schemaOrgWebPage = {
  '@context': 'http://schema.org',
  '@type': article ? 'Article' : 'WebPage',
  url: path,
  inLanguage: site.siteLanguage,
  name: title,
  description: description,
  author: {
    '@type': 'Person',
    name: author.name,
  },
  datePublished,
  dateModified,
};
---
<script type="application/ld+json" set:html={JSON.stringify(schemaOrgWebPage)} />
```

### Meta Tag Pattern
```astro
<!-- Primary Meta Tags -->
<title>{title}</title>
<meta name="description" content={description} />

<!-- Open Graph -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={metaImage.src} />

<!-- Twitter -->
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
```

## JavaScript Enhancement Patterns

### Progressive Enhancement Pattern
```javascript
// Add functionality after DOM load and page transitions
document.addEventListener("DOMContentLoaded", () => addFeature());
document.addEventListener("astro:after-swap", () => addFeature());
```

### Code Copy Button Pattern
```javascript
// Global script in Head.astro
function addCopyCodeButtons() {
  let copyButtonLabel = "✂️ copy";
  let codeBlocks = Array.from(document.querySelectorAll("pre"));

  for (let codeBlock of codeBlocks) {
    const copyButton = document.createElement("button");
    copyButton.innerText = copyButtonLabel;
    copyButton.classList = "copy-code";
    
    codeBlock.appendChild(copyButton);
    
    copyButton.addEventListener("click", async () => {
      await navigator.clipboard.writeText(codeBlock.innerText);
      copyButton.innerText = "✅ copied!";
      setTimeout(() => copyButton.innerText = copyButtonLabel, 2000);
    });
  }
}
```

## Utility Function Patterns

### Date Formatting Pattern
```typescript
// src/lib/utils.ts
export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit", 
    day: "2-digit",
  }).format(date);
}
```

### Slugify Pattern
```javascript
// src/lib/slugify.mjs
export function slugify(text) {
  return text.toString().trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/([^a-zA-Z0-9\._-]+)/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
```

## Remark Plugin Patterns

### Custom Remark Plugin Pattern
```javascript
// src/lib/remark-reading-time.mjs
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    data.astro.frontmatter.timeToRead = readingTime.text;
  };
}
```

### Git Integration Pattern
```javascript
// src/lib/remark-modified-time.mjs
import { execSync } from "child_process";

export function remarkModifiedTime() {
  return function (tree, file) {
    const filepath = file.history[0];
    const result = execSync(`git log -1 --pretty="format:%cI" "${filepath}"`);
    file.data.astro.frontmatter.lastModified = result.toString();
  };
}
```