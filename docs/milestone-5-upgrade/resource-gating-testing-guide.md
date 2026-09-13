# Resource Gating System Testing Guide

This guide provides comprehensive testing procedures for the resource gating system using Chrome DevTools and automated testing scripts.

## Prerequisites

1. **Development Environment Setup**
   ```bash
   npm run dev  # Start Astro development server
   ```

2. **Database Setup**
   ```bash
   # Apply database migrations
   node scripts/migrate-database.js --local
   ```

3. **Chrome DevTools**
   - Chrome browser with DevTools
   - GA4 DebugView extension (optional)

## Automated Testing

### Run Test Suite
```bash
# Run comprehensive test suite
node scripts/tests/test-resource-gating.js
```

### Test Components
- Database connectivity and table structure
- API endpoint validation
- Form validation and sanitization
- Rate limiting and spam protection
- PDF delivery system
- Analytics event tracking

## Manual Testing with Chrome DevTools

### 1. Network Tab Testing

#### Form Submission Flow
1. **Open DevTools**: Press F12 or right-click → Inspect
2. **Navigate to Network Tab**
3. **Visit Resource Page**: Go to `/resources/automation-guide/`
4. **Fill Form**: Complete the resource download form
5. **Submit Form**: Click "Download Now"

#### Expected Network Requests
```
POST /api/resource-download
Status: 200 OK
Content-Type: application/json

Response Body:
{
  "success": true,
  "message": "Form submitted successfully",
  "downloadUrl": "/api/serve-resource?token=eyJ...&resource=automation-guide"
}
```

#### PDF Download Verification
1. **Click Download Link**: From form success message
2. **Check Network Request**:
   ```
   GET /api/serve-resource?token=...&resource=automation-guide
   Status: 200 OK
   Content-Type: application/pdf
   Content-Disposition: attachment; filename="automation-guide.pdf"
   ```

### 2. Console Tab Testing

#### Analytics Event Tracking
1. **Open Console Tab**
2. **Submit Resource Form**
3. **Verify Console Messages**:
   ```javascript
   // Expected console outputs
   "Resource page view tracked: {resourceName: 'automation-guide', ...}"
   "Resource form submission tracked: {event_name: 'form_submit', ...}"
   "Resource download tracked: {event_name: 'resource_download', ...}"
   "Lead conversion tracked: {event_name: 'conversion', ...}"
   ```

#### Error Handling Testing
1. **Submit Invalid Data**: Use invalid email format
2. **Check Error Messages**: Verify validation errors appear
3. **Test Rate Limiting**: Submit multiple requests quickly

### 3. Application Tab Testing

#### Local Storage Inspection
1. **Go to Application Tab** → Local Storage
2. **Check Storage Items**:
   - `resource_session_id`: Session tracking data
   - `analytics_logs`: Debug analytics events (development only)

#### Session Management
```javascript
// Check session data structure
{
  "sessionId": "session_1234567890_abc123",
  "timestamp": 1234567890123
}
```

### 4. Security Testing

#### Honeypot Field Testing
1. **Open Console**
2. **Fill Honeypot Field**:
   ```javascript
   document.querySelector('input[name="website"]').value = 'spam-content';
   ```
3. **Submit Form**: Should be blocked with 429 status
4. **Verify Response**:
   ```json
   {
     "success": false,
     "error": "Bot detected via honeypot",
     "retryAfter": 900
   }
   ```

#### Token Security Testing
1. **Get Valid Download URL**: From successful form submission
2. **Modify Token Parameter**: Change token value
3. **Access Modified URL**: Should return 401 Unauthorized
4. **Test Expired Token**: Wait 30+ minutes and retry

### 5. Performance Testing

#### Lighthouse Audit
1. **Open Lighthouse Tab** in DevTools
2. **Run Performance Audit** on resource page
3. **Target Scores**:
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 90
   - SEO: > 95

#### Core Web Vitals
1. **Performance Tab** → Core Web Vitals
2. **Target Metrics**:
   - LCP (Largest Contentful Paint): < 2.5s
   - FID (First Input Delay): < 100ms
   - CLS (Cumulative Layout Shift): < 0.1

### 6. Mobile Responsiveness Testing

#### Device Simulation
1. **Click Device Toolbar Icon** (mobile icon)
2. **Select Device**: iPhone 12, iPad, etc.
3. **Test Form Usability**:
   - Form fields are easily tappable
   - Text is readable without zooming
   - Form validation works on mobile
   - Download process works on mobile

### 7. Analytics Validation

