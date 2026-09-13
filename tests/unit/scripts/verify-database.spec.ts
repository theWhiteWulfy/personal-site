import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as d1cli from '../../../scripts/_d1-cli.js';

const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

vi.mock('../../../scripts/_d1-cli.js', async (importOriginal) => {
    const actual = await importOriginal<typeof d1cli>();
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
        mockExit.mockImplementation(() => undefined as never);
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

        const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`EXIT_${code}`);
        });
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        try {
            await import('../../../scripts/verify-database.js');
        } catch (e: any) {
            if (!e?.message?.startsWith('EXIT_')) throw e;
        }

        expect(exitSpy).toHaveBeenCalledWith(0);
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('All required tables are present.'));
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

        const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`EXIT_${code}`);
        });
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            await import('../../../scripts/verify-database.js');
        } catch (e: any) {
            if (!e?.message?.startsWith('EXIT_')) throw e;
        }

        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('One or more required tables are missing.'));
    });
});
