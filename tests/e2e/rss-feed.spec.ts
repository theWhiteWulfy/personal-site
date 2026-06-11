/**
 * Task ID: TSK-019
 * Description: Playwright E2E tests for RSS feed structure and content integrity.
 */

import { test, expect } from '@playwright/test';

test.describe('RSS Feed E2E Tests', () => {
  test('rss.xml has correct structure and content', async ({ request, page }) => {
    // 1. Fetch /rss.xml via request.get() and verify status 200
    const response = await request.get('/rss.xml');
    expect(response.status()).toBe(200);

    // 2. Verify Content-Type contains xml
    const contentType = response.headers()['content-type'] || '';
    expect(contentType.toLowerCase()).toContain('xml');

    const text = await response.text();

    // 3. Verify stylesheet pretty-feed-v3.xsl is linked
    expect(text).toContain('href="/rss/pretty-feed-v3.xsl"');
    expect(text).toContain('type="text/xsl"');

    // 4. Parse RSS XML in the browser context using DOMParser
    // We navigate to about:blank to have a clean DOM context to run DOMParser
    await page.goto('about:blank');

    const parsedData = await page.evaluate((xmlString) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'application/xml');

      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error(`XML parsing failed: ${parserError.textContent}`);
      }

      const title = doc.querySelector('channel > title')?.textContent || '';
      const description = doc.querySelector('channel > description')?.textContent || '';

      const items = Array.from(doc.querySelectorAll('item')).map(item => {
        const title = item.querySelector('title')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        return { title, link, pubDate };
      });

      return { title, description, items };
    }, text);

    // 5. Assert <title> contains 'Meteoric Teachings'
    expect(parsedData.title).toContain('Meteoric Teachings');

    // 6. Assert <description> exists
    expect(parsedData.description).toBeTruthy();
    expect(parsedData.description.length).toBeGreaterThan(0);

    // 7. Assert at least one <item> exists
    expect(parsedData.items.length).toBeGreaterThan(0);

    // 8. Assert item links and pubDates
    const validCollections = ['articles', 'notes', 'works', 'bibliophilediaries', 'saasguide'];

    for (const item of parsedData.items) {
      // Assert <pubDate> exists with valid date
      expect(item.pubDate).toBeTruthy();
      expect(isNaN(Date.parse(item.pubDate))).toBe(false);

      // Assert <link> matches valid collection pattern
      // Collection prefix should be one of validCollections
      const urlPath = new URL(item.link, 'https://alokprateek.in').pathname;
      const pathParts = urlPath.split('/').filter(Boolean);

      expect(pathParts.length).toBeGreaterThanOrEqual(2);
      const collection = pathParts[0];
      expect(validCollections).toContain(collection);

      // Assert NO item link starts with /faqs/ or /illustrations/
      expect(urlPath.startsWith('/faqs/')).toBe(false);
      expect(urlPath.startsWith('/illustrations/')).toBe(false);
    }
  });
});
