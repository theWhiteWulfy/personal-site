# Milestone 3 — Resource Download System: Real PDF Serving

**Branch**: `m3` (user-named branch; replaces the plan's `feat/resource-real-files`)  
**Base from**: `main` (post Astro v6 migration merge #1083)  
**Priority**: 🟠 After Milestone 1 (1B prerequisite)  
**Status**: ✅ Implemented + smoke-tested (2026-09-16); PR pending

---

## Prerequisites

- [x] Milestone 1, sub-task 1.2 (HMAC fix) is merged — M3 builds on the secure token system
- [x] **TASK-3A** in `HUMAN_TASKS.md`: Storage location decided (R2 chosen)
- [x] **TASK-3B** in `HUMAN_TASKS.md`: R2 bucket `meteoric-resources` created
- [x] **TASK-3C** in `HUMAN_TASKS.md`: Real PDF files uploaded to production R2 (confirmed by site owner 2026-09-16)

---

## Git Setup

```bash
git checkout main
git pull
git checkout -b m3   # user-named branch, per instruction
```

The 3 resources referenced in code that need real files:
- `automation-guide.pdf`
- `whitelabel-checklist.pdf`
- `ai-integration-playbook.pdf`

---

## Git Setup

```bash
git checkout complete_astro_v6_migration
git pull
git checkout -b feat/resource-real-files
```

---

## Sub-Tasks

### 3.1 — Add R2 binding to `wrangler.toml` (if R2 chosen)
**Commit**: `chore: add R2 bucket binding for resources`  
**Files**: `wrangler.toml`

- [x] Add R2 binding (if R2 storage was chosen in TASK-3A):
  ```toml
  [[r2_buckets]]
  binding = "RESOURCES_BUCKET"
  bucket_name = "meteoric-resources"
  ```
- [x] Add `RESOURCES_BUCKET` to the `Env` TypeScript interface in `src/env.d.ts` (+ typed secrets `RESOURCE_SIGNING_SECRET`, `ADMIN_API_KEY`)
- [ ] If `/public/resources/` chosen instead: skip this sub-task, create the directory (n/a — R2 chosen)

---

### 3.2 — Build resource allowlist and metadata registry
**Commit**: `feat(resources): add resource allowlist and metadata registry`  
**Files**: `src/lib/api/resources.ts` (new file)

- [x] Create a typed resource registry mapping resource names to metadata (`src/lib/api/resources.ts`, `as const satisfies Record<string, ResourceMeta>` + `ResourceId` union)
- [x] Export `isValidResource(name: string): boolean` (type guard)
- [x] This replaces any hardcoded resource name checks in `serve-resource.ts`

---

### 3.3 — Update `serve-resource.ts` to read real files
**Commit**: `feat(resources): serve real files from R2/public instead of stub`  
**Files**: `src/pages/api/serve-resource.ts`

**If R2 storage**:
- [x] Replace mock PDF content block (~lines 160-214) with R2 fetch:
  ```ts
  const bucket = getEnv().RESOURCES_BUCKET;
  const object = await bucket.get(resourceMeta.filename);
  if (!object) { /* 404 */ }
  ```
  Deviation from plan: the response streams `object.body` (R2ObjectBody ReadableStream) instead of buffering through `object.arrayBuffer()` — lower memory on Workers, same client-visible result; `Content-Length` comes from `object.size`.
- [x] Set proper response headers: `Content-Type`, `Content-Disposition`, `Content-Length` (+ no-cache headers preserved from the stub)
- [ ] If `/public/resources/` (n/a — R2 chosen)

- [x] Remove the entire mock PDF stub code block
- [x] Remove the comment `// In production, you would read the actual file`

---

### 3.4 — Add resource not-found handling
**Commit**: `fix(resources): proper 404 when resource file is missing`  
**Files**: `src/pages/api/serve-resource.ts`

- [x] If R2 `get()` returns null: return 404 with JSON error `{ error: 'Resource not found' }` (+ `console.warn` of the R2 key, no PII)
- [x] If resource name is not in allowlist: return 400 with JSON error `{ error: 'Invalid resource' }` (checked early in both GET and POST, before token work)
- [x] Log missing resources server-side (without PII) for debugging

---

### 3.5 — Update `ResourceForm.astro` resource name references
**Commit**: `fix(resources): update resource form to use allowlist keys`  
**Files**: `src/components/ResourceForm.astro`

- [x] Ensure the resource names passed in form props match the allowlist keys exactly (prop typed as `ResourceId` union — build-time enforcement via `astro check`)
- [x] Validate that form hidden input `resource` field matches one of the allowlist keys (`src/pages/resources/[...slug].astro` slugs typed as `ResourceId`; hidden input value comes from the typed prop)

---

### 3.6 — Smoke-test the full download flow
**Commit**: `test(resources): manual smoke test results documented`  
**Files**: `docs/backlog/tasks/milestone-3-resource-system.md` (update this file)

- [x] End-to-end test locally (real workerd via `wrangler dev --config dist/server/wrangler.json`, local D1 + R2 emulation, generated test PDFs):
  1. Seed `resource_downloads` row locally, `POST /api/serve-resource` with `{downloadId, resourceName, email}` → 200 + signed `downloadUrl` (token HMAC-verified)
  2. `GET` the `downloadUrl` → 200 with `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="automation-guide.pdf"`, `Content-Length` matching the object
  3. Downloaded bytes **exactly match** the R2 object (673 B) and are **not** the old mock stub (`%PDF-1.4…Sample Resource PDF` absent)
  4. (Form → email → link path unchanged: `resource-download.ts` POST → serve-resource token; the internal `fetch('/api/serve-resource')` in resource-download.ts remains a known pre-existing quirk, out of M3 scope)
- [x] Test with invalid token → 401
- [x] Test with invalid resource name → 400 (`{"error":"Invalid resource"}`)
- [x] Test missing R2 object → 404 (`{"error":"Resource not found"}`)

**Smoke result: 16/16 checks passed** (2026-09-16, wrangler dev 4.131.1, workerd local).

**Local smoke setup notes** (for future sessions):
- `wrangler dev --config dist/server/wrangler.json` keys local persist state under `dist/server/.wrangler/` — pass `--persist-to .wrangler/state` to share the root CLI state (D1 seeds, R2 objects).
- Secrets for local worker runs come from a `.dev.vars` next to the used config; the root `.dev.vars` is not auto-loaded for `--config dist/server/...`. A `dist/server/.dev.vars` is gitignored and was created/removed during testing (do not commit).
- Unit suite extended: 32 new tests (registry + serve-resource flows incl. expiry, attempt limits, tampered tokens, missing bucket/secret/file).

---

## PR Checklist

Before merging to `main`:

- [x] Build passes: `npm run build` (astro check 0 errors, all pages prerendered)
- [x] Real PDFs download correctly (not `%PDF-1.4...\nSample Resource PDF`)
- [x] Invalid resource name → 400
- [x] Missing file in R2 → 404
- [x] Expired/invalid token → 401
- [x] HMAC signing works (from M1.2) — tokens signed/verified through the M1 HMAC path; expiry + attempt limits re-tested
- [x] No mock/stub code remains in `serve-resource.ts`
- [x] All 3.x commits on branch `m3` (user-named; replaces `feat/resource-real-files`)
- [x] Extra: `fix(api)` commit — replaces `Astro.locals.runtime.env` (removed in Astro v6) with a `getEnv()` shim over `cloudflare:workers`; without it every SSR API route 500s at runtime (pre-existing breakage from the v6 migration merge, caught by this smoke test)
- [x] PR opened: `m3` → `main`
