/**
 * Database operations for resource tracking with performance monitoring
 */

import { 
  executeOptimizedQuery, 
  executeOptimizedQueryAll, 
  executeOptimizedWrite,
  dbConnectionManager 
} from './database-performance';

export interface ResourceDownloadRecord {
  id?: number;
  email: string;
  name: string;
  workplace: string;
  role: string;
  resource_name: string;
  download_timestamp?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface DownloadStats {
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
}

export interface DatabaseError extends Error {
  code?: string;
  query?: string;
}

/**
 * Validate database connection
 */
export function validateDatabaseConnection(DB: any): void {
  if (!DB) {
    throw new Error('Database connection not available');
  }
}

/**
 * Insert new resource download record with duplicate prevention and performance monitoring
 */
export async function insertResourceDownload(
  DB: any,
  record: ResourceDownloadRecord
): Promise<{ success: boolean; id?: number; isDuplicate?: boolean }> {
  try {
    validateDatabaseConnection(DB);
    const connection = dbConnectionManager.getConnection(DB);
    
    // Check for existing download within the last 24 hours to prevent duplicates
    const duplicateCheckQuery = `
      SELECT id FROM resource_downloads 
      WHERE email = ?1 AND resource_name = ?2 
      AND download_timestamp > datetime('now', '-24 hours')
      LIMIT 1
    `;
    
    const existingRecord = await executeOptimizedQuery<{id: number}>(
      connection,
      'duplicate_check_resource_download',
      duplicateCheckQuery,
      [record.email, record.resource_name]
    );
    
    if (existingRecord) {
      dbConnectionManager.trackQuery('default', true);
      return {
        success: true,
        isDuplicate: true,
        id: existingRecord.id
      };
    }
    
    // Insert new record
    const insertQuery = `
      INSERT INTO resource_downloads 
      (email, name, workplace, role, resource_name, ip_address, user_agent) 
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    `;
    
    const result = await executeOptimizedWrite(
      connection,
      'insert_resource_download',
      insertQuery,
      [
        record.email,
        record.name,
        record.workplace,
        record.role,
        record.resource_name,
        record.ip_address || null,
        record.user_agent || null
      ]
    );
    
    if (!result.success) {
      dbConnectionManager.trackQuery('default', false);
      throw new Error('Failed to insert resource download record');
    }
    
    dbConnectionManager.trackQuery('default', true);
    return {
      success: true,
      id: result.meta.last_row_id,
      isDuplicate: false
    };
    
  } catch (error) {
    dbConnectionManager.trackQuery('default', false);
    const dbError = error as DatabaseError;
    dbError.query = 'insertResourceDownload';
    console.error('Database insert error:', dbError);
    throw dbError;
  }
}

/**
 * Get download statistics for analytics with performance monitoring
 */
export async function getDownloadStats(
  DB: any,
  options: {
    limit?: number;
    resourceFilter?: string;
    dateRange?: { start: string; end: string };
  } = {}
): Promise<DownloadStats> {
  try {
    validateDatabaseConnection(DB);
    const connection = dbConnectionManager.getConnection(DB);
    
    const { limit = 10, resourceFilter, dateRange } = options;
    
    // Build date filter condition
    let dateCondition = '';
    let dateParams: string[] = [];
    
    if (dateRange) {
      dateCondition = 'AND download_timestamp BETWEEN ?1 AND ?2';
      dateParams = [dateRange.start, dateRange.end];
    }
    
    // Get total downloads count with optimized query
    const totalQuery = `SELECT COUNT(*) as total FROM resource_downloads WHERE 1=1 ${dateCondition}`;
    const totalResult = await executeOptimizedQuery<{total: number}>(
      connection,
      'get_total_downloads',
      totalQuery,
      dateParams
    );
    const totalDownloads = totalResult?.total || 0;
    
    // Get unique users count with optimized query
    const uniqueUsersQuery = `SELECT COUNT(DISTINCT email) as unique_users FROM resource_downloads WHERE 1=1 ${dateCondition}`;
    const uniqueUsersResult = await executeOptimizedQuery<{unique_users: number}>(
      connection,
      'get_unique_users',
      uniqueUsersQuery,
      dateParams
    );
    const uniqueUsers = uniqueUsersResult?.unique_users || 0;
    
    // Get resource breakdown with optimized query
    const resourceBreakdownQuery = `
      SELECT resource_name, COUNT(*) as download_count 
      FROM resource_downloads 
      WHERE 1=1 ${dateCondition}
      GROUP BY resource_name 
      ORDER BY download_count DESC
    `;
    const resourceBreakdown = await executeOptimizedQueryAll<{resource_name: string; download_count: number}>(
      connection,
      'get_resource_breakdown',
      resourceBreakdownQuery,
      dateParams
    );
    
    // Get recent downloads with optimized query
    let recentDownloadsQuery = `
      SELECT email, name, resource_name, download_timestamp 
      FROM resource_downloads 
      WHERE 1=1 ${dateCondition}
    `;
    
    let recentParams = [...dateParams];
    
    if (resourceFilter) {
      recentDownloadsQuery += ` AND resource_name = ?${dateParams.length + 1}`;
      recentParams.push(resourceFilter);
    }
    
    recentDownloadsQuery += ` ORDER BY download_timestamp DESC LIMIT ?${recentParams.length + 1}`;
    recentParams.push(limit.toString());
    
    const recentDownloads = await executeOptimizedQueryAll<{email: string; name: string; resource_name: string; download_timestamp: string}>(
      connection,
      'get_recent_downloads',
      recentDownloadsQuery,
      recentParams
    );
    
    dbConnectionManager.trackQuery('default', true);
    
    return {
      totalDownloads,
      uniqueUsers,
      resourceBreakdown: resourceBreakdown.results || [],
      recentDownloads: recentDownloads.results || []
    };
    
  } catch (error) {
    dbConnectionManager.trackQuery('default', false);
    const dbError = error as DatabaseError;
    dbError.query = 'getDownloadStats';
    console.error('Database stats error:', dbError);
    throw dbError;
  }
}

/**
 * Get download record by ID
 */
export async function getDownloadById(
  DB: any,
  id: number
): Promise<ResourceDownloadRecord | null> {
  try {
    validateDatabaseConnection(DB);
    
    const query = 'SELECT * FROM resource_downloads WHERE id = ?1';
    const result = await DB.prepare(query).bind(id).first();
    
    return result || null;
    
  } catch (error) {
    const dbError = error as DatabaseError;
    dbError.query = 'getDownloadById';
    console.error('Database select error:', dbError);
    throw dbError;
  }
}

/**
 * Get downloads by email
 */
export async function getDownloadsByEmail(
  DB: any,
  email: string,
  limit: number = 10
): Promise<ResourceDownloadRecord[]> {
  try {
    validateDatabaseConnection(DB);
    
    const query = `
      SELECT * FROM resource_downloads 
      WHERE email = ?1 
      ORDER BY download_timestamp DESC 
      LIMIT ?2
    `;
    
    const result = await DB.prepare(query).bind(email, limit).all();
    
    return result.results || [];
    
  } catch (error) {
    const dbError = error as DatabaseError;
    dbError.query = 'getDownloadsByEmail';
    console.error('Database select error:', dbError);
    throw dbError;
  }
}

/**
 * Update download record (for tracking completion, etc.)
 */
export async function updateDownloadRecord(
  DB: any,
  id: number,
  updates: Partial<ResourceDownloadRecord>
): Promise<boolean> {
  try {
    validateDatabaseConnection(DB);
    
    const updateFields = Object.keys(updates)
      .filter(key => key !== 'id')
      .map((key, index) => `${key} = ?${index + 2}`)
      .join(', ');
    
    if (!updateFields) {
      return false;
    }
    
    const query = `UPDATE resource_downloads SET ${updateFields} WHERE id = ?1`;
    const values = [id, ...Object.values(updates).filter((_, index) => Object.keys(updates)[index] !== 'id')];
    
    const result = await DB.prepare(query).bind(...values).run();
    
    return result.success && result.meta.changes > 0;
    
  } catch (error) {
    const dbError = error as DatabaseError;
    dbError.query = 'updateDownloadRecord';
    console.error('Database update error:', dbError);
    throw dbError;
  }
}

/**
 * Delete old download records (for cleanup)
 */
export async function cleanupOldRecords(
  DB: any,
  daysToKeep: number = 365
): Promise<number> {
  try {
    validateDatabaseConnection(DB);
    
    const query = `
      DELETE FROM resource_downloads 
      WHERE download_timestamp < datetime('now', '-${daysToKeep} days')
    `;
    
    const result = await DB.prepare(query).run();
    
    return result.meta.changes || 0;
    
  } catch (error) {
    const dbError = error as DatabaseError;
    dbError.query = 'cleanupOldRecords';
    console.error('Database cleanup error:', dbError);
    throw dbError;
  }
}

/**
 * Test database connection and table existence
 */
export async function testDatabaseConnection(DB: any): Promise<boolean> {
  try {
    validateDatabaseConnection(DB);
    
    // Test if the table exists and is accessible
    const testQuery = 'SELECT COUNT(*) as count FROM resource_downloads LIMIT 1';
    await DB.prepare(testQuery).first();
    
    return true;
    
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}