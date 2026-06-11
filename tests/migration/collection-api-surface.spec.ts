/**
 * Task ID: TSK-026
 * Description: E2E tests validating the Astro Content Collections API surface and routing output
 */

import { test, expect } from '@playwright/test';

// Disable execution under Vitest runner and provide dummy test to prevent "no test suite found" error
if (typeof (globalThis as any).vitest !== 'undefined') {
  (globalThis as any).it('skips Playwright E2E tests in Vitest', () => {
    // No-op
  });
} else {
  test.describe('Content Collection API Surface & Routing Baseline', () => {
  
  test('Article paths on articles index match pattern /articles/{slug}/', async ({ page }) => {
    await page.goto('/articles/');
    
    // Select all links in the articles listing
    // Assuming article links are inside main or contain '/articles/'
    const links = await page.locator('a[href^="/articles/"]').all();
    expect(links.length).toBeGreaterThan(0);
    
    const hrefPattern = /^\/articles\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/;
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href !== '/articles/' && href !== '/articles') {
        expect(href).toMatch(hrefPattern);
      }
    }
  });

  test('Article detail page renders standard components correctly', async ({ page }) => {
    // Navigate to articles index to pick the first article URL dynamically
    await page.goto('/articles/');
    const links = await page.locator('a[href^="/articles/"]').all();
    
    let articleUrl = '/articles/migrating-to-astro/'; // fallback
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && href !== '/articles/' && href !== '/articles') {
        articleUrl = href;
        break;
      }
    }
    
    await page.goto(articleUrl);
    
    // Assert <article> element is present
    const article = page.locator('article');
    await expect(article).toBeAttached();
    
    // Assert microformats or class names (.e-content)
    const content = page.locator('.e-content');
    await expect(content).toBeAttached();
    
    // Assert reading time element is present (can contain "min read")
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('min read');
    
    // Assert last modified or publish time element is present
    await expect(page.locator('.dt-published, .dt-updated').first()).toBeAttached();
  });

  test('RSS feed items have valid links matching collection slug pattern', async ({ request }) => {
    const response = await request.get('/rss.xml');
    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('xml');
    
    const text = await response.text();
    
    // Verify stylesheet reference
    expect(text).toContain('href="/rss/pretty-feed-v3.xsl"');
    
    // Check that we have item tags
    expect(text).toContain('<item>');
    
    // Extract links using regex
    const linkMatches = [...text.matchAll(/<link>(https:\/\/alokprateek\.in)?(\/[a-z-]+\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\/)<\/link>/g)];
    expect(linkMatches.length).toBeGreaterThan(0);
    
    // Validate each link matches expected collection routes
    const allowedCollections = ['articles', 'notes', 'works', 'bibliophilediaries', 'saasguide'];
    
    for (const match of linkMatches) {
      const path = match[2];
      const collection = path.split('/')[1];
      expect(allowedCollections).toContain(collection);
      expect(path.endsWith('/')).toBe(true);
    }
  });

  test('Home page recent/featured posts match slug patterns', async ({ page }) => {
    await page.goto('/');
    
    // Find all links to articles, notes, works, etc.
    const allowedPrefixes = ['/articles/', '/notes/', '/works/', '/bibliophilediaries/', '/saasguide/'];
    const links = await page.locator('a').all();
    
    let matchedCount = 0;
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && allowedPrefixes.some(prefix => href.startsWith(prefix))) {
        // Exclude listing indexes like /articles/ or /notes/
        const isIndex = allowedPrefixes.some(prefix => href === prefix || href === prefix.slice(0, -1));
        if (!isIndex) {
          matchedCount++;
          expect(href.length).toBeGreaterThan(0);
        }
      }
    }
    expect(matchedCount).toBeGreaterThan(0);
  });

  test('Tag pages index and individual aggregation routes', async ({ page }) => {
    await page.goto('/tag/');
    
    // Assert tags are listed as links starting with /tag/
    const tagLinks = await page.locator('a[href^="/tag/"]').all();
    expect(tagLinks.length).toBeGreaterThan(0);
    
    let firstTagUrl = '';
    for (const link of tagLinks) {
      const href = await link.getAttribute('href');
      if (href && href !== '/tag/' && href !== '/tag') {
        firstTagUrl = href;
        break;
      }
    }
    
    expect(firstTagUrl).toBeTruthy();
    
    // Navigate to first individual tag page
    await page.goto(firstTagUrl);
    
    // Individual tag pages should list posts matching standard patterns
    const postLinks = await page.locator('a').all();
    let taggedPostsFound = 0;
    const allowedPrefixes = ['/articles/', '/notes/', '/works/', '/bibliophilediaries/', '/saasguide/'];
    
    for (const link of postLinks) {
      const href = await link.getAttribute('href');
      if (href && allowedPrefixes.some(prefix => href.startsWith(prefix))) {
        const isIndex = allowedPrefixes.some(prefix => href === prefix || href === prefix.slice(0, -1));
        if (!isIndex) {
          taggedPostsFound++;
          expect(href.length).toBeGreaterThan(0);
        }
      }
    }
    expect(taggedPostsFound).toBeGreaterThan(0);
  });

  });
}
