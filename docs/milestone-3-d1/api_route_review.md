# API Route Review (Cloudflare D1)

## Overview
This document audits the data flow, security posture, and database interaction of all API routes to ensure D1 work is stable through framework upgrades.

## Route Analysis

### `resource-download.ts`
- **Input Schema:** `email`, `name`, `workplace`, `role`, `resourceName` (via FormData).
- **Validation:** Uses `validateResourceForm` in `src/lib/api/validation.ts`.
- **Security:** 
  - Extracts IP using `CF-Connecting-IP` or `X-Forwarded-For`.
  - Uses `performSecurityChecks` (rate limiting, honeypot, spam detection).
- **DB Guard:** Uses `getDatabase(locals)` which wraps `locals?.runtime?.env?.DB`.
- **Data Flow:** Validates data -> checks security -> inserts record via `insertResourceDownload` (handling duplicates) -> logs to `analytics_events` -> fetches download token from `serve-resource.ts`.
- **Error Paths:** Returns 429 for security blocks, 400 for validation errors, 500 for DB/internal errors.

### `campaign-visit.ts`
- **Input Schema:** `campaign_slug`, `utm_*` fields, `referrer`, `session_id`, `user_id`, `conversion_type`, `conversion_value`, `page_url`.
- **Validation:** Manual check for `campaign_slug`.
- **Security:** Extracts IP via `clientAddress` (Astro standard) instead of Cloudflare headers.
- **DB Guard:** Uses standard `getDatabase(locals)` pattern.
- **Data Flow:** Validates slug -> fetches `campaignId` -> inserts visit record -> returns 200 with `visit_id`.
- **UTM Tracking Risk:** UTM tracking in `campaign-visit.ts` relies on FormData. If the frontend relies on `astro:after-swap` for client-side routing, the event listener must be properly attached to handle navigation events in Astro 6 (`<ClientRouter />`).

### Other Routes (`newsletter.ts`, `leadform.ts`, `campaigns.ts`, `serve-resource.ts`, `campaign-signup.ts`)
- All routes appear to follow the standardized DB guard pattern: `const dbCheck = getDatabase(locals); if (dbCheck.errorResponse) return dbCheck.errorResponse; const DB = dbCheck.DB;`
- This ensures consistency and prevents runtime crashes if `locals.runtime.env.DB` is missing.

## Risk Assessment

1. **`locals.runtime.env.DB` Inconsistencies:**
   - The codebase has been successfully refactored to use the central `getDatabase(locals)` helper from `src/lib/api/database.ts`. No divergent patterns were found in the audited routes.

2. **Missing Migration Risk:**
   - The schemas for `resource_downloads`, `campaign_visits`, and `analytics_events` exist in the SQL bindings within the routes (or `database.ts`).
   - We need to ensure `scripts/004_*.sql` and `scripts/005_*.sql` explicitly define `CREATE TABLE` for these to prevent missing tables during local/production migration.

3. **`scripts/migrate-database.js` / `verify-database.js` Interface Gap:**
   - `package.json` includes `"db:migrate": "node scripts/migrate-database.js"` and `"db:verify": "node scripts/verify-database.js"`. 
   - Industry-standard Wrangler usage typically relies on `wrangler d1 migrations apply`. The custom scripts must wrap Wrangler appropriately or use the D1 HTTP API.

4. **Security Logic Resiliency:**
   - `resource-download.ts` explicitly reads `CF-Connecting-IP`. This is safe for Cloudflare environments but may fail in local development without proper polyfills in the Astro adapter.

5. **`astro:after-swap` semantics:**
   - `Head.astro` and page scripts rely on `astro:after-swap` to re-bind analytics and copy-code buttons. In Astro 6, `ViewTransitions` is renamed/re-architected to `<ClientRouter />`, so these listeners must be verified after the upgrade.
