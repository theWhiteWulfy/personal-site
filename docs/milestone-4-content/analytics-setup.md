# Analytics Setup Guide

## Overview
This document explains how to configure Google Analytics 4 (GA4) and Microsoft Clarity tracking for the IndieWeb engagement system.

1. Replace placeholder tracking IDs in src/config/site.js
2. Test the implementation in development mode
3. Verify analytics events in GA4 and Clarity dashboards
4. Test consent management and opt-out functionality

## Configuration

### 1. Update Tracking IDs
Edit `src/config/site.js` and replace the placeholder values:

```javascript
// Analytics Configuration
ga4MeasurementId: 'G-XXXXXXXXXX', // Replace with your actual GA4 measurement ID
clarityProjectId: 'XXXXXXXXXX',   // Replace with your actual Clarity project ID
```

### 2. Privacy Settings
The following privacy settings are already configured:

- `enableAnalytics: true` - Enable/disable all analytics
- `requireCookieConsent: true` - Require user consent before tracking
- `anonymizeIp: true` - Anonymize IP addresses in GA4
- `privacyMode: true` - Enable privacy-compliant mode
- `optOutCookieName: 'analytics_opt_out'` - Cookie name for opt-out preference

## Features Implemented

### Google Analytics 4 (GA4)
- ✅ Automatic page view tracking
- ✅ Enhanced measurement (scrolls, outbound clicks, site search)
- ✅ Custom engagement event tracking
- ✅ Conversion event tracking
- ✅ Privacy-compliant consent management
- ✅ IP anonymization
- ✅ Cookie consent integration

### Microsoft Clarity
- ✅ Session recording and heatmaps
- ✅ Custom event tracking
- ✅ Privacy-compliant initialization
- ✅ Cookie consent integration

### Event Tracking
The following events are automatically tracked:

#### Content Events
- `content_view` - When users view content pages
- `newsletter_signup` - When users subscribe to newsletter
- `contact_form_submit` - When users submit contact form
- `content_share` - When users share content
- `micropub_create` - When content is created via Micropub

#### Conversion Events
- `phone_click` - When users click phone number links
- `email_click` - When users click email links
- `contact_form_submit` - When users submit contact forms
- `newsletter_signup` - When users sign up for newsletter

### Privacy Features
- ✅ Cookie consent management
- ✅ Opt-out functionality
- ✅ GDPR compliance
- ✅ Conditional loading based on consent
- ✅ Secure cookie settings (SameSite=Strict)

## Usage

### Client-Side Functions
The following functions are available globally:

```javascript
// Track custom engagement events
window.trackEngagementEvent('custom_event', {
  content_id: 'article-123',
  content_type: 'article',
  engagement_type: 'custom'
});

// Track conversion events
window.trackConversionEvent('custom_conversion', {
  conversion_type: 'custom',
  value: 10
});

// Manage consent
window.setAnalyticsConsent(true);  // Grant consent
window.setOptOutPreference(false); // Opt back in
```

### Automatic Tracking
The following are tracked automatically:
- Phone number clicks (`tel:` links)
- Email clicks (`mailto:` links)
- Page views and navigation
- Enhanced measurement events (GA4)

## Testing

### Development Testing
1. Start development server: `npm run dev`
2. Open browser developer tools
3. Check console for analytics initialization messages
4. Test event tracking by interacting with elements

### Production Testing
1. Deploy to staging/production
2. Verify GA4 real-time reports
3. Check Clarity dashboard for session recordings
4. Test consent management functionality

## Troubleshooting

### Common Issues
1. **Analytics not loading**: Check tracking IDs in site.js
2. **Events not tracking**: Verify consent has been granted
3. **Console errors**: Check browser developer tools for details

### Debug Mode
Enable debug mode by setting:
```javascript
// In browser console
localStorage.setItem('analytics_debug', 'true');
```

## Compliance Notes
- All tracking respects user consent preferences
- IP addresses are anonymized in GA4
- Cookies use secure settings (SameSite=Strict)
- Users can opt out at any time
- No personal data is collected without consent