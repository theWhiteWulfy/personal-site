# Milestone 1 — Security: Fix Live Production Risks

**Branch**: `fix/security-phase-1`  
**Base from**: `complete_astro_v6_migration`  
**Priority**: 🔴 First — live production issues  
**Estimated effort**: 2–3 days  
**Status**: ⏳ Waiting on human tasks TASK-1A and TASK-1B

---

## Prerequisites (Human Tasks)

Before starting, confirm in `HUMAN_TASKS.md`:
- [ ] **TASK-1A** `DONE ✅` — `RESOURCE_SIGNING_SECRET` generated and stored
- [ ] **TASK-1B** `DONE ✅` — `ADMIN_API_KEY` generated and stored

---

## Git Setup

```bash
git checkout complete_astro_v6_migration
git pull
git checkout -b fix/security-phase-1
```

---

## Sub-Tasks

### 1.1 — Fix `public/_headers` security headers
**Commit**: `security: fix HTTP security headers`  
**Files**: `public/_headers`

- [ ] Remove deprecated `X-XSS-Protection: 1; mode=block`
- [ ] Replace `Feature-Policy` with `Permissions-Policy` (same permissions, modern directive)
- [ ] Add `X-Frame-Options: DENY`
- [ ] Add `Cross-Origin-Opener-Policy: same-origin`
- [ ] Tighten `Content-Security-Policy`: change `form-action https:` to `form-action 'self' https://alokprateek.in`
- [ ] Add `HSTS preload` directive to `Strict-Transport-Security`

**Expected result** (`public/_headers`):
```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  Cross-Origin-Opener-Policy: same-origin
  Permissions-Policy: geolocation=(), midi=(), sync-xhr=(), microphone=(), camera=(), magnetometer=(), gyroscope=(), fullscreen=(), payment=()
  Content-Security-Policy: form-action 'self'
```

**Verification**: Deploy to CF Pages preview; check headers at https://securityheaders.com

---

### 1.2 — Fix hardcoded secret in `serve-resource.ts`
**Commit**: `security: replace hardcoded HMAC secret with env var`  
**Files**: `src/pages/api/serve-resource.ts`  
**Requires**: TASK-1A DONE

- [ ] Replace `const secret = 'your-secret-key-here'` with `const secret = import.meta.env.RESOURCE_SIGNING_SECRET`
- [ ] Add runtime guard: if secret is missing/empty in production, return 503 with error
- [ ] Replace the custom xor-hash token signing with proper Web Crypto HMAC-SHA256:
  ```ts
  async function signToken(payload: string, secret: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    return btoa(String.fromCharCode(...new Uint8Array(sig)));
  }
  ```
- [ ] Update token verification to use `crypto.subtle.verify` with the same key
- [ ] Update `.dev.vars.example` (create if not exists) with `RESOURCE_SIGNING_SECRET=<generate-with-openssl-rand-hex-32>`

**Verification**: Download flow works end-to-end in local dev with `.dev.vars`

---

### 1.3 — Remove PII console log in `serve-resource.ts`
**Commit**: `security: redact PII from resource download logs`  
**Files**: `src/pages/api/serve-resource.ts`

- [ ] Find line ~332: `console.log(\`Resource download: ${resourceName} by ${tokenData.email}...\`)`
- [ ] Replace with redacted version: `console.log(\`Resource download: ${resourceName} (attempt ${newAttempts})\`)` — remove email
- [ ] Audit for any other PII in console statements in this file

---

### 1.4 — Create admin auth utility
**Commit**: `security: add admin API key auth utility`  
**Files**: `src/lib/api/auth.ts` (new file)  
**Requires**: TASK-1B DONE

- [ ] Create `src/lib/api/auth.ts`:
  ```ts
  export function requireAdminAuth(request: Request, env: Env): boolean {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return false;
    const token = authHeader.slice(7);
    const adminKey = env.ADMIN_API_KEY;
    if (!adminKey) return false;
    // Constant-time comparison to prevent timing attacks
    return token.length === adminKey.length &&
      crypto.subtle !== undefined &&
      Buffer.from(token).equals(Buffer.from(adminKey));
  }
  ```
- [ ] Export `requireAdminAuth` and `unauthorizedResponse` helper
- [ ] Update `.dev.vars.example` with `ADMIN_API_KEY=<your-key-here>`

---

### 1.5 — Protect `GET /api/resource-download` (admin stats endpoint)
**Commit**: `security: require admin auth on resource download stats endpoint`  
**Files**: `src/pages/api/resource-download.ts`

- [ ] Import `requireAdminAuth` from `@lib/api/auth`
- [ ] In the GET handler (around line 184), add auth check at the top:
  ```ts
  if (!requireAdminAuth(request, locals.runtime.env)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  ```
- [ ] Verify GET `/api/resource-download` returns 401 without the key
- [ ] Verify it returns data with `Authorization: Bearer <key>` header

---

### 1.6 — Protect campaign CRUD endpoints
**Commit**: `security: require admin auth on campaign write endpoints`  
**Files**: `src/pages/api/campaigns.ts`

- [ ] Import `requireAdminAuth` from `@lib/api/auth`
- [ ] Add auth check to POST handler (campaign create, ~line 159)
- [ ] Add auth check to PUT handler (campaign update)
- [ ] Add auth check to DELETE handler (campaign delete)
- [ ] Leave GET handler public (reading campaign data for display is fine)

---

### 1.7 — Remove production console.logs leaking data
**Commit**: `security: remove production console.log data leaks`  
**Files**: 
- `src/components/custom/LeadForm.astro`
- `src/components/custom/NewsletterForm.astro`

- [ ] `LeadForm.astro ~line 119`: Remove `console.log(result)` on form submit
- [ ] `NewsletterForm.astro ~line 69`: Remove `console.log(result)` on subscribe
- [ ] Scan both files for any other unguarded console statements

---

### 1.8 — Fix duplicate submission detection in campaign signup
**Commit**: `security: fix campaign signup duplicate detection to use email`  
**Files**: `src/pages/api/campaign-signup.ts`

- [ ] Find ~line 131-155: current dedup queries by `utm_source + utm_campaign`
- [ ] Replace with email-based dedup: check if email already exists for this campaign
- [ ] Remove the comment `'Potential duplicate submission detected, but allowing...'` — make it actually block

---

### 1.9 — Update `wrangler.toml` secrets documentation
**Commit**: `chore: document required env secrets in wrangler.toml`  
**Files**: `wrangler.toml`, `.dev.vars.example` (create)

- [ ] Add comment block to `wrangler.toml` listing all required secrets:
  ```toml
  # Required secrets (set via: wrangler secret put <KEY>)
  # RESOURCE_SIGNING_SECRET - HMAC key for download token signing
  # ADMIN_API_KEY           - Bearer token for admin API endpoints
  ```
- [ ] Create `.dev.vars.example` with all local dev variables (no real values)
- [ ] Verify `.dev.vars` is in `.gitignore`

---

## PR Checklist

Before merging to `complete_astro_v6_migration`:

- [ ] Build passes: `npm run build`
- [ ] `GET /api/resource-download` returns 401 without auth header
- [ ] `POST /api/campaigns` returns 401 without auth header
- [ ] Resource download token uses proper HMAC (not xor hash)
- [ ] `public/_headers` passes https://securityheaders.com with A or B rating
- [ ] No `console.log` with user PII in production paths
- [ ] All 1.x commits on branch `fix/security-phase-1`
- [ ] PR opened: `fix/security-phase-1` → `complete_astro_v6_migration`
