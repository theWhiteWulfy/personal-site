---
trigger: always_on
description: Invariants for Cloudflare Pages deployment, Wrangler configuration, and Astro 6 build outputs.
---

# Cloudflare Pages & Wrangler Deployment Invariants

When working with Cloudflare deployment, Astro configuration, or Wrangler configs in this repository, you MUST follow these invariants:

1. **Cloudflare Pages Output Directory (`dist/client`)**:
   - In Astro 6 (`@astrojs/cloudflare` v13+), static HTML, CSS, JS, `_headers`, and `_redirects` are output to `dist/client/`.
   - The Cloudflare Pages project build setting (`destination_dir`) MUST ALWAYS be set to `dist/client`.
   - NEVER set `destination_dir` to `dist/`. If set to `dist/`, all pages will be served under the `/client/...` path prefix, causing all root and canonical URLs (`/`, `/about`, `/articles`) to return HTTP 404.

2. **Wrangler Configuration Invariant (`wrangler.toml`)**:
   - DO NOT add `pages_build_output_dir` to `wrangler.toml`.
   - Adding `pages_build_output_dir` forces Wrangler into legacy Pages mode, causing a fatal build validation error: `"The name 'ASSETS' is reserved in Pages projects. Please use a different name for your Assets binding."`
   - Keep `wrangler.toml` configured strictly for Workers/D1 compatibility (`name`, `compatibility_flags = ["nodejs_compat"]`, and `[[d1_databases]]`).

3. **Local Preview Command**:
   - Use `npm run cfpreview` (which executes `wrangler dev --config dist/server/wrangler.json`).
   - Do NOT run `wrangler pages dev ./dist`.

4. **Preview Deployments vs. Production**:
   - Preview deployments on `*.pages.dev` are protected by Cloudflare Access and return HTTP 302 redirects to the Access login portal.
   - Public accessibility checks should be performed against production (`https://alokprateek.in/`) or with appropriate Access service tokens.

5. **Astro Image Service vs. `@playform/compress` Build Invariant**:
   - When `@astrojs/cloudflare` is configured with `imageService: 'compile'`, Astro's build pipeline handles image compression and format conversion directly via Sharp at build time.
   - `@playform/compress` MUST ALWAYS be configured with `{ Image: false }` in `astro.config.mjs`.
   - NEVER enable image compression in `@playform/compress` while using `imageService: 'compile'`. Duplicate Sharp processing causes catastrophic CPU thrashing, ballooning build times from ~24s to >8m locally and causing Cloudflare Pages CI builds to hang and time out (>30m).

6. **Preview Branch Naming Convention (`fix/*`, `agent/*`)**:
   - Cloudflare Pages preview builds are strictly filtered by `preview_branch_includes: ["agent/*", "fix/*"]`.
   - Bugfix and remediation branches MUST use the singular prefix `fix/<branch-name>` (e.g., `fix/pre-m5`), NEVER plural `fixes/`.
   - Non-matching branch prefixes are skipped by Cloudflare Pages with `skip_reason: "branch_config"`.
