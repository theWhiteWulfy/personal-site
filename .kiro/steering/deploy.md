# Cloudflare Deployment & Hosting Guide

## Overview
The site is deployed on Cloudflare Pages with hybrid rendering, D1 database integration, and comprehensive security headers.

## Cloudflare Pages Configuration

### Build Settings
```bash
# Build command
npm run build

# Output directory
dist/

# Environment
Node.js (latest)
```

### Astro Cloudflare Adapter
```javascript
// astro.config.mjs
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://alokprateek.in/",
  output: "hybrid", // Static + server-rendered pages
  adapter: cloudflare({
    platformProxy: {
      enabled: true,  // Access to Cloudflare runtime in dev
    },
    imageService: 'passthrough', // Use Cloudflare's image optimization
  })
});
```

## Wrangler Configuration

### Database Setup
```toml
# wrangler.toml
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "meteoric"
database_id = "8380ec22-098e-4814-a56f-48d907425b35"
```

### Local Development
```bash
# Preview with Cloudflare Pages locally
npm run cfpreview

# Uses wrangler pages dev ./dist
# Provides access to D1 database and other Cloudflare features
```

## Security Headers

### HTTP Headers Configuration
```
# public/_headers
/*
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Content-Security-Policy: form-action https:
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Feature-Policy: geolocation 'none'; midi 'none'; sync-xhr 'none'; microphone 'none'; camera 'none'; magnetometer 'none'; gyroscope 'none'; fullscreen 'none'; payment 'none'
```

### Security Features
- **HSTS**: 1-year max-age with subdomain inclusion
- **CSP**: Restricts form actions to HTTPS only
- **XSS Protection**: Browser-level XSS filtering enabled
- **Content Type**: Prevents MIME type sniffing
- **Feature Policy**: Disables unnecessary browser APIs

## URL Redirects & Routing

### Redirect Configuration
```
# public/_redirects

# Domain redirects
http://alokprateek.in/* https://alokprateek.in/:splat 301

# Content migration redirects
/work /works 301
/saas-guide /saasguide 301
/bibliophile-diaries /bibliophilediaries 301

# Dynamic collection redirects
/work/* /works/:splat 301
/saas-guide/* /saasguide/:splat 301
/bibliophile-diaries/* /bibliophilediaries/:splat 301

# Feed redirects
/atom /feed.xml 301
/rss /feed.xml 301
/feed /feed.xml 301
```

### Redirect Patterns
- **Collection Renames**: Old URLs redirect to new collection structure
- **Feed Consolidation**: Multiple feed URLs redirect to single RSS
- **HTTPS Enforcement**: HTTP traffic redirected to HTTPS
- **Subdomain Handling**: www and non-www normalization

## D1 Database Integration

### Database Access Pattern
```typescript
// src/pages/api/newsletter.ts
export const prerender = false; // Required for server-side rendering

import type { APIRoute, APIContext } from 'astro';

export const POST: APIRoute = async ({ request, locals }: APIContext) => {
  // Access Cloudflare runtime
  if (!locals?.runtime?.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { DB } = locals.runtime.env;
  
  // Execute SQL query
  const query = 'INSERT INTO newsletter (email, timestamp) VALUES (?1, CURRENT_TIMESTAMP)';
  await DB.prepare(query).bind(email).run();
  
  return new Response(JSON.stringify({ message: 'Success' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Database Schema
```sql
-- Newsletter subscription table
CREATE TABLE newsletter (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Hybrid Rendering Strategy

### Static vs Server-Rendered Pages
```javascript
// Static pages (default)
// All content collection pages are pre-rendered

// Server-rendered pages
export const prerender = false; // API endpoints only
```

### Page Types
- **Static**: All content pages, layouts, components
- **Server-Rendered**: API endpoints (`/api/*`)
- **Assets**: Images, CSS, JS cached at edge

## Performance Optimizations

### Edge Caching
- **Static Assets**: Cached at Cloudflare edge locations
- **HTML Pages**: Cached with appropriate TTL
- **API Responses**: Not cached (dynamic content)

### Compression
```javascript
// astro.config.mjs
import playformCompress from "@playform/compress";

export default defineConfig({
  integrations: [playformCompress()], // Asset compression
});
```

### Image Optimization
- **Cloudflare Images**: Automatic WebP conversion and resizing
- **Image Service**: 'passthrough' delegates to Cloudflare
- **Custom Component**: `AstroImage` with lazy loading

## Development Workflow

### Local Development
```bash
# Standard development
npm run dev          # Astro dev server (no Cloudflare features)

# Cloudflare development
npm run build        # Build for production
npm run cfpreview    # Preview with Cloudflare runtime
```

### Environment Variables
```bash
# Development
# No special environment variables needed

# Production
# Database binding configured in wrangler.toml
# Secrets managed via Cloudflare dashboard
```

## Deployment Process

### Automatic Deployment
1. **Git Push**: Push to main branch triggers build
2. **Build Process**: `npm run build` executed on Cloudflare
3. **Asset Upload**: Static files uploaded to edge locations
4. **Function Deployment**: API routes deployed as Cloudflare Functions
5. **DNS Update**: Automatic DNS updates for custom domain

### Manual Deployment
```bash
# Using Wrangler CLI
wrangler pages publish dist --project-name=meteoric-teachings

# Build and deploy
npm run build
wrangler pages publish dist
```

## Monitoring & Analytics

### Built-in Analytics
- **Cloudflare Analytics**: Traffic, performance, security metrics
- **Core Web Vitals**: Automatic performance monitoring
- **Security Events**: Attack patterns and mitigation

### Custom Analytics
```javascript
// Google Analytics integration in Head.astro
// GA4 tracking with privacy considerations
```

## Domain Configuration

### Custom Domain Setup
- **Primary Domain**: alokprateek.in
- **SSL Certificate**: Automatic via Cloudflare
- **DNS Management**: Cloudflare nameservers
- **Subdomain Redirects**: Configured in `_redirects`

### DNS Records
```
A    alokprateek.in    192.0.2.1 (Cloudflare proxy)
AAAA alokprateek.in    2001:db8::1 (Cloudflare proxy)
CNAME www              alokprateek.in
```

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version and dependencies
2. **Database Errors**: Verify D1 binding and permissions
3. **Redirect Loops**: Check `_redirects` file syntax
4. **API Timeouts**: Ensure `prerender = false` for server routes

### Debug Commands
```bash
# Check build locally
npm run build
npm run preview

# Test Cloudflare features
npm run cfpreview

# Wrangler debugging
wrangler pages dev dist --local
```

### Performance Monitoring
- **Lighthouse**: Regular performance audits
- **Cloudflare Analytics**: Traffic and performance metrics
- **Core Web Vitals**: User experience monitoring
- **Error Tracking**: Cloudflare error logs