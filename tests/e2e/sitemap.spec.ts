/**
 * Task ID: TSK-030
 * Description: Playwright E2E tests for sitemap validation
 */

import { test, expect } from '@playwright/test';

test.describe('Sitemap E2E Tests', () => {
  test('Verify sitemap-index.xml and child sitemaps', async ({ request }) => {
    // 1. Fetch /sitemap-index.xml and assert 200
    const response = await request.get('/sitemap-index.xml');
    expect(response.status()).toBe(200);

    const xmlText = await response.text();

    // 2. Parse XML and assert at least one <sitemap> link/entry
    const sitemapUrls = [...xmlText.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
    expect(sitemapUrls.length).toBeGreaterThan(0);

    const allUrls: string[] = [];

    // 3. Fetch all child sitemaps listed in the index
    for (const sitemapUrl of sitemapUrls) {
      // Get relative path from absolute URL (e.g. https://alokprateek.in/sitemap-0.xml -> /sitemap-0.xml)
      const urlPath = new URL(sitemapUrl).pathname;
      const childResponse = await request.get(urlPath);
      expect(childResponse.status()).toBe(200);

      const childXmlText = await childResponse.text();
      const urls = [...childXmlText.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
      
      // Verify url nodes exist in the child sitemap
      expect(urls.length).toBeGreaterThan(0);

      allUrls.push(...urls);
    }

    // 4. Assert NO URL is an API route (path starts with /api/)
    for (const url of allUrls) {
      const pathname = new URL(url).pathname;
      expect(pathname.startsWith('/api/')).toBe(false);
    }

    // 5. Assert all URLs use the configured site URL (https://alokprateek.in)
    for (const url of allUrls) {
      expect(url.startsWith('https://alokprateek.in')).toBe(true);
    }

    // 6. Assert key canonical pages exist in the sitemap
    const requiredPaths = [
      'https://alokprateek.in/',
      'https://alokprateek.in/articles/',
      'https://alokprateek.in/notes/',
      'https://alokprateek.in/works/',
      'https://alokprateek.in/contact/',
      'https://alokprateek.in/about/',
      'https://alokprateek.in/services/',
      'https://alokprateek.in/faqs/',
    ];

    for (const path of requiredPaths) {
      const normalizedPath = path.replace(/\/$/, '');
      const matchFound = allUrls.some(url => {
        const normalizedUrl = url.replace(/\/$/, '');
        return normalizedUrl === normalizedPath;
      });
      expect(matchFound, `Expected sitemap to contain path: ${path}`).toBe(true);
    }

    // 7. Snapshot complete URL list for migration diff
    expect(JSON.stringify(allUrls.sort(), null, 2)).toMatchSnapshot('sitemap-urls.json');
  });
});
