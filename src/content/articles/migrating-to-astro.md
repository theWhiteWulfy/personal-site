---
title: "Why I Ditched Gatsby: A Migration Story to Astro for Simplicity and Speed"
excerpt: "A personal and technical story of migrating a blog from Gatsby to Astro, focusing on the move away from complexity towards a more streamlined and stable development workflow."
path: /articles/migrating-to-astro/
categories: [articles]
tags: [web development, astro, gatsby, javascript, frontend]
date: 2025-07-13
last_modified_at: 2025-07-14T20:49:14-05:00
comments: true
toc: true
---

## Part 1: The Breaking Point and The Migration

### Introduction: The Gatsby Maintenance Trap

I once loved Gatsby. Its promise of a "blazing fast" website was intoxicating. For a while, it delivered. My personal site was snappy, and the developer experience felt modern and powerful. But over time, the initial thrill faded, replaced by a nagging sense of fragility and a growing maintenance burden.

My reasons for leaving Gatsby boil down to two core issues:

1.  **Update Fatigue:** My terminal became a constant stream of `npm audit` warnings and breaking changes. Keeping dependencies up-to-date felt like a full-time job, a Sisyphean task of resolving peer dependency conflicts and chasing down obscure bugs introduced by minor version bumps. The endless cycle of `dependabot` pull requests was a constant reminder that I was spending more time maintaining the site's plumbing than actually writing content.

2.  **GraphQL Overkill:** GraphQL is a powerful tool, but for a personal blog, it felt like using a sledgehammer to crack a nut. The complexity of writing queries, managing fragments, and debugging the data layer added a significant cognitive overhead. I found myself wrestling with the tooling more than I was expressing my ideas. The setup was, in a word, over-engineered.

### The Migration: What Was Hard, What Was Easy

The decision was made: I was moving to Astro. I was drawn to its promise of "zero JS by default" and its component-based architecture that felt familiar to my React background.

#### The "Easy" Part - A Pattern Emerges

Surprisingly, the initial migration was smoother than I anticipated. A significant portion of the work involved converting my React components to Astro components. The process was often as simple as copying the JSX markup, tweaking the props, and saving the file with a `.astro` extension.

The initial commits of the migration tell this story. I was able to move over the core layout, components, and even the icons in a few focused sessions. For example, in commit `53c2fdbf8b7964fb4ec0c9c3776f0f4d738eae55`, I converted all my SVG icons into individual `.astro` components.

What was once a React component like this:

```jsx
// gatsby/src/components/icons/GithubIcon.js
import React from 'react';

const GithubIcon = () => (
  <svg viewBox="0 0 16 16">
    // ... svg path data
  </svg>
);

export default GithubIcon;
```

Became a much simpler Astro component:

```astro
---
// astro/src/components/icons/GithubIcon.astro
---
<svg viewBox="0 0 16 16">
  // ... svg path data
</svg>
```

This pattern repeated for most of my presentational components, which gave me a huge head start.

#### Hurdle #1: Taming Images

The first major roadblock was handling images. In Gatsby, `gatsby-plugin-image` is the de facto solution. It's powerful, but it's also deeply integrated into the Gatsby ecosystem, with its own set of GraphQL queries and configuration.

Astro, on the other hand, offers a more flexible, but less opinionated, approach. I initially struggled to replicate the "blur-up" effect and responsive image generation I had in Gatsby. My git log from this period is a testament to the struggle, with a series of commits tweaking my custom `AstroImage` component.

I started with a basic component in commit `ffecf1f17543eecd9135bcb825463654e7450588`:

```astro
---
// src/components/AstroImage.astro (initial version)
import { Image } from "astro:assets";
const { src, alt } = Astro.props;
---
<Image src={src} alt={alt} />
```

This worked, but it lacked the polish I was used to. After several iterations, I landed on a much more robust solution in commit `ed932049ae3904ce730786e12c9ffd3cc70eafea`:

