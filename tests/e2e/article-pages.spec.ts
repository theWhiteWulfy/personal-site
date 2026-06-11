/**
 * Task ID: TSK-020
 * Description: E2E tests for article index and detail pages.
 */

import { test, expect } from '@playwright/test';

test.describe('Article Pages E2E Tests', () => {
  test('Index: /articles/ lists articles with correct URL formatting', async ({ page }) => {
    // 1. Navigate to the articles index page
    await page.goto('/articles/');

    // 2. Assert articles exist on the page
    const articles = page.locator('article.h-entry');
    await expect(articles.first()).toBeVisible();
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);

    // 3. Assert links start with /articles/ without trailing slash
    const articleLinks = page.locator('article.h-entry h2 a');
    const linkCount = await articleLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    for (let i = 0; i < linkCount; i++) {
      const href = await articleLinks.nth(i).getAttribute('href');
      expect(href).not.toBeNull();
      if (href) {
        // Assert it starts with /articles/
        expect(href.startsWith('/articles/')).toBe(true);
        // Assert it does not end with / (no trailing slash)
        expect(href.endsWith('/')).toBe(false);
      }
    }
  });

  test('Detail: Navigate to first article and assert structure and elements', async ({ page }) => {
    // 1. Navigate to /articles/ to find the first article URL
    await page.goto('/articles/');
    const firstArticleLink = page.locator('article.h-entry h2 a').first();
    await expect(firstArticleLink).toBeVisible();
    const href = await firstArticleLink.getAttribute('href');
    expect(href).toBeTruthy();

    // 2. Navigate to the article detail page
    await page.goto(href!);

    // 3. Assert H1 exists and is not empty (using main h1 or h1.first() to avoid strict mode errors)
    const h1 = page.locator('main h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toBeEmpty();

    // 4. Assert .h-entry article class
    const article = page.locator('article.h-entry');
    await expect(article).toBeVisible();

    // 5. Assert visible time elements exist
    const visibleTime = page.locator('time').filter({ visible: true }).first();
    await expect(visibleTime).toBeVisible();
    await expect(visibleTime).toHaveAttribute('datetime');

    // 6. Assert .e-content class has children/content
    const content = page.locator('.e-content');
    await expect(content).toBeVisible();
    const childrenCount = await content.locator('> *').count();
    expect(childrenCount).toBeGreaterThan(0);

    // 7. Assert prev/next links (if present)
    const prevLink = page.locator('a[rel="prev"]');
    if (await prevLink.count() > 0) {
      await expect(prevLink).toBeVisible();
      const prevHref = await prevLink.getAttribute('href');
      expect(prevHref).toBeTruthy();
    }

    const nextLink = page.locator('a[rel="next"]');
    if (await nextLink.count() > 0) {
      await expect(nextLink).toBeVisible();
      const nextHref = await nextLink.getAttribute('href');
      expect(nextHref).toBeTruthy();
    }

    // 8. Assert tag links point to /tag/{slug}/
    const tagLinks = page.locator('a[href^="/tag/"]');
    const tagCount = await tagLinks.count();
    for (let i = 0; i < tagCount; i++) {
      const tagHref = await tagLinks.nth(i).getAttribute('href');
      expect(tagHref).not.toBeNull();
      if (tagHref) {
        expect(tagHref).toMatch(/^\/tag\/[^/]+\/$/);
      }
    }

    // 9. Assert details with 'Table of contents' summary exists
    const tocDetails = page.locator('details');
    await expect(tocDetails).toBeVisible();
    const tocSummary = tocDetails.locator('summary');
    await expect(tocSummary).toHaveText(/Table of contents/i);
  });
});
