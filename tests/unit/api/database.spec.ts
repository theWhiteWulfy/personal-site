/**
 * Task ID: TSK-009
 * Description: Unit tests for Database operations layer wrapping D1 queries.
 */

import { vi, describe, it, expect } from 'vitest';
import { createMockD1 } from '../../mocks/d1';
import {
  validateDatabaseConnection,
  insertResourceDownload,
  getDownloadStats,
  getDownloadById,
  getDownloadsByEmail,
  updateDownloadRecord,
  cleanupOldRecords,
  testDatabaseConnection,
  type ResourceDownloadRecord
} from '@lib/api/database';

describe('validateDatabaseConnection', () => {
  it('throws an error if DB connection is not available (null/undefined)', () => {
    expect(() => validateDatabaseConnection(null)).toThrow('Database connection not available');
    expect(() => validateDatabaseConnection(undefined)).toThrow('Database connection not available');
  });

  it('does not throw if DB connection is a truthy object', () => {
    const db = createMockD1();
    expect(() => validateDatabaseConnection(db)).not.toThrow();
  });
});

describe('insertResourceDownload', () => {
  const mockRecord: ResourceDownloadRecord = {
    email: 'user@example.com',
    name: 'John Doe',
    workplace: 'Company Inc',
    role: 'Developer',
    resource_name: 'ebook-astro',
    ip_address: '127.0.0.1',
    user_agent: 'Mozilla/5.0'
  };

  it('throws an error if DB connection is missing', async () => {
    await expect(insertResourceDownload(null, mockRecord)).rejects.toThrow('Database connection not available');
  });

  it('inserts record successfully when no duplicate exists in 24 hours', async () => {
    const db = createMockD1();
    
    // First query (duplicate check) returns null
    db.first.mockResolvedValueOnce(null);
    
    // Insert query run returns success with last_row_id
    db.run.mockResolvedValueOnce({
      success: true,
      meta: {
        last_row_id: 101,
        changes: 1,
        duration: 0.1,
        rows_read: 0,
        rows_written: 1
      }
    });

    const result = await insertResourceDownload(db, mockRecord);

    expect(result).toEqual({
      success: true,
      id: 101,
      isDuplicate: false
    });

    // Check duplicate check query was prepared and bound
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT id FROM resource_downloads'));
    expect(db.bind).toHaveBeenNthCalledWith(1, 'user@example.com', 'ebook-astro');
    
    // Check insert query was prepared and bound
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO resource_downloads'));
    expect(db.bind).toHaveBeenNthCalledWith(2,
      'user@example.com',
      'John Doe',
      'Company Inc',
      'Developer',
      'ebook-astro',
      '127.0.0.1',
      'Mozilla/5.0'
    );
  });

  it('handles optional fields and replaces undefined with null during insert', async () => {
    const db = createMockD1();
    db.first.mockResolvedValueOnce(null);
    db.run.mockResolvedValueOnce({
      success: true,
      meta: { last_row_id: 102 }
    });

    const sparseRecord = {
      email: 'user@example.com',
      name: 'John Doe',
      workplace: 'Company Inc',
      role: 'Developer',
      resource_name: 'ebook-astro'
    };

    const result = await insertResourceDownload(db, sparseRecord);
    expect(result.success).toBe(true);
    expect(db.bind).toHaveBeenNthCalledWith(2,
      'user@example.com',
      'John Doe',
      'Company Inc',
      'Developer',
      'ebook-astro',
      null,
      null
    );
  });

  it('prevents duplicates if record was downloaded in last 24 hours', async () => {
    const db = createMockD1();
    
    // Duplicate check query returns an existing record id
    db.first.mockResolvedValueOnce({ id: 42 });

    const result = await insertResourceDownload(db, mockRecord);

    expect(result).toEqual({
      success: true,
      isDuplicate: true,
      id: 42
    });

    // Verify insert was NOT called (db.run was not called, only first)
    expect(db.run).not.toHaveBeenCalled();
    expect(db.prepare).toHaveBeenCalledTimes(1);
    expect(db.bind).toHaveBeenCalledTimes(1);
  });

  it('throws database error if insert run response success is false', async () => {
    const db = createMockD1();
    db.first.mockResolvedValueOnce(null);
    db.run.mockResolvedValueOnce({
      success: false,
      meta: {}
    });

    await expect(insertResourceDownload(db, mockRecord)).rejects.toThrow('Failed to insert resource download record');
    expect(console.error).toHaveBeenCalled();
  });

  it('throws and logs database error if D1 operation throws', async () => {
    const db = createMockD1();
    const mockError = new Error('D1 Connection Failure');
    db.first.mockRejectedValueOnce(mockError);

    await expect(insertResourceDownload(db, mockRecord)).rejects.toThrow('D1 Connection Failure');
    expect(console.error).toHaveBeenCalledWith('Database insert error:', expect.objectContaining({
      query: 'insertResourceDownload'
    }));
  });
});

