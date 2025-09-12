export const prerender = false; // Required for server-side rendering

import type { APIRoute, APIContext } from 'astro';
import { validateResourceForm, formatValidationErrors } from '@/lib/api/validation';
import { performSecurityChecks } from '@/lib/api/security';
import { insertResourceDownload, getDownloadStats, validateDatabaseConnection } from '@/lib/api/database';

// TypeScript interfaces for request and response data
interface ResourceDownloadRequest {
  email: string;
  name: string;
  workplace: string;
  role: string;
  resourceName: string;
}

interface ResourceDownloadResponse {
  success: boolean;
  message?: string;
  downloadUrl?: string;
  error?: string;
  retryAfter?: number;
  validationErrors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

interface DownloadStatsResponse {
  success: boolean;
  data?: {
    totalDownloads: number;
    uniqueUsers: number;
    resourceBreakdown: Array<{
      resource_name: string;
      download_count: number;
    }>;
    recentDownloads: Array<{
      email: string;
      name: string;
      resource_name: string;
      download_timestamp: string;
    }>;
  };
  error?: string;
}

// POST handler for form submissions
export const POST: APIRoute = async ({ request, locals }: APIContext) => {
  try {
    // Check database configuration
    if (!locals?.runtime?.env?.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not configured'
      } as ResourceDownloadResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { DB } = locals.runtime.env;
    const formData = await request.formData();

    // Get client IP for security checks
    const clientIP = request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      'unknown';
    const userAgent = request.headers.get('User-Agent') || 'unknown';

    // Perform security checks (rate limiting, spam detection, honeypot)
    const securityCheck = await performSecurityChecks(DB, formData, clientIP);
    if (!securityCheck.allowed) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Request blocked for security reasons',
        error: securityCheck.reason || 'Request blocked for security reasons',
        retryAfter: securityCheck.retryAfter
      } as ResourceDownloadResponse), {
        status: 429, // Too Many Requests
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': securityCheck.retryAfter?.toString() || '900'
        }
      });
    }

    // Validate and sanitize form data
    const validationResult = validateResourceForm(formData);

    if (!validationResult.isValid) {
      return new Response(JSON.stringify({
        success: false,
        error: formatValidationErrors(validationResult.errors),
        validationErrors: validationResult.errors
      } as ResourceDownloadResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use sanitized data
    const { email, name, workplace, role, resourceName } = validationResult.sanitizedData!;

    // Insert download record into database with duplicate prevention
    const insertResult = await insertResourceDownload(DB, {
      email,
      name,
      workplace,
      role,
      resource_name: resourceName,
      ip_address: clientIP,
      user_agent: userAgent
    });

    // Log analytics event to database
    try {
      const analyticsQuery = `
        INSERT INTO analytics_events 
        (event_type, event_data, user_email, ip_address, user_agent, timestamp) 
        VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP)
      `;

      const eventData = JSON.stringify({
        resource_name: resourceName,
        form_submission: true,
        download_id: insertResult.id,
        is_duplicate: insertResult.isDuplicate
      });

      await DB.prepare(analyticsQuery)
        .bind('resource_form_submission', eventData, email, clientIP, userAgent)
        .run();
    } catch (analyticsError) {
      // Don't fail the main request if analytics logging fails
      console.error('Analytics logging failed:', analyticsError);
    }

    if (!insertResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to process download request'
      } as ResourceDownloadResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate secure download token
    const tokenResponse = await fetch('/api/serve-resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        downloadId: insertResult.id,
        resourceName,
        email
      })
    });

    let downloadUrl = null;
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      downloadUrl = tokenData.downloadUrl;
    }

    const message = insertResult.isDuplicate
      ? 'You have already downloaded this resource recently. Here is your download link.'
      : 'Form submitted successfully';

    return new Response(JSON.stringify({
      success: true,
      message,
      downloadUrl
    } as ResourceDownloadResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Resource download API error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    } as ResourceDownloadResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// GET handler for retrieving download statistics (admin use)
export const GET: APIRoute = async ({ url, locals }: APIContext) => {
  try {
    // Check database configuration
    if (!locals?.runtime?.env?.DB) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database not configured'
      } as DownloadStatsResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { DB } = locals.runtime.env;

    // Validate database connection
    try {
      validateDatabaseConnection(DB);
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Database connection failed'
      } as DownloadStatsResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const resourceFilter = searchParams.get('resource') || undefined;

    // Parse date range if provided
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const dateRange = (startDate && endDate) ? { start: startDate, end: endDate } : undefined;

    // Get download statistics using database utility
    const stats = await getDownloadStats(DB, {
      limit,
      resourceFilter,
      dateRange
    });

    return new Response(JSON.stringify({
      success: true,
      data: stats
    } as DownloadStatsResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Resource stats API error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    } as DownloadStatsResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};