export const prerender = false; // Required for server-side rendering

import type { APIRoute, APIContext } from 'astro';
import { validateDatabaseConnection, getDownloadById, getDatabase } from '@/lib/api/database';

// Token configuration
const TOKEN_EXPIRY_MINUTES = 30; // Tokens expire after 30 minutes
const MAX_DOWNLOAD_ATTEMPTS = 3; // Maximum download attempts per token

interface AccessToken {
  downloadId: number;
  resourceName: string;
  email: string;
  timestamp: number;
  attempts: number;
}

interface ResourceFile {
  name: string;
  path: string;
  mimeType: string;
  size?: number;
}

// Available resources mapping (in production, this could be in a database)
const AVAILABLE_RESOURCES: Record<string, ResourceFile> = {
  'automation-guide': {
    name: 'Complete Automation Guide',
    path: '/resources/pdfs/automation-guide.pdf',
    mimeType: 'application/pdf'
  },
  'whitelabel-checklist': {
    name: 'Whitelabel Solutions Checklist',
    path: '/resources/pdfs/whitelabel-checklist.pdf',
    mimeType: 'application/pdf'
  },
  'ai-integration-playbook': {
    name: 'AI Integration Playbook',
    path: '/resources/pdfs/ai-integration-playbook.pdf',
    mimeType: 'application/pdf'
  }
};

/**
 * Encode bytes as base64
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decode base64 to bytes
 */
function base64ToBytes(encoded: string): Uint8Array {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Import the signing secret as an HMAC-SHA256 key
 */
function importSigningKey(secret: string, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usages
  );
}

/**
 * Sign payload with HMAC-SHA256
 */
async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await importSigningKey(secret, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return bytesToBase64(new Uint8Array(signature));
}

/**
 * Verify payload HMAC-SHA256 signature
 */
