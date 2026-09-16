# Human Tasks — Agent↔Human Handoff Document

**Site**: alokprateek.in | **Last updated**: 2026-09-13

---

> [!IMPORTANT]
> **READ THIS FIRST — How to use this file**
>
> 1. **Agent reads this file at the start of every session** before touching any code
> 2. If a task for the current milestone is `PENDING 🔲` — agent stops and notifies you
> 3. You complete the task, fill in the values below, tick the boxes, change status to `DONE ✅`
> 4. Use the **exact resume prompt** at the bottom of each task block to continue
> 5. No conversation restart — all state is tracked here and in git

---
---

## ═══════════════════════════════════════
## MILESTONE 1 — Security Phase 1
## ═══════════════════════════════════════

> **Agent starts this milestone after TASK-1A and TASK-1B are both `DONE ✅`.**
> The agent can do nothing in M1 without the two secrets below — all M1 code depends on them.

---

### TASK-1A — Generate `RESOURCE_SIGNING_SECRET`

**Status**: `DONE ✅`
**Blocks**: Sub-task 1.2 (hardcoded secret fix in serve-resource.ts)

&nbsp;

**What this is**: A cryptographically secure random string used as the HMAC-SHA256 key for signing resource download tokens. Replaces the current `'your-secret-key-here'` hardcoded in production.

&nbsp;

**Steps to complete**:

```bash
# Step 1 — Generate the secret (pick one method)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# OR
openssl rand -hex 32

# Step 2 — Store it in Cloudflare (production)
wrangler secret put RESOURCE_SIGNING_SECRET
# paste the generated value when prompted

# Step 3 — Store it locally for dev
# Add this line to your .dev.vars file:
# RESOURCE_SIGNING_SECRET=<the-same-value>
```

&nbsp;

**Fill in after completing**:

| Item | Done? |
|---|---|
| Secret generated | Yes |
| `wrangler secret put RESOURCE_SIGNING_SECRET` run (production) | Yes |
| `RESOURCE_SIGNING_SECRET=<value>` added to `.dev.vars` (local dev) | Yes |
| `.dev.vars` is in `.gitignore` (verify with `git status`) | Yes |

&nbsp;

**Notes / issues encountered**:

```
(leave blank or describe any problems here)
```

&nbsp;

---

### TASK-1B — Generate `ADMIN_API_KEY`

**Status**: `DONE ✅`
**Blocks**: Sub-task 1.4–1.6 (protecting admin endpoints in resource-download + campaigns APIs)

&nbsp;

**What this is**: A static API key that only you know. Used as a Bearer token to access admin-only endpoints (`GET /api/resource-download` stats, `POST/PUT/DELETE /api/campaigns`). Simple and effective for a personal site.

&nbsp;

**Steps to complete**:

```bash
# Step 1 — Generate the key
node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"

# Step 2 — Store it in Cloudflare (production)
wrangler secret put ADMIN_API_KEY
# paste the generated value when prompted

# Step 3 — Store it locally for dev
# Add this line to your .dev.vars file:
# ADMIN_API_KEY=<the-same-value>

# Step 4 — Save it somewhere safe (password manager)
# You'll need it to call admin endpoints:
# curl -H "Authorization: Bearer <key>" https://alokprateek.in/api/resource-download
```

&nbsp;

**Fill in after completing**:

| Item | Done? |
|---|---|
| Key generated | Yes |
| `wrangler secret put ADMIN_API_KEY` run (production) | Yes |
| `ADMIN_API_KEY=<value>` added to `.dev.vars` (local dev) | Yes |
| Key saved in password manager | Yes |

&nbsp;

**Your admin key (last 4 chars only — for verification, do NOT write the full key here)**: 

```
Last 4 chars: WfFa
```

&nbsp;

**Notes / issues encountered**:

```
(leave blank or describe any problems here)
```

&nbsp;

---

### ✅ RESUME PROMPT FOR MILESTONE 1

Once TASK-1A and TASK-1B are both done, copy and send this message:

> **"Continue milestone 1 — TASK-1A and TASK-1B are resolved"**

---
---

## ═══════════════════════════════════════
## MILESTONE 2 — IndieWeb Quick Wins
## ═══════════════════════════════════════

