/**
 * Task ID: TSK-017
 * Description: E2E tests for SEO metadata
 */

import { test, expect } from '@playwright/test';

test.describe('SEO Metadata E2E Tests', () => {
  test('Home page (/) has correct SEO tags', async ({ page }) => {
    await page.goto('/');
    
    // Assert title
    await expect(page).toHaveTitle(/Meteoric Teachings/);
    
    // Assert description exists
    const description = page.locator('meta[name="description"]');
    await expect(description).toBeAttached();
    await expect(description).toHaveAttribute('content', /Alok Prateek/);
    
    // Assert canonical URL
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toBeAttached();
    await expect(canonical).toHaveAttribute('href', 'https://alokprateek.in/');
    
    // Assert og:type
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toBeAttached();
    await expect(ogType).toHaveAttribute('content', 'website');
    
    // Assert generator
    const generator = page.locator('meta[name="generator"]');
    await expect(generator).toBeAttached();
    await expect(generator).toHaveAttribute('content', /Astro/i);
    
    // Assert JSON-LD exists
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached();
    
    // Common elements
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toBeAttached();
    await expect(page.locator('meta[name="viewport"]').first()).toBeAttached();
  });

  test('Article page has correct SEO tags', async ({ page }) => {
    await page.goto('/articles/migrating-to-astro/');
    
    // Assert og:type
    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toBeAttached();
    await expect(ogType).toHaveAttribute('content', 'article');
    
    // Assert canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toBeAttached();
    await expect(canonical).toHaveAttribute('href', 'https://alokprateek.in/articles/migrating-to-astro/');
    
    // Assert JSON-LD exists
    const jsonLdScripts = await page.locator('script[type="application/ld+json"]').all();
    let hasArticleSchema = false;
    for (const script of jsonLdScripts) {
      const content = await script.textContent();
      if (content) {
        try {
          const parsed = JSON.parse(content);
          const schemas = Array.isArray(parsed) ? parsed : [parsed];
          if (schemas.some(s => s['@type'] === 'Article')) {
            hasArticleSchema = true;
            break;
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }
    expect(hasArticleSchema).toBe(true);
    
    // Common elements
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toBeAttached();
    await expect(page.locator('meta[name="viewport"]').first()).toBeAttached();
  });

  test('Services page has correct SEO tags', async ({ page }) => {
    await page.goto('/services/');
    
    // Assert canonical
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toBeAttached();
    await expect(canonical).toHaveAttribute('href', 'https://alokprateek.in/services/');
    
    // Assert JSON-LD exists
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd.first()).toBeAttached();
    
    // Common elements
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toBeAttached();
    await expect(page.locator('meta[name="viewport"]').first()).toBeAttached();
  });
});
