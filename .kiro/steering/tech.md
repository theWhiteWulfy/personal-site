# Technology Stack & Patterns

## Framework & Build System
- **Astro 4.15+**: Static site generator with hybrid rendering
- **Node.js**: Runtime environment (ES modules)
- **TypeScript**: Type-safe JavaScript with strict configuration
- **Vite**: Build tool and dev server

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
- **PostCSS**: CSS processing with modern features
  - `postcss-import`, `postcss-nested`, `postcss-mixins`
  - `postcss-preset-env` for future CSS features
  - `cssnano` for optimization
- **CSS Modules**: Scoped component styles (`.module.css`)
- **CSS Custom Properties**: Design tokens in `src/styles/variables.modules.css`
- **Custom Media Queries**: Responsive breakpoints via PostCSS
- **Fontsource**: Self-hosted web fonts (Prompt, Zilla Slab)

## Key Integrations & APIs
- **PWA**: Vite PWA plugin with service worker and manifest
- **Sitemap**: Automatic XML sitemap generation
- **RSS**: Multi-collection feed with custom XSL styling
- **Giscus**: GitHub-based commenting system
- **Compress**: Asset optimization and compression

## Development Patterns

### Component Architecture
- **Layout System**: `Layout.astro` (base) → `PageLayout.astro` (content pages)
- **Head Component**: Centralized SEO, meta tags, and schema.org JSON-LD
- **CSS Modules**: Component-scoped styles with BEM-like naming
- **Astro Components**: `.astro` files with frontmatter logic and template

### Content Processing
- **Dynamic Routes**: `[...slug].astro` pattern for collection pages
- **Static Generation**: `getStaticPaths()` for build-time page generation  
- **Remark Pipeline**: Reading time calculation and Git modification dates
- **Image Processing**: Custom `AstroImage` component with lazy loading

### API Endpoints
- **Server Routes**: `/api/` directory with TypeScript endpoints
- **Cloudflare Integration**: Access to D1 database via `locals.runtime.env`
- **Form Handling**: Newsletter and contact form processing

## Development Tools
- **Prettier**: Code formatting with Astro and import organization plugins
- **TypeScript**: Strict type checking with path aliases (`@*` → `./src/*`)
- **Path Aliases**: Clean imports from src root

## Common Commands & Workflows

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