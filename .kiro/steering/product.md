# Product Overview

**Meteoric Teachings** is a personal blog and portfolio website for Alok Prateek, a multi-talented designer with 11+ years of experience.

## Site Purpose
- Personal blog featuring articles, notes, and tutorials
- Portfolio showcasing design work and illustrations
- Professional services and contact information
- Book reviews and reading diaries (bibliophilediaries)
- SaaS guides and technical content

## Content Architecture
- **Content Collections**: Type-safe content managed via Astro Collections with Zod schemas
- **Dynamic Routing**: Each collection has `[...slug].astro` and `index.astro` pages
- **Frontmatter Standards**: All content requires `title`, `path`, `date`, `last_modified_at`, `excerpt`
- **Git Integration**: Last modified dates auto-generated from Git history via remark plugin

## Content Types & Collections
- **articles/**: Main blog posts and tutorials
- **notes/**: Shorter form content and quick thoughts  
- **works/**: Portfolio pieces and case studies (has `output` field)
- **illustrations/**: Design and artwork showcase
- **bibliophilediaries/**: Book reviews and reading content
- **saasguide/**: Technical guides and tutorials
- **faqs/**: FAQ content with `order` field for sorting
- **albums/**: Photo albums (data collection with image schema)

## SEO & Metadata Strategy
- **Schema.org**: Automatic JSON-LD generation for articles and pages
- **Open Graph**: Complete OG and Twitter Card meta tags
- **Indie Web**: Webmention, pingback, and micropub support
- **RSS Feed**: Multi-collection RSS with custom styling (`/rss/pretty-feed-v3.xsl`)
- **Reading Time**: Auto-calculated via remark plugin (180 words/min)

## Key Features
- **PWA**: Service worker with offline support and update notifications
- **Dark/Light Theme**: CSS custom properties with `data-theme` attribute
- **Table of Contents**: Auto-generated from headings with collapsible details
- **Code Copy**: JavaScript-enhanced code blocks with copy buttons
- **Tag System**: Slugified tags with dedicated tag pages
- **Post Navigation**: Previous/next post navigation within collections