# PWA Implementation Guide

## Overview
The site implements a Progressive Web App using Vite PWA plugin with automatic service worker generation, offline support, and update notifications.

## Core PWA Architecture

### Vite PWA Plugin Configuration
PWA configuration is integrated into the main Astro config (see tech.md for complete Astro configuration). Key PWA-specific settings:

```javascript
// astro.config.mjs - PWA-specific configuration only
vite: {
  plugins: [VitePWA({
    registerType: "autoUpdate",        // Service worker updates automatically
    manifest,                          // Web app manifest from src/config/manifest.ts
    workbox: {
      globDirectory: 'dist',
      globPatterns: ['**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}'],
      navigateFallback: null           // Prevents console errors for document requests
    }
  })]
}
```

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

### Auto-Update Behavior
- **registerType: "autoUpdate"**: Service worker updates automatically
- **No user prompt**: Updates happen seamlessly in background
- **Cache Strategy**: Workbox handles caching with glob patterns
- **Update Detection**: Service worker controller changes trigger notifications

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

## PWA Development Patterns

### Service Worker Registration Pattern
```astro
<!-- src/layouts/Layout.astro - PWA integration -->
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

### PWA Update Detection Pattern
```javascript
// Custom update notification handling
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Show update notification
    showUpdateNotification();
  });
}
```

### Testing PWA Features
```bash
# Build and preview to test PWA functionality (see tech.md for all development commands)
npm run build && npm run preview

# Test PWA with Cloudflare Pages locally for service worker functionality
npm run cfpreview
```

### PWA Debugging
1. **Chrome DevTools**: Application tab → Service Workers
2. **Manifest**: Application tab → Manifest
3. **Cache**: Application tab → Storage → Cache Storage
4. **Network**: Test offline functionality
5. **Lighthouse**: PWA audit and performance testing

### Icon Generation
- **Source**: Favicon files in `/public/favicons/`
- **Sizes**: 72, 96, 128, 144, 152, 192, 384, 512px
- **Format**: PNG with "any maskable" purpose
- **Naming**: `favicon-{size}x{size}.png`

## Integration with Astro

### Hybrid Rendering Compatibility
PWA works with Astro's hybrid rendering mode (see tech.md for complete Astro configuration):
- **Static pages**: Pre-rendered content pages cached by service worker
- **Server-rendered pages**: API endpoints excluded from aggressive caching
- **PWA Assets**: Service worker and manifest files deployed with static assets

## Performance Optimizations

### PWA Asset Optimization
- **Service Worker Caching**: Optimized asset caching for offline functionality
- **Manifest Optimization**: Compressed icons and optimized manifest delivery
- **Cache Strategy**: Intelligent caching of PWA-specific assets

### Caching Strategy
- **Static Assets**: Long-term caching via service worker
- **Dynamic Content**: Excluded from aggressive caching
- **API Responses**: Not cached (server-rendered)

## Deployment Considerations

### PWA Deployment Integration
- **Service Worker**: Automatically deployed with static assets
- **Manifest File**: Deployed to root directory as `/manifest.webmanifest`
- **PWA Assets**: Icons and PWA-specific files deployed with build

### PWA Security Considerations
- **Content Security Policy**: PWA assets served with appropriate CSP headers (see deploy.md for complete security configuration)
- **Service Worker Security**: Secure service worker registration and update mechanisms
- **Manifest Security**: Web app manifest served with proper MIME types and security headers

## Troubleshooting

### Common PWA Issues

#### Service Worker Issues
1. **Service Worker Not Updating**: 
   - Check cache headers and version
   - Verify `registerType: "autoUpdate"` configuration
   - Clear browser cache and hard refresh
   - Check for console errors during registration

2. **Service Worker Not Registering**:
   - Verify `/registerSW.js` file exists in public directory
   - Check HTTPS requirement (service workers require secure context)
   - Verify script tag in Layout.astro is not removed

#### Manifest Issues
3. **Manifest Not Loading**: 
   - Verify `/manifest.webmanifest` path and MIME type
   - Check manifest link tag in head section
   - Validate manifest JSON structure

4. **Icons Not Displaying**: 
   - Check icon paths and sizes in manifest
   - Verify all icon files exist in `/public/favicons/`
   - Ensure icons support "any maskable" purpose

#### Caching Issues
5. **Offline Not Working**: 
   - Verify glob patterns in workbox configuration
   - Check service worker cache storage in DevTools
   - Test network throttling in DevTools

6. **Assets Not Caching**:
   - Verify file extensions in globPatterns
   - Check cache storage size limits
   - Ensure assets are within cache scope

#### Installation Issues
7. **Install Prompt Not Showing**:
   - Verify all PWA criteria are met (manifest, service worker, HTTPS)
   - Check browser PWA installation requirements
   - Test on different browsers and devices

### PWA Debug Commands
```javascript
// Check service worker registration status
console.log(navigator.serviceWorker.controller);

// Get all service worker registrations
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registered service workers:', registrations);
});

// Force service worker update
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.update());
});

// Check cache storage
caches.keys().then(cacheNames => {
  console.log('Available caches:', cacheNames);
});

// Check if app is installable
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('App is installable');
});
```

### PWA Testing Checklist
- [ ] Service worker registers successfully
- [ ] Manifest loads without errors
- [ ] All icons display correctly
- [ ] Offline functionality works
- [ ] Install prompt appears (when criteria met)
- [ ] Updates work automatically
- [ ] Cache strategy functions properly
- [ ] PWA passes Lighthouse audit