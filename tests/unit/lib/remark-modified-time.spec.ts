/**
 * Task ID: TSK-004
 * Description: Unit tests for remark-modified-time plugin
 */

import { vi, describe, it, expect } from 'vitest';
import { remarkModifiedTime } from '@lib/remark-modified-time.mjs';
import { execSync } from 'child_process';

// Mock child_process module
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

describe('remarkModifiedTime', () => {
  it('calls execSync with the expected git log command and sets lastModified on frontmatter', () => {
    // Configure execSync mock to return a Buffer
    const mockTimestamp = '2024-06-01T12:00:00+05:30';
    vi.mocked(execSync).mockReturnValue(Buffer.from(mockTimestamp));

    // Create a mock file object
    const file = {
      history: ['/path/to/test.md'],
      data: {
        astro: {
          frontmatter: {} as Record<string, any>,
        },
      },
    };

    // Call remarkModifiedTime() and invoke the returned function
    const plugin = remarkModifiedTime();
    plugin(null, file as any);

    // Assert file.data.astro.frontmatter.lastModified equals the mocked git timestamp string
    expect(file.data.astro.frontmatter.lastModified).toBe(mockTimestamp);

    // Assert execSync was called with the correct git command format
    expect(execSync).toHaveBeenCalledWith(
      `git log -1 --pretty="format:%cI" "/path/to/test.md"`
    );
  });
});
