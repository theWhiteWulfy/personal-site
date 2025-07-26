# Project Structure & Conventions

## Root Directory
```
├── .astro/           # Astro build cache and generated types
├── .git/             # Git repository
├── .kiro/            # Kiro AI assistant configuration
├── .vscode/          # VS Code workspace settings
├── .wrangler/        # Cloudflare Wrangler cache
├── ai/               # AI-related documentation and prompts
├── node_modules/     # Dependencies
├── public/           # Static assets served directly
└── src/              # Source code
```

## Source Structure (`src/`)
```
src/
├── components/       # Reusable Astro components
│   ├── custom/       # Custom specialized components
│   ├── icons/        # Icon components
│   ├── logos/        # Logo components
│   └── *.astro       # Core components (Header, Footer, etc.)
├── config/           # Site configuration
│   ├── site.js       # Main site configuration
│   ├── manifest.ts   # PWA manifest
│   └── taxonomy.yml  # Content taxonomy
├── content/          # Content collections (Markdown/MDX)
│   ├── articles/     # Blog articles
│   ├── notes/        # Short-form content
│   ├── works/        # Portfolio pieces
│   ├── illustrations/ # Design work
│   ├── bibliophilediaries/ # Book reviews
│   ├── saasguide/    # Technical guides
│   ├── faqs/         # FAQ content
│   ├── albums/       # Photo albums (data collection)
│   └── config.ts     # Content collection schemas
├── images/           # Image assets
│   ├── cover/        # Cover images
│   ├── illu/         # Illustrations
│   └── theme/        # Theme-related images
├── layouts/          # Page layout components
│   ├── Layout.astro  # Base layout
│   └── PageLayout.astro # Page-specific layout
├── lib/              # Utility functions and plugins
│   ├── remark-*.mjs  # Remark plugins for Markdown processing
│   ├── utils.ts      # General utilities
│   └── *.ts          # Other utility modules
├── pages/            # File-based routing
│   ├── api/          # API endpoints
│   ├── [collection]/ # Dynamic collection pages
│   ├── tag/          # Tag pages
│   └── *.astro       # Static pages
└── styles/           # CSS and styling
    ├── *.module.css  # Component-specific styles
    ├── global.css    # Global styles
    ├── reset.css     # CSS reset
    └── variables.modules.css # CSS custom properties
```

## Critical Architecture Patterns

### Content Collection Pattern
Each content type follows this structure:
```
src/content/[collection]/
├── config.ts         # Zod schema definition
├── [content-files]   # Markdown/MDX files
src/pages/[collection]/
├── [...slug].astro   # Dynamic content pages
└── index.astro       # Collection listing page
```

### Layout Hierarchy
```
Layout.astro (base HTML, Head, Header, Footer)
└── PageLayout.astro (content-specific: meta, TOC, tags)
    └── Content (MDX rendered content)
```

### CSS Architecture
- **Variables**: `variables.modules.css` defines design tokens and custom media queries
- **Global**: `global.css` contains utility classes and component styles
- **Modules**: Component-specific styles with `.module.css` extension
- **Theme**: Dark/light mode via `[data-theme]` attribute

### Remark Plugin Chain
1. **Reading Time**: Calculates reading time from content
2. **Modified Time**: Gets last Git commit date for file
3. **Frontmatter Injection**: Adds computed data to frontmatter

## Naming Conventions
- **Files**: kebab-case for all files and directories
- **Components**: PascalCase for Astro components (`.astro` files)
- **Styles**: CSS modules use `.module.css` extension
- **Content**: Markdown files use descriptive names matching their slugs
- **Assets**: Organized by type and purpose in logical subdirectories
- **Collections**: Lowercase, plural directory names

## Content Frontmatter Standards
Required fields for all content:
```yaml
title: string
path: string  
date: YYYY-MM-DD
last_modified_at: YYYY-MM-DD
excerpt: string
```

Optional fields:
```yaml
image: string (relative path)
categories: string[]
tags: string[]
toc: boolean
hide_meta: boolean
comments: boolean
featured: boolean
draft: boolean
```

## API Endpoint Patterns
- **Location**: `src/pages/api/[endpoint].ts`
- **Prerender**: Must set `export const prerender = false` for server-side
- **Cloudflare**: Access runtime via `locals.runtime.env`
- **Database**: D1 database available as `locals.runtime.env.DB`

## Path Aliases & Imports
- `@*` maps to `./src/*` for clean imports
- Use absolute imports: `import site from '@/config/site.js'`
- Component imports: `import Layout from '@layouts/Layout.astro'`
- Style imports: `import style from '@styles/component.module.css'`

## SEO & Meta Pattern
Every page should use the `Head.astro` component with:
- Title (auto-prefixed with site title)
- Description for meta and OG tags
- Image for social sharing
- Schema.org JSON-LD structured data
- Publication/modification dates for articles