# Backend Changes SOP

Use this guide for API routes, server-side utilities, analytics endpoints, and resource gates.

## Scope

- API routes live in `src/pages/api/` (all have `export const prerender = false`).
- Shared API helpers live in `src/lib/api/`.
- Campaign and analytics helpers live in `src/lib/`.

## Current API Routes (7 routes)

| Route | Purpose |
|---|---|
| `campaign-signup.ts` | Campaign enrollment |
| `campaign-visit.ts` | Campaign visit tracking |
| `campaigns.ts` | Campaign data retrieval |
| `leadform.ts` | Lead capture form submission |
| `newsletter.ts` | Newsletter subscription |
| `resource-download.ts` | Resource download tracking |
| `serve-resource.ts` | Gated resource serving |

## Database Guard Pattern

Every route that accesses D1 must use:

```typescript
import { getDatabase } from "@lib/api/database";

export const GET: APIRoute = async ({ locals }) => {
  const { DB, errorResponse } = getDatabase(locals);
  if (errorResponse) return errorResponse;
  // Use DB safely
};
```

Never access `locals.runtime.env.DB` directly in route handlers.

## Required Practices

- Preserve request and response shapes unless the assigned task includes an API contract change.
- Preserve validation, rate-limit, analytics, and security checks when editing endpoints.
- Treat Cloudflare runtime access through `locals.runtime.env` as architecture-sensitive.
- Verify TypeScript and build behavior with `npm run build`.
- See `docs/milestone-3-d1/d1_api_contract.md` for the full API contract.

## Out Of Scope

- Do not change D1 schema or migrations from a general backend branch.
- Do not run production-affecting scripts without explicit approval.
- Do not introduce Node-only APIs without checking Cloudflare Workers compatibility.
