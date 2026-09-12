# Technology Stack & Patterns

## Framework & Build System
- **Astro 4.15+**: Static site generator with hybrid rendering
- **Node.js**: Runtime environment (ES modules)
- **TypeScript**: Type-safe JavaScript with strict configuration
- **Vite**: Build tool and dev server

### Core Astro Configuration
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from "@astrojs/cloudflare";
import { VitePWA } from "vite-plugin-pwa";
import playformCompress from "@playform/compress";
import { manifest } from "./src/config/manifest";

export default defineConfig({
  site: "https://alokprateek.in/",
  output: "hybrid", // Static + server-rendered pages
  adapter: cloudflare({
    platformProxy: {
      enabled: true,  // Access to Cloudflare runtime in dev
    },
    imageService: 'passthrough', // Use Cloudflare's image optimization
  }),
  integrations: [playformCompress()], // Asset compression
  vite: {
    plugins: [VitePWA({
      registerType: "autoUpdate",
      manifest,
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}'],
        navigateFallback: null // Prevents console errors for document-based requests
      }
    })]
  }
});
```

### Astro Project Structure
- **Hybrid Rendering**: Static generation with on-demand server rendering
- **File-based Routing**: Pages in `src/pages/` directory
- **Dynamic Routes**: `[...slug].astro` pattern for collection pages
- **API Endpoints**: Server routes in `/api/` directory with TypeScript
- **Static Generation**: `getStaticPaths()` for build-time page generation

## Deployment & Hosting
- **Cloudflare Pages**: Static hosting with edge functions
- **Wrangler**: Cloudflare deployment tool (`wrangler.toml`)
- **Hybrid rendering**: Static generation with on-demand server rendering
- **D1 Database**: Cloudflare's SQLite database for newsletter subscriptions

## Content Management Architecture
- **Astro Content Collections**: Type-safe content with Zod schemas in `src/content/config.ts`
- **MDX**: Enhanced Markdown with component support
- **Remark Plugins**: Custom plugins for reading time and Git-based modification dates
- **Frontmatter**: YAML metadata with strict schema validation

## Styling & Design System
- **PostCSS**: CSS processing with plugins (see structure.md for complete CSS architecture)
- **Fontsource**: Self-hosted web fonts (Prompt, Zilla Slab)

## Key Integrations & APIs
- **PWA**: Vite PWA plugin with service worker and manifest
- **Sitemap**: Automatic XML sitemap generation (`@astrojs/sitemap`)
- **RSS**: Multi-collection feed with custom XSL styling
- **Giscus**: GitHub-based commenting system
- **Compress**: Asset optimization and compression (`@playform/compress`)
- **Cloudflare D1**: SQLite database for newsletter subscriptions
- **Wrangler**: Cloudflare deployment and development tool

## Development Patterns

### Component Architecture
- **Layout System**: `Layout.astro` (base) → `PageLayout.astro` (content pages)
- **Head Component**: Centralized SEO, meta tags, and schema.org JSON-LD
- **Astro Components**: `.astro` files with frontmatter logic and template

### Content Processing
- **Remark Pipeline**: Reading time calculation and Git modification dates
- **Image Processing**: Custom `AstroImage` component with lazy loading

### API Endpoints
- **Form Handling**: Newsletter and contact form processing

## Development Tools
- **Prettier**: Code formatting with Astro and import organization plugins
- **TypeScript**: Strict type checking with path aliases (`@*` → `./src/*`)
- **Path Aliases**: Clean imports from src root

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm start           # Alias for dev

# Building
npm run build       # Type check and build for production
npm run preview     # Preview production build locally

# Cloudflare
npm run cfpreview   # Preview with Cloudflare Pages locally

# Other
npm run astro       # Run Astro CLI commands
```

## Critical File Patterns
- **Site Config**: `src/config/site.js` - Central configuration
- **Content Schema**: `src/content/config.ts` - Collection definitions
- **CSS Variables**: `src/styles/variables.modules.css` - Design tokens
- **Utilities**: `src/lib/` - Shared functions and remark plugins
- **Dynamic Pages**: `src/pages/[collection]/[...slug].astro` pattern