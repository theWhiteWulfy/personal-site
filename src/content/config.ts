import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// REAL COLLECTIONS (Content Layer loaders)

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    hide_meta: z.boolean().optional(),
    comments: z.boolean().optional(),
    comments_locked: z.boolean().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    hide_meta: z.boolean().optional(),
    comments: z.boolean().optional(),
    comments_locked: z.boolean().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/works" }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    hide_meta: z.boolean().optional(),
    comments: z.boolean().optional(),
    comments_locked: z.boolean().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
    output: z.boolean().optional(),
  }),
});

const illustrations = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/illustrations" }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    hide_meta: z.boolean().optional(),
    comments: z.boolean().optional(),
    comments_locked: z.boolean().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

const bibliophilediaries = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/bibliophilediaries" }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    hide_meta: z.boolean().optional(),
    comments: z.boolean().optional(),
    comments_locked: z.boolean().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

const saasguide = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/saasguide" }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    hide_meta: z.boolean().optional(),
    comments: z.boolean().optional(),
    comments_locked: z.boolean().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

const faqs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/faqs" }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    order: z.number(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    hide_meta: z.boolean().optional(),
    comments: z.boolean().optional(),
    comments_locked: z.boolean().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

const albums = defineCollection({
  loader: glob({ pattern: "**/*.yaml", base: "./src/content/albums" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      cover: image(),
    }),
});

const keyboards = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/keyboards" }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    hide_meta: z.boolean().optional(),
    comments: z.boolean().optional(),
    comments_locked: z.boolean().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

const repos = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/repos" }),
  schema: z.object({
    title: z.string(),
    path: z.string(),
    date: z.coerce.date(),
    last_modified_at: z.coerce.date(),
    excerpt: z.string(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    toc: z.boolean().optional(),
    hide_meta: z.boolean().optional(),
    comments: z.boolean().optional(),
    comments_locked: z.boolean().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

const photoalbum = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/photoalbum" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    cover: z.string().optional(),
    featured: z.boolean().optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = {
  articles,
  notes,
  works,
  illustrations,
  bibliophilediaries,
  faqs,
  saasguide,
  albums,
  keyboards,
  repos,
  photoalbum,
};
