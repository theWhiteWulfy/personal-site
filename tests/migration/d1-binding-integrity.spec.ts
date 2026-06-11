/**
 * Task ID: TSK-027
 * Description: Unit tests validating D1 binding integrity and access pattern guards
 */

import { describe, it, expect } from 'vitest';
import { createMockD1 } from '../mocks/d1';

describe('D1 Database Binding Integrity', () => {
  describe('Access Pattern Guard Tests', () => {
    // Helper function that mimics the guard statement used across all API endpoints:
    // if (!locals || !locals.runtime || !locals.runtime.env || !locals.runtime.env.DB) { ... }
    function evaluateGuard(locals: any): boolean {
      return !locals || !locals.runtime || !locals.runtime.env || !locals.runtime.env.DB;
    }

    it('returns true (fails) when locals is undefined/null', () => {
      expect(evaluateGuard(undefined)).toBe(true);
      expect(evaluateGuard(null)).toBe(true);
    });

    it('returns true (fails) when locals.runtime is undefined', () => {
      const locals = {};
      expect(evaluateGuard(locals)).toBe(true);
    });

    it('returns true (fails) when locals.runtime.env is undefined', () => {
      const locals = { runtime: {} };
      expect(evaluateGuard(locals)).toBe(true);
    });

    it('returns true (fails) when locals.runtime.env.DB is undefined', () => {
      const locals = { runtime: { env: {} } };
      expect(evaluateGuard(locals)).toBe(true);
    });

    it('returns false (passes) when the full D1 binding is present', () => {
      const db = createMockD1();
      const locals = {
        runtime: {
          env: {
            DB: db,
          },
        },
      };
      expect(evaluateGuard(locals)).toBe(false);
    });
  });

  describe('D1 Method Chain Pattern Tests', () => {
    it('supports prepare().bind().run() method chain', async () => {
      const DB = createMockD1();
      
      const query = 'INSERT INTO test_table (name) VALUES (?1)';
      const result = await DB.prepare(query).bind('test_name').run();
      
      expect(DB.prepare).toHaveBeenCalledWith(query);
      expect(DB.bind).toHaveBeenCalledWith('test_name');
      expect(DB.run).toHaveBeenCalled();
      expect(result).toHaveProperty('success', true);
      expect(result.meta).toHaveProperty('changes', 1);
    });

    it('supports prepare().bind().first() method chain', async () => {
      const DB = createMockD1();
      const mockRecord = { id: 1, name: 'test_record' };
      DB.first.mockResolvedValue(mockRecord);

      const query = 'SELECT * FROM test_table WHERE id = ?1';
      const result = await DB.prepare(query).bind(1).first();

      expect(DB.prepare).toHaveBeenCalledWith(query);
      expect(DB.bind).toHaveBeenCalledWith(1);
      expect(DB.first).toHaveBeenCalled();
      expect(result).toEqual(mockRecord);
    });

    it('supports prepare().bind().all() method chain', async () => {
      const DB = createMockD1();
      const mockResultList = {
        success: true,
        results: [{ id: 1 }, { id: 2 }],
        meta: { duration: 0.5 }
      };
      DB.all.mockResolvedValue(mockResultList);

      const query = 'SELECT * FROM test_table WHERE status = ?1';
      const result = await DB.prepare(query).bind('active').all();

      expect(DB.prepare).toHaveBeenCalledWith(query);
      expect(DB.bind).toHaveBeenCalledWith('active');
      expect(DB.all).toHaveBeenCalled();
      expect(result).toEqual(mockResultList);
    });
  });
});
