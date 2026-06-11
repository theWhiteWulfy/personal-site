/**
 * Task ID: TSK-002
 * Description: Unit tests for core utility functions (formatDate, readingTime, getAdjacentPosts)
 */

import { describe, it, expect } from 'vitest';
import { formatDate, readingTime, getAdjacentPosts } from '@lib/utils';

describe('formatDate', () => {
  it('formats standard date correctly (MM/DD/YYYY)', () => {
    // Construct local-time based Date to prevent timezone shifting
    // standard Date('2024-01-15') defaults to UTC, which in negative timezones might shift to Jan 14.
    // We handle the dynamic expectation to be completely timezone independent.
    const date = new Date('2024-01-15');
    const isNegativeTimezone = date.getDate() === 14;
    const expected = isNegativeTimezone ? '01/14/2024' : '01/15/2024';
    expect(formatDate(date)).toBe(expected);
  });

  it('formats epoch date correctly', () => {
    // Construct dynamic expectation for epoch date based on local timezone
    const epochDate = new Date(0);
    const isEpochNegativeTimezone = epochDate.getDate() === 31;
    const expected = isEpochNegativeTimezone ? '12/31/1969' : '01/01/1970';
    expect(formatDate(epochDate)).toBe(expected);
  });

  it('throws a RangeError for an invalid date input', () => {
    const invalidDate = new Date('invalid-date');
    expect(() => formatDate(invalidDate)).toThrow(RangeError);
  });
});

describe('readingTime', () => {
  it('calculates reading time correctly for a known word count HTML string', () => {
    // "<p>word </p>".repeat(180) yields 180 words.
    // 180 / 180 + 1 = 2 min read.
    const htmlInput = '<p>word </p>'.repeat(180);
    expect(readingTime(htmlInput)).toBe('2 min read');
  });

  it('returns "1 min read" for an empty string', () => {
    expect(readingTime('')).toBe('1 min read');
  });

  it('strips deeply nested HTML tags correctly to calculate reading time', () => {
    const nestedHtml = '<div><main><article><p><span>nested</span> <strong>words</strong> <em>here</em></p></article></main></div>';
    // Strips down to: "nested words here" (3 words)
    // 3 / 180 + 1 = 1.016 -> toFixed() = "1" -> "1 min read"
    expect(readingTime(nestedHtml)).toBe('1 min read');
  });
});

describe('getAdjacentPosts', () => {
  const mockPosts = [
    { slug: 'post-1', title: 'Post 1' },
    { slug: 'post-2', title: 'Post 2' },
    { slug: 'post-3', title: 'Post 3' },
    { slug: 'post-4', title: 'Post 4' },
    { slug: 'post-5', title: 'Post 5' },
  ];

  it('returns correct next and previous posts for a middle post', () => {
    const result = getAdjacentPosts(mockPosts, 'post-3');
    expect(result).toEqual({
      nextPost: { slug: 'post-4', title: 'Post 4' },
      prevPost: { slug: 'post-2', title: 'Post 2' },
    });
  });

  it('returns undefined for the previous post when current post is the first post', () => {
    const result = getAdjacentPosts(mockPosts, 'post-1');
    expect(result).toEqual({
      nextPost: { slug: 'post-2', title: 'Post 2' },
      prevPost: undefined,
    });
  });

  it('returns undefined for the next post when current post is the last post', () => {
    const result = getAdjacentPosts(mockPosts, 'post-5');
    expect(result).toEqual({
      nextPost: undefined,
      prevPost: { slug: 'post-4', title: 'Post 4' },
    });
  });

  it('returns undefined for both next and previous posts when slug does not exist', () => {
    const result = getAdjacentPosts(mockPosts, 'non-existent-slug');
    expect(result).toEqual({
      nextPost: undefined,
      prevPost: undefined,
    });
  });

  it('returns undefined for both next and previous posts when slug is undefined', () => {
    const result = getAdjacentPosts(mockPosts, undefined);
    expect(result).toEqual({
      nextPost: undefined,
      prevPost: undefined,
    });
  });
});
