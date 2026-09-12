# Human Tasks — Agent↔Human Handoff Document

**Site**: alokprateek.in | **Last updated**: 2026-09-13

> [!IMPORTANT]
> This document is the **single source of truth** for human↔agent handoffs.
> The agent reads this file **before starting or resuming any milestone**.
> To resume work after completing a human task: update the task status to `DONE ✅`
> then prompt: **"Continue milestone [N] — human task [ID] is resolved"**

---

## How to Use This Document

### Agent Protocol
1. At the start of any session, read this file first
2. If any task for the current milestone is `PENDING 🔲` — stop and notify the human
3. If all tasks for the current milestone are `DONE ✅` or `N/A` — proceed with code changes
4. After completing a code task that surfaces a new human dependency — add it here and stop

### Human Protocol
1. Complete the task described in the section below
2. Change status from `PENDING 🔲` to `DONE ✅`
3. Fill in any response values (secret keys, file paths, confirmations)
4. Prompt the agent: **"Continue milestone [N] — human task [TASK-ID] is resolved"**

---

## MILESTONE 1 — Security Phase 1

### TASK-1A: Generate `RESOURCE_SIGNING_SECRET`
**Status**: `PENDING 🔲`
**Milestone**: 1 | **Blocks**: 1B (hardcoded secret fix)

**What to do**:
Generate a cryptographically secure random secret (minimum 32 bytes) to replace the hardcoded `'your-secret-key-here'` in `serve-resource.ts`.

```bash
# Option A — Node.js (run in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option B — OpenSSL
openssl rand -hex 32

# Option C — Wrangler (stores it directly as a secret — recommended)
wrangler secret put RESOURCE_SIGNING_SECRET
# Then paste the generated value when prompted
```

**What to fill in after completing**:
- [ ] Secret generated and stored via `wrangler secret put RESOURCE_SIGNING_SECRET` (production)
- [ ] Secret added to local `.dev.vars` file as `RESOURCE_SIGNING_SECRET=<value>` (development)
- [ ] Confirm `.dev.vars` is in `.gitignore` (it already should be — verify)

**Agent note**: Once this is done, the agent will:
1. Replace `const secret = 'your-secret-key-here'` with `import.meta.env.RESOURCE_SIGNING_SECRET`
2. Implement proper HMAC-SHA256 signing using `crypto.subtle`

---

### TASK-1B: Generate `ADMIN_API_KEY`
**Status**: `PENDING 🔲`
**Milestone**: 1 | **Blocks**: 1C (admin endpoint protection)

**What to do**:
Generate a secure API key that only you will use to access admin endpoints (`GET /api/resource-download`, `POST/PUT/DELETE /api/campaigns`).

```bash
# Generate a secure key
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"

# Store it as a Cloudflare secret
wrangler secret put ADMIN_API_KEY
```

**What to fill in after completing**:
- [ ] `ADMIN_API_KEY` set via `wrangler secret put ADMIN_API_KEY` (production)
- [ ] `ADMIN_API_KEY=<value>` added to local `.dev.vars`
- [ ] Key saved somewhere safe (password manager) — you'll need it to call admin endpoints

**How to use the key** (once implemented by agent):
```bash
# Example: fetch resource download stats
curl -H "Authorization: Bearer <your-key>" https://alokprateek.in/api/resource-download
```

---

## MILESTONE 2 — IndieWeb Quick Wins

### TASK-2A: Add `rel="me"` Back-Links on Social Profiles
**Status**: `PENDING 🔲`
**Milestone**: 2 | **Blocks**: 2B (rel-me implementation)

The agent will add `rel="me"` links to the site footer and `<head>`. For IndieAuth verification to work **bidirectionally**, you must also add a link back to `https://alokprateek.in` from each social profile.

**What to do** (manual steps on each platform):

| Platform | Profile URL | Where to add link |
|---|---|---|
| GitHub | https://github.com/thewhitewulfy | Profile → Edit profile → Website field: `https://alokprateek.in` |
| LinkedIn | https://www.linkedin.com/in/alokprateek/ | Profile → Contact info → Website: `https://alokprateek.in` |
| Twitter/X | https://twitter.com/thewhitewulfy | Profile → Edit profile → Website: `https://alokprateek.in` |
| Instagram | https://www.instagram.com/thewhitewulfy/ | Profile → Edit profile → Website: `https://alokprateek.in` |
| Mastodon | (if applicable) | Profile → Edit profile → Add link with rel=me |

