# Analytics Testing Guide

This guide provides comprehensive instructions for testing the Google Analytics 4 and Microsoft Clarity integration using Chrome DevTools.

## Prerequisites

1. **Chrome DevTools**: Open Chrome DevTools (F12 or Ctrl+Shift+I)
2. **GA4 Account**: Access to Google Analytics 4 account with DebugView enabled
3. **Clarity Account**: Access to Microsoft Clarity dashboard
4. **Development Environment**: Local development server running

## Testing Checklist

### 1. Initial Setup Verification

#### Check Script Loading
1. Open **Network** tab in DevTools
2. Reload the page
3. Filter by "google" or "clarity"
4. Verify these requests are successful:
   - `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`
   - `https://www.clarity.ms/tag/XXXXXXXXXX`

#### Check Console for Errors
1. Open **Console** tab
2. Look for any analytics-related errors
3. Verify these functions are available:
   - `window.gtag`
   - `window.clarity`
   - `window.dataLayer`

### 2. GA4 Integration Testing

#### Using Chrome DevTools Console
```javascript
// Test GA4 availability
console.log('GA4 gtag available:', typeof window.gtag === 'function');
console.log('dataLayer available:', Array.isArray(window.dataLayer));
console.log('dataLayer entries:', window.dataLayer.length);

// Test event firing
window.gtag('event', 'test_event', {
  event_category: 'debug',
  event_label: 'manual_test',
  value: 1
});
```

#### Using GA4 DebugView
1. Go to Google Analytics 4 dashboard
2. Navigate to **Configure** > **DebugView**
3. Events should appear in real-time when fired
4. Test events by:
   - Clicking phone numbers
   - Clicking email links
   - Submitting forms
   - Downloading resources

#### Network Tab Verification
1. Filter Network tab by "google-analytics" or "collect"
2. Verify measurement protocol requests are sent
3. Check request parameters include:
   - `tid` (tracking ID)
   - `t` (hit type)
   - `ec` (event category)
   - `ea` (event action)

### 3. Microsoft Clarity Testing

#### Console Verification
```javascript
// Test Clarity availability
console.log('Clarity available:', typeof window.clarity === 'function');

// Test event firing
window.clarity('event', 'test_event', {
  test_type: 'manual_verification',
  timestamp: new Date().toISOString()
});
```

#### Network Tab Verification
1. Filter Network tab by "clarity"
2. Verify requests to `clarity.ms` domain
3. Check for successful response codes (200)

#### Clarity Dashboard
1. Go to Microsoft Clarity dashboard
2. Check **Live** section for real-time sessions
3. Verify recordings are being captured
4. Check heatmaps are generating data

### 4. Event Tracking Testing

#### Phone Click Tracking
```javascript
// Manual test
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
  link.click(); // This will trigger tracking
});

// Check if events are fired
window.trackConversionEvent('phone_click', {
  conversion_type: 'phone_contact',
  phone_number: '+1234567890',
  value: 10
});
```

#### Email Click Tracking
```javascript
// Manual test
document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
  link.click(); // This will trigger tracking
});

// Check if events are fired
window.trackConversionEvent('email_click', {
  conversion_type: 'email_contact',
  email_address: 'test@example.com',
  value: 8
});
```

#### Form Submission Tracking
```javascript
// Test form tracking
window.trackConversionEvent('form_submit', {
  form_type: 'contact',
  form_location: 'contact_page',
  success: true,
  value: 25
});
```

### 5. Privacy Compliance Testing

#### Consent Management
```javascript
// Check privacy manager
console.log('Privacy manager:', window.privacyManager);
console.log('Has consent:', window.privacyManager?.hasConsent());
console.log('Has opted out:', window.privacyManager?.hasOptedOut());

// Test consent changes
window.privacyManager?.setConsent(true, false, true);
window.privacyManager?.setOptOut(false);
```

#### Cookie Verification
1. Open **Application** tab in DevTools
2. Navigate to **Cookies** section
3. Check for consent-related cookies:
   - `meteoric_analytics_consent`
   - `analytics_consent`

