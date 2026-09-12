# Cloudflare D1 SOP

Use this guide for all Cloudflare D1 database work: migrations, verification, runtime access, and local development.

## Database Properties

| Property | Value |
|---|---|
| Binding name | `DB` |
| Database name | `meteoric` |
| Database ID | `8380ec22-098e-4814-a56f-48d907425b35` |
| Compatibility flag | `nodejs_compat` |
| Local state | `.wrangler/state/v3/d1/` |

## Schema (6 tables)

| Table | Purpose |
|---|---|
| `campaigns` | Campaign definitions |
| `campaign_visits` | Per-visit campaign analytics |
| `newsletter_subscribers` | Newsletter opt-ins |
| `leads` | Lead capture form submissions |
| `resource_downloads` | Resource download events |
| `resource_requests` | Gated resource access requests |

## Migration Files

Located in `scripts/` — applied in numeric order:

```
001_create_campaigns.sql
002_create_campaign_visits.sql
003_create_resources.sql
004_create_newsletter.sql
005_create_leads.sql
```

## Commands

```shell
# Local development
npm run db:migrate:local  # Apply all migrations to local SQLite
npm run db:verify:local   # Verify all 6 tables exist locally
npm run test:db           # Same as verify:local (used in CI)

# Remote Cloudflare D1 (requires wrangler auth)
npm run db:migrate        # Apply migrations to remote D1
npm run db:verify         # Verify remote schema
```

## Runtime Access Pattern

```typescript
// src/lib/api/database.ts exports:
export function getDatabase(locals: App.Locals) {
  const DB = locals?.runtime?.env?.DB;
  if (!DB) {
    return { DB: null, errorResponse: new Response("Service unavailable", { status: 500 }) };
  }
  return { DB, errorResponse: null };
}
```

Usage in every API route:
```typescript
import { getDatabase } from "@lib/api/database";

const { DB, errorResponse } = getDatabase(locals);
if (errorResponse) return errorResponse;
// DB is now guaranteed non-null D1Database
const result = await DB.prepare("SELECT ...").first();
```

## Local Preview with D1

```shell
npm run build
npm run cfpreview  # Uses wrangler pages dev with real D1 platformProxy
```

The `platformProxy.enabled: true` in `astro.config.mjs` makes `locals.runtime.env.DB` available during `npm run dev` as well.

## Rules

- Never change the `DB` binding name without updating `wrangler.toml`, all API routes, and `src/env.d.ts`.
- Never run remote migrations without explicit approval from Alok.
- Never access D1 directly without going through `getDatabase()`.
- Always add new migrations as the next numbered file — never modify existing migration files.
- The `database_id` in `wrangler.toml` is not a secret — it requires a Cloudflare API token to access.
