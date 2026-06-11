/**
 * Task ID: TSK-016
 * E2E tests for FormattedDate rendering in page layouts.
 */

import { test, expect } from '@playwright/test';

test.describe('FormattedDate Component E2E Tests', () => {
  test('should render valid time tags in article list', async ({ page }) => {
    // 1. Navigate to article index page
    await page.goto('/articles/');

    // 2. Select all time tags
    const timeElements = page.locator('article.h-entry time');
    await expect(timeElements.first()).toBeVisible();

    const count = await timeElements.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const timeTag = timeElements.nth(i);
      
      // 3. Assert datetime attribute exists and is a valid ISO date
      const datetime = await timeTag.getAttribute('datetime');
      expect(datetime).not.toBeNull();
      expect(new Date(datetime!).toString()).not.toBe('Invalid Date');

      // 4. Assert text content is a human-readable date matching "Month D(D), YYYY"
      const text = await timeTag.textContent();
      expect(text).not.toBeNull();
      const trimmedText = text!.trim();
      expect(trimmedText).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
    }
  });

  test('should render valid time tag in article details page', async ({ page }) => {
    // 1. Find first article URL
    await page.goto('/articles/');
    const firstArticleLink = page.locator('article.h-entry h2 a').first();
    await expect(firstArticleLink).toBeVisible();
    const href = await firstArticleLink.getAttribute('href');
    expect(href).toBeTruthy();

    // 2. Navigate to article details
    await page.goto(href!);

    // 3. Locate the visible time element
    const visibleTime = page.locator('article.h-entry time').filter({ visible: true }).first();
    await expect(visibleTime).toBeVisible();

    const datetime = await visibleTime.getAttribute('datetime');
    expect(datetime).not.toBeNull();
    expect(datetime!.length).toBeGreaterThan(0);

    const text = await visibleTime.textContent();
    expect(text).not.toBeNull();
    expect(text!.trim().length).toBeGreaterThan(0);
  });
});
