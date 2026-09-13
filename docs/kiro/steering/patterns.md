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

### Component Styling Pattern
```css
/* Component-specific styles with CSS modules */
.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.heading {
  font-size: var(--text-xl);
  color: var(--text-color);
  margin-bottom: var(--space-sm);
}

/* Responsive styling */
@media (--medium-up) {
  .wrapper {
    flex-direction: row;
    align-items: center;
  }
}
```

### Theme-Aware Styling
```css
/* Styles that adapt to theme changes */
.card {
  background: var(--background-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  transition: var(--global-transition);
}

.card:hover {
  background: var(--background-hover);
  transform: translateY(-2px);
}
```

### Utility Class Pattern
```css
/* Reusable utility classes */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.text-center { text-align: center; }
.text-muted { color: var(--text-muted); }
.mb-0 { margin-bottom: 0; }
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

### Basic API Route Pattern
```typescript
// src/pages/api/endpoint.ts
export const prerender = false; // Required for server-side rendering

import type { APIRoute, APIContext } from 'astro';

export const POST: APIRoute = async ({ request, locals }: APIContext) => {
  const formData = await request.formData();
  const data = formData.get('data');

  // Process the request data
  const result = await processData(data);

  return new Response(JSON.stringify({ result }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Form Processing Pattern
```typescript
// Handle form submissions with validation
export const POST: APIRoute = async ({ request }: APIContext) => {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  
  // Validation
  if (!email || !email.includes('@')) {
    return new Response(JSON.stringify({ error: 'Invalid email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Process form data
  await handleFormSubmission(email);

  return new Response(JSON.stringify({ message: 'Success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Error Handling Pattern
```typescript
// Consistent error handling across API routes
export const POST: APIRoute = async ({ request }: APIContext) => {
  try {
    const data = await request.json();
    const result = await processRequest(data);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
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