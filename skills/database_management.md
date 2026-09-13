# Database Management SOP

Use this guide for Cloudflare D1 bindings, SQL migrations, and database verification.

## Scope

- D1 binding configuration is in `wrangler.toml`.
- Runtime typing is in `src/env.d.ts`.
- SQL migration files live in `scripts/` (ordered: 001_-005_*.sql).
- Runtime database helper lives in `src/lib/api/database.ts`.
- Migration runner: `scripts/migrate-database.js`.
- Verification runner: `scripts/verify-database.js`.

## D1 Binding

| Property | Value |
|---|---|
| Binding name | `DB` |
| Database name | `meteoric` |
| Database ID | `8380ec22-098e-4814-a56f-48d907425b35` |
| Compatibility flag | `nodejs_compat` |

Runtime access in API routes: always via `getDatabase(locals)` from `src/lib/api/database.ts`. Never access `locals.runtime.env.DB` directly.

## Required Practices

- Preserve the `DB` binding name unless Alok approves a coordinated migration.
- Keep SQL migrations reviewable and ordered (prefix: `00N_description.sql`).
- Separate schema changes from framework upgrade work.
- Prefer local verification before remote D1 operations.

## Verification Commands

```shell
npm run test:db          # Verify local D1 tables (runs verify-database.js --local)
npm run db:verify:local  # Same as above
npm run db:migrate:local # Apply migrations to local SQLite
npm run db:verify        # Verify remote D1 (requires wrangler auth)
npm run db:migrate       # Apply migrations to remote D1 (requires approval)
```

Local verification uses `.wrangler/state/v3/` SQLite. All 6 tables must be present:
`campaigns`, `campaign_visits`, `newsletter_subscribers`, `leads`, `resource_downloads`, `resource_requests`.

## Out Of Scope

- Do not run D1 migrations without explicit approval.
- Do not edit production database identifiers without explicit approval.
- Do not change the `DB` binding name without coordinating all API routes and `wrangler.toml`.
