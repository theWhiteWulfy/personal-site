# Cloudflare Deployment & Hosting Guide

## Overview
The site is deployed on Cloudflare Pages with hybrid rendering, D1 database integration, and comprehensive security headers.

## Cloudflare Pages Configuration

### Build Settings
```bash
# Build command (see tech.md for build details)
npm run build

# Output directory
dist/

# Environment
Node.js (latest)
```

### Astro Cloudflare Adapter
Deployment uses the Cloudflare adapter (see tech.md for full Astro configuration). Key deployment-specific settings:

- **adapter: cloudflare()**: Enables Cloudflare Pages deployment
- **platformProxy.enabled**: Access to Cloudflare runtime in development
- **imageService: 'passthrough'**: Delegates image optimization to Cloudflare
- **output: "hybrid"**: Combines static generation with server-rendered API routes

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

### Local Development with Cloudflare Features
```bash
# Preview with Cloudflare Pages locally (see tech.md for all development commands)
npm run cfpreview   # Uses wrangler pages dev ./dist - includes D1 database access
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

### Database Configuration
The D1 database is configured in `wrangler.toml` and provides SQLite database functionality for server-rendered API routes.

### Database Binding Setup
```toml
# wrangler.toml - Database binding configuration
[[d1_databases]]
binding = "DB"                                    # Environment variable name
database_name = "meteoric"                        # Database name in Cloudflare
database_id = "8380ec22-098e-4814-a56f-48d907425b35"  # Unique database ID
```

### Runtime Access Pattern
```typescript
// src/pages/api/newsletter.ts
export const prerender = false; // Required for server-side rendering

import type { APIRoute, APIContext } from 'astro';

export const POST: APIRoute = async ({ request, locals }: APIContext) => {
  // Access Cloudflare runtime environment
  if (!locals?.runtime?.env?.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { DB } = locals.runtime.env;
  const formData = await request.formData();
  const email = formData.get('email') as string;
  
  try {
    // Execute SQL query with parameter binding
    const query = 'INSERT INTO newsletter (email, timestamp) VALUES (?1, CURRENT_TIMESTAMP)';
    const result = await DB.prepare(query).bind(email).run();
    
    return new Response(JSON.stringify({ 
      message: 'Success',
      id: result.meta.last_row_id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Database operation failed' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### Database Schema Management
```sql
-- Newsletter subscription table
CREATE TABLE newsletter (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmed BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_newsletter_email ON newsletter(email);
CREATE INDEX idx_newsletter_timestamp ON newsletter(timestamp);
```

### Database Operations
```typescript
// Common D1 database operations for deployment

// Insert with error handling
const insertQuery = 'INSERT INTO newsletter (email) VALUES (?1)';
const insertResult = await DB.prepare(insertQuery).bind(email).run();

// Select with pagination
const selectQuery = 'SELECT * FROM newsletter ORDER BY timestamp DESC LIMIT ?1 OFFSET ?2';
const selectResult = await DB.prepare(selectQuery).bind(limit, offset).all();

// Update operation
const updateQuery = 'UPDATE newsletter SET confirmed = TRUE WHERE email = ?1';
const updateResult = await DB.prepare(updateQuery).bind(email).run();

// Delete operation
const deleteQuery = 'DELETE FROM newsletter WHERE email = ?1';
const deleteResult = await DB.prepare(deleteQuery).bind(email).run();
```

### Environment Variables & Secrets
```bash
# Production environment (managed via Cloudflare dashboard)
# Database binding: Configured in wrangler.toml
# Secrets: Use wrangler secret put command

# Example secret management
wrangler secret put API_KEY --env production
wrangler secret put DATABASE_ENCRYPTION_KEY --env production
```

### Database Migration Strategy
```sql
-- Migration scripts for schema updates
-- Run via wrangler d1 execute command

-- Add new column
ALTER TABLE newsletter ADD COLUMN source TEXT DEFAULT 'website';

-- Create new table
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Local Development Database
```bash
# Local D1 database commands
wrangler d1 execute meteoric --local --file=./schema.sql
wrangler d1 execute meteoric --local --command="SELECT * FROM newsletter"

# Sync local with remote
wrangler d1 backup download meteoric --output=backup.sql
wrangler d1 execute meteoric --local --file=backup.sql
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
For standard development commands (`npm run dev`, `npm run build`, `npm run preview`), see tech.md.

Deployment-specific development:
```bash
npm run cfpreview    # Preview with Cloudflare runtime and D1 database access
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
2. **Build Process**: Build command executed on Cloudflare (see tech.md for build details)
3. **Asset Upload**: Static files uploaded to edge locations
4. **Function Deployment**: API routes deployed as Cloudflare Functions
5. **DNS Update**: Automatic DNS updates for custom domain

### Manual Deployment
```bash
# Build first (see tech.md for build commands)
npm run build

# Deploy using Wrangler CLI
wrangler pages publish dist --project-name=meteoric-teachings

# Or combined deployment
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
1. **Build Failures**: Check Node.js version and dependencies (see tech.md for build troubleshooting)
2. **Database Errors**: Verify D1 binding and permissions
3. **Redirect Loops**: Check `_redirects` file syntax
4. **API Timeouts**: Ensure `prerender = false` for server routes

### Debug Commands
```bash
# Standard build and preview commands - see tech.md
# For deployment-specific debugging:

# Test Cloudflare features locally
npm run cfpreview

# Wrangler debugging with local D1
wrangler pages dev dist --local

# D1 database debugging
wrangler d1 execute meteoric --local --command="SELECT * FROM newsletter"

# Check deployment logs
wrangler pages deployment list
wrangler pages deployment tail
```

### Performance Monitoring
- **Lighthouse**: Regular performance audits
- **Cloudflare Analytics**: Traffic and performance metrics
- **Core Web Vitals**: User experience monitoring
- **Error Tracking**: Cloudflare error logs