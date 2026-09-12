# Performance Testing Guide

## Overview
This guide provides instructions for testing the performance impact of the resource hints and optimization changes implemented in task 8.

## Testing Setup

### Prerequisites
1. Chrome DevTools (latest version)
2. Built project (`npm run build`)
3. Local server running (`npm run preview`)

## Performance Testing Checklist

### 1. Core Web Vitals Testing

#### Before Testing
- Clear browser cache (DevTools > Application > Storage > Clear site data)
- Disable browser extensions
- Use incognito mode for consistent results

#### Lighthouse Audit
1. Open Chrome DevTools (F12)
2. Navigate to Lighthouse tab
3. Select "Performance" category
4. Run audit on key pages:
   - Home page (/)
   - Service page (/services/custom-automation/)
   - Article page (/articles/[any-article]/)
   - Contact page (/contact/)

#### Key Metrics to Monitor
- **First Contentful Paint (FCP)**: < 1.8s (good)
- **Largest Contentful Paint (LCP)**: < 2.5s (good)
- **First Input Delay (FID)**: < 100ms (good)
- **Cumulative Layout Shift (CLS)**: < 0.1 (good)
- **Speed Index**: < 3.4s (good)

### 2. Resource Loading Analysis

#### Network Tab Testing
1. Open DevTools > Network tab
2. Reload page with cache disabled (Ctrl+Shift+R)
3. Verify resource hints are working:
   - DNS prefetch requests appear early
   - Preconnect connections established
   - Font preloading occurs before usage
   - Images load with appropriate priority

#### Resource Priority Verification
Check that resources have correct priorities:
- **High Priority**: Critical fonts, above-fold images
- **Medium Priority**: Analytics scripts (deferred)
- **Low Priority**: Non-critical assets

### 3. Analytics Performance Testing

#### GA4 Integration
1. Open DevTools > Network tab
2. Filter by "google-analytics.com" and "googletagmanager.com"
3. Verify:
   - Scripts load with defer attribute
   - No render-blocking behavior
   - Events fire correctly (check Console for debug messages)

#### Microsoft Clarity Integration
1. Filter Network tab by "clarity.ms"
2. Verify:
   - Script loads asynchronously
   - No impact on page load performance
   - Heatmap functionality works

### 4. Font Loading Performance

#### Font Display Testing
1. Open DevTools > Network tab
2. Throttle connection to "Slow 3G"
3. Reload page and verify:
   - Text remains visible during font load (font-display: swap)
   - No layout shifts when fonts load
   - Critical fonts preload correctly

### 5. Performance Monitoring Commands

#### Chrome DevTools Console Commands
```javascript
// Check Core Web Vitals
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.value);
  }
}).observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']});

// Check resource loading
performance.getEntriesByType('navigation')[0];
performance.getEntriesByType('resource');

// Check DNS prefetch effectiveness
performance.getEntriesByType('resource').filter(r => r.name.includes('dns-prefetch'));
```

## Expected Performance Improvements

### Resource Hints Impact
- **DNS Prefetch**: 20-200ms reduction in connection time
- **Preconnect**: 100-500ms reduction for external resources
- **Font Preload**: Elimination of font swap/FOIT

### Script Optimization Impact
- **Defer Analytics**: Improved FCP and LCP scores
- **RequestIdleCallback**: Better main thread utilization
- **Fetchpriority**: Optimized resource loading order

## Performance Benchmarks

### Target Scores (Lighthouse)
- **Performance**: 90+ (green)
- **Accessibility**: 95+ (green)
- **Best Practices**: 90+ (green)
- **SEO**: 95+ (green)

### Core Web Vitals Targets
- **LCP**: < 2.0s (excellent)
- **FID**: < 50ms (excellent)
- **CLS**: < 0.05 (excellent)

## Testing Results Documentation

### Test Environment
- Browser: Chrome [version]
- Device: [device specs]
- Network: [connection type]
- Date: [test date]

### Before Optimization
- Performance Score: [score]
- LCP: [time]
- FID: [time]
- CLS: [score]

### After Optimization
- Performance Score: [score]
- LCP: [time]
- FID: [time]
- CLS: [score]

### Improvement Summary
- Performance Score: +[difference]
- LCP: -[time saved]
- FID: -[time saved]
- CLS: -[score improvement]

## Troubleshooting

### Common Issues
1. **High CLS**: Check font loading and image dimensions
2. **Poor LCP**: Verify image preloading and resource priorities
3. **Slow FCP**: Check for render-blocking resources
4. **Analytics Errors**: Verify consent management and script loading

### Debug Commands
```javascript
// Check if analytics loaded
console.log('GA4:', typeof gtag);
console.log('Clarity:', typeof clarity);

// Check resource hints
document.querySelectorAll('link[rel="dns-prefetch"]');
document.querySelectorAll('link[rel="preconnect"]');
document.querySelectorAll('link[rel="preload"]');
```

## Continuous Monitoring

### Automated Testing
- Set up Lighthouse CI for continuous performance monitoring
- Monitor Core Web Vitals in production
- Track performance regressions in CI/CD pipeline

### Production Monitoring
- Use Google PageSpeed Insights for real-world data
- Monitor Core Web Vitals in Google Search Console
- Set up performance budgets and alerts