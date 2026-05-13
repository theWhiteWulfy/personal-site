# Database Management SOP

Use this guide for Cloudflare D1 bindings, SQL migrations, and database verification.

## Scope

- D1 binding configuration is in `wrangler.toml`.
- Runtime typing is in `src/env.d.ts`.
- SQL migration files live in `scripts/`.
- Runtime database helpers live in `src/lib/api/database.ts` and related campaign utilities.

## Required Practices

- Preserve the `DB` binding name unless Alok approves a coordinated migration.
- Keep SQL migrations reviewable and ordered.
- Separate schema changes from framework upgrade work.
- Prefer local verification before remote D1 operations.

## Known Baseline Finding

`package.json` references `scripts/migrate-database.js` and `scripts/verify-database.js`, but the current `scripts/` directory contains only SQL migration files. Document this gap until a maintenance branch is assigned to restore or replace those scripts.

## Out Of Scope

- Do not run D1 migrations during documentation bootstrap.
- Do not edit production database identifiers without explicit approval.
