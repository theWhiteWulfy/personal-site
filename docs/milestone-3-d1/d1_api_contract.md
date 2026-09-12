# Cloudflare D1 and API Surface Contract

**Status**: Architecture-only document. Produced by Claude (Architect).  
**Goal**: Lock the D1/API contract so framework upgrades, dependency bumps, and Codex implementation branches cannot silently break database connectivity or data integrity.  
**Companion documents**: [`ARCHITECTURE.md`](../ARCHITECTURE.md) — first-run baseline, Cloudflare and D1 section. [`docs/astro_6_2_upgrade_plan.md`](./astro_6_2_upgrade_plan.md) — Astro upgrade plan; §4.2 covers the adapter version decision.

---

## 1. `wrangler.toml` Invariants

These values are **preservation-critical**. Any change to them requires Alok's explicit approval and must be coordinated across Cloudflare's dashboard, `wrangler.toml`, and `src/env.d.ts` simultaneously. No Codex branch may alter them.

```toml
name = "personal-site"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "meteoric"
database_id = "8380ec22-098e-4814-a56f-48d907425b35"
```

| Invariant | Value | Why it must not change |
|---|---|---|
| Binding name | `DB` | All 7 API routes destructure `const { DB } = locals.runtime.env`. A rename breaks every route simultaneously. |
| Database name | `meteoric` | Used by `wrangler d1 execute` CLI commands; also correlates the Cloudflare Dashboard view. |
| Database ID | `8380ec22-098e-4814-a56f-48d907425b35` | Uniquely identifies the production D1 database. Replacing this ID creates a new, empty database. |
| Compatibility flag | `nodejs_compat` | Required by `@astrojs/cloudflare` to support Node.js built-ins in Workers runtime. Removing it breaks the build. |

---

## 2. Runtime Type Declaration

`src/env.d.ts` declares the Cloudflare runtime shape. This file must be preserved and kept synchronized with the adapter version.

```typescript
/// <reference types="astro/client" />

type D1Database = import("@cloudflare/workers-types").D1Database;
type ENV = {
    DB: D1Database;
};
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
    interface Locals extends Runtime { }
}
```

**Preservation rules**:
- The `D1Database` type must always be imported from `@cloudflare/workers-types`.
- The `ENV` type must declare `DB` with the exact binding name matching `wrangler.toml`.
- The `Runtime` import path changes between `@astrojs/cloudflare` versions — verify against the adapter CHANGELOG when bumping (see Cloudflare Adapter Compatibility Matrix, §6).
- The `App.Locals extends Runtime` declaration enables `locals.runtime.env.DB` access in all route handlers.

---

## 3. Canonical Database Access Pattern

Every server-rendered API route follows this exact four-step pattern. This pattern is **preservation-critical** and must not be refactored without architecture review.

### Step 1: Opt out of prerendering

```typescript
export const prerender = false;
```

Required on every API route file. Without this, Astro treats the file as a static page and the route returns 500 at runtime on Cloudflare Pages.

### Step 2: Guard the DB binding

```typescript
if (!locals?.runtime?.env?.DB) {
  return new Response(JSON.stringify({ error: 'Database not configured' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

The optional-chaining guard (`?.`) is intentional. During local `astro dev` (without `wrangler`), `locals.runtime` does not exist. The guard prevents a runtime crash and returns a structured 500. The Cloudflare preview (`npm run cfpreview`) **does** inject the binding.

### Step 3: Destructure the binding

```typescript
const { DB } = locals.runtime.env;
```

### Step 4: Execute D1 queries via the prepared-statement API

```typescript
// Single row
const result = await DB.prepare(query).bind(param1, param2).first();

// Multiple rows
const result = await DB.prepare(query).bind(...params).all();
// result.results is the array

