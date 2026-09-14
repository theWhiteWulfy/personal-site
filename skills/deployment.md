# Deployment SOP

Use this guide for Cloudflare Pages, Workers runtime behavior, adapter configuration, headers, redirects, and previews.

## Scope

- Astro adapter configuration is in `astro.config.mjs`.
- Cloudflare D1 and compatibility flags are in `wrangler.toml`.
- Headers and redirects live in `public/_headers` and `public/_redirects`.
- Preview scripts are declared in `package.json`.

## Current Configuration (Astro 6 / v5.0.0)

- Output mode: `static` (replaces legacy `hybrid` mode from Astro 4)
- Server-rendered routes (API endpoints): declare `export const prerender = false`
- Adapter: `@astrojs/cloudflare` v13.x with `platformProxy: { enabled: true }` and `imageService: 'passthrough'`
- A prebuild guard (`fs.mkdirSync('./dist/client', { recursive: true })`) ensures Miniflare initializes cleanly on fresh clones
- Build output layout:
  - `dist/client/`: Static assets, pre-rendered HTML, images, CSS, JS, `_headers`, and `_redirects`
  - `dist/server/`: Worker entrypoint and generated `wrangler.json`

## Cloudflare Pages Project Configuration

- Project Name: `meteoricteachings`
- Build command: `npm run build`
- Build output directory (`destination_dir`): `dist/client`
  > **CRITICAL**: In Astro 6, static assets and HTML live under `dist/client/`. Cloudflare Pages project build setting `destination_dir` MUST be `dist/client`. If set to `dist/`, Pages serves assets under `/client/...`, resulting in HTTP 404 for all root paths (`/`, `/about`, `/articles`).
  > **DO NOT** add `pages_build_output_dir` to `wrangler.toml`: `@astrojs/cloudflare` automatically generates an assets binding with `"binding": "ASSETS"`, which Wrangler rejects as a reserved binding name in Pages projects. Keep `wrangler.toml` configured for Cloudflare Workers/D1 and set `destination_dir: "dist/client"` in Cloudflare Pages build settings.

## Local Preview

```shell
npm run build      # Build first
npm run cfpreview  # wrangler dev --config dist/server/wrangler.json (uses real D1 binding)
```

## Security Headers

Known gaps (tracked in `docs/security-audit.md`):
- `X-Frame-Options: DENY` is missing — should be added to `public/_headers`
- `Feature-Policy` should be replaced with `Permissions-Policy`
- `X-XSS-Protection` is deprecated and should be removed

These are tracked as a separate headers hardening task.

## Required Practices

- Preserve `output: "static"` — do not revert to `hybrid` mode.
- Preserve Cloudflare adapter and `platformProxy` behavior through framework upgrades.
- Verify static and server-rendered behavior separately when deployment branches change runtime code.
- Use deployment checks only after build passes locally.

## Out Of Scope

- Do not deploy from documentation-only branches.
- Do not change Cloudflare project settings from code unless the task explicitly covers deployment configuration.
