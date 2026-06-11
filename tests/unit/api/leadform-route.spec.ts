/**
 * Task ID: TSK-012
 * Unit tests for leadform submission API route handler.
 */

import { describe, it, expect } from 'vitest';
import { POST } from '../../../src/pages/api/leadform';
import { createMockD1, createMockAPIContext, createMockAPIContextNoDB, createMockFormData } from '../../mocks/d1';

describe('Leadform API Route - POST', () => {
  it('should successfully submit a lead when all required fields are present', async () => {
    const db = createMockD1();
    const formData = createMockFormData({
      usrname: 'Jane Doe',
      email: 'jane.doe@example.com',
      msg: 'Interested in services',
      ref: 'Google Search',
    });

    const context = createMockAPIContext({
      request: new Request('http://localhost:4321/api/leadform', {
        method: 'POST',
        body: formData,
      }),
      db,
    });

    const response = await POST(context as any);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toEqual({ message: 'Submitted successfully' });

    // Verify D1 interaction and binding order: name, email, refer, message
    expect(db.prepare).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO leads')
    );
    expect(db.bind).toHaveBeenCalledWith(
      'Jane Doe',
      'jane.doe@example.com',
      'Google Search',
      'Interested in services'
    );
    expect(db.run).toHaveBeenCalled();
  });

  it('should return 400 when any of the required fields are missing', async () => {
    const db = createMockD1();
    
    // Omit 'msg' field
    const formData = createMockFormData({
      usrname: 'Jane Doe',
      email: 'jane.doe@example.com',
      ref: 'Google Search',
    });

    const context = createMockAPIContext({
      request: new Request('http://localhost:4321/api/leadform', {
        method: 'POST',
        body: formData,
      }),
      db,
    });

    const response = await POST(context as any);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toEqual({ error: 'Missing required fields' });
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it('should return 500 when database is not configured in locals', async () => {
    const formData = createMockFormData({
      usrname: 'Jane Doe',
      email: 'jane.doe@example.com',
      msg: 'Hello',
      ref: 'Direct',
    });

    const context = createMockAPIContextNoDB({
      request: new Request('http://localhost:4321/api/leadform', {
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
