# Milestone 3 — Resource Download System: Real PDF Serving

**Branch**: `feat/resource-real-files`  
**Base from**: `fix/security-phase-1` (after M1 merge)  
**Priority**: 🟠 After Milestone 1 (1B prerequisite)  
**Estimated effort**: 3–5 days  
**Status**: ⏳ Waiting on human tasks TASK-3A, TASK-3B, TASK-3C

---

## Prerequisites

- [ ] Milestone 1, sub-task 1.2 (HMAC fix) is merged — M3 builds on the secure token system
- [ ] **TASK-3A** in `HUMAN_TASKS.md`: Storage location decided (R2 vs public/)
- [ ] **TASK-3B** in `HUMAN_TASKS.md`: Real PDF files provided and uploaded
- [ ] **TASK-3C** in `HUMAN_TASKS.md`: R2 bucket created (if R2 chosen)

---

## Context

`src/pages/api/serve-resource.ts` currently returns a **hardcoded mock PDF stub**:
```ts
// In production, you would read the actual file
const mockPdfContent = '%PDF-1.4...\nSample Resource PDF';
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

- [ ] Add R2 binding (if R2 storage was chosen in TASK-3A):
  ```toml
  [[r2_buckets]]
  binding = "RESOURCES_BUCKET"
  bucket_name = "meteoric-resources"
  ```
- [ ] Add `RESOURCES_BUCKET` to the `Env` TypeScript interface in `src/env.d.ts`
- [ ] If `/public/resources/` chosen instead: skip this sub-task, create the directory

---

### 3.2 — Build resource allowlist and metadata registry
**Commit**: `feat(resources): add resource allowlist and metadata registry`  
**Files**: `src/lib/api/resources.ts` (new file)

- [ ] Create a typed resource registry mapping resource names to metadata:
  ```ts
  export const RESOURCES: Record<string, ResourceMeta> = {
    'automation-guide': {
      filename: 'automation-guide.pdf',
      displayName: 'Automation Guide',
      contentType: 'application/pdf',
      maxDownloads: 3,   // per token
    },
    'whitelabel-checklist': { ... },
    'ai-integration-playbook': { ... },
  };
  ```
- [ ] Export `isValidResource(name: string): boolean`
- [ ] This replaces any hardcoded resource name checks in `serve-resource.ts`

---

### 3.3 — Update `serve-resource.ts` to read real files
**Commit**: `feat(resources): serve real files from R2/public instead of stub`  
**Files**: `src/pages/api/serve-resource.ts`

**If R2 storage**:
- [ ] Replace mock PDF content block (~lines 160-214) with R2 fetch:
  ```ts
  const object = await locals.runtime.env.RESOURCES_BUCKET.get(resourceMeta.filename);
  if (!object) {
    return new Response('Resource not found', { status: 404 });
  }
  const body = await object.arrayBuffer();
  ```
- [ ] Set proper response headers: `Content-Type`, `Content-Disposition`, `Content-Length`

**If `/public/resources/`**:
- [ ] Serve via a redirect to the static URL (since files are publicly accessible)
- [ ] Note: token auth becomes advisory only in this case — file is accessible without token

- [ ] Remove the entire mock PDF stub code block
- [ ] Remove the comment `// In production, you would read the actual file`

---

### 3.4 — Add resource not-found handling
**Commit**: `fix(resources): proper 404 when resource file is missing`  
**Files**: `src/pages/api/serve-resource.ts`

- [ ] If R2 `get()` returns null: return 404 with JSON error `{ error: 'Resource not found' }`
- [ ] If resource name is not in allowlist: return 400 with JSON error `{ error: 'Invalid resource' }`
- [ ] Log missing resources server-side (without PII) for debugging

---

### 3.5 — Update `ResourceForm.astro` resource name references
**Commit**: `fix(resources): update resource form to use allowlist keys`  
**Files**: `src/components/ResourceForm.astro`

- [ ] Ensure the resource names passed in form props match the allowlist keys exactly
- [ ] Validate that form hidden input `resource` field matches one of the allowlist keys

---

### 3.6 — Smoke-test the full download flow
**Commit**: `test(resources): manual smoke test results documented`  
**Files**: `docs/backlog/tasks/milestone-3-resource-system.md` (update this file)

- [ ] End-to-end test locally:
  1. Submit `ResourceForm` with valid email
  2. Receive confirmation (email with download link, or page redirect)
  3. Click download link / call `GET /api/serve-resource?token=<token>&resource=<name>`
  4. Verify real PDF is downloaded (not mock stub)
- [ ] Test with invalid token → 401
- [ ] Test with invalid resource name → 400

---

## PR Checklist

Before merging to `complete_astro_v6_migration`:

- [ ] Build passes: `npm run build`
- [ ] Real PDFs download correctly (not `%PDF-1.4...\nSample Resource PDF`)
- [ ] Invalid resource name → 400
- [ ] Missing file in R2 → 404
- [ ] Expired/invalid token → 401
- [ ] HMAC signing works (from M1.2)
- [ ] No mock/stub code remains in `serve-resource.ts`
- [ ] All 3.x commits on branch `feat/resource-real-files`
- [ ] PR opened: `feat/resource-real-files` → `complete_astro_v6_migration`