describe('getDownloadStats', () => {
  it('throws an error if DB connection is missing', async () => {
    await expect(getDownloadStats(null)).rejects.toThrow('Database connection not available');
  });

  it('returns correctly structured stats with default options', async () => {
    const db = createMockD1();
    
    // Sequential mocks for the 4 queries
    // 1. totalQuery (first)
    db.first.mockResolvedValueOnce({ total: 150 });
    // 2. uniqueUsersQuery (first)
    db.first.mockResolvedValueOnce({ unique_users: 75 });
    // 3. resourceBreakdownQuery (all)
    db.all.mockResolvedValueOnce({
      success: true,
      results: [
        { resource_name: 'Res A', download_count: 100 },
        { resource_name: 'Res B', download_count: 50 }
      ]
    });
    // 4. recentDownloadsQuery (all)
    db.all.mockResolvedValueOnce({
      success: true,
      results: [
        { email: 'u1@t.com', name: 'N1', resource_name: 'Res A', download_timestamp: '2026-06-12' }
      ]
    });

    const stats = await getDownloadStats(db);

    expect(stats).toEqual({
      totalDownloads: 150,
      uniqueUsers: 75,
      resourceBreakdown: [
        { resource_name: 'Res A', download_count: 100 },
        { resource_name: 'Res B', download_count: 50 }
      ],
      recentDownloads: [
        { email: 'u1@t.com', name: 'N1', resource_name: 'Res A', download_timestamp: '2026-06-12' }
      ]
    });

    // Defaults check: limit should be passed as last argument to recent downloads query bind
    expect(db.bind).toHaveBeenLastCalledWith(10);
  });

  it('handles empty query results correctly', async () => {
    const db = createMockD1();
    db.first.mockResolvedValueOnce(null); // total downloads
    db.first.mockResolvedValueOnce(null); // unique users
    db.all.mockResolvedValueOnce({ success: true, results: undefined }); // breakdown
    db.all.mockResolvedValueOnce({ success: true, results: undefined }); // recent

    const stats = await getDownloadStats(db);

    expect(stats).toEqual({
      totalDownloads: 0,
      uniqueUsers: 0,
      resourceBreakdown: [],
      recentDownloads: []
    });
  });

  it('applies dateRange filters to the queries', async () => {
    const db = createMockD1();
    db.first.mockResolvedValueOnce({ total: 10 });
    db.first.mockResolvedValueOnce({ unique_users: 5 });
    db.all.mockResolvedValueOnce({ success: true, results: [] });
    db.all.mockResolvedValueOnce({ success: true, results: [] });

    const dateRange = { start: '2026-06-01', end: '2026-06-10' };
    await getDownloadStats(db, { dateRange });

    // Verify all queries are prepared with BETWEEN clause and bind the start/end params
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('BETWEEN ? AND ?'));
    
    // First query (totalQuery) bind
    expect(db.bind).toHaveBeenNthCalledWith(1, '2026-06-01', '2026-06-10');
    // Second query (uniqueUsers) bind
    expect(db.bind).toHaveBeenNthCalledWith(2, '2026-06-01', '2026-06-10');
    // Third query (breakdown) bind
    expect(db.bind).toHaveBeenNthCalledWith(3, '2026-06-01', '2026-06-10');
    // Fourth query (recent) bind with date parameters and limit
    expect(db.bind).toHaveBeenNthCalledWith(4, '2026-06-01', '2026-06-10', 10);
  });

  it('applies resourceFilter and custom limit to the recent downloads query', async () => {
    const db = createMockD1();
    db.first.mockResolvedValueOnce({ total: 10 });
    db.first.mockResolvedValueOnce({ unique_users: 5 });
    db.all.mockResolvedValueOnce({ success: true, results: [] });
    db.all.mockResolvedValueOnce({ success: true, results: [] });

    const dateRange = { start: '2026-06-01', end: '2026-06-10' };
    await getDownloadStats(db, {
      dateRange,
      resourceFilter: 'ebook-astro',
      limit: 5
    });

    // Recent downloads query (the 4th query in getDownloadStats)
    expect(db.prepare).toHaveBeenLastCalledWith(expect.stringContaining('AND resource_name = ? ORDER BY download_timestamp DESC LIMIT ?'));
    expect(db.bind).toHaveBeenLastCalledWith('2026-06-01', '2026-06-10', 'ebook-astro', 5);
  });

  it('throws and logs database error on stats query failure', async () => {
    const db = createMockD1();
    const mockError = new Error('Stats failure');
    db.first.mockRejectedValueOnce(mockError);

    await expect(getDownloadStats(db)).rejects.toThrow('Stats failure');
    expect(console.error).toHaveBeenCalledWith('Database stats error:', expect.objectContaining({
      query: 'getDownloadStats'
    }));
  });
});