**What to fill in after completing**:
- [ ] GitHub profile has `https://alokprateek.in` in website field
- [ ] LinkedIn has site URL in contact info
- [ ] Twitter/X has site URL in website field
- [ ] Instagram has site URL (note: Instagram's `rel` may not be supported by all parsers)
- [ ] Mastodon link added (if applicable)

> [!NOTE]
> The agent can proceed with adding the `rel="me"` link tags to the site code without waiting for this task — the site-side implementation doesn't depend on the social profiles being updated. Mark this DONE once you've done the social profiles.

---

### TASK-2B: Verify Webmention.io Token
**Status**: `PENDING 🔲`
**Milestone**: 2 | **Blocks**: 2C (webmention display)

The webmention display component will fetch from `webmention.io`. Verify the site is correctly claimed.

**What to do**:
1. Go to https://webmention.io
2. Sign in with your domain (`alokprateek.in`) via IndieAuth
3. Confirm the dashboard shows received webmentions (if any)
4. Note your token if you want to use the authenticated API (optional — public API works without token)

**What to fill in after completing**:
- [ ] webmention.io dashboard is accessible and site is claimed
- [ ] (Optional) `WEBMENTION_IO_TOKEN` added to `.dev.vars` and `wrangler secret put WEBMENTION_IO_TOKEN`
- Token value (leave blank if using public API): `___________________`

---

## MILESTONE 3 — Resource System

### TASK-3A: Choose PDF Storage Location
**Status**: `PENDING 🔲`
**Milestone**: 3 | **Blocks**: All of M3

**Decision needed**: Where will the real PDF files be stored?

| Option | Pros | Cons |
|---|---|---|
| **Cloudflare R2** (recommended) | Native to stack, zero egress within CF, secure gated access | Requires R2 bucket setup |
| **`/public/resources/`** | Simplest, no new infra | Files publicly accessible at known URLs (bypasses token auth) |
| **External URL** | Flexible | Latency, external dependency |

**Your choice**: `___________________`

---

### TASK-3B: Provide Real PDF Files
**Status**: `PENDING 🔲`
**Milestone**: 3 | **Blocks**: 3 (file upload sub-task)

The following 3 resource files are referenced in the code but not present:

| Filename | Status |
|---|---|
| `automation-guide.pdf` | ❌ Missing — placeholder stub in code |
| `whitelabel-checklist.pdf` | ❌ Missing — placeholder stub in code |
| `ai-integration-playbook.pdf` | ❌ Missing — placeholder stub in code |

**If using R2**: Upload files using `wrangler r2 object put resources/<filename> --file <path>`
**If using `/public/`**: Place files in `public/resources/`

**What to fill in after completing**:
- [ ] `automation-guide.pdf` uploaded
- [ ] `whitelabel-checklist.pdf` uploaded
- [ ] `ai-integration-playbook.pdf` uploaded
- Storage location chosen: `___________________`

---

### TASK-3C: Set Up Cloudflare R2 Bucket (if R2 chosen)
**Status**: `PENDING 🔲`
**Milestone**: 3 | **Blocks**: 3 (only if R2 chosen)

```bash
# Create R2 bucket
wrangler r2 bucket create meteoric-resources

# Then add to wrangler.toml (agent will do this in code):
# [[r2_buckets]]
# binding = "RESOURCES_BUCKET"
# bucket_name = "meteoric-resources"
```

**What to fill in after completing**:
- [ ] R2 bucket `meteoric-resources` created
- [ ] Bucket name to use: `___________________`

---

## MILESTONE 5 — Astro 7 Migration

### TASK-5A: Review Astro 7 Breaking Changes Checklist
**Status**: `PENDING 🔲`
**Milestone**: 5 | **Blocks**: M5 start

Before the agent begins the Astro 7 migration branch, review the official migration guide and confirm you're ready for the branch to diverge.

**What to do**:
1. Read: https://docs.astro.build/en/guides/upgrade-to/v7/
2. Check `@astrojs/cloudflare` compatibility: https://github.com/withastro/adapters/releases
3. Confirm you have a working deployment on the current branch first
4. Create the migration branch: `git checkout -b feat/astro7-migration`

**What to fill in after completing**:
- [ ] Astro 7 migration guide reviewed
- [ ] Current branch (`complete_astro_v6_migration`) deployed and verified working on Cloudflare Pages
- [ ] `feat/astro7-migration` branch created from the latest commit of `complete_astro_v6_migration`

---

## MILESTONE 6 — Comment System

### TASK-6A: Decide on Captcha Provider
**Status**: `PENDING 🔲`
**Milestone**: 6 | **Blocks**: Comment form anti-spam

The comment system needs captcha. `generateCaptcha()`/`verifyCaptcha()` are already scaffolded in `src/lib/api/security.ts` but not wired to any service.

| Provider | Notes |
|---|---|
| **hCaptcha** | Privacy-friendly, free tier generous, GDPR compliant |
| **Cloudflare Turnstile** | Native to the stack, excellent privacy, free |
| **reCAPTCHA v3** | Config already in `site.js` (empty keys) — familiar but Google |

**Your choice**: `___________________`

**What to fill in after completing**:
- [ ] Captcha provider chosen
- [ ] Site key obtained: `___________________`
- [ ] Secret key obtained and stored: `wrangler secret put CAPTCHA_SECRET_KEY`
- [ ] (For hCaptcha/Turnstile) Site key added to `site.js` or env

---

## Completed Tasks (Archive)

> Move tasks here once DONE ✅

*(none yet)*

---

## Agent State Tracker

> The agent updates this section to record where it stopped and what's next.

| Field | Value |
|---|---|
| Last active milestone | — |
| Last completed sub-task | — |
| Last git commit | — |
| Stopped reason | — |
| Next action when resumed | Start Milestone 1 once TASK-1A and TASK-1B are DONE |