// Write (INSERT/UPDATE/DELETE)
const result = await DB.prepare(query).bind(...params).run();
// result.success — boolean
// result.meta.last_row_id — for INSERTs
// result.meta.changes — for UPDATE/DELETE
```

**Positional parameter syntax**: D1 uses `?1`, `?2`, `?3`, ... (one-indexed). Never use `?` alone (zero-indexed style). All current routes use this correctly.

---

## 4. API Route Contract

All routes live in `src/pages/api/`. All declare `export const prerender = false`.

### 4.1 `newsletter.ts`

**File**: [`src/pages/api/newsletter.ts`](../src/pages/api/newsletter.ts)  
**Method**: POST  
**Form fields**: `subsemail` (email string)  
**Tables touched**:

| Operation | Table | Query |
|---|---|---|
| INSERT | `newsletter` | `INSERT INTO newsletter (email, timestamp) VALUES (?1, CURRENT_TIMESTAMP)` |

**Missing migration**: no SQL migration file creates the `newsletter` table. See §5.1.

**Validation**: none beyond type check (`typeof email !== 'string'`). No duplicate prevention. No rate limiting.

**Security note**: this is the thinnest API route in the codebase. It lacks rate limiting, duplicate prevention, and email format validation that the `resource-download.ts` route provides. This is a maintenance finding, not a blocking issue.

---

### 4.2 `leadform.ts`

**File**: [`src/pages/api/leadform.ts`](../src/pages/api/leadform.ts)  
**Method**: POST  
**Form fields**: `usrname` (name), `email`, `msg` (message), `ref` (referrer/source)  
**Tables touched**:

| Operation | Table | Query |
|---|---|---|
| INSERT | `leads` | `INSERT INTO leads (name, email, refer, message, timestamp) VALUES (?1, ?2, ?3, ?4, CURRENT_TIMESTAMP)` |

**Missing migration**: no SQL migration file creates the `leads` table. See §5.1.

**Validation**: presence check only (`!name || !email || !message || !refer`). No sanitization, no duplicate prevention, no rate limiting.

**Security note**: similar to `newsletter.ts`, `leadform.ts` is minimal. No honeypot, no spam detection. Future hardening should follow the `resource-download.ts` security pattern.

---

### 4.3 `resource-download.ts`

**File**: [`src/pages/api/resource-download.ts`](../src/pages/api/resource-download.ts)  
**Methods**: POST, GET  
**POST form fields**: `email`, `name`, `workplace`, `role`, `resourceName`, plus honeypot fields (`website`, `url`, `phone_number`, `company_url`)  
**GET query params**: `limit` (default: 10), `resource` (filter), `startDate`, `endDate`

**Tables touched**:

| Operation | Table | Purpose |
|---|---|---|
| SELECT | `resource_downloads` | 24-hour duplicate check before INSERT |
| INSERT | `resource_downloads` | Store download record with IP, user agent |
| INSERT | `analytics_events` | Log `resource_form_submission` event with full context |

**Security pipeline** (in order):
1. `performSecurityChecks(DB, formData, clientIP)` — checks IP rate limit (5 requests / 15 min via `resource_downloads`), email rate limit (3 requests / 15 min), honeypot fields, spam patterns
2. `validateResourceForm(formData)` — validates and sanitizes all fields via `sanitize-html`
3. `insertResourceDownload(DB, record)` — 24-hour duplicate prevention (same email + resource_name)
4. `analytics_events` INSERT — logged non-blocking (failure does not fail the request)
5. Calls `/api/serve-resource` to generate a download token — returns `downloadUrl` in response

**Note**: the GET handler returns admin-level statistics. It has **no authentication**. Any caller can retrieve download stats including email addresses.

---

### 4.4 `serve-resource.ts`

**File**: [`src/pages/api/serve-resource.ts`](../src/pages/api/serve-resource.ts)  
**Methods**: POST, GET  
**POST body (JSON)**: `{ downloadId, resourceName, email }`  
**GET query params**: `token`

**Tables touched**:

| Operation | Table | Purpose |
|---|---|---|
| SELECT | `resource_downloads` | Verify download record exists via `getDownloadById(DB, id)` |

**Token lifecycle**: tokens are base64-encoded JSON + a simple hash signature. They expire after 30 minutes and allow a maximum of 3 download attempts. The signing secret is currently hardcoded as `'your-secret-key-here'` in the source. This is a **security finding** — the secret should be an environment variable.

**Available resources** (hardcoded in `AVAILABLE_RESOURCES` map):
- `automation-guide` → `/resources/pdfs/automation-guide.pdf`
- `whitelabel-checklist` → `/resources/pdfs/whitelabel-checklist.pdf`
- `ai-integration-playbook` → `/resources/pdfs/ai-integration-playbook.pdf`

**Resource serving**: currently returns a mock PDF stub. Production implementation comment states it should read from Cloudflare R2, AWS S3, or filesystem.

---

### 4.5 `campaigns.ts`

**File**: [`src/pages/api/campaigns.ts`](../src/pages/api/campaigns.ts)  
**Methods**: GET, POST, PUT  
**GET query params**: `status` (active/paused/expired), `include_analytics` (bool), `slug`, `limit` (default: 50), `offset` (default: 0)  
**POST body (JSON)**: `CampaignData` object (`slug`, `title`, `description`, `start_date`, `end_date`, `status`)  
**PUT body (JSON)**: `CampaignData` object with `id`

**Tables touched**:

| Operation | Method | Table | Purpose |
|---|---|---|---|
| SELECT | GET | `campaigns` | List/filter campaigns with pagination |
| SELECT | GET | `campaign_visits` | Analytics aggregate (when `include_analytics=true`) |
| UPDATE | GET | `campaigns` | Auto-expire campaigns past their `end_date` |
| INSERT | POST | `campaigns` | Create new campaign |
| SELECT | POST | `campaigns` | Duplicate slug check |
| SELECT | POST | `campaigns` | Return newly created campaign |
| UPDATE | PUT | `campaigns` | Update existing campaign fields |

**Auto-expiry side-effect**: the GET handler includes a side-effect that silently updates expired campaigns (`status = 'expired'`) while returning results. This is a write operation inside a GET handler — a design note for future refactoring.

**Note**: no authentication on any method. POST/PUT allow arbitrary campaign creation and modification from any caller.

---

### 4.6 `campaign-visit.ts`

**File**: [`src/pages/api/campaign-visit.ts`](../src/pages/api/campaign-visit.ts)  
**Methods**: POST, GET  
**POST form fields**: `campaign_slug` (required), `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `referrer`, `session_id`, `user_id`, `conversion_type` (default: `page_view`), `conversion_value`, `page_url`  
**GET query params**: `campaign` (slug filter), `start_date`, `end_date`, `limit` (default: 100), `offset` (default: 0)

