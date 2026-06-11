/**
 * Task ID: TSK-013
 * Unit tests for resource download API route handler (POST and GET).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '../../../src/pages/api/resource-download';
import { createMockD1, createMockAPIContext, createMockAPIContextNoDB, createMockFormData } from '../../mocks/d1';

// Mock the dependencies at module level
vi.mock('@/lib/api/validation', () => ({
  validateResourceForm: vi.fn(),
  formatValidationErrors: vi.fn(),
}));

vi.mock('@/lib/api/security', () => ({
  performSecurityChecks: vi.fn(),
}));

vi.mock('@/lib/api/database', () => ({
  insertResourceDownload: vi.fn(),
  getDownloadStats: vi.fn(),
  validateDatabaseConnection: vi.fn(),
}));

import { validateResourceForm, formatValidationErrors } from '@/lib/api/validation';
import { performSecurityChecks } from '@/lib/api/security';
import { insertResourceDownload, getDownloadStats, validateDatabaseConnection } from '@/lib/api/database';

describe('Resource Download API Route', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
  });

  describe('POST - Form Submission', () => {
    it('should successfully submit and return download URL on happy path', async () => {
      const db = createMockD1();
      const formData = createMockFormData({
        email: 'test@example.com',
        name: 'John Doe',
        workplace: 'Acme',
        role: 'Dev',
        resourceName: 'eBook',
      });

      // Configure mocks
      vi.mocked(performSecurityChecks).mockResolvedValue({ allowed: true });
      vi.mocked(validateResourceForm).mockReturnValue({
        isValid: true,
        sanitizedData: {
          email: 'test@example.com',
          name: 'John Doe',
          workplace: 'Acme',
          role: 'Dev',
          resourceName: 'eBook',
        },
        errors: [],
      });
      vi.mocked(insertResourceDownload).mockResolvedValue({
        success: true,
        id: 42,
        isDuplicate: false,
      });
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ downloadUrl: 'http://localhost/downloads/eBook.pdf' }),
      });

      const context = createMockAPIContext({
        request: new Request('http://localhost:4321/api/resource-download', {
          method: 'POST',
          body: formData,
          headers: {
            'CF-Connecting-IP': '1.2.3.4',
            'User-Agent': 'Mozilla/5.0',
          },
        }),
        db,
      });

      const response = await POST(context as any);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body).toEqual({
        success: true,
        message: 'Form submitted successfully',
        downloadUrl: 'http://localhost/downloads/eBook.pdf',
      });

      // Verify dependencies were called correctly
      expect(performSecurityChecks).toHaveBeenCalledWith(db, formData, '1.2.3.4');
      expect(validateResourceForm).toHaveBeenCalledWith(formData);
      expect(insertResourceDownload).toHaveBeenCalledWith(db, {
        email: 'test@example.com',
        name: 'John Doe',
        workplace: 'Acme',
        role: 'Dev',
        resource_name: 'eBook',
        ip_address: '1.2.3.4',
        user_agent: 'Mozilla/5.0',
      });
      expect(fetchMock).toHaveBeenCalledWith('/api/serve-resource', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ downloadId: 42, resourceName: 'eBook', email: 'test@example.com' }),
      }));
    });

    it('should return 429 when security checks fail', async () => {
      const db = createMockD1();
      const formData = createMockFormData({ email: 'spam@bot.com' });

      vi.mocked(performSecurityChecks).mockResolvedValue({
        allowed: false,
        reason: 'Rate limit exceeded',
        retryAfter: 900,
      });

      const context = createMockAPIContext({
        request: new Request('http://localhost:4321/api/resource-download', {
          method: 'POST',
          body: formData,
        }),
        db,
      });

      const response = await POST(context as any);
      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('900');

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Rate limit exceeded');
      expect(validateResourceForm).not.toHaveBeenCalled();
    });

    it('should return 400 when validation fails', async () => {
      const db = createMockD1();
      const formData = createMockFormData({});

      vi.mocked(performSecurityChecks).mockResolvedValue({ allowed: true });
      vi.mocked(validateResourceForm).mockReturnValue({
        isValid: false,
        errors: [{ field: 'email', message: 'Required', code: 'REQUIRED' }],
      });
      vi.mocked(formatValidationErrors).mockReturnValue('email: Required');

      const context = createMockAPIContext({
        request: new Request('http://localhost:4321/api/resource-download', {
          method: 'POST',
          body: formData,
        }),
        db,
      });

      const response = await POST(context as any);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('email: Required');
      expect(body.validationErrors).toHaveLength(1);
      expect(insertResourceDownload).not.toHaveBeenCalled();
    });

    it('should return 500 when database insert fails', async () => {
      const db = createMockD1();
      const formData = createMockFormData({ email: 'test@example.com' });

      vi.mocked(performSecurityChecks).mockResolvedValue({ allowed: true });
      vi.mocked(validateResourceForm).mockReturnValue({
        isValid: true,
        sanitizedData: { email: 'test@example.com', name: 'John', workplace: 'Acme', role: 'Dev', resourceName: 'Book' },
        errors: [],
      });
      vi.mocked(insertResourceDownload).mockResolvedValue({
        success: false,
        id: -1,
        isDuplicate: false,
      });

      const context = createMockAPIContext({
        request: new Request('http://localhost:4321/api/resource-download', {
          method: 'POST',
          body: formData,
        }),
        db,
      });

      const response = await POST(context as any);
      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Failed to process download request');
    });

    it('should return 500 when database is not configured', async () => {
      const context = createMockAPIContextNoDB({
        request: new Request('http://localhost:4321/api/resource-download', {
          method: 'POST',
        }),
      });

      const response = await POST(context as any);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Database not configured');
    });
  });

  describe('GET - Download Statistics', () => {
    it('should retrieve statistics successfully with query parameters', async () => {
      const db = createMockD1();
      const mockStats = {
        totalDownloads: 10,
        uniqueUsers: 5,
        resourceBreakdown: [],
        recentDownloads: [],
      };

      vi.mocked(getDownloadStats).mockResolvedValue(mockStats);

      const context = createMockAPIContext({
        request: new Request('http://localhost:4321/api/resource-download?limit=5&resource=eBook&startDate=2024-01-01&endDate=2024-01-31', {
          method: 'GET',
        }),
        db,
      });

      const response = await GET(context as any);
      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual(mockStats);

      expect(validateDatabaseConnection).toHaveBeenCalledWith(db);
      expect(getDownloadStats).toHaveBeenCalledWith(db, {
        limit: 5,
        resourceFilter: 'eBook',
        dateRange: { start: '2024-01-01', end: '2024-01-31' },
      });
    });

    it('should return 500 when database connection fails validation', async () => {
      const db = createMockD1();
      vi.mocked(validateDatabaseConnection).mockImplementation(() => {
        throw new Error('D1 connection invalid');
      });

      const context = createMockAPIContext({
        request: new Request('http://localhost:4321/api/resource-download', {
          method: 'GET',
        }),
        db,
      });

      const response = await GET(context as any);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Database connection failed');
    });

    it('should return 500 when database is not configured', async () => {
      const context = createMockAPIContextNoDB({
        request: new Request('http://localhost:4321/api/resource-download', {
          method: 'GET',
        }),
      });

      const response = await GET(context as any);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe('Database not configured');
    });
  });
});
