import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { VitePWA } from "vite-plugin-pwa";
import { manifest } from "./src/config/manifest";
import { remarkReadingTime } from './src/lib/remark-reading-time.mjs';
import { remarkModifiedTime } from './src/lib/remark-modified-time.mjs';
import playformCompress from "@playform/compress";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://alokprateek.in/",
  integrations: [sitemap(), mdx(), playformCompress()], 
  markdown: {
    syntaxHighlight: 'prism',
    remarkPlugins: [remarkReadingTime, remarkModifiedTime]
  },
  vite: {
    logLevel: 'warn',
    build: {
      rollupOptions: {
        // Exclude specific files from the build
        external: [
          // Use exact paths or patterns as needed
          'dist/workbox-*.js',
          'public/web/experiment/js/*.js'
        ]
      }
    },
    plugins: [VitePWA({
      registerType: "autoUpdate",
      manifest,
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}'],
        // Don't fallback on document based (e.g. `/some-page`) requests
        // This removes an errant console.log message from showing up.
        navigateFallback: null
      }
    })]
  },
  output: "hybrid", // add `export const prerender = false` to any files that should be server-rendered on demand
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    imageService: 'passthrough',
  })
});