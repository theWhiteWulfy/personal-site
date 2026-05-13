# Deployment SOP

Use this guide for Cloudflare Pages, Workers runtime behavior, adapter configuration, headers, redirects, and previews.

## Scope

- Astro adapter configuration is in `astro.config.mjs`.
- Cloudflare D1 and compatibility flags are in `wrangler.toml`.
- Headers and redirects live in `public/_headers` and `public/_redirects`.
- Preview scripts are declared in `package.json`.

## Required Practices

- Preserve `output: "hybrid"` unless an assigned architecture change says otherwise.
- Preserve Cloudflare adapter and `platformProxy` behavior through framework upgrades.
- Verify static and server-rendered behavior separately when deployment branches change runtime code.
- Use deployment checks only after build passes locally.

## Out Of Scope

- Do not deploy from bootstrap or documentation branches.
- Do not change Cloudflare project settings from code unless the task explicitly covers deployment configuration.