```astro
---
// src/components/AstroImage.astro (final version)
import { Image } from "astro:assets";

const { src, alt, loading = 'lazy' } = Astro.props;

let imageSrc;
if (src.startsWith('/src/images')) {
  // Use a dynamic import for images in the src directory
  const images = import.meta.glob('/src/images/**/*.{jpeg,jpg,png,gif}');
  const imagePath = `/${src.split('/').slice(2).join('/')}`;
  if (!images[imagePath]) {
    throw new Error(`Image not found: ${imagePath}`);
  }
  imageSrc = images[imagePath]();
} else {
  // For images in the public directory
  imageSrc = src;
}
---
<Image src={imageSrc} alt={alt} loading={loading} />
```

This final version handles images from both the `src` and `public` directories, and allows me to control the `loading` attribute. It took some effort, but the end result was a component that I fully understood and controlled.

#### Hurdle #2: Rebuilding Forms

Forms were another challenge. My Gatsby site used a combination of a simple contact form and a newsletter signup form. In Gatsby, I was using a third-party service that integrated with my React components.

In Astro, I decided to build a more robust solution using API routes. This was a new concept for me, but it turned out to be surprisingly straightforward. I created a couple of API endpoints that handle the form submissions, and then used the native `fetch` API on the client-side to send the data.

First, I created the form in an `.astro` component, as seen in commit `f051e88fa989c437c1955ae15bf835fd94cb3530`:

```astro
---
// src/components/custom/LeadForm.astro
---
<form id="lead-form">
  <input type="email" name="email" required />
  <button type="submit">Submit</button>
</form>

<script>
  document.getElementById('lead-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/api/leadform', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      // show success message
    } else {
      // show error message
    }
  });
</script>
```

Then, I created the API route to handle the submission in commit `74916e91b0522f5b919bacebb5d69d084b7a271f`:

```typescript
// src/pages/api/leadform.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  // Do something with the data, like send an email or save to a database
  console.log(data);
  return new Response(JSON.stringify({ message: 'Success!' }), { status: 200 });
};
```

This new setup is simpler and more transparent. I'm no longer reliant on a third-party service, and I have full control over the form submission process.

## Part 2: Life After Migration - Enhancements & The Payoff

### Post-Migration Enhancements

Once the migration was complete and the site was stable, I was finally able to focus on adding new features. The simplicity of Astro made it a joy to work with.

*   **PWA Support:** In commit `4d36a7de91af486bb09553b478525d067f7858f5`, I added Progressive Web App (PWA) support using `vite-plugin-pwa`. The configuration in `astro.config.mjs` was straightforward:

    ```javascript
    // astro.config.mjs
    import { defineConfig } from 'astro/config';
    import VitePWA from 'vite-plugin-pwa';
    import manifest from './src/config/manifest';

    export default defineConfig({
      integrations: [
        VitePWA({
          registerType: 'autoUpdate',
          manifest,
        }),
      ],
    });
    ```

*   **Image Galleries:** As seen in commit `a179c13cddae6a46c47958a2b9b9bf14e31ca612`, I created a new section for my illustrations, with a beautiful image gallery that uses a lightbox for a better viewing experience. Astro's file-based routing made it easy to create dynamic pages for each album.

*   **Dark Mode:** In commit `899683f0c28179475e670762999afc0ed93b0246`, I implemented a dark mode toggle that respects the user's system preferences using a simple script in my `menu.astro` component.

### Improved Performance

The performance improvements have been dramatic. My Lighthouse scores have gone up across the board, and the site feels noticeably faster. Astro's "zero JS by default" approach means that the browser has less work to do, resulting in a snappier, more responsive experience for my readers.

### Conclusion: The Joy of "Just Writing"

The migration to Astro was a significant undertaking, but it was worth every bit of the effort. I've traded the complexity and fragility of Gatsby for the simplicity and stability of Astro. I no longer dread running `npm update`, and I'm spending more time creating content and less time wrestling with my tools.

The biggest payoff, however, has been the renewed joy of writing. I can now open up my editor, write a new post, and publish it with confidence, knowing that my site is built on a solid foundation. The technology has faded into the background, and I'm free to focus on what really matters: sharing my ideas with the world.
