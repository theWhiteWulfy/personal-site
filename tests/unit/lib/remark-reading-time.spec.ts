/**
 * Task ID: TSK-003
 * Description: Unit tests for remarkReadingTime plugin
 */

import { vi, describe, it, expect } from 'vitest';
import { remarkReadingTime } from '@lib/remark-reading-time.mjs';
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';

vi.mock('reading-time', () => ({
  default: vi.fn(() => ({ text: '5 min read' })),
}));

vi.mock('mdast-util-to-string', () => ({
  toString: vi.fn(() => 'mocked tree text'),
}));

describe('remarkReadingTime', () => {
  it('should be a function that returns a transform function', () => {
    const plugin = remarkReadingTime();
    expect(typeof plugin).toBe('function');
  });

  it('should extract text from tree, calculate reading time, and set timeToRead in frontmatter', () => {
    const plugin = remarkReadingTime();
    const mockTree = { type: 'root', children: [] };
    const mockFile = {
      data: {
        astro: {
          frontmatter: {} as Record<string, any>,
        },
      },
    };

    plugin(mockTree, mockFile);

    // Assert toString was called with the tree
    expect(toString).toHaveBeenCalledWith(mockTree);

    // Assert getReadingTime was called with the result of toString
    expect(getReadingTime).toHaveBeenCalledWith('mocked tree text');

    // Assert timeToRead was set correctly in the file frontmatter
    expect(mockFile.data.astro.frontmatter).toEqual({
      timeToRead: '5 min read',
    });
  });

  it('should support dynamic mock values for getReadingTime', () => {
    vi.mocked(getReadingTime).mockReturnValueOnce({ text: '10 min read' } as any);
    
    const plugin = remarkReadingTime();
    const mockTree = { type: 'root', children: [] };
    const mockFile = {
      data: {
        astro: {
          frontmatter: {} as Record<string, any>,
        },
      },
    };

    plugin(mockTree, mockFile);

    expect(mockFile.data.astro.frontmatter.timeToRead).toBe('10 min read');
  });
});