async function verifyPayloadSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const key = await importSigningKey(secret, ['verify']);
    return await crypto.subtle.verify('HMAC', key, base64ToBytes(signature), new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

/**
 * Generate secure access token
 */
async function generateAccessToken(downloadId: number, resourceName: string, email: string, secret: string): Promise<string> {
  const tokenData: AccessToken = {
    downloadId,
    resourceName,
    email,
    timestamp: Date.now(),
    attempts: 0
  };

  const payload = JSON.stringify(tokenData);
  const signature = await signPayload(payload, secret);
  const token = bytesToBase64(new TextEncoder().encode(payload)) + '.' + signature;

  return token;
}

/**
 * Validate and decode access token
 */
async function validateAccessToken(token: string, secret: string): Promise<AccessToken | null> {
  try {
    const [encodedPayload, signature] = token.split('.');

    if (!encodedPayload || !signature) {
      return null;
    }

    const payload = new TextDecoder().decode(base64ToBytes(encodedPayload));

    // Verify signature
    const isValid = await verifyPayloadSignature(payload, signature, secret);
    if (!isValid) {
      return null;
    }

    const tokenData: AccessToken = JSON.parse(payload);

    // Check expiry
    const now = Date.now();
    const tokenAge = now - tokenData.timestamp;
    const maxAge = TOKEN_EXPIRY_MINUTES * 60 * 1000;

    if (tokenAge > maxAge) {
      return null; // Token expired
    }

    // Check download attempts
    if (tokenData.attempts >= MAX_DOWNLOAD_ATTEMPTS) {
      return null; // Too many attempts
    }

    return tokenData;

  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

/**
 * Get file from public directory or external storage
 */
async function getResourceFile(resourcePath: string): Promise<Response | null> {
  try {
    // In a real implementation, you might fetch from:
    // - Cloudflare R2
    // - AWS S3
    // - Local file system
    // - Database blob storage
    
    // For now, we'll simulate file serving
    // In production, you would read the actual file
    const mockPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Sample Resource PDF) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;

    return new Response(mockPdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resourcePath.split('/').pop()}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('File retrieval error:', error);
    return null;
  }
}

// GET handler for secure PDF serving
export const GET: APIRoute = async ({ url, locals }: APIContext) => {
  try {
    const dbCheck = getDatabase(locals);
    if (dbCheck.errorResponse) return dbCheck.errorResponse;
    const DB = dbCheck.DB;
    
    // Validate database connection
    try {
      validateDatabaseConnection(DB);
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Service temporarily unavailable'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const searchParams = url.searchParams;
    const token = searchParams.get('token');
    const resourceName = searchParams.get('resource');

    if (!token || !resourceName) {
      return new Response(JSON.stringify({
        error: 'Invalid request parameters'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the token signing secret (required for all token operations)
    const signingSecret = locals.runtime?.env?.RESOURCE_SIGNING_SECRET;
    if (!signingSecret) {
      return new Response(JSON.stringify({
        error: 'Service temporarily unavailable'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate access token
    const tokenData = await validateAccessToken(token, signingSecret);
    if (!tokenData) {
      return new Response(JSON.stringify({
        error: 'Invalid or expired access token'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify token matches requested resource
    if (tokenData.resourceName !== resourceName) {
      return new Response(JSON.stringify({
        error: 'Token does not match requested resource'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify download record exists in database
    const downloadRecord = await getDownloadById(DB, tokenData.downloadId);
    if (!downloadRecord) {
      return new Response(JSON.stringify({
        error: 'Download record not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify email matches
    if (downloadRecord.email !== tokenData.email) {
      return new Response(JSON.stringify({
        error: 'Access denied'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if resource exists
    const resourceFile = AVAILABLE_RESOURCES[resourceName];
    if (!resourceFile) {
      return new Response(JSON.stringify({
        error: 'Resource not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Increment download attempts
    const newAttempts = tokenData.attempts + 1;
    
    // Get and serve the file
    const fileResponse = await getResourceFile(resourceFile.path);
    if (!fileResponse) {
      return new Response(JSON.stringify({
        error: 'Resource temporarily unavailable'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log the download attempt and analytics event
    console.log(`Resource download: ${resourceName} by ${tokenData.email} (attempt ${newAttempts})`);
    
    // Log analytics event to database
    try {
      const analyticsQuery = `
        INSERT INTO analytics_events 
        (event_type, event_data, user_email, ip_address, user_agent, timestamp) 
        VALUES (?1, ?2, ?3, ?4, ?5, CURRENT_TIMESTAMP)
      `;
      
      const clientIP = 'unknown'; // IP not available in GET context
      const userAgent = 'unknown'; // User agent not available in GET context
      
      const eventData = JSON.stringify({
        resource_name: resourceName,
        download_id: tokenData.downloadId,
        attempt_number: newAttempts,
        token_used: true
      });
      
      await DB.prepare(analyticsQuery)
        .bind('resource_download_complete', eventData, tokenData.email, clientIP, userAgent)
        .run();
    } catch (analyticsError) {
      // Don't fail the download if analytics logging fails
      console.error('Analytics logging failed:', analyticsError);
    }

    return fileResponse;

  } catch (error) {
    console.error('Resource serving error:', error);
    
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// POST handler for generating download tokens
export const POST: APIRoute = async ({ request, locals }: APIContext) => {
  try {
    const dbCheck = getDatabase(locals);
    if (dbCheck.errorResponse) return dbCheck.errorResponse;
    const DB = dbCheck.DB;
    const requestData = await request.json();
    
    const { downloadId, resourceName, email } = requestData;

    if (!downloadId || !resourceName || !email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify download record exists
    const downloadRecord = await getDownloadById(DB, downloadId);
    if (!downloadRecord || downloadRecord.email !== email) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid download request'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the token signing secret (required for all token operations)
    const signingSecret = locals.runtime?.env?.RESOURCE_SIGNING_SECRET;
    if (!signingSecret) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Service temporarily unavailable'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate access token
    const accessToken = await generateAccessToken(downloadId, resourceName, email, signingSecret);
    
    // Generate download URL
    const downloadUrl = `/api/serve-resource?token=${encodeURIComponent(accessToken)}&resource=${encodeURIComponent(resourceName)}`;

    return new Response(JSON.stringify({
      success: true,
      downloadUrl,
      expiresIn: TOKEN_EXPIRY_MINUTES * 60, // seconds
      maxAttempts: MAX_DOWNLOAD_ATTEMPTS
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Token generation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Export token generation function for use in other modules
export { generateAccessToken, validateAccessToken };
