# D1 Database Scripts Restore Design

**Date:** 2026-06-12  
**Branch:** `maintenance/db-scripts-restore`  
**Scope:** Restore the missing local Node-based D1 migration and verification scripts referenced by `package.json` without changing API route behavior, `wrangler.toml`, or remote database configuration.

## Goal

Implement `scripts/migrate-database.js` and `scripts/verify-database.js` so the existing `npm run db:migrate`, `db:migrate:local`, `db:verify`, and `db:verify:local` commands work against the existing Cloudflare D1 setup.

## Constraints

- Keep `wrangler.toml` unchanged.
- Use the existing D1 database name `meteoric`.
- Support `--local` for both CLIs.
- Execute migrations in lexical file order.
- Fail fast on Wrangler command errors.
- Verification must check for required tables and print schema information.
- Do not add SQL migrations for `newsletter` or `leads` in this branch.

## Recommended Approach

Use two small Node ESM CLIs plus one shared helper module:

- `scripts/_d1-cli.js`
  - Parse CLI flags.
  - Resolve the `scripts/` directory.
  - Discover `*.sql` files in lexical order.
  - Build and execute `wrangler d1 execute meteoric ...` commands.
  - Provide a small JSON/query wrapper for verification commands.

- `scripts/migrate-database.js`
  - Use the shared helper to find SQL files.
  - Run each file through Wrangler in order.
  - Log progress and stop on first failure.

- `scripts/verify-database.js`
  - Use the shared helper to query `sqlite_master` and `PRAGMA index_list(...)`.
  - Confirm required tables exist: `resource_downloads`, `analytics_events`, `campaigns`, `campaign_visits`, `newsletter`, `leads`.
  - Print schema SQL for tables that exist.
  - Print index names for each table.
  - Exit non-zero when any required table is missing.

## Why This Shape

This keeps the user-facing CLIs simple while avoiding duplicated Wrangler command construction and error handling. It also gives us a clean seam for unit tests around argument parsing, file ordering, and command generation without needing to hit a real D1 database in most tests.

## Command Behavior

### `node scripts/migrate-database.js`

- Default target: remote `meteoric`
- Discovers `scripts/*.sql`
- Runs each file with `wrangler d1 execute meteoric --file <path>`
- Logs each migration before execution
- Exits `0` only if every migration succeeds

### `node scripts/migrate-database.js --local`

- Same as above, but adds `--local`

### `node scripts/verify-database.js`

- Default target: remote `meteoric`
- Queries for table existence
- Prints each found table's `CREATE TABLE` SQL
- Prints index inventory from `PRAGMA index_list(table_name)`
- Exits non-zero if any required table is missing

### `node scripts/verify-database.js --local`

- Same verification flow, but adds `--local`

## Test Strategy

Follow TDD with focused unit coverage:

- Shared helper tests
  - `--local` parsing
  - SQL file discovery and lexical ordering
  - Wrangler argument construction
  - Error propagation from child-process execution

- Migration CLI tests
  - No SQL files found
  - Files run in lexical order
  - Early stop on failed migration

- Verify CLI tests
  - Passes when all required tables are present
  - Fails when one or more required tables are missing
  - Emits schema and index output from mocked query results

Use mocks/spies around `child_process` execution so unit tests stay local and deterministic.

## Files To Add

- `scripts/_d1-cli.js`
- `scripts/migrate-database.js`
- `scripts/verify-database.js`
- `tests/unit/scripts/d1-cli.spec.ts`
- `tests/unit/scripts/migrate-database.spec.ts`
- `tests/unit/scripts/verify-database.spec.ts`

## Non-Goals

- No `newsletter` or `leads` SQL migrations in this branch
- No API route refactors
- No runtime changes to `locals.runtime.env.DB` handling
- No changes to `package.json` script names unless the implementation proves a mismatch

## Risks

- Wrangler output format may vary, so verification helpers should avoid brittle string parsing when possible.
- Remote `db:verify` depends on existing Cloudflare auth outside the repo.
- The branch can only verify table presence for `newsletter` and `leads`; it cannot make them pass until the next migration branch adds those tables.

## Success Criteria

- The two missing CLIs exist and are runnable via the existing npm scripts.
- Migration discovery is deterministic.
- Verification clearly reports missing tables instead of failing opaquely.
- Unit tests cover the shared helper and both CLIs.
