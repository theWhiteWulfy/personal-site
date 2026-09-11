import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as d1cli from '../../../scripts/_d1-cli.js';
import fs from 'node:fs';

// Mock the process.exit and console to prevent the test from actually exiting
const mockExit = vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`EXIT_${code}`);
});
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// We will mock the entire module to control its exports easily
vi.mock('../../../scripts/_d1-cli.js', async (importOriginal) => {
    const actual = await importOriginal<typeof d1cli>();
    return {
        ...actual,
        isLocal: vi.fn(),
        getSqlFiles: vi.fn(),
        executeSqlFile: vi.fn(),
    };
});

describe('migrate-database.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        mockExit.mockImplementation((code) => {
            throw new Error(`EXIT_${code}`);
        });
    });

    it('exits 0 if no files found', async () => {
        vi.mocked(d1cli.isLocal).mockReturnValue(true);
        vi.mocked(d1cli.getSqlFiles).mockReturnValue([]);

        // Dynamic import to execute main
        try {
            await import('../../../scripts/migrate-database.js');
        } catch (e: any) {
            if (!e?.message?.startsWith('EXIT_')) throw e;
        }

        expect(mockExit).toHaveBeenCalledWith(0);
        expect(mockConsoleLog).toHaveBeenCalledWith('No SQL files found to migrate.');
    });

    it('runs files in order and stops on failure', async () => {
        vi.mocked(d1cli.isLocal).mockReturnValue(true);
        vi.mocked(d1cli.getSqlFiles).mockReturnValue(['001.sql', '002.sql']);
        vi.mocked(d1cli.executeSqlFile).mockImplementation((file: any) => {
            if (file === '001.sql') return { success: true, output: '' };
            return { success: false, error: 'fail', output: '' };
        });

        const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`EXIT_${code}`);
        });
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        try {
            await import('../../../scripts/migrate-database.js');
        } catch (e: any) {
            if (!e?.message?.startsWith('EXIT_')) throw e;
        }

        expect(d1cli.executeSqlFile).toHaveBeenCalledTimes(2);
        expect(exitSpy).toHaveBeenCalledWith(1);
        expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('Migration failed on 002.sql!'));
    });
});
