/**
 * Task ID: TSK-027
 * Description: Unit tests validating D1 binding integrity and access pattern guards
 */

import { describe, it, expect } from 'vitest';
import { createMockD1 } from '../mocks/d1';
import { getDatabase } from '../../src/lib/api/database';
import { setMockCloudflareEnv } from 'cloudflare:workers';

describe('D1 Database Binding Integrity', () => {
  describe('Access Pattern Guard Tests', () => {
    // The API layer reads bindings through the getEnv() shim
    // (`cloudflare:workers` env, see src/lib/api/runtime-env.ts) and
    // getDatabase() guards on the DB binding being present.
    it('returns a 500 errorResponse when the DB binding is missing', () => {
      const { DB, errorResponse } = getDatabase();
      expect(DB).toBeNull();
      expect(errorResponse).toBeInstanceOf(Response);
      expect(errorResponse!.status).toBe(500);
    });

    it('returns the DB binding when it is configured', () => {
      const db = createMockD1();
      setMockCloudflareEnv({ DB: db });

      const { DB, errorResponse } = getDatabase();
      expect(DB).toBe(db);
      expect(errorResponse).toBeNull();
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
