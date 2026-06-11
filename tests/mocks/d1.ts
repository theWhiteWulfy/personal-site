/**
 * Cloudflare D1 Database Mock Factory
 *
 * Provides mock implementations of the D1 database binding used by all
 * server-rendered API routes in `src/pages/api/`. The real D1 binding
 * is accessed via `locals.runtime.env.DB` in the Cloudflare adapter.
 *
 * Usage in tests:
 *   import { createMockD1, createMockAPIContext } from '../mocks/d1';
 *
 *   const db = createMockD1();
 *   db.first.mockResolvedValue({ id: 1, email: 'test@example.com' });
 *
 *   const ctx = createMockAPIContext({
 *     request: new Request('http://localhost/api/newsletter', {
 *       method: 'POST',
 *       body: formData,
 *     }),
 *   });
 */

import { vi } from 'vitest';

/**
 * Creates a chainable D1 database mock.
 *
 * Mimics the D1 query pattern used across all API routes:
 *   DB.prepare(sql).bind(...params).run()
 *   DB.prepare(sql).bind(...params).first()
 *   DB.prepare(sql).bind(...params).all()
 *
 * Each method in the chain returns `this` (the mock) to enable chaining.
 * Terminal methods (run, first, all) return sensible defaults.
 */
export function createMockD1() {
  const mock: any = {
    prepare: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    run: vi.fn().mockResolvedValue({
      success: true,
      meta: {
        last_row_id: 1,
        changes: 1,
        duration: 0.5,
        rows_read: 0,
        rows_written: 1,
      },
    }),
    first: vi.fn().mockResolvedValue(null),
    all: vi.fn().mockResolvedValue({
      success: true,
      results: [],
      meta: { duration: 0.5 },
    }),
    raw: vi.fn().mockResolvedValue([]),
    batch: vi.fn().mockResolvedValue([]),
    exec: vi.fn().mockResolvedValue({ count: 0, duration: 0 }),
  };
  return mock;
}

/**
 * Helper to create a FormData from a plain object.
 * Works in both Node.js 18+ and browser environments.
 */
export function createMockFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  return formData;
}

/**
 * Creates a mock Astro APIContext matching the structure expected
 * by all `src/pages/api/*.ts` route handlers.
 *
 * The structure mirrors:
 *   - `locals.runtime.env.DB` from `@astrojs/cloudflare` Runtime<ENV>
 *   - Standard `Request` object
 *   - `url` parsed from the request
 *
 * @param overrides - Partial overrides to merge into the default context.
 */
export function createMockAPIContext(overrides: Record<string, any> = {}) {
  const db = createMockD1();
  const defaultRequest = new Request('http://localhost:4321/api/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'CF-Connecting-IP': '127.0.0.1',
      'User-Agent': 'vitest-mock/1.0',
    },
  });

  const request = overrides.request || defaultRequest;

  return {
    request,
    url: new URL(request.url),
    locals: {
      runtime: {
        env: {
          DB: overrides.db || db,
        },
      },
    },
    // Expose the DB mock for direct assertion access
    __mockDB: overrides.db || db,
    ...overrides,
  };
}

/**
 * Creates a mock APIContext with NO database binding.
 * Use this to test the "Database not configured" error path
 * that every API route must handle.
 */
export function createMockAPIContextNoDB(overrides: Record<string, any> = {}) {
  return {
    request: overrides.request || new Request('http://localhost:4321/api/test', { method: 'POST' }),
    url: new URL('http://localhost:4321/api/test'),
    locals: {},
    ...overrides,
  };
}
