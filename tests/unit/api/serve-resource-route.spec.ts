/**
 * Unit tests for the /api/serve-resource route (GET + POST).
 * Covers token validation, the resource allowlist and R2-backed file serving
 * (Milestone 3, sub-tasks 3.3-3.4).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST, generateAccessToken } from '../../../src/pages/api/serve-resource';
import { createMockD1, createMockAPIContext } from '../../mocks/d1';

vi.mock('@/lib/api/database', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/database')>();
  return {
    ...actual,
    getDownloadById: vi.fn(),
    validateDatabaseConnection: vi.fn(),
  };
});

import { getDownloadById } from '@/lib/api/database';

const SECRET = 'test-signing-secret';
const EMAIL = 'test@example.com';

function makeR2Object(content: string) {
  const bytes = new TextEncoder().encode(content);
  return {
    size: bytes.length,
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    }),
  };
}

/** Hand-sign a token payload (mirrors the route's HMAC-SHA256 format). */
async function signToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const raw = JSON.stringify(payload);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw));
  const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
  return `${b64(new TextEncoder().encode(raw))}.${b64(new Uint8Array(signature))}`;
}

describe('Serve Resource API Route', () => {
  const bucket = { get: vi.fn() };
  const db = createMockD1();
  const defaultEnv = { RESOURCE_SIGNING_SECRET: SECRET, RESOURCES_BUCKET: bucket };

  let warnSpy: ReturnType<typeof vi.spyOn>;

  const makeGetContext = (query: string, env: Record<string, unknown> = defaultEnv) =>
    createMockAPIContext({
      request: new Request(`http://localhost:4321/api/serve-resource?${query}`),
      env,
    });

  const makePostContext = (body: unknown, env: Record<string, unknown> = defaultEnv) =>
    createMockAPIContext({
      request: new Request('http://localhost:4321/api/serve-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
      env,
    });

  beforeEach(() => {
    vi.clearAllMocks();
    bucket.get.mockResolvedValue(null);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(getDownloadById).mockResolvedValue({ id: 1, email: EMAIL } as any);
  });

  afterEach(() => {
    warnSpy.mockRestore();
    vi.useRealTimers();
  });

  describe('GET - Secure PDF serving', () => {
    it('should return 400 when the token parameter is missing', async () => {
      const response = await GET(makeGetContext('resource=automation-guide') as any);
      expect(response.status).toBe(400);
    });

    it('should return 400 when the resource parameter is missing', async () => {
      const response = await GET(makeGetContext('token=abc') as any);
      expect(response.status).toBe(400);
    });

    it('should return 400 for a resource name outside the allowlist', async () => {
      const response = await GET(makeGetContext('token=abc&resource=not-a-resource') as any);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.error).toBe('Invalid resource');
      expect(getDownloadById).not.toHaveBeenCalled();
    });

    it('should return 401 for an invalid token', async () => {
      const response = await GET(makeGetContext('token=garbage.sig&resource=automation-guide') as any);
      expect(response.status).toBe(401);
    });

    it('should return 401 for an expired token', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      const token = await generateAccessToken(1, 'automation-guide', EMAIL, SECRET);
      vi.setSystemTime(new Date('2026-01-01T00:31:00Z'));

      const response = await GET(
        makeGetContext(`token=${encodeURIComponent(token)}&resource=automation-guide`) as any
      );
      expect(response.status).toBe(401);
    });

    it('should return 401 once the download attempt limit is reached', async () => {
      const token = await signToken(
        { downloadId: 1, resourceName: 'automation-guide', email: EMAIL, timestamp: Date.now(), attempts: 3 },
        SECRET
      );

      const response = await GET(
        makeGetContext(`token=${encodeURIComponent(token)}&resource=automation-guide`) as any
      );
      expect(response.status).toBe(401);
    });

    it('should return 403 when the token was issued for a different resource', async () => {
      const token = await generateAccessToken(1, 'whitelabel-checklist', EMAIL, SECRET);

      const response = await GET(
        makeGetContext(`token=${encodeURIComponent(token)}&resource=automation-guide`) as any
      );
      expect(response.status).toBe(403);
    });

    it('should return 404 when the download record does not exist', async () => {
      vi.mocked(getDownloadById).mockResolvedValue(null);
      const token = await generateAccessToken(1, 'automation-guide', EMAIL, SECRET);

      const response = await GET(
        makeGetContext(`token=${encodeURIComponent(token)}&resource=automation-guide`) as any
      );
      expect(response.status).toBe(404);
    });

    it('should return 403 when the download record email does not match the token', async () => {
      vi.mocked(getDownloadById).mockResolvedValue({ id: 1, email: 'other@example.com' } as any);
      const token = await generateAccessToken(1, 'automation-guide', EMAIL, SECRET);

      const response = await GET(
        makeGetContext(`token=${encodeURIComponent(token)}&resource=automation-guide`) as any
      );
      expect(response.status).toBe(403);
    });

    it('should return 503 when the signing secret is not configured', async () => {
      const token = await generateAccessToken(1, 'automation-guide', EMAIL, SECRET);

      const response = await GET(
        makeGetContext(`token=${encodeURIComponent(token)}&resource=automation-guide`, {
          RESOURCES_BUCKET: bucket,
        }) as any
      );
      expect(response.status).toBe(503);
    });

    it('should return 503 when the RESOURCES_BUCKET binding is missing', async () => {
      const token = await generateAccessToken(1, 'automation-guide', EMAIL, SECRET);

      const response = await GET(
        makeGetContext(`token=${encodeURIComponent(token)}&resource=automation-guide`, {
          RESOURCE_SIGNING_SECRET: SECRET,
        }) as any
      );
      expect(response.status).toBe(503);
    });

    it('should return 404 and log server-side when the file is missing in R2', async () => {
      bucket.get.mockResolvedValue(null);
      const token = await generateAccessToken(1, 'automation-guide', EMAIL, SECRET);

      const response = await GET(
        makeGetContext(`token=${encodeURIComponent(token)}&resource=automation-guide`) as any
      );
      expect(response.status).toBe(404);

      const body = await response.json();
      expect(body.error).toBe('Resource not found');
      expect(warnSpy).toHaveBeenCalledWith('Resource file missing in R2: automation-guide.pdf');
    });

    it('should stream the real PDF from R2 with download headers', async () => {
      const content = '%PDF-1.7 real automation guide bytes';
      bucket.get.mockResolvedValue(makeR2Object(content));
      const token = await generateAccessToken(1, 'automation-guide', EMAIL, SECRET);

      const response = await GET(
        makeGetContext(`token=${encodeURIComponent(token)}&resource=automation-guide`) as any
      );
      expect(response.status).toBe(200);
      expect(bucket.get).toHaveBeenCalledWith('automation-guide.pdf');
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(response.headers.get('Content-Disposition')).toBe(
        'attachment; filename="automation-guide.pdf"'
      );
      expect(response.headers.get('Content-Length')).toBe(String(new TextEncoder().encode(content).length));

      const body = new TextDecoder().decode(await response.arrayBuffer());
      expect(body).toBe(content);
    });
  });

  describe('POST - Token generation', () => {
    it('should return 400 when required parameters are missing', async () => {
      const response = await POST(makePostContext({ downloadId: 1, email: EMAIL }) as any);
      expect(response.status).toBe(400);
    });

    it('should return 400 for a resource name outside the allowlist', async () => {
      const response = await POST(
        makePostContext({ downloadId: 1, resourceName: 'not-a-resource', email: EMAIL }) as any
      );
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Invalid resource');
      expect(getDownloadById).not.toHaveBeenCalled();
    });

    it('should return 404 when the download record does not exist', async () => {
      vi.mocked(getDownloadById).mockResolvedValue(null);

      const response = await POST(
        makePostContext({ downloadId: 99, resourceName: 'automation-guide', email: EMAIL }) as any
      );
      expect(response.status).toBe(404);
    });

    it('should return 404 when the email does not match the download record', async () => {
      vi.mocked(getDownloadById).mockResolvedValue({ id: 1, email: 'other@example.com' } as any);

      const response = await POST(
        makePostContext({ downloadId: 1, resourceName: 'automation-guide', email: EMAIL }) as any
      );
      expect(response.status).toBe(404);
    });

    it('should return 503 when the signing secret is not configured', async () => {
      const response = await POST(
        makePostContext({ downloadId: 1, resourceName: 'automation-guide', email: EMAIL }, {
          RESOURCES_BUCKET: bucket,
        }) as any
      );
      expect(response.status).toBe(503);
    });

    it('should return a signed download URL for an allowlisted resource', async () => {
      const response = await POST(
        makePostContext({ downloadId: 42, resourceName: 'automation-guide', email: EMAIL }) as any
      );
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.expiresIn).toBe(30 * 60);
      expect(body.maxAttempts).toBe(3);
      expect(body.downloadUrl).toMatch(/^\/api\/serve-resource\?token=[^&]+&resource=automation-guide$/);
    });
  });
});
