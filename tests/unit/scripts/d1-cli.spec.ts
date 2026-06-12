import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as d1cli from '../../../scripts/_d1-cli.js';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

vi.mock('node:fs');
vi.mock('node:child_process');

describe('_d1-cli.js', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset process.argv
        process.argv = ['node', 'script.js'];
    });

    describe('isLocal()', () => {
        it('returns true when --local is present', () => {
            process.argv.push('--local');
            expect(d1cli.isLocal()).toBe(true);
        });

        it('returns false when --local is absent', () => {
            expect(d1cli.isLocal()).toBe(false);
        });
    });

    describe('getSqlFiles()', () => {
        it('returns .sql files sorted in lexical order', () => {
            vi.mocked(fs.readdirSync).mockReturnValue([
                '002_test.sql',
                '001_test.sql',
                'not-sql.txt'
            ]);
            const files = d1cli.getSqlFiles();
            expect(files.length).toBe(2);
            expect(files[0]).toContain('001_test.sql');
            expect(files[1]).toContain('002_test.sql');
        });
    });

    describe('runWranglerCommand()', () => {
        it('adds --local when local is true', () => {
            vi.mocked(execSync).mockReturnValue('success');
            const result = d1cli.runWranglerCommand('execute meteoric', true);
            expect(result.success).toBe(true);
            expect(execSync).toHaveBeenCalledWith(
                'npx wrangler d1 execute meteoric --local',
                expect.any(Object)
            );
        });

        it('adds --remote when local is false', () => {
            vi.mocked(execSync).mockReturnValue('success');
            const result = d1cli.runWranglerCommand('execute meteoric', false);
            expect(result.success).toBe(true);
            expect(execSync).toHaveBeenCalledWith(
                'npx wrangler d1 execute meteoric --remote',
                expect.any(Object)
            );
        });

        it('handles errors from execSync', () => {
            const error = new Error('cmd failed');
            error.stderr = 'some error';
            error.stdout = 'some out';
            vi.mocked(execSync).mockImplementation(() => { throw error; });
            const result = d1cli.runWranglerCommand('execute meteoric', false);
            expect(result.success).toBe(false);
            expect(result.error).toBe('some error');
            expect(result.output).toBe('some out');
        });
    });
});
