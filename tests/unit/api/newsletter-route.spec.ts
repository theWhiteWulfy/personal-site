/**
 * Task ID: TSK-011
 * Unit tests for newsletter registration API route handler.
 */

import { describe, it, expect } from 'vitest';
import { POST } from '../../../src/pages/api/newsletter';
import { createMockD1, createMockAPIContext, createMockAPIContextNoDB, createMockFormData } from '../../mocks/d1';

describe('Newsletter API Route - POST', () => {
  it('should successfully register a valid email', async () => {
    const db = createMockD1();
    const formData = createMockFormData({ subsemail: 'subscriber@example.com' });
    
    const context = createMockAPIContext({
      request: new Request('http://localhost:4321/api/newsletter', {
        method: 'POST',
        body: formData,
      }),
      db,
    });

    const response = await POST(context as any);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ message: 'Submitted successfully' });

    // Verify database interaction
    expect(db.prepare).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO newsletter')
    );
    expect(db.bind).toHaveBeenCalledWith('subscriber@example.com');
    expect(db.run).toHaveBeenCalled();
  });

  it('should return 400 when email is missing or wrong type', async () => {
    const db = createMockD1();
    
    // Empty form data
    const formData = createMockFormData({});
    const context = createMockAPIContext({
      request: new Request('http://localhost:4321/api/newsletter', {
        method: 'POST',
        body: formData,
      }),
      db,
    });

    const response = await POST(context as any);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toEqual({ error: 'Missing or wrong input' });
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it('should return 500 when database is not configured in locals', async () => {
    const formData = createMockFormData({ subsemail: 'subscriber@example.com' });
    const context = createMockAPIContextNoDB({
      request: new Request('http://localhost:4321/api/newsletter', {
        method: 'POST',
        body: formData,
      }),
    });

    const response = await POST(context as any);
    expect(response.status).toBe(500);

    const body = await response.json();
    expect(body).toEqual({ error: 'Database not configured' });
  });
});
