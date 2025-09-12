# Campaign System Testing Guide

This guide provides comprehensive instructions for testing the campaign system using Chrome DevTools and other browser tools.

## Prerequisites

1. **Development Environment**: Ensure the site is running locally (`npm run dev`)
2. **Chrome DevTools**: Use Chrome browser with DevTools open
3. **GA4 DebugView**: If GA4 is configured, have DebugView open in another tab
4. **Database Access**: Ensure D1 database is accessible (for server-side testing)

## 1. Testing Campaign Page Analytics

### 1.1 Basic Analytics Tracking

1. **Open Campaign Page**:
   ```
   http://localhost:4321/offers/monsoon-automation-audit
   ```

2. **Open Chrome DevTools** (F12):
   - Go to **Console** tab
   - Look for campaign analytics initialization messages

3. **Check Network Tab**:
   - Filter by "analytics" or "gtag"
   - Verify GA4 requests are being sent
   - Look for campaign-specific parameters

4. **Verify Event Firing**:
   ```javascript
   // In Console, check if gtag is available
   typeof gtag
   
   // Manually fire a test event
   gtag('event', 'test_campaign_event', {
     campaign_slug: 'monsoon-automation-audit',
     test_parameter: 'manual_test'
   });
   ```

### 1.2 UTM Parameter Capture

1. **Visit with UTM Parameters**:
   ```
   http://localhost:4321/offers/monsoon-automation-audit?utm_source=test&utm_medium=devtools&utm_campaign=testing&utm_term=automation&utm_content=hero
   ```

2. **Check Session Storage**:
   - Go to **Application** tab → **Storage** → **Session Storage**
   - Look for `campaign_utm_params` key
   - Verify UTM parameters are stored correctly

3. **Verify Parameter Persistence**:
   ```javascript
   // In Console, check stored UTM parameters
   JSON.parse(sessionStorage.getItem('campaign_utm_params'))
   
   // Check if parameters persist across page interactions
   sessionStorage.getItem('session_id')
   sessionStorage.getItem('page_views')
   ```

### 1.3 Scroll Depth Tracking

1. **Scroll Through Campaign Page**:
   - Scroll to 25%, 50%, 75%, and 90% of page
   - Watch Console for scroll depth events

2. **Check Network Tab**:
   - Look for `campaign_scroll_depth` events
   - Verify scroll percentages are accurate

## 2. Testing Campaign Form Submissions

### 2.1 Form Interaction Tracking

1. **Focus on Form Fields**:
   - Click on email, name, company fields
   - Check Console for `campaign_form_interaction` events

2. **Submit Campaign Form**:
   - Fill out the campaign signup form
   - Submit and watch for `campaign_form_submit` events

3. **Verify Conversion Tracking**:
   ```javascript
   // Check if conversion events are fired
   // Look in Network tab for conversion-related requests
   ```

### 2.2 API Endpoint Testing

1. **Test Campaign Signup API**:
   ```javascript
   // In Console, test form submission
   const formData = new FormData();
   formData.append('name', 'Test User');
   formData.append('email', 'test@example.com');
   formData.append('campaign_slug', 'monsoon-automation-audit');
   formData.append('form_type', 'campaign-signup');
   formData.append('tracking_id', 'test_' + Date.now());
   
   fetch('/api/campaign-signup', {
     method: 'POST',
     body: formData
   }).then(r => r.json()).then(console.log);
   ```

## 3. Testing Campaign Expiration Handling

### 3.1 Expired Campaign Redirects

1. **Test Expired Campaign URL**:
   - Try accessing a campaign that should be expired
   - Verify 301 redirect to `/offers/expired`

2. **Check Redirect Headers**:
   - In Network tab, look for 301 status codes
   - Verify `Location` header points to expired page

3. **Test Expired Page Analytics**:
   ```
   http://localhost:4321/offers/expired?campaign=test-campaign&title=Test%20Campaign
   ```
   - Check for `expired_campaign_visit` events
   - Verify campaign information is displayed

### 3.2 Database Status Updates

1. **Check Campaign Status**:
   ```javascript
   // Test campaign API
   fetch('/api/campaigns?slug=monsoon-automation-audit')
     .then(r => r.json())
     .then(data => {
       console.log('Campaign status:', data.data[0]?.status);
       console.log('End date:', data.data[0]?.end_date);
     });
   ```

2. **Verify Auto-Expiration**:
   - Manually set a campaign's end_date to past date in database
   - Visit the campaign page
   - Verify automatic status update to "expired"

## 4. Testing Campaign Management API

### 4.1 CRUD Operations

1. **List Campaigns**:
   ```javascript
   fetch('/api/campaigns')
     .then(r => r.json())
     .then(console.log);
   ```

2. **Get Campaign Analytics**:
   ```javascript
   fetch('/api/campaigns?include_analytics=true&slug=monsoon-automation-audit')
     .then(r => r.json())
     .then(data => {
       console.log('Analytics:', data.data[0]?.analytics);
     });
   ```

3. **Create Test Campaign**:
   ```javascript
   fetch('/api/campaigns', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       slug: 'test-campaign-' + Date.now(),
       title: 'Test Campaign',
       description: 'Testing campaign creation',
       start_date: new Date().toISOString(),
       end_date: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
       status: 'active'
     })
   }).then(r => r.json()).then(console.log);
   ```

