/**
 * Task ID: TSK-023
 * Description: Playwright E2E tests for View Transitions baseline and SPA navigation validation.
 */

import { test, expect } from '@playwright/test';

// Disable execution under Vitest runner and provide dummy test to prevent "no test suite found" error
if (typeof (globalThis as any).vitest !== 'undefined') {
  (globalThis as any).it('skips Playwright E2E tests in Vitest', () => {
    // No-op
  });
} else {
  test.describe('View Transitions & SPA Navigation E2E Tests', () => {
    
    test('Verify View Transitions meta tags are present on /', async ({ page }) => {
      await page.goto('/');

      // Check for View Transitions meta tags in head
      const vtEnabled = page.locator('meta[name="astro-view-transitions-enabled"]');
      await expect(vtEnabled).toBeAttached();
      await expect(vtEnabled).toHaveAttribute('content', 'true');

      const vtFallback = page.locator('meta[name="astro-view-transitions-fallback"]');
      await expect(vtFallback).toBeAttached();
      await expect(vtFallback).toHaveAttribute('content', 'animate');
      
      // Check that trackConversionEvent is available on the window object
      const isTrackAvailable = await page.evaluate(() => typeof (window as any).trackConversionEvent === 'function');
      expect(isTrackAvailable).toBe(true);
    });

    test('Internal navigation occurs without full page reload (SPA navigation) and preserves trackConversionEvent', async ({ page }) => {
      await page.goto('/');

      // Ensure the page title is correct to confirm it's loaded
      await expect(page).toHaveTitle(/Meteoric Teachings/);

      // Inject a custom property on window to track if a full reload happens
      await page.evaluate(() => {
        (window as any).__spaNavigationFlag = 'persisted';
      });

      // Click the "Articles" navigation link
      const articlesLink = page.locator('nav#nav-primary a[href="/articles/"]');
      await expect(articlesLink).toBeVisible();
      await articlesLink.click();

      // Wait for URL to update to /articles/
      await page.waitForURL(/\/articles\/?$/);

      // Verify the flag still exists on the window object (no reload occurred)
      const flag = await page.evaluate(() => (window as any).__spaNavigationFlag);
      expect(flag).toBe('persisted');

      // Verify page content loaded correctly
      const heading = page.locator('main h1').first();
      await expect(heading).toBeVisible();
      await expect(heading).toHaveText(/Articles/i);

      // Assert window.trackConversionEvent is still available after navigation
      const isTrackAvailable = await page.evaluate(() => typeof (window as any).trackConversionEvent === 'function');
      expect(isTrackAvailable).toBe(true);
    });

    test('Copy buttons initialize and re-initialize after SPA navigation between articles', async ({ page }) => {
      // 1. Navigate directly to migrating-to-astro article (which has code blocks)
      await page.goto('/articles/migrating-to-astro/');

      // Ensure the code blocks are visible
      const preBlocks = page.locator('pre');
      await expect(preBlocks.first()).toBeVisible();

      // Assert that copy buttons are initialized
      const copyButtons = page.locator('pre button.copy-code');
      await expect(copyButtons.first()).toBeVisible();
      await expect(copyButtons.first()).toHaveText(/copy/i);

      // 2. Set SPA navigation flag
      await page.evaluate(() => {
        (window as any).__spaNavigationFlag = 'persisted';
      });

      // 3. Navigate back to articles index
      const articlesMenuLink = page.locator('nav#nav-primary a[href="/articles/"]');
      await expect(articlesMenuLink).toBeVisible();
      await articlesMenuLink.click();

      await page.waitForURL(/\/articles\/?$/);

      // Assert flag persists
      expect(await page.evaluate(() => (window as any).__spaNavigationFlag)).toBe('persisted');

      // 4. Click a different article from the list (jekyll-pwa)
      const jekyllPwaLink = page.locator('a[href^="/articles/jekyll-pwa"]');
      await expect(jekyllPwaLink).toBeVisible();
      await jekyllPwaLink.click();

      await page.waitForURL(/\/articles\/jekyll-pwa\/?$/);

      // Assert flag persists
      expect(await page.evaluate(() => (window as any).__spaNavigationFlag)).toBe('persisted');

      // Assert copy buttons re-initialized on the new article
      const nextPreBlocks = page.locator('pre');
      await expect(nextPreBlocks.first()).toBeVisible();

      const nextCopyButtons = page.locator('pre button.copy-code');
      await expect(nextCopyButtons.first()).toBeVisible();
      await expect(nextCopyButtons.first()).toHaveText(/copy/i);
    });
  });
}
