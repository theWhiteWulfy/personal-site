import { defineCollection, z } from "astro:content";

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
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    demoURL: z.string().optional(),
    repoURL: z.string().optional(),
  }),
});

export const collections = { blog, projects };
