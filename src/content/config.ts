import { defineCollection, z } from "astro:content";

// TEST COLLECTION

const blog = defineCollection({
  type: "content",
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

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    demoURL: z.string().optional(),
    repoURL: z.string().optional(),
  }),
});

// REAL COLLECTIONS

const articles = defineCollection({
  type: "content",
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
  type: "content",
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
  type: "content",
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
  type: "content",
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
  type: "content",
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
  type: "content",
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
  type: "content",
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


export const collections = { blog, projects , articles, notes, works, illustrations, bibliophilediaries, faqs, saasguide };
