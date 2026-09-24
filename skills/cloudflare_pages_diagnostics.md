# Cloudflare Pages Diagnostics & API Debugging SOP

Use this guide to diagnose Cloudflare Pages deployment issues, fetch build and deployment logs, inspect project settings, and trigger redeployments using the Cloudflare REST API and local Wrangler credentials.

## Scope

- Cloudflare Pages project configuration and deployment history.
- Querying Cloudflare v4 REST API using locally stored Wrangler OAuth credentials.
- Troubleshooting build output mismatches, asset binding conflicts, and Access portal redirects.

## Authentication & Configuration

Wrangler stores user OAuth credentials locally:
- **Windows**: `%USERPROFILE%\AppData\Roaming\xdg.config\.wrangler\config\default.toml`
- **Linux/macOS**: `~/.config/.wrangler/config/default.toml`

If requests return HTTP 401, run `npx wrangler whoami` to refresh the OAuth token using the stored refresh token.

### Project Invariants
- **Account ID**: `e40e4ff5055e9ab9bceec75e853fb29c`
- **Project Name**: `meteoricteachings`
- **Base API Endpoint**: `https://api.cloudflare.com/client/v4/accounts/e40e4ff5055e9ab9bceec75e853fb29c/pages/projects/meteoricteachings`

## Diagnostic Procedures

### 1. Check Project Settings & Recent Deployments
Inspect `result.build_config` to confirm:
- `build_command`: `npm run build`
- `destination_dir`: `dist/client` (MUST be `dist/client`, not `dist/`)

Query endpoint: `GET /accounts/:accountId/pages/projects/meteoricteachings/deployments`

### 2. Fetch Build and Deployment Logs
When a deployment fails or behaves unexpectedly, pull the build logs directly from Cloudflare:
`GET /accounts/:accountId/pages/projects/meteoricteachings/deployments/:deploymentId/history/logs`

Look for:
- "Checking for configuration in a Wrangler configuration file"
- Upload directory messages
- Compilation/Vite errors

### 3. Trigger Deployment Retry
When build settings have been patched via API or when rerunning a failed build:
`POST /accounts/:accountId/pages/projects/meteoricteachings/deployments/:deploymentId/retry`

### 4. Cancel Hung Deployment
When a build hangs during compilation or compression:
`POST /accounts/:accountId/pages/projects/meteoricteachings/deployments/:deploymentId/cancel`

## Common Invariants & Gotchas

1. **404 Errors on Web Root (`https://alokprateek.in/`)**:
   - Verify `destination_dir` is `dist/client`. In Astro 6, assets are written to `dist/client/`. If Pages serves `dist/`, files are published under `/client/...`.

2. **Reserved `ASSETS` Binding in `wrangler.toml`**:
   - Never add `pages_build_output_dir` to `wrangler.toml`. `@astrojs/cloudflare` v13 generates an `ASSETS` binding that causes Wrangler to throw: `"The name 'ASSETS' is reserved in Pages projects"`.

3. **Cloudflare Access on Previews**:
   - Preview deployments on `*.pages.dev` redirect unauthenticated HTTP requests to Cloudflare Access login (HTTP 302). Live public verification must test `https://alokprateek.in/`.

4. **CI Build Hang (>20–30 Minutes) during `npm run build`**:
   - Cause: Duplicate Sharp compression pass when `@playform/compress` runs `{ Image: true }` alongside Astro's `imageService: 'compile'`.
   - Fix: Ensure `astro.config.mjs` sets `playformCompress({ Image: false })`. Cancel the hung build via `check-deployment.mjs cancel <deploymentId>`.

5. **Preview Build Does Not Trigger (`skip_reason: "branch_config"`)**:
   - Cause: Branch name does not match `preview_branch_includes: ["agent/*", "fix/*"]`. E.g., `fixes/*` (plural) is skipped.
   - Fix: Rename branch using singular prefix `fix/<name>` or `agent/<name>`.
