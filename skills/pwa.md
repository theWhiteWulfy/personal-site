# Progressive Web App (PWA) SOP

Use this guide for Progressive Web App implementation, Vite PWA plugin configuration, web app manifest, Workbox service worker caching, and offline update mechanisms.

> **Related Agent Skill**: See [.agents/skills/pwa-debugging/SKILL.md](../.agents/skills/pwa-debugging/SKILL.md) for automated PWA diagnostic workflows and debugging commands.

## Scope

- Service worker generation via `vite-plugin-pwa` in `astro.config.mjs`.
- Web app manifest definition in `src/config/manifest.ts`.
- Auto-update behavior and toast notification in `src/styles/global.css` and layout components.
- Caching policies, glob patterns, and offline navigation exclusions.

## Current Configuration (Astro 6 / Vite)

### 1. Vite PWA Plugin (`astro.config.mjs`)
```javascript
vite: {
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest,
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}'],
        navigateFallback: null, // Crucial: prevents console 404s for SSR/hybrid pages
      }
    })
  ]
}
```

### 2. Web App Manifest (`src/config/manifest.ts`)
- Name: `Meteoric Teachings`
- Theme Color: `#ffffff`
- Background Color: `#111111`
- Display: `minimal-ui`
- Icons: Maskable icon set from 72x72 to 512x512 located in `/public/favicons/`.

### 3. Layout Registration (`src/layouts/Layout.astro`)
```astro
<head>
  <script is:inline src="/registerSW.js"></script>
  <link rel="manifest" href="/manifest.webmanifest" />
</head>
<body>
  <!-- Hack required by vite-plugin-pwa to trigger sw.js generation -->
  <script></script>
</body>
```

## Required Practices

- Keep `navigateFallback: null`: In hybrid and dynamic Astro sites, setting a document fallback breaks server-rendered routes and generates console routing warnings.
- All icons referenced in the manifest must exist with matching dimensions in `/public/favicons/` and include `"purpose": "any maskable"`.
- When updating styles or service worker logic, verify update toast behavior with `document.addEventListener('astro:after-swap')` to ensure compatibility with client-side transitions.
- Verify production build outputs include both `dist/client/sw.js` and `dist/client/manifest.webmanifest`.

## Common Gotchas & Troubleshooting

1. **Service Worker Not Generating**:
   - Ensure the inline `<script>` tag in `Layout.astro` body is preserved; `vite-plugin-pwa` relies on script injection hooks to compile `sw.js`.
2. **Missing Icons on Android/Chrome**:
   - Check that `favicons/favicon-512x512.png` is served with HTTP 200 and matches the path declared in `src/config/manifest.ts`.
3. **Local Testing**:
   - Run `npm run build && npm run cfpreview` to inspect service worker lifecycle under the real Cloudflare Workers/Pages environment.

## Out Of Scope

- Do not introduce push notifications or background sync without explicit architectural review.
- Do not cache dynamic server routes (`/api/*`) in Workbox `globPatterns`.
