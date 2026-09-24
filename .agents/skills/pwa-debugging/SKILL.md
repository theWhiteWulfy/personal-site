---
name: pwa-debugging
description: >-
  Diagnose Progressive Web App (PWA) issues, validate web app manifests, verify Workbox service worker caching, and troubleshoot offline update notifications.
---

# PWA Debugging & Verification Skill

Use this skill when investigating Progressive Web App (PWA) issues, service worker registration failures, missing manifest icons, or offline caching problems.

> **Related SOP**: See [skills/pwa.md](../../../skills/pwa.md) for architectural configuration and invariants.

## Quick Diagnostic Checklist

1. **Verify Manifest Generation**:
   - Check `src/config/manifest.ts` schema and icons.
   - Run `npm run build` and ensure `dist/client/manifest.webmanifest` exists.
   - Confirm all icon files exist in `public/favicons/` (sizes: 72, 96, 128, 144, 152, 192, 384, 512).

2. **Verify Service Worker Output**:
   - Confirm `dist/client/sw.js` is generated during the build.
   - Check that `dist/client/registerSW.js` exists and is referenced in `src/layouts/Layout.astro`.
   - Verify `workbox.navigateFallback` remains `null` to avoid breaking SSR/hybrid pages.

3. **Verify Dev/Preview Environment**:
   - Run `npm run cfpreview` and open browser DevTools:
     - **Application > Manifest**: Check for warnings, theme colors, and icons.
     - **Application > Service Workers**: Check registration status, scope (`/`), and update behavior.
     - **Application > Storage > Cache Storage**: Verify workbox precache hashes.

## Common Issues & Fixes

| Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| `sw.js` not output to `dist/client/` | Missing inline script tag in `Layout.astro` | Ensure `<script>` hook in `<body>` of `src/layouts/Layout.astro` is present. |
| Console 404 on page navigation | `navigateFallback` configured in Workbox | Ensure `navigateFallback: null` in `astro.config.mjs`. |
| Install prompt does not appear | Missing maskable icon or manifest error | Validate that icons support `"any maskable"` purpose in `manifest.ts`. |
| Toast update notification does not clear | Transition event listener missing | Ensure `astro:after-swap` listener is bound in layout scripts. |