describe('getDownloadById', () => {
  it('throws an error if DB connection is missing', async () => {
    await expect(getDownloadById(null, 1)).rejects.toThrow('Database connection not available');
  });

  it('returns the record when found', async () => {
    const db = createMockD1();
    const mockRecord = { id: 123, email: 'test@example.com', name: 'John' };
    db.first.mockResolvedValueOnce(mockRecord);

    const result = await getDownloadById(db, 123);
    expect(result).toEqual(mockRecord);
    expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM resource_downloads WHERE id = ?1');
    expect(db.bind).toHaveBeenCalledWith(123);
  });

  it('returns null when record is not found', async () => {
    const db = createMockD1();
    db.first.mockResolvedValueOnce(null);

    const result = await getDownloadById(db, 999);
    expect(result).toBeNull();
  });

  it('throws and logs database error on select failure', async () => {
    const db = createMockD1();
    const mockError = new Error('Select failure');
    db.first.mockRejectedValueOnce(mockError);

    await expect(getDownloadById(db, 1)).rejects.toThrow('Select failure');
    expect(console.error).toHaveBeenCalledWith('Database select error:', expect.objectContaining({
      query: 'getDownloadById'
    }));
  });
});

describe('getDownloadsByEmail', () => {
  it('throws an error if DB connection is missing', async () => {
    await expect(getDownloadsByEmail(null, 'test@example.com')).rejects.toThrow('Database connection not available');
  });

  it('returns empty array when no records are found', async () => {
    const db = createMockD1();
    db.all.mockResolvedValueOnce({ success: true, results: [] });

    const result = await getDownloadsByEmail(db, 'test@example.com');
    expect(result).toEqual([]);
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('WHERE email = ?1'));
    expect(db.bind).toHaveBeenCalledWith('test@example.com', 10);
  });

  it('returns matching records with custom limit', async () => {
    const db = createMockD1();
    const mockRecords = [
      { id: 1, email: 'test@example.com', resource_name: 'res1' },
      { id: 2, email: 'test@example.com', resource_name: 'res2' }
    ];
    db.all.mockResolvedValueOnce({ success: true, results: mockRecords });

    const result = await getDownloadsByEmail(db, 'test@example.com', 5);
    expect(result).toEqual(mockRecords);
    expect(db.bind).toHaveBeenCalledWith('test@example.com', 5);
  });

  it('throws and logs database error on select failure', async () => {
    const db = createMockD1();
    const mockError = new Error('Select by email failure');
    db.all.mockRejectedValueOnce(mockError);

    await expect(getDownloadsByEmail(db, 'test@example.com')).rejects.toThrow('Select by email failure');
    expect(console.error).toHaveBeenCalledWith('Database select error:', expect.objectContaining({
      query: 'getDownloadsByEmail'
    }));
  });
});

