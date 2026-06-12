# API Responses Regression Baseline

This document lists the baseline status and response bodies for all audited API routes run against the local D1 database prior to upgrading.

## Endpoint Test Results

### 1. POST `/api/newsletter`
- **Method:** `POST`
- **Status:** `200 OK`
- **Response Body:**
  ```json
  {"message":"Submitted successfully"}
  ```

### 2. POST `/api/leadform`
- **Method:** `POST`
- **Status:** `200 OK`
- **Response Body:**
  ```json
  {"message":"Submitted successfully"}
  ```

### 3. POST `/api/resource-download`
- **Method:** `POST`
- **Status:** `500 Internal Server Error` (Known issue in baseline)
- **Response Body:** *(Empty)*
- **Console/Wrangler Error:**
  ```
  Resource download API error: TypeError: Invalid URL: /api/serve-resource
  ```
  *Note:* Relative fetches inside Cloudflare Workers environment throw a `TypeError: Invalid URL`. Needs to be instantiated with `new URL('/api/serve-resource', request.url)`.

### 4. GET `/api/resource-download`
- **Method:** `GET`
- **Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "totalDownloads": 1,
      "uniqueUsers": 1,
      "resourceBreakdown": [
        {
          "resource_name": "automation-guide",
          "download_count": 1
        }
      ],
      "recentDownloads": [
        {
          "email": "test@example.com",
          "name": "Alok",
          "resource_name": "automation-guide",
          "download_timestamp": "2026-06-12 22:19:04"
        }
      ]
    }
  }
  ```

### 5. POST `/api/serve-resource`
- **Method:** `POST`
- **Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "success": true,
    "downloadUrl": "/api/serve-resource?token=eyJkb3dubG9hZElkIjoxLCJyZXNvdXJjZU5hbWUiOiJhdXRvbWF0aW9uLWd1aWRlIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwidGltZXN0YW1wIjoxNzgxMzAyNzc0NzkyLCJhdHRlbXB0cyI6MH0%3D.fefwpn&resource=automation-guide",
    "expiresIn": 1800,
    "maxAttempts": 3
  }
  ```

### 6. POST `/api/campaigns`
- **Method:** `POST`
- **Status:** `409 Conflict` (Or `201 Created` on first run)
- **Response Body:** *(Empty)*
- **Description:** Returns `409 Conflict` when trying to register a campaign that already exists.

### 7. GET `/api/campaigns`
- **Method:** `GET`
- **Status:** `200 OK`
- **Query Params:** `slug=test-campaign`
- **Response Body:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "slug": "test-campaign",
        "title": "Updated Campaign Title",
        "description": null,
        "start_date": "2026-06-01T00:00:00Z",
        "end_date": null,
        "status": "active",
        "created_at": "2026-06-12 22:19:04",
        "updated_at": "2026-06-12 22:19:04"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 50,
      "offset": 0,
      "has_more": false
    }
  }
  ```

### 8. PUT `/api/campaigns`
- **Method:** `PUT`
- **Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "slug": "test-campaign",
      "title": "Updated Campaign Title",
      "description": null,
      "start_date": "2026-06-01T00:00:00Z",
      "end_date": null,
      "status": "active",
      "created_at": "2026-06-12 22:19:04",
      "updated_at": "2026-06-12 22:19:04"
    },
    "message": "No changes detected"
  }
  ```

### 9. POST `/api/campaign-visit`
- **Method:** `POST`
- **Status:** `500 Internal Server Error` (Known issue in baseline)
- **Response Body:** *(Empty)*
- **Console/Wrangler Error:**
  ```
  D1_TYPE_ERROR: Type 'undefined' not supported for value 'undefined'
  ```
  *Note:* Cloudflare D1 driver does not support binding `undefined` variables in query parameters. Any optional UTM/visit params that are not supplied must be converted to `null` or a default value before calling `.bind()`.

### 10. GET `/api/campaign-visit`
- **Method:** `GET`
- **Status:** `200 OK`
- **Query Params:** `campaign=test-campaign`
- **Response Body:**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 2,
        "campaign_id": 1,
        "visit_timestamp": "2026-06-12 22:19:13",
        "ip_address": null,
        "user_agent": "Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.8521",
        "referrer": null,
        "utm_source": null,
        "utm_medium": null,
        "utm_campaign": null,
        "utm_term": null,
        "utm_content": null,
        "session_id": null,
        "user_id": "test@example.com",
        "conversion_type": "form_submit",
        "conversion_value": 1,
        "campaign_slug": "test-campaign",
        "campaign_title": "Updated Campaign Title"
      }
    ],
    "pagination": {
      "total": 2,
      "limit": 100,
      "offset": 0,
      "has_more": false
    }
  }
  ```

### 11. POST `/api/campaign-signup`
- **Method:** `POST`
- **Status:** `200 OK`
- **Response Body:**
  ```json
  {
    "success": true,
    "message": "You're all set!",
    "next_steps": "Check your email for next steps and additional resources.",
    "tracking_id": "track-123",
    "visit_id": 3
  }
  ```
