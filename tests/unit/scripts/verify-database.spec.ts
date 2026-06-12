import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as d1cli from '../../../scripts/_d1-cli.js';

const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

vi.mock('../../../scripts/_d1-cli.js', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        isLocal: vi.fn(),
        queryDatabase: vi.fn(),
    };
});

describe('verify-database.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it('exits 0 when all required tables are present', async () => {
        vi.mocked(d1cli.isLocal).mockReturnValue(true);
        vi.mocked(d1cli.queryDatabase).mockImplementation((sql) => {
            if (sql.includes('sqlite_master')) {
                return {
                    success: true,
                    results: [
                        { name: 'resource_downloads', sql: 'CREATE TABLE resource_downloads' },
                        { name: 'analytics_events', sql: 'CREATE TABLE analytics_events' },
                        { name: 'campaigns', sql: 'CREATE TABLE campaigns' },
                        { name: 'campaign_visits', sql: 'CREATE TABLE campaign_visits' },
                        { name: 'newsletter', sql: 'CREATE TABLE newsletter' },
                        { name: 'leads', sql: 'CREATE TABLE leads' },
                    ]
                };
            }
            if (sql.includes('PRAGMA index_list')) {
                return { success: true, results: [] };
            }
            return { success: false, error: 'Unknown query' };
        });

        await import(`../../../scripts/verify-database.js?update=${Date.now()}`);

        expect(mockExit).toHaveBeenCalledWith(0);
        expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('All required tables are present.'));
    });

    it('exits 1 when one or more required tables are missing', async () => {
        vi.mocked(d1cli.isLocal).mockReturnValue(true);
        vi.mocked(d1cli.queryDatabase).mockImplementation((sql) => {
            if (sql.includes('sqlite_master')) {
                return {
                    success: true,
                    // Missing 'leads' and 'newsletter'
                    results: [
                        { name: 'resource_downloads', sql: 'CREATE TABLE resource_downloads' },
                        { name: 'analytics_events', sql: 'CREATE TABLE analytics_events' },
                        { name: 'campaigns', sql: 'CREATE TABLE campaigns' },
                        { name: 'campaign_visits', sql: 'CREATE TABLE campaign_visits' },
                    ]
                };
            }
            return { success: true, results: [] };
        });

        await import(`../../../scripts/verify-database.js?update=${Date.now()}`);

        expect(mockExit).toHaveBeenCalledWith(1);
        expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('One or more required tables are missing.'));
    });
});
