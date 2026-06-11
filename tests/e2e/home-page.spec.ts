/**
 * Task ID: TSK-021
 * E2E tests for the home page structure and links.
 */

import { test, expect } from '@playwright/test';

test.describe('Home Page E2E Tests', () => {
  test('should render home page successfully with correct layout and key sections', async ({ page }) => {
    // 1. Navigate to the home page
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // 2. Assert heading contains "Automate Your Operations."
    const h1 = page.locator('main h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Automate Your Operations.');

    // 3. Assert "Recent posts" section exists
    const recentPostsHeader = page.locator('h2:has-text("Recent posts")').first();
    await expect(recentPostsHeader).toBeVisible();

    // 4. Assert "Featured articles" section exists
    const featuredArticlesHeader = page.locator('h2:has-text("Featured articles")').first();
    await expect(featuredArticlesHeader).toBeVisible();

    // 5. Assert recent/featured posts list links follow /{collection}/{slug} pattern
    // Get all links inside the h-entry article titles
    const postLinks = page.locator('article.h-entry h2 a');
    const postLinkCount = await postLinks.count();
    expect(postLinkCount).toBeGreaterThan(0);

    for (let i = 0; i < postLinkCount; i++) {
      const href = await postLinks.nth(i).getAttribute('href');
      expect(href).not.toBeNull();
      if (href) {
        // Skip explore menu links (which have a trailing slash)
        if (href.endsWith('/')) {
          continue;
        }
        // Assert it matches collection pattern /collection/slug
        expect(href).toMatch(/^\/(articles|notes|works|bibliophilediaries|saasguide)\/[a-z0-9-_]+$/i);
      }
    }

    // 6. Assert "Explore more on this site" section links
    const exploreMoreHeader = page.locator('h2:has-text("Explore more on this site")').first();
    await expect(exploreMoreHeader).toBeVisible();

    const exploreLinks = [
      { id: 'services', path: '/services/' },
      { id: 'articles', path: '/articles/' },
      { id: 'notes', path: '/notes/' },
      { id: 'works', path: '/works/' },
      { id: 'contact', path: '/contact/' },
      { id: 'support', path: '/support/' },
      { id: 'faqs', path: '/faqs/' },
      { id: 'topics', path: '/tag/' },
    ];

    for (const item of exploreLinks) {
      const link = page.locator(`li#${item.id} a[href="${item.path}"]`).first();
      await expect(link).toBeVisible();
    }

    // 7. Assert CTA button links to /contact/
    const ctaButton = page.locator('a.btn:has-text("Book a free Automation Audit")').first();
    await expect(ctaButton).toBeVisible();
    expect(await ctaButton.getAttribute('href')).toBe('/contact/');
  });
});