> **⚙️ Agent completes Milestone 1 first.** The code changes in M2 (rel-me links,
> micropub fix) do not depend on human tasks — the agent will start those automatically
> after M1 is merged. TASK-2A and TASK-2B below are parallel human actions you can
> complete while the agent works on the code side.

---

### TASK-2A — Add Your Site URL to Social Profiles (`rel="me"` back-links)

**Status**: `DONE ✅` (confirmed complete by site owner, 2026-09-14)
**Blocks**: Bidirectional IndieAuth identity verification (agent adds site-side links; you add profile-side links)

> [!NOTE]
> The agent will add `rel="me"` link tags to the site code without waiting for this task.
> This task enables the **other direction** — platforms confirming your identity back.
> Mark DONE once you've updated your social profiles.

&nbsp;

**What to do**: On each platform, add `https://alokprateek.in` as your website URL.

| Platform | Profile URL | Where to add | Done? |
|---|---|---|---|
| **GitHub** | https://github.com/thewhitewulfy | Profile → Edit profile → Website field | Yes / No |
| **LinkedIn** | https://www.linkedin.com/in/alokprateek/ | Profile → Contact info → Website | Yes / No |
| **Twitter / X** | https://twitter.com/thewhitewulfy | Profile → Edit profile → Website | Yes / No |
| **Instagram** | https://www.instagram.com/thewhitewulfy/ | Profile → Edit profile → Website | Yes / No |
| **Mastodon** (if applicable) | `___________________________` | Profile → Edit profile → Add link with rel=me | Yes / No |

&nbsp;

**Notes / issues encountered**:

```
(leave blank or describe any problems here)
```

&nbsp;

---

### TASK-2B — Verify webmention.io is Active for Your Domain

**Status**: `DONE ✅` (confirmed complete by site owner, 2026-09-14 — deployment live at https://alokprateek.in)
**Blocks**: Sub-task 2.5–2.6 (WebmentionDisplay component — needs confirmed endpoint)

> [!NOTE]
> The agent can build the WebmentionDisplay component code without this task.
> This task verifies the live integration is working so you can confirm it during testing.

&nbsp;

**Steps to complete**:

```
1. Go to https://webmention.io
2. Sign in with your domain (alokprateek.in) via IndieAuth / rel-me
3. Confirm the dashboard loads and shows your site
4. (Optional) Copy your API token if you want authenticated API access
```

&nbsp;

**Fill in after completing**:

| Item | Done? |
|---|---|
| webmention.io dashboard accessible for alokprateek.in | Yes |
| Any webmentions already received (check the dashboard) | Yes |
| Using authenticated API? (optional) | Yes |

&nbsp;

**Webmention.io token** (last 4 chars only for verification — do NOT write the full key here; the full value lives only in `.dev.vars` and the Cloudflare secret):

```
Last 4 chars: Jueg
```

> [!WARNING]
> The full token was briefly pasted into this file (2026-09-14) and redacted before commit — it never
> reached git history. If it had been committed, the token should be rotated from the webmention.io
> dashboard.

If using token: run `wrangler pages secret put WEBMENTION_IO_TOKEN --project-name=meteoricteachings` (this is a Cloudflare **Pages** project — `wrangler secret put` alone is Workers-only) and add to `.dev.vars`.

| Item | Done? (only if using token) |
|---|---|
| `wrangler secret put WEBMENTION_IO_TOKEN` run |  No |
| `WEBMENTION_IO_TOKEN=<value>` added to `.dev.vars` | Yes |

&nbsp;

**Notes / issues encountered**:

```
(leave blank or describe any problems here)
```

&nbsp;

---

### ✅ RESUME PROMPT FOR MILESTONE 2

The agent starts M2 code work automatically after M1 merges.
Once TASK-2A and/or TASK-2B are done, send this to unlock full M2 verification:

> **"Continue milestone 2 — TASK-2A and TASK-2B are resolved"**

Or if only one is done:

> **"Continue milestone 2 — TASK-2A is resolved"**
> **"Continue milestone 2 — TASK-2B is resolved"**

---
---

## ═══════════════════════════════════════
## MILESTONE 3 — Resource Download System
## ═══════════════════════════════════════

> **⚙️ Agent completes Milestone 1 sub-task 1.2 (HMAC fix) first.**
> All of Milestone 3 depends on the secure token signing from M1 being in place.
> TASK-3A, 3B, and 3C below are fully blocking — the agent cannot write any M3
> code until you've decided where to store files and have the real PDFs ready.

---

### TASK-3A — Choose PDF File Storage Location

**Status**: `done ✅`
**Blocks**: All of Milestone 3 code

&nbsp;

**Your options**:

| Option | Description | Recommendation |
|---|---|---|
| **Cloudflare R2** | Object storage native to Cloudflare stack. Zero egress cost within CF. Gated behind token auth. Requires a bucket. | ✅ Recommended |
| **`/public/resources/`** | Serve files statically from Astro. Simple, no new infra. Files are publicly accessible at their URL — token auth becomes advisory only. | Only if files can be public |
| **External URL** | Files hosted elsewhere (Dropbox, S3, etc.). Agent generates a redirect or proxy. | Adds latency + dependency |

&nbsp;

**Your decision**:

```
Storage choice: ________________R2____________________
                (write: "R2" / "public/resources" / "external:<url>")
```

&nbsp;

**Notes / reason for choice**:

```
(leave blank or explain here)
```

&nbsp;

---

### TASK-3B — Set Up Cloudflare R2 Bucket *(only if R2 chosen in TASK-3A)*

**Status**: `done ✅` *(skip if not using R2)*
**Blocks**: Sub-task 3.1 (R2 binding in wrangler.toml)

&nbsp;

**Steps to complete**:

```bash
# Create the R2 bucket
wrangler r2 bucket create meteoric-resources

# Verify it was created
npx wrangler r2 bucket list
```

&nbsp;

**Fill in after completing**:

| Item | Done? |
|---|---|
| R2 bucket created via `wrangler r2 bucket create` | Yes |
| Bucket appears in `wrangler r2 bucket list` output | Yes |

&nbsp;

**Bucket name used** (if different from `meteoric-resources`):

```
Bucket name: ____________________________________
```

&nbsp;

**Notes / issues encountered**:

```
(leave blank or describe any problems here)
```

&nbsp;

---

### TASK-3C — Provide Real PDF Files

**Status**: `PENDING 🔲`
**Blocks**: Sub-task 3.3 (serve-resource.ts updated to serve real files)

&nbsp;

**Files needed** (currently returning a fake stub in production):

| Filename | Status | Upload command (if using R2) |
|---|---|---|
| `automation-guide.pdf` | ❌ Missing | `wrangler r2 object put meteoric-resources/automation-guide.pdf --file D:/PERSONAL/PDF/Automation-Guide.pdf` |
| `whitelabel-checklist.pdf` | ❌ Missing | `wrangler r2 object put meteoric-resources/whitelabel-checklist.pdf --file D:/PERSONAL/PDF/Whitelabel-Checklist.pdf` |
| `ai-integration-playbook.pdf` | ❌ Missing | `wrangler r2 object put meteoric-resources/ai-integration-playbook.pdf --file D:/PERSONAL/PDF/AI-Integration-Playbook.pdf` |

&nbsp;

**Fill in after completing**:

| File | Uploaded? | Location |
|---|---|---|
| `automation-guide.pdf` | Yes | R2 |
| `whitelabel-checklist.pdf` | Yes | R2 |
| `ai-integration-playbook.pdf` | Yes | R2 |

&nbsp;

**Notes / issues encountered**:

```
(leave blank or describe any problems here)
```

&nbsp;

---

### ✅ RESUME PROMPT FOR MILESTONE 3

Once TASK-3A, 3B, and 3C are all done, copy and send this message:

> **"Continue milestone 3 — TASK-3A, TASK-3B, and TASK-3C are resolved"**

If skipping R2 (using public/ instead):

> **"Continue milestone 3 — TASK-3A and TASK-3C are resolved, storage is public/resources"**

---
---

## ═══════════════════════════════════════
## MILESTONE 4 — Dead Code Cleanup
## ═══════════════════════════════════════

> **⚙️ No human tasks required for Milestone 4.**
> The agent runs this independently on branch `chore/dead-code-cleanup`.
> You only need to review and merge the PR.

> **Resume prompt (anytime)**:
> **"Start milestone 4 — dead code cleanup"**

---
---

## ═══════════════════════════════════════
## MILESTONE 5 — Astro 7 Migration
## ═══════════════════════════════════════

> **⚙️ Agent waits for M1 and M2 to be merged before starting M5.**
> TASK-5A below is a human prerequisite — the agent needs your confirmation
> that you've reviewed the breaking changes and the migration branch is ready.

---

### TASK-5A — Review Astro 7 Breaking Changes & Create Migration Branch

**Status**: `PENDING 🔲`
**Blocks**: All of Milestone 5

&nbsp;

**What to do**:

```
1. Read the Astro 7 migration guide:
   https://docs.astro.build/en/guides/upgrade-to/v7/

2. Read the @astrojs/cloudflare adapter changelog:
   https://github.com/withastro/adapters/releases

3. Confirm the current site is working on Cloudflare Pages
   (M1 + M2 deployed and live)

4. Create the migration branch:
   git checkout complete_astro_v6_migration
   git pull
   git checkout -b feat/astro7-migration
```

&nbsp;

**Fill in after completing**:

| Item | Done? |
|---|---|
| Astro 7 migration guide read | Yes / No |
| `@astrojs/cloudflare` v14 changelog checked | Yes / No |
| `vite-plugin-pwa` Astro 7 compat checked | Yes / No |
| Current site (`complete_astro_v6_migration`) is live on CF Pages and working | Yes / No |
| Branch `feat/astro7-migration` created | Yes / No |

&nbsp;

**Any breaking changes that concern you** (optional — agent will handle but good to flag):

```
(leave blank or describe concerns here)
```

&nbsp;

---

### ✅ RESUME PROMPT FOR MILESTONE 5

Once TASK-5A is done, copy and send this message:

> **"Continue milestone 5 — TASK-5A is resolved, branch feat/astro7-migration is ready"**

---
---

## ═══════════════════════════════════════
## MILESTONE 6 — Comment System (D1)
## ═══════════════════════════════════════

> **⚙️ Agent waits for Milestone 5 (Astro 7) to be fully merged before starting M6.**
> TASK-6A is a human prerequisite — the captcha provider and keys must be decided
> before the agent wires up the anti-spam layer.

---

### TASK-6A — Choose Captcha Provider and Obtain Keys

**Status**: `PENDING 🔲`
**Blocks**: Sub-tasks 6.4–6.5 (captcha wiring in comment form and API)

&nbsp;

**Your options**:

| Provider | Privacy | Free Tier | Recommendation |
|---|---|---|---|
| **Cloudflare Turnstile** | Excellent — no tracking | Very generous | ✅ Recommended (native to stack) |
| **hCaptcha** | Good — GDPR compliant | Generous | Good alternative |
| **reCAPTCHA v3** | Google tracking | Yes | Familiar but privacy trade-off |

&nbsp;

**How to get keys**:

```bash
# Cloudflare Turnstile (recommended)
# Go to: Cloudflare Dashboard → Turnstile → Add a site
# Get: Site Key (public) + Secret Key (private)

# hCaptcha
# Go to: https://www.hcaptcha.com → Register → New Site
# Get: Site Key (public) + Secret Key (private)

# reCAPTCHA v3
# Go to: https://www.google.com/recaptcha/admin
# Get: Site Key (public) + Secret Key (private)
```

&nbsp;

**Your decision**:

```
Provider chosen: ____________________________________
                 (write: "Turnstile" / "hCaptcha" / "reCAPTCHA")
```

&nbsp;

**Fill in after completing**:

| Item | Done? |
|---|---|
| Captcha provider chosen | Yes / No |
| Site key obtained (public — goes in site config) | Yes / No |
| Secret key obtained (private — goes in env var) | Yes / No |
| `wrangler secret put CAPTCHA_SECRET_KEY` run (production) | Yes / No |
| `CAPTCHA_SECRET_KEY=<value>` added to `.dev.vars` (local dev) | Yes / No |

&nbsp;

**Site key** (public — safe to write here, will go in `site.js`):

```
Site key: ____________________________________
```

&nbsp;

**Secret key last 4 chars** (for verification only — do NOT write full key here):

```
Last 4 chars: ____
```

&nbsp;

**Notes / issues encountered**:

```
(leave blank or describe any problems here)
```

&nbsp;

---

### ✅ RESUME PROMPT FOR MILESTONE 6

Once TASK-6A is done and Milestone 5 is merged, copy and send this message:

> **"Continue milestone 6 — TASK-6A is resolved, captcha provider is [Turnstile/hCaptcha/reCAPTCHA], site key is [your-site-key]"**

---
---

## ═══════════════════════════════════════
## MILESTONE 7 — 404 "Did You Mean?" Feature
## ═══════════════════════════════════════

> **⚙️ No human tasks required for Milestone 7.**
> The agent runs this independently on branch `feat/404-did-you-mean`.
> Can be started anytime after Milestone 4.

> **Resume prompt (anytime after M4)**:
> **"Start milestone 7 — 404 did-you-mean feature"**

---
---

## ═══════════════════════════════════════
## MILESTONE 8 — Future Vision
## ═══════════════════════════════════════

> **⚙️ Milestone 8 has no tasks yet — planning only.**
> Human tasks for POSSE API keys, Mastodon credentials, etc. will be added
> to this section when Milestone 8 sub-features are prioritized.

> **When ready to start a Phase 8 sub-feature**:
> **"Start milestone 8A — POSSE dev.to integration"**
> *(Agent will add the relevant human tasks to this section at that time)*

---
---

## ═══════════════════════════════════════
## ✅ COMPLETED TASKS ARCHIVE
## ═══════════════════════════════════════

> Move tasks here once `DONE ✅` and their milestone is merged.

*(none yet)*

---
---

## ═══════════════════════════════════════
## 🤖 AGENT STATE TRACKER
## ═══════════════════════════════════════

> The agent updates this section at the end of each working session.
> Read this first when resuming to understand exactly where things left off.

&nbsp;

| Field | Value |
|---|---|
| **Last active milestone** | Milestone 2 — IndieWeb Quick Wins (**closed**: merged via PR #1075, live verification passed) |
| **Last completed sub-task** | Live verification of deployed site (real-browser, agent-browser) |
| **Branch name** | `fix/indieweb-phase-1` → merged into `complete_astro_v6_migration` (9819d1e) |
| **Last git commit hash** | a4f0c71 |
| **Last git commit message** | docs: record PR #1075 for Milestone 2 |
| **Stopped reason** | M2 fully closed: TASK-2A + TASK-2B done; live site verified at https://alokprateek.in (head rel=me ×4, zero micropub tags, footer rel=me noopener noreferrer ×4, webmention endpoints present, graceful empty webmention state on articles) |
| **Next action when resumed** | Await instruction — Milestone 4 (dead code cleanup) is startable on request; M3/M5 wait on their human prerequisites (TASK-3A/3B/3C, TASK-5A) |
| **Estimated remaining work in current milestone** | None |

&nbsp;

**Any in-progress notes**:

```
Agent session 2026-09-13:
- Sub-tasks 1.1–1.9 committed as 10 commits on fix/security-phase-1 (per-milestone commit messages honored).
- Deviation from plan 1.2: signing secret is read from locals.runtime.env.RESOURCE_SIGNING_SECRET
  (matches getDatabase() pattern; wrangler secret put / .dev.vars values are runtime-only and are NOT
  visible via import.meta.env). 503 guard added in both GET and POST handlers.
- Deviation from plan 1.4: constant-time comparison implemented as pure string XOR — the plan's Buffer
  snippet is unnecessary with nodejs_compat and less portable; crypto.subtle check dropped.
- CSP tightened to `form-action 'self'` (matches plan's expected-result block; all site forms post same-origin).
- Token format changed (UTF-8-safe base64 + HMAC-SHA256 signature): all previously issued tokens are invalidated — acceptable, tokens expire in 30 min anyway.
- Local `npm run build` currently fails on emptyDir EPERM because a running astro dev / workerd session
  (node PID 17392 on :4321/:9229, workerd PID 27284 on :8788) locks dist/. Build was verified with a
  temporary outDir override (astro.config.verify.mjs, since deleted) — full build passes.
- Unit suite: 303/303 pass (3 stale GET stats tests updated for the new 401 gate; 2 new auth tests added).
- docs/backlog/tasks/milestone-1-security.md checkboxes updated to reflect completed code work.

Agent session 2026-09-13 (deploy fix):
- CF Pages preview failed: `npm clean-install` ERESOLVE. Three stale peer conflicts in the tree:
  @astrojs/mdx 4.3.14 (peer astro ^5) vs astro 6.4.8 [hard conflict], sugarss 4 (via postcss-mixins 10) vs vite 7 [optional],
  @cloudflare/workers-types 4 vs wrangler 4.131.1 (peerOptional ^5) [optional].
- Fix (commit 49b8acd on fix/security-phase-1): added .npmrc with legacy-peer-deps=true (matches the
  locally-verified working tree) and upgraded @astrojs/mdx to ^5.0.6 (the Astro 6 compatible line).
- Verified: `npm ci --dry-run` exits 0, full astro build passes, 303/303 unit tests pass.
- Follow-up recommended: dependency refresh (postcss-mixins 12, @cloudflare/workers-types 5, audit the
  17 Dependabot vulns on main) before or during the Milestone 5 Astro 7 migration.
- Note: CF Pages logs a non-fatal warning about wrangler.toml lacking `pages_build_output_dir` — Pages
  ignores the file and uses project settings. Decided to leave as-is (adding it would make wrangler.toml
  authoritative for the Pages project config, e.g. project name).

Agent session 2026-09-14 (Milestone 2 — IndieWeb Quick Wins):
- Branch created as `fix/indieweb-phase-1` (user override of the plan's `feat/indieweb-quick-wins`),
  based on fix/security-phase-1 @ acff505. Milestone doc header updated to match.
- Sub-tasks 2.1–2.6 committed as 6 atomic commits (1e3299b, af17af4, 1e9a3e9, 2d4e09f, 5c65e1c, 055e3dc).
- Deviation from plan 2.4: footer social anchors previously had `rel="nofollow"`; replaced with
  `rel="me noopener noreferrer"` rather than appending (nofollow contradicts a rel=me identity assertion).
- Deviation from plan 2.5: target URL is `encodeURIComponent`-encoded in the JF2 fetch; mention content
  rendered as TEXT ONLY (no set:html) — external mention content must never be injected as HTML (XSS).
  Mentions with no content fall back to the JF2 `name`; avatar-less authors get an initial fallback chip.
- Root-cause fix for the known emptyDir EPERM build failure: killed the stale `wrangler dev
  --config dist/server/wrangler.json --port 8788` process tree left running by the previous session
  (it held the dist/ directory lock; killing only its workerd child made wrangler respawn workerd).
- Verification: `npm run build` passes (astro check 0 errors, 114 pages prerendered); 303/303 unit tests
  pass; rendered HTML checks — 0 `micropub` occurrences anywhere, 4 `rel=me` head links per page
  (minifier emits `<link href=... rel=me>`; grep for `rel="me"` misses it), footer
  `rel="me noopener noreferrer"` on all 114 pages, no webmention section/h-cite rendered on articles
  (graceful empty state, component CSS still inlined).
- docs/backlog/tasks/milestone-2-indieweb-quick-wins.md checkboxes updated to reflect completed work;
  only "PR opened" remains unchecked.

Agent session 2026-09-14 (M2 close-out — live verification):
- PR #1075 merged (9819d1e); site live at https://alokprateek.in. TASK-2A and TASK-2B both confirmed
  done by site owner. M2 closed.
- Real-browser verification (agent-browser, Chrome via CDP):
  * Home page head: 4 rel="me" links (GitHub/LinkedIn/Twitter/Instagram) with correct URLs; zero
    micropub link tags; webmention + pingback endpoints present and correct.
  * Footer: all 4 social anchors carry rel="me noopener noreferrer" with correct profile URLs.
  * Article page (/articles/migrating-to-astro/): no webmention section rendered (graceful empty
    state — correct while the account has 0 mentions); full-page screenshot verified clean layout.
- ⚠ Anomaly (local environment, NOT the site): TLS connections to webmention.io (23.239.2.96 — same IP
  from local resolver and Google DoH) return a certificate for CN=client.xaa.rocks and serve an
  unrelated OIDC sandbox app (xaa.rocks); /api/mentions.jf2 404s from every local vantage (Chrome,
  .NET SslStream, harness fetch). Third-party reports from Sept 2026 describe the real webmention.io
  as up (with intermittent 502s), so this is consistent with VPN/DNS interception on this machine,
  not a webmention.io outage or a site defect. The deployed site is unaffected: the JF2 fetch runs at
  build time on CF Pages infrastructure and the component hides itself on failure.
- Follow-up: once real webmentions arrive (or with the VPN off), re-check the JF2 API from a clean
  vantage to see the section render live.
```
