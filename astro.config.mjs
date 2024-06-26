import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import pagefind from "astro-pagefind";
import { remarkReadingTime } from './src/lib/remark-reading-time.mjs';
import { remarkModifiedTime } from './src/lib/remark-modified-time.mjs';

import playformCompress from "@playform/compress";

// https://astro.build/config
export default defineConfig({
  site: "https://astro-micro.vercel.app",
  integrations: [sitemap(), mdx(), pagefind(), playformCompress()],
  markdown: {
    syntaxHighlight: 'prism',
    remarkPlugins: [remarkReadingTime, remarkModifiedTime]
  }
});