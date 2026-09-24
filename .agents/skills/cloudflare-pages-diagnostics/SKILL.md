---
name: cloudflare-pages-diagnostics
description: >-
  Use this skill to diagnose Cloudflare Pages deployment issues, fetch build and deployment logs, inspect project settings, and trigger redeployments using the Cloudflare REST API and local Wrangler credentials.
---

# Cloudflare Pages Diagnostics & API Debugging

This skill provides step-by-step instructions and scripts to diagnose Cloudflare Pages build issues and inspect deployment logs without needing a browser or Cloudflare dashboard access.

## Quick Diagnostic Commands

The bundled helper script [check-deployment.mjs](./scripts/check-deployment.mjs) handles authentication via stored Wrangler tokens and queries the Cloudflare v4 REST API:

```shell
# Check project settings and recent deployments
node .agents/skills/cloudflare-pages-diagnostics/scripts/check-deployment.mjs status

# Fetch full build and deployment logs for a deployment
node .agents/skills/cloudflare-pages-diagnostics/scripts/check-deployment.mjs logs <deploymentId>

# Retry/redeploy a previous deployment
node .agents/skills/cloudflare-pages-diagnostics/scripts/check-deployment.mjs retry <deploymentId>

# Cancel/abort a hung deployment
node .agents/skills/cloudflare-pages-diagnostics/scripts/check-deployment.mjs cancel <deploymentId>
```

---

## Manual Diagnostic Procedure

### 1. Retrieve Wrangler OAuth Token
Wrangler stores the user's OAuth token locally:
- **Windows**: `%USERPROFILE%\AppData\Roaming\xdg.config\.wrangler\config\default.toml`
- **Linux/macOS**: `~/.config/.wrangler/config/default.toml`

Extract the `oauth_token = "..."` value.

### 2. Cloudflare Project Context
- **Account ID**: `e40e4ff5055e9ab9bceec75e853fb29c`
- **Project Name**: `meteoricteachings`
- **Base Endpoint**: `https://api.cloudflare.com/client/v4/accounts/e40e4ff5055e9ab9bceec75e853fb29c/pages/projects/meteoricteachings`

### 3. Key Endpoints

- **Project Config**: `GET /accounts/:accountId/pages/projects/:projectName`
  - Inspect `result.build_config` (`destination_dir`, `build_command`).
  - **Invariant**: `destination_dir` MUST be `dist/client`.
  - Inspect `result.source.config.preview_branch_includes` (`["agent/*", "fix/*"]`).
- **List Deployments**: `GET /accounts/:accountId/pages/projects/:projectName/deployments`
  - Returns recent deployment IDs, environments, branch names, and stage statuses (`queued`, `initialize`, `clone_repo`, `build`, `deploy`).
  - Inspect `deployment_trigger.metadata.skip_reason` when builds do not trigger.
- **Fetch Build Logs**: `GET /accounts/:accountId/pages/projects/:projectName/deployments/:deploymentId/history/logs`
  - Inspect exact compiler warnings, `wrangler.json` detection messages, and upload counts.
- **Trigger Retry**: `POST /accounts/:accountId/pages/projects/:projectName/deployments/:deploymentId/retry`
  - Triggers a new deployment using updated project build settings.
- **Cancel Deployment**: `POST /accounts/:accountId/pages/projects/:projectName/deployments/:deploymentId/cancel`
  - Aborts a hung build immediately to free runner capacity.

---

## Common Gotchas & Troubleshooting

1. **HTTP 404 on Live Site (`alokprateek.in/`)**:
   - Check if `destination_dir` was changed back to `dist/`. If it is `dist/`, all static files are served at `/client/...` rather than `/`.
   - Ensure `destination_dir` is `dist/client`.

2. **`The name 'ASSETS' is reserved in Pages projects`**:
   - Cause: `pages_build_output_dir` was added to `wrangler.toml`.
   - Fix: Remove `pages_build_output_dir` from `wrangler.toml`. `@astrojs/cloudflare` v13 generates an `ASSETS` binding for Cloudflare Workers-with-assets, which conflicts with Pages-mode Wrangler.

3. **HTTP 302 on Preview URLs (`*.pages.dev`)**:
   - Branch preview deployments have Cloudflare Access enabled. They redirect unauthenticated requests to the Cloudflare Access portal. This is normal; verify public production URLs on `https://alokprateek.in/`.

4. **CI Build Hang (>20–30 Minutes) during `npm run build`**:
   - Cause: Duplicate Sharp compression pass when `@playform/compress` runs `{ Image: true }` alongside Astro's `imageService: 'compile'`.
   - Fix: Ensure `astro.config.mjs` sets `playformCompress({ Image: false })`. Cancel the hung build via `check-deployment.mjs cancel <deploymentId>`.

5. **Preview Build Does Not Trigger (`skip_reason: "branch_config"`)**:
   - Cause: Branch name does not match `preview_branch_includes: ["agent/*", "fix/*"]`. E.g., `fixes/*` (plural) is skipped.
   - Fix: Rename branch using singular prefix `fix/<name>` or `agent/<name>`.