describe('updateDownloadRecord', () => {
  it('throws an error if DB connection is missing', async () => {
    await expect(updateDownloadRecord(null, 1, { name: 'New' })).rejects.toThrow('Database connection not available');
  });

  it('returns false and does not query DB if updates object is empty', async () => {
    const db = createMockD1();
    const result = await updateDownloadRecord(db, 1, {});
    expect(result).toBe(false);
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it('returns false and does not query DB if updates object contains only id', async () => {
    const db = createMockD1();
    const result = await updateDownloadRecord(db, 1, { id: 1 });
    expect(result).toBe(false);
    expect(db.prepare).not.toHaveBeenCalled();
  });

  it('performs updates and returns true when DB update succeeds and changes > 0', async () => {
    const db = createMockD1();
    db.run.mockResolvedValueOnce({
      success: true,
      meta: { changes: 1 }
    });

    const result = await updateDownloadRecord(db, 123, {
      name: 'New Name',
      role: 'Manager'
    });

    expect(result).toBe(true);
    expect(db.prepare).toHaveBeenCalledWith('UPDATE resource_downloads SET name = ?2, role = ?3 WHERE id = ?1');
    expect(db.bind).toHaveBeenCalledWith(123, 'New Name', 'Manager');
  });

  it('returns false if DB update returns 0 changes', async () => {
    const db = createMockD1();
    db.run.mockResolvedValueOnce({
      success: true,
      meta: { changes: 0 }
    });

    const result = await updateDownloadRecord(db, 123, { name: 'New Name' });
    expect(result).toBe(false);
  });

  it('throws and logs database error on update failure', async () => {
    const db = createMockD1();
    const mockError = new Error('Update failure');
    db.run.mockRejectedValueOnce(mockError);

    await expect(updateDownloadRecord(db, 123, { name: 'New Name' })).rejects.toThrow('Update failure');
    expect(console.error).toHaveBeenCalledWith('Database update error:', expect.objectContaining({
      query: 'updateDownloadRecord'
    }));
  });
});

describe('cleanupOldRecords', () => {
  it('throws an error if DB connection is missing', async () => {
    await expect(cleanupOldRecords(null)).rejects.toThrow('Database connection not available');
  });

  it('deletes records older than default days (365) and returns changes count', async () => {
    const db = createMockD1();
    db.run.mockResolvedValueOnce({
      success: true,
      meta: { changes: 15 }
    });

    const deletedCount = await cleanupOldRecords(db);
    expect(deletedCount).toBe(15);
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("'-365 days'"));
  });

  it('deletes records older than custom days', async () => {
    const db = createMockD1();
    db.run.mockResolvedValueOnce({
      success: true,
      meta: { changes: 5 }
    });

    const deletedCount = await cleanupOldRecords(db, 30);
    expect(deletedCount).toBe(5);
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("'-30 days'"));
  });

  it('throws and logs database error on delete failure', async () => {
    const db = createMockD1();
    const mockError = new Error('Delete failure');
    db.run.mockRejectedValueOnce(mockError);

    await expect(cleanupOldRecords(db)).rejects.toThrow('Delete failure');
    expect(console.error).toHaveBeenCalledWith('Database cleanup error:', expect.objectContaining({
      query: 'cleanupOldRecords'
    }));
  });
});

describe('testDatabaseConnection', () => {
  it('returns false if DB connection is missing', async () => {
    const result = await testDatabaseConnection(null);
    expect(result).toBe(false);
  });

  it('returns true if query runs successfully', async () => {
    const db = createMockD1();
    db.first.mockResolvedValueOnce({ count: 1 });

    const result = await testDatabaseConnection(db);
    expect(result).toBe(true);
    expect(db.prepare).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM resource_downloads LIMIT 1');
  });

  it('returns false and logs error when query fails', async () => {
    const db = createMockD1();
    db.first.mockRejectedValueOnce(new Error('Connection failed'));

    const result = await testDatabaseConnection(db);
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Database connection test failed:', expect.any(Error));
  });
});
