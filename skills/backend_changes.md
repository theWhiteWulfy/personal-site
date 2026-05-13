# Backend Changes SOP

Use this guide for API routes, server-side utilities, analytics endpoints, and resource gates.

## Scope

- API routes live in `src/pages/api/`.
- Shared API helpers live in `src/lib/api/`.
- Campaign and analytics helpers live in `src/lib/`.

## Required Practices

- Preserve request and response shapes unless the assigned task includes an API contract change.
- Preserve validation, rate-limit, analytics, and security checks when editing endpoints.
- Treat Cloudflare runtime access through `locals.runtime.env` as architecture-sensitive.
- Verify TypeScript and build behavior with `npm run build`.

## Out Of Scope

- Do not change D1 schema or migrations from a general backend branch.
- Do not run production-affecting scripts without explicit approval.
- Do not introduce Node-only APIs without checking Cloudflare compatibility.