#### Local Storage Check
1. Open **Application** tab
2. Navigate to **Local Storage**
3. Verify consent data is stored properly

#### Do Not Track Testing
1. Enable "Do Not Track" in browser settings
2. Reload page
3. Verify analytics are disabled
4. Check console for opt-out messages

### 6. Performance Impact Testing

#### Lighthouse Audit
1. Open **Lighthouse** tab in DevTools
2. Run performance audit
3. Check impact on Core Web Vitals:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)

#### Network Performance
1. Check **Network** tab for:
   - Script loading times
   - Total payload size
   - Number of requests
2. Verify scripts load asynchronously
3. Check for any blocking resources

### 7. Automated Testing with Debug Console

#### Run Full Test Suite
```javascript
// Available in development mode
analyticsDebugger.runFullTestSuite();
```

#### Individual Tests
```javascript
analyticsDebugger.testGA4Integration();
analyticsDebugger.testClarityIntegration();
analyticsDebugger.testPhoneClickTracking();
analyticsDebugger.testEmailClickTracking();
analyticsDebugger.testFormTracking();
analyticsDebugger.testPrivacyCompliance();
```

## Common Issues and Troubleshooting

### GA4 Not Loading
- **Check measurement ID**: Ensure it's not the placeholder `G-XXXXXXXXXX`
- **Check network requests**: Verify gtag.js loads successfully
- **Check console errors**: Look for JavaScript errors preventing initialization

### Events Not Firing
- **Check consent status**: Ensure user has given analytics consent
- **Check opt-out status**: Verify user hasn't opted out
- **Check function availability**: Ensure `window.gtag` is available
- **Check network tab**: Verify measurement protocol requests are sent

### Clarity Not Working
- **Check project ID**: Ensure it's not the placeholder `XXXXXXXXXX`
- **Check network requests**: Verify clarity.ms requests are successful
- **Check console**: Look for Clarity-related errors

### Privacy Issues
- **Check Do Not Track**: Verify handling of DNT header
- **Check consent flow**: Test consent banner and preferences
- **Check cookie settings**: Verify proper cookie handling

## Testing Checklist Summary

- [ ] GA4 scripts load successfully
- [ ] Microsoft Clarity loads successfully
- [ ] Phone click tracking works
- [ ] Email click tracking works
- [ ] Form submission tracking works
- [ ] Privacy consent system works
- [ ] Opt-out mechanism works
- [ ] Do Not Track is respected
- [ ] Events appear in GA4 DebugView
- [ ] Events appear in Clarity dashboard
- [ ] Performance impact is minimal
- [ ] No console errors
- [ ] All network requests successful

## Real-Time Monitoring

### GA4 DebugView
1. Go to GA4 property
2. Navigate to Configure > DebugView
3. Select your debug device/session
4. Monitor events in real-time

### Clarity Live Sessions
1. Go to Clarity dashboard
2. Navigate to Live section
3. Find your session
4. Watch real-time user interactions

### Browser Console Monitoring
```javascript
// Monitor all analytics events
window.addEventListener('analytics:event', (event) => {
  console.log('Analytics event:', event.detail);
});

// Monitor consent changes
window.addEventListener('analytics:consent-changed', (event) => {
  console.log('Consent changed:', event.detail);
});
```

## Validation Tools

### External Validation
- **Google Tag Assistant**: Chrome extension for GA4 validation
- **GA4 Measurement Protocol Validator**: Validate measurement protocol requests
- **Facebook Debugger**: Test Open Graph tags (if using social sharing)
- **Twitter Card Validator**: Test Twitter cards

### Performance Tools
- **PageSpeed Insights**: Google's performance testing tool
- **GTmetrix**: Performance analysis with recommendations
- **WebPageTest**: Detailed performance analysis

This comprehensive testing approach ensures that your analytics implementation is working correctly, respecting user privacy, and not negatively impacting site performance.