**Tables touched**:

| Operation | Method | Table | Purpose |
|---|---|---|---|
| SELECT | POST | `campaigns` | Look up campaign ID by slug (validates `status = 'active'`) |
| INSERT | POST | `campaign_visits` | Record visit with full UTM + session data |
| SELECT (JOIN) | GET | `campaign_visits` + `campaigns` | List visits with campaign metadata |

**IP address source**: uses Astro's `clientAddress` (set by Cloudflare adapter from `CF-Connecting-IP`). This is different from the `resource-download.ts` pattern which reads `CF-Connecting-IP` from headers manually — both approaches are valid under the Cloudflare adapter.

---

### 4.7 `campaign-signup.ts`

**File**: [`src/pages/api/campaign-signup.ts`](../src/pages/api/campaign-signup.ts)  
**Method**: POST  
**Form fields**: `name`, `email`, `company`, `phone`, `message`, `campaign_slug`, `form_type`, `tracking_id`, `utm_params` (JSON string), `submission_timestamp`, `page_url`

**Tables touched**:

| Operation | Table | Purpose |
|---|---|---|
| SELECT | `campaigns` | Validate campaign exists, check `status` and `end_date` |
| SELECT | `campaign_visits` | Duplicate check (same `campaign_id` + `utm_source` + `utm_campaign` within 24h) |
| INSERT | `campaign_visits` | Record `conversion_type = 'form_submit'` |
| INSERT | `analytics_events` | Store full signup payload as `event_type = 'campaign_signup'` |

**Signup data storage**: full signup form data (name, email, company, phone, message) is stored as JSON in `analytics_events.event_data`. There is **no dedicated signups table**. The code comment at line 200 explicitly flags this: `"you might want to create a separate table for this"`. This is a maintenance finding (see §5.3).

**Duplicate detection logic**: detects duplicates by `campaign_id` + `utm_source` + `utm_campaign` within 24 hours — but then **logs and continues** rather than blocking. This means duplicates are silently allowed.

---

## 5. Gaps and Maintenance Findings

These are documentation findings. No code or SQL changes are made in this document.

### 5.1 Missing D1 Table Migrations

Two tables are used by API routes but have no SQL migration file in `scripts/`.

| Table | Used by | Fields inferred from code |
|---|---|---|
| `newsletter` | `newsletter.ts` | `email TEXT`, `timestamp DATETIME DEFAULT CURRENT_TIMESTAMP` |
| `leads` | `leadform.ts` | `name TEXT`, `email TEXT`, `refer TEXT`, `message TEXT`, `timestamp DATETIME DEFAULT CURRENT_TIMESTAMP` |

**Recommended resolution** (for Codex to implement when authorized):
1. Create `scripts/004_create_newsletter_table.sql` with `CREATE TABLE IF NOT EXISTS newsletter` and an index on `email`.
2. Create `scripts/005_create_leads_table.sql` with `CREATE TABLE IF NOT EXISTS leads` and indexes on `email` and `timestamp`.
3. Jules verifies by running `wrangler d1 execute meteoric --local --file=scripts/004_create_newsletter_table.sql` and `005_...` against the local D1 and confirming the tables appear.

The SQL migration number sequence starts at 004 because migrations 001–003 are already present.

### 5.2 Missing Database Management Scripts

`package.json` declares four `db:*` scripts, but the referenced JavaScript files do not exist.

| npm script | Referenced file | Status |
|---|---|---|
| `db:migrate` | `scripts/migrate-database.js` | Missing |
| `db:migrate:local` | `scripts/migrate-database.js` | Missing |
| `db:verify` | `scripts/verify-database.js` | Missing |
| `db:verify:local` | `scripts/verify-database.js` | Missing |

**Expected interface** (for Codex to implement to spec):

`scripts/migrate-database.js`:
- Accepts `--local` flag: when present, runs against local D1 (`wrangler d1 execute meteoric --local`); otherwise runs against production (`wrangler d1 execute meteoric`).
- Reads all `.sql` files from `scripts/` in ascending numeric order (001, 002, ...).
- Executes each migration file idempotently (all tables use `CREATE TABLE IF NOT EXISTS`).
- Logs each file executed and reports success/failure.
- Exit code 0 on success, non-zero on failure.

`scripts/verify-database.js`:
- Accepts `--local` flag: same semantics.
- Queries D1 to confirm all expected tables exist: `newsletter`, `leads`, `resource_downloads`, `analytics_events`, `campaigns`, `campaign_visits`.
- Confirms expected indexes are present (via `PRAGMA index_list(table_name)`).
- Logs table/index presence and reports any missing items.
- Exit code 0 if all tables verified, non-zero on any missing table.

**Prerequisites**: both scripts require `wrangler` to be installed (already in `devDependencies` at `^4.28.1`) and the Cloudflare account to be authenticated via `wrangler login` or `CLOUDFLARE_API_TOKEN` environment variable.

### 5.3 No Dedicated Campaign Signups Table

Campaign signup data (name, email, company, phone, message) is stored as JSON blobs in `analytics_events.event_data` rather than in a typed table. The code comment in `campaign-signup.ts` at line 200 acknowledges this explicitly.

**Consequence**: signup data cannot be queried by field (e.g., "all signups with email X"), only by event type. No index on `user_email` in `analytics_events` covers the full signup payload.

**Recommended resolution**: create a `campaign_signups` table (Milestone 3 → Codex when authorized) with typed columns mirroring the `CampaignSignupData` interface.

### 5.4 Hardcoded Token Signing Secret

`serve-resource.ts` line 71 contains: `const secret = 'your-secret-key-here';`

This is a placeholder. In production, download tokens are cryptographically weak. The secret must be moved to a Cloudflare Worker secret (via `wrangler secret put RESOURCE_SIGNING_SECRET`) and read from the runtime environment.

**Consequence**: any party who reads the source code can forge valid download tokens for any `downloadId`.

### 5.5 Unauthenticated Admin Endpoints

Three endpoints expose administrative data without authentication:

| Endpoint | Method | Exposed data |
|---|---|---|
| `GET /api/resource-download` | GET | Download stats including email addresses |
| `GET /api/campaigns` | GET | Full campaign list with all metadata |
| `GET /api/campaign-visit` | GET | Visit records including IP addresses |
| `POST /api/campaigns` | POST | Create campaigns |
| `PUT /api/campaigns` | PUT | Modify campaigns |

These are architecture-only findings. Implementing authentication (e.g., Cloudflare Access, a shared secret header, or a signed cookie) is out of scope for this milestone.

---

## 6. Cloudflare Adapter Compatibility Matrix

This section tracks the `@astrojs/cloudflare` version required for each Astro major and the configuration flags that must remain set.

| Astro version | `@astrojs/cloudflare` | `platformProxy` | `imageService` | D1 access pattern | Notes |
|---|---|---|---|---|---|
| 4.15.x (current) | `^11.0.1` | `{ enabled: true }` | `'passthrough'` | `locals.runtime.env.DB` | Current state. `output: "hybrid"` required. |
| 5.x (Phase 2) | `^12.x` | `{ enabled: true }` | `'passthrough'` | `locals.runtime.env.DB` | `output: "hybrid"` removed; use default static + per-route `prerender = false`. |
| 6.x (Phase 2+) | `^13.x` | `{ enabled: true }` | `'passthrough'` | `locals.runtime.env.DB` (verify against CHANGELOG) | Node 22.12.0 minimum. `wrangler` v3+ recommended alongside. |

**Flags that must remain set in `astro.config.mjs` across all versions**:
```js
adapter: cloudflare({
  platformProxy: {
    enabled: true   // enables locals.runtime in dev via wrangler's platformProxy
  },
  imageService: 'passthrough'  // disables Astro's image optimization pipeline
})
```

**What `platformProxy.enabled` does**: when `true`, the Cloudflare adapter injects the Wrangler platform proxy during `astro dev`, which makes `locals.runtime.env.DB` available locally without deploying to Cloudflare Pages. Removing this flag means the D1 guard check (Step 2 of the canonical access pattern) triggers 500 on every API call during development.

**What `imageService: 'passthrough'` does**: bypasses Astro's image optimization. The site uses standard `<img>` tags and Fontsource-served fonts; it does not rely on Astro's `<Image>` component. This flag must remain unless an explicit decision is made to adopt `<Image>`.

**`@astrojs/cloudflare` v11 → v13 migration notes**:
- v11 → v12: minor API surface changes, no breaking change to `locals.runtime.env.DB`.
- v12 → v13: review the CHANGELOG before Phase 2 merge. Historically significant changes in v12 and v13 include changes to `SSRManifest` shape and `app.render()` — these are internal to the adapter and should not affect route handler code, but verify on local `cfpreview`.
- Decision required (Alok, see upgrade plan §4.2): accept v13 in lockstep with Astro 6.

**Verification checklist for each adapter bump**:
1. Run `npm run build`.
2. Run `npm run cfpreview`.
3. POST to `/api/newsletter` with a test email — confirm 200 response and D1 write.
4. POST to `/api/resource-download` with valid form data — confirm 200 and `downloadUrl` present.
5. GET `/api/campaigns` — confirm JSON response with campaign list (or empty array).
6. Confirm `locals.runtime.env.DB` is defined in a route handler (add a temporary log if needed).

---

## 7. D1 Table and Index Inventory

Complete table inventory with migration file references.

| Table | Migration file | Status |
|---|---|---|
| `resource_downloads` | `scripts/001_create_resource_downloads_table.sql` | ✅ Migrated |
| `analytics_events` | `scripts/002_create_analytics_events_table.sql` | ✅ Migrated |
| `campaigns` | `scripts/003_create_campaigns_table.sql` | ✅ Migrated |
| `campaign_visits` | `scripts/003_create_campaigns_table.sql` | ✅ Migrated |
| `newsletter` | **None** | ⚠️ Missing migration |
| `leads` | **None** | ⚠️ Missing migration |

### Index inventory

| Table | Index name | Columns | Migration |
|---|---|---|---|
| `resource_downloads` | `idx_resource_downloads_email` | `email` | 001 |
| `resource_downloads` | `idx_resource_downloads_resource_name` | `resource_name` | 001 |
| `resource_downloads` | `idx_resource_downloads_timestamp` | `download_timestamp` | 001 |
| `resource_downloads` | `idx_resource_downloads_email_resource` | `(email, resource_name)` | 001 |
| `resource_downloads` | `idx_resource_downloads_timestamp_resource` | `(download_timestamp, resource_name)` | 001 |
| `analytics_events` | `idx_analytics_events_type` | `event_type` | 002 |
| `analytics_events` | `idx_analytics_events_timestamp` | `timestamp` | 002 |
| `analytics_events` | `idx_analytics_events_user_email` | `user_email` | 002 |
| `analytics_events` | `idx_analytics_events_session` | `session_id` | 002 |
| `analytics_events` | `idx_analytics_events_type_timestamp` | `(event_type, timestamp)` | 002 |
| `campaigns` | `idx_campaigns_slug` | `slug` | 003 |
| `campaigns` | `idx_campaigns_status` | `status` | 003 |
| `campaigns` | `idx_campaigns_dates` | `(start_date, end_date)` | 003 |
| `campaigns` | `idx_campaigns_status_dates` | `(status, start_date, end_date)` | 003 |
| `campaign_visits` | `idx_campaign_visits_campaign_id` | `campaign_id` | 003 |
| `campaign_visits` | `idx_campaign_visits_timestamp` | `visit_timestamp` | 003 |
| `campaign_visits` | `idx_campaign_visits_utm_source` | `utm_source` | 003 |
| `campaign_visits` | `idx_campaign_visits_utm_campaign` | `utm_campaign` | 003 |
| `campaign_visits` | `idx_campaign_visits_conversion_type` | `conversion_type` | 003 |
| `campaign_visits` | `idx_campaign_visits_session` | `session_id` | 003 |
| `campaign_visits` | `idx_campaign_visits_campaign_timestamp` | `(campaign_id, visit_timestamp)` | 003 |
| `campaign_visits` | `idx_campaign_visits_utm_source_medium` | `(utm_source, utm_medium)` | 003 |
| `campaign_visits` | `idx_campaign_visits_conversion_campaign` | `(conversion_type, campaign_id)` | 003 |

---

## 8. API Utility Module Reference

Shared API utilities in `src/lib/api/`:

### `validation.ts`

Exports: `validateResourceForm(formData)`, `validateEmail(email)`, `validateRequiredField(value, fieldName, min, max)`, `validateResourceName(name)`, `formatValidationErrors(errors)`, `sanitizeInput(input)`.

Uses `sanitize-html` (must be in `dependencies` or `devDependencies` — verify in `package.json` if the build fails post-upgrade).

### `security.ts`

Exports: `performSecurityChecks(DB, formData, clientIP)`, `checkRateLimit(DB, ipAddress, email?)`, `HONEYPOT_FIELDS`.

Rate limiting is implemented by counting rows in `resource_downloads` per IP/email within a 15-minute window. It does **not** use an in-memory store or a dedicated rate-limit table, meaning rate limits reset on Worker restarts and may not be 100% accurate under concurrent requests.

Rate limits:
- IP-based: 5 requests per 15 minutes
- Email-based: 3 requests per 15 minutes

### `database.ts`

Exports: `insertResourceDownload()`, `getDownloadStats()`, `getDownloadById()`, `getDownloadsByEmail()`, `updateDownloadRecord()`, `cleanupOldRecords()`, `testDatabaseConnection()`, `validateDatabaseConnection()`.

All functions accept `DB: any` (typed loosely to avoid binding the utility to a specific version of `@cloudflare/workers-types`). After an adapter version bump, the type should be re-verified.

### `utm-tracking.ts`

Exports: UTM parameter extraction from URL query strings and session storage. Called by client-side code in the campaign pages; does not directly interact with D1 (UTM data is passed to `campaign-visit.ts` via the form submission payload).