### 4.2 Visit Tracking

1. **Track Campaign Visit**:
   ```javascript
   const visitData = new FormData();
   visitData.append('campaign_slug', 'monsoon-automation-audit');
   visitData.append('utm_source', 'devtools-test');
   visitData.append('conversion_type', 'page_view');
   
   fetch('/api/campaign-visit', {
     method: 'POST',
     body: visitData
   }).then(r => r.json()).then(console.log);
   ```

2. **Get Visit Data**:
   ```javascript
   fetch('/api/campaign-visit?campaign=monsoon-automation-audit&limit=10')
     .then(r => r.json())
     .then(console.log);
   ```

## 5. Testing Mobile Responsiveness

### 5.1 Device Simulation

1. **Open Device Toolbar** (Ctrl+Shift+M):
   - Test iPhone, iPad, and Android devices
   - Verify campaign pages render correctly

2. **Check Touch Interactions**:
   - Test form field focus on mobile
   - Verify CTA buttons are touch-friendly
   - Check phone/email link functionality

3. **Performance Testing**:
   - Use **Lighthouse** tab in DevTools
   - Run mobile performance audit
   - Check Core Web Vitals scores

### 5.2 Mobile Analytics

1. **Test Mobile Events**:
   - Verify analytics events fire on mobile
   - Check touch-specific interactions
   - Test mobile form submissions

## 6. GA4 DebugView Testing

### 6.1 Enable Debug Mode

1. **Install GA Debugger Extension** (optional)
2. **Enable Debug Mode**:
   ```javascript
   // In Console
   gtag('config', 'GA_MEASUREMENT_ID', {
     debug_mode: true
   });
   ```

3. **Open GA4 DebugView**:
   - Go to GA4 property → Configure → DebugView
   - Filter by your device/session

### 6.2 Verify Campaign Events

1. **Check Event Stream**:
   - Look for `campaign_page_view` events
   - Verify `campaign_exposure` events
   - Check `campaign_form_submit` events

2. **Validate Parameters**:
   - Verify campaign_slug is correct
   - Check UTM parameters are captured
   - Validate custom dimensions

## 7. Performance Testing

### 7.1 Page Load Performance

1. **Network Tab Analysis**:
   - Check resource loading order
   - Verify analytics scripts load asynchronously
   - Look for any blocking resources

2. **Performance Tab**:
   - Record page load performance
   - Check for layout shifts
   - Verify smooth scrolling

3. **Lighthouse Audit**:
   - Run full Lighthouse audit
   - Focus on Performance and SEO scores
   - Check for accessibility issues

### 7.2 Database Performance

1. **API Response Times**:
   - Monitor campaign API response times
   - Check database query performance
   - Verify caching effectiveness

## 8. Error Handling Testing

### 8.1 Network Failures

1. **Simulate Offline**:
   - Use Network tab → Offline
   - Verify graceful degradation
   - Check error handling

2. **API Failures**:
   - Test with invalid campaign slugs
   - Verify 404 handling
   - Check error messages

### 8.2 JavaScript Errors

1. **Console Error Monitoring**:
   - Watch for JavaScript errors
   - Verify analytics still work with errors
   - Check fallback mechanisms

## 9. Cross-Browser Testing

### 9.1 Browser Compatibility

1. **Test in Multiple Browsers**:
   - Chrome, Firefox, Safari, Edge
   - Verify analytics work across browsers
   - Check form functionality

2. **Feature Detection**:
   - Test with JavaScript disabled
   - Verify progressive enhancement
   - Check fallback experiences

## 10. Automated Testing

### 10.1 Run Test Script

```bash
# Run the automated test script
node scripts/tests/test-campaign-system.js
```

### 10.2 Continuous Monitoring

1. **Set up monitoring for**:
   - Campaign page load times
   - Analytics event success rates
   - API endpoint availability
   - Database performance

## Troubleshooting Common Issues

### Analytics Not Firing
- Check if gtag is loaded: `typeof gtag`
- Verify GA4 measurement ID is correct
- Check network requests in DevTools
- Ensure no ad blockers are interfering

### UTM Parameters Not Captured
- Check sessionStorage for `campaign_utm_params`
- Verify URL parameters are correctly formatted
- Check JavaScript console for errors

### Campaign Redirects Not Working
- Verify campaign status in database
- Check server-side rendering is enabled
- Verify redirect logic in campaign page

### Form Submissions Failing
- Check API endpoint responses
- Verify CSRF protection (if enabled)
- Check form validation logic
- Verify database connectivity

## Best Practices

1. **Always test with real UTM parameters**
2. **Use incognito mode to avoid cached data**
3. **Test both desktop and mobile experiences**
4. **Verify analytics in GA4 DebugView when possible**
5. **Check database changes after API calls**
6. **Test error scenarios and edge cases**
7. **Monitor performance impact of analytics**
8. **Validate schema markup with Google tools**

This comprehensive testing approach ensures the campaign system works correctly across all scenarios and provides reliable analytics data for campaign optimization.