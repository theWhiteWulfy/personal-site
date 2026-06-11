/**
 * Task ID: TSK-001
 * Unit tests for slugify utility function.
 */

import { describe, it, expect } from 'vitest';
import { slugify } from '@lib/slugify.mjs';

describe('slugify', () => {
  it('should format standard cases correctly', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Astro Static Site')).toBe('astro-static-site');
  });

  it('should strip special characters and non-word characters', () => {
    expect(slugify('C++ Programming')).toBe('c-programming');
    expect(slugify('Hello! World?')).toBe('hello-world');
    expect(slugify('slug@test#run')).toBe('slugtestrun');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('  spaced   out  ')).toBe('spaced-out');
  });

  it('should collapse multiple dashes into a single dash', () => {
    expect(slugify('test--case')).toBe('test-case');
    expect(slugify('multiple---dashes')).toBe('multiple-dashes');
  });

  it('should trim leading and trailing dashes', () => {
    expect(slugify('-leading-')).toBe('leading');
    expect(slugify('--leading--and--trailing--')).toBe('leading-and-trailing');
  });

  it('should preserve dots and underscores', () => {
    expect(slugify('file.name_v2')).toBe('file.name_v2');
    expect(slugify('my.cool_file-name.txt')).toBe('my.cool_file-name.txt');
  });

  it('should handle empty string input', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle numeric-only input', () => {
    expect(slugify('12345')).toBe('12345');
    expect(slugify(12345 as any)).toBe('12345');
  });
});