#### GA4 DebugView Testing
1. **Install GA4 DebugView Extension**
2. **Enable Debug Mode**
3. **Submit Resource Form**
4. **Verify Events in DebugView**:

##### Expected Events
```javascript
// Page View Event
{
  event_name: 'page_view',
  page_title: 'Resource: Complete Business Automation Guide',
  content_group1: 'resource_page',
  resource_name: 'automation-guide'
}

// Form Start Event
{
  event_name: 'begin_checkout',
  content_group1: 'resource_download',
  resource_name: 'automation-guide'
}

// Form Submission Event
{
  event_name: 'form_submit',
  form_id: 'resource_download_form',
  resource_name: 'automation-guide',
  value: 25
}

// Download Complete Event
{
  event_name: 'resource_download',
  resource_name: 'automation-guide',
  download_method: 'form_submission'
}

// Lead Generation Event
{
  event_name: 'generate_lead',
  value: 25,
  currency: 'USD',
  resource_name: 'automation-guide'
}
```

## Database Testing

### Verify Data Storage
```sql
-- Check resource downloads
SELECT * FROM resource_downloads ORDER BY download_timestamp DESC LIMIT 10;

-- Check analytics events
SELECT * FROM analytics_events ORDER BY timestamp DESC LIMIT 10;

-- Verify indexes
.schema resource_downloads
.schema analytics_events
```

### Test Queries
```bash
# Local database testing
npx wrangler d1 execute meteoric --local --command="SELECT COUNT(*) as total_downloads FROM resource_downloads"

npx wrangler d1 execute meteoric --local --command="SELECT resource_name, COUNT(*) as downloads FROM resource_downloads GROUP BY resource_name"
```

## Error Scenarios Testing

### 1. Validation Errors
- **Invalid Email**: `test@invalid`
- **Missing Fields**: Submit with empty required fields
- **Suspicious Content**: Include spam keywords in form fields

### 2. Rate Limiting
- **IP Rate Limit**: Submit 6+ requests from same IP within 15 minutes
- **Email Rate Limit**: Submit 4+ requests with same email within 15 minutes

### 3. Security Violations
- **Honeypot Triggered**: Fill hidden form fields
- **Invalid Token**: Modify download URL token
- **Expired Token**: Use token after 30 minutes

### 4. System Errors
- **Database Unavailable**: Test with database connection issues
- **File Not Found**: Request non-existent resource
- **Network Errors**: Test with poor connectivity

## Success Criteria

### ✅ Functional Requirements
- [ ] Form validates input correctly
- [ ] Spam protection blocks malicious submissions
- [ ] Rate limiting prevents abuse
- [ ] PDF delivery works securely
- [ ] Analytics events fire correctly
- [ ] Database stores data properly

### ✅ Performance Requirements
- [ ] Page loads in < 3 seconds
- [ ] Form submission completes in < 2 seconds
- [ ] PDF download starts immediately
- [ ] Mobile experience is smooth

### ✅ Security Requirements
- [ ] Honeypot fields catch bots
- [ ] Tokens expire after 30 minutes
- [ ] Rate limiting prevents spam
- [ ] Input sanitization prevents XSS
- [ ] Download URLs are not guessable

### ✅ Analytics Requirements
- [ ] Page views tracked
- [ ] Form interactions tracked
- [ ] Download completions tracked
- [ ] Conversion events fired
- [ ] Data stored in database

## Troubleshooting

### Common Issues

#### Form Not Submitting
1. Check console for JavaScript errors
2. Verify API endpoint is running
3. Check network requests for error responses

#### Analytics Not Tracking
1. Verify GA4 configuration
2. Check console for gtag errors
3. Ensure analytics scripts are loaded

#### PDF Download Failing
1. Check token validity and expiration
2. Verify resource file exists
3. Check server logs for errors

#### Database Errors
1. Verify database migrations are applied
2. Check database connection
3. Verify table structure matches schema

### Debug Commands
```bash
# Check server logs
npm run dev

# Test database connection
npx wrangler d1 execute meteoric --local --command="SELECT 1"

# Run specific tests
node scripts/tests/test-resource-gating.js

# Check analytics events
npx wrangler d1 execute meteoric --local --command="SELECT * FROM analytics_events WHERE event_type = 'resource_form_submission'"
```

## Reporting Issues

When reporting issues, include:
1. **Browser and version**
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Console errors**
5. **Network request details**
6. **Screenshots if applicable**

This comprehensive testing ensures the resource gating system works reliably across all scenarios and provides valuable analytics data for business insights.