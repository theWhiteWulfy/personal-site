# PWA Implementation Guide

## Overview
The site implements a Progressive Web App using Vite PWA plugin with automatic service worker generation, offline support, and update notifications.

## Core PWA Architecture

### Vite PWA Plugin Configuration
PWA configuration is integrated into the main Astro config (see tech.md). Key PWA-specific settings:

- **registerType: "autoUpdate"**: Service worker updates automatically
- **manifest**: Web app manifest from `src/config/manifest.ts`
- **workbox.globPatterns**: Asset caching patterns for offline support
- **workbox.navigateFallback: null**: Prevents console errors for document requests

### Web App Manifest
```typescript
// src/config/manifest.ts
export const manifest: Partial<ManifestOptions> = {
  name: site.title,                    // "Meteoric Teachings"
  short_name: site.shortName,          // "Meteoric Teachings" (must be <12 chars)
  description: site.description,
  theme_color: site.themeColor,        // "#ffffff"
  background_color: site.backgroundColor, // "#111111"
  display: "minimal-ui",               // App-like experience
  icons: [
    // Complete icon set from 72x72 to 512x512
    // All icons support "any maskable" purpose
  ]
}
```

## Service Worker Integration

### Registration Pattern
```astro
<!-- src/layouts/Layout.astro -->
<head>
  <!-- Service worker registration -->
  <script is:inline src="/registerSW.js"></script>
  <link rel="manifest" href="/manifest.webmanifest" />
</head>

<body>
  <!-- Vite PWA hack - DO NOT REMOVE -->
  <script>
    // This is a hack to get vite-plugin-pwa to generate a sw.js file.
    // Do not remove this script tag.
  </script>
</body>
```

### Auto-Update Behavior
- **registerType: "autoUpdate"**: Service worker updates automatically
- **No user prompt**: Updates happen seamlessly in background
- **Cache Strategy**: Workbox handles caching with glob patterns

## Update Notification System

### CSS Toast Notification
```css
/* src/styles/global.css */
#sw-toast {
  min-width: 50%;
  background-color: var(--background-color);
  color: var(--text-color);
  border: solid var(--button-background-color);
  position: fixed;
  z-index: 11;
  left: 2vw;
  right: 2vw;
  bottom: 2vw;
  display: grid;
  grid-template-columns: 1fr 6em;
  grid-template-areas: ".sw-toast-text .sw-toast-btn";
}

.sw-toast-text {
  padding: 2ch 3vw;
  text-align: left;
}

.sw-toast-btn {
  align-self: center;
  width: 6em;
  padding: 3vh 0;
  max-height: 10vh;
}
```

## Caching Strategy

### Asset Caching
```javascript
// Workbox configuration caches:
globPatterns: [
  '**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}'
]
```

### Cache Exclusions
- **navigateFallback: null**: Prevents caching of document requests
- **Reason**: Avoids console errors for page-based navigation
- **Hybrid Rendering**: Some pages are server-rendered on-demand

## PWA Features Implemented

### Core Features
- ✅ **Web App Manifest**: Complete with icons and display settings
- ✅ **Service Worker**: Auto-generated via Vite PWA plugin
- ✅ **Offline Support**: Asset caching for offline functionality
- ✅ **Auto Updates**: Seamless background updates
- ✅ **Install Prompt**: Browser-native install experience

### Advanced Features
- ✅ **Theme Integration**: Manifest colors match CSS custom properties
- ✅ **Icon Set**: Complete maskable icon set (72px to 512px)
- ✅ **Security Headers**: CSP and security headers via Cloudflare
- ✅ **Performance**: Optimized asset caching strategy

## Development Patterns

### Testing PWA Features
```bash
# Build and preview to test PWA (see tech.md for all commands)
npm run build && npm run preview

# Test with Cloudflare Pages locally
npm run cfpreview
```

### PWA Debugging
1. **Chrome DevTools**: Application tab → Service Workers
2. **Manifest**: Application tab → Manifest
3. **Cache**: Application tab → Storage → Cache Storage
4. **Network**: Test offline functionality

### Icon Generation
- **Source**: Favicon files in `/public/favicons/`
- **Sizes**: 72, 96, 128, 144, 152, 192, 384, 512px
- **Format**: PNG with "any maskable" purpose
- **Naming**: `favicon-{size}x{size}.png`

## Integration with Astro

### Hybrid Rendering Compatibility
PWA works with Astro's hybrid rendering mode (see tech.md for full configuration):
- **Static pages**: Pre-rendered content pages cached by service worker
- **Server-rendered pages**: API endpoints excluded from aggressive caching
- **Cloudflare adapter**: Enables PWA deployment on Cloudflare Pages

### API Route Considerations
```typescript
// src/pages/api/newsletter.ts
export const prerender = false; // Server-rendered API routes
```

## Performance Optimizations

### Asset Optimization
- **Compression**: `@playform/compress` integration
- **Image Processing**: Custom `AstroImage` component
- **Font Loading**: Fontsource self-hosted fonts
- **CSS**: PostCSS optimization pipeline

### Caching Strategy
- **Static Assets**: Long-term caching via service worker
- **Dynamic Content**: Excluded from aggressive caching
- **API Responses**: Not cached (server-rendered)

## Deployment Considerations

### Cloudflare Pages Integration
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Service Worker**: Automatically deployed with static assets
- **Headers**: Security headers via `public/_headers`

### Security Headers
```
# public/_headers
/*
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Content-Security-Policy: form-action https:
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## Troubleshooting

### Common Issues
1. **Service Worker Not Updating**: Check cache headers and version
2. **Manifest Not Loading**: Verify path and MIME type
3. **Icons Not Displaying**: Check icon paths and sizes
4. **Offline Not Working**: Verify glob patterns and cache strategy

### Debug Commands
```bash
# Check service worker registration
console.log(navigator.serviceWorker.controller);

# Force service worker update
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.update());
});
```