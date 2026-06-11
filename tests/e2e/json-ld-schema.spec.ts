/**
 * Task ID: TSK-018
 * Description: E2E tests for JSON-LD Schema.org markup
 */

import { test, expect } from '@playwright/test';

// Helper to extract and parse all JSON-LD schemas on a page, scrubbing dynamic dates
async function getSchemas(page: any): Promise<any[]> {
  const scripts = await page.locator('script[type="application/ld+json"]').all();
  const schemas: any[] = [];
  for (const script of scripts) {
    const text = await script.textContent();
    if (text) {
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        if (item.dateModified) {
          item.dateModified = 'DYNAMIC_DATE_MODIFIED';
        }
        schemas.push(item);
      }
    }
  }
  return schemas;
}

test.describe('JSON-LD Schema.org E2E Tests', () => {
  test('Home page (/) schema structure and snapshot', async ({ page }) => {
    await page.goto('/');
    const schemas = await getSchemas(page);
    
    expect(schemas.length).toBeGreaterThan(0);
    
    // Assert @context and @type exists on all schemas
    for (const schema of schemas) {
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBeDefined();
    }
    
    // Assert WebPage and LocalBusiness are present
    const types = schemas.map(s => s['@type']);
    expect(types).toContain('WebPage');
    expect(types).toContain('LocalBusiness');
    
    // Match snapshot for regression testing
    expect(JSON.stringify(schemas, null, 2)).toMatchSnapshot('home-schemas.json');
  });

  test('Article page schema structure and snapshot', async ({ page }) => {
    await page.goto('/articles/migrating-to-astro/');
    const schemas = await getSchemas(page);
    
    expect(schemas.length).toBeGreaterThan(0);
    
    for (const schema of schemas) {
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBeDefined();
    }
    
    const articleSchema = schemas.find(s => s['@type'] === 'Article');
    expect(articleSchema).toBeDefined();
    expect(articleSchema.author).toBeDefined();
    expect(articleSchema.publisher).toBeDefined();
    expect(articleSchema.datePublished).toBeDefined();
    expect(articleSchema.dateModified).toBeDefined();
    
    const types = schemas.map(s => s['@type']);
    expect(types).toContain('BreadcrumbList');
    
    // Match snapshot for regression testing
    expect(JSON.stringify(schemas, null, 2)).toMatchSnapshot('article-schemas.json');
  });

  test('Contact page schema structure and snapshot', async ({ page }) => {
    await page.goto('/contact/');
    const schemas = await getSchemas(page);
    
    expect(schemas.length).toBeGreaterThan(0);
    
    for (const schema of schemas) {
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBeDefined();
    }
    
    const types = schemas.map(s => s['@type']);
    expect(types).toContain('WebPage');
    expect(types).toContain('LocalBusiness');
    expect(types).toContain('BreadcrumbList');
    
    // Match snapshot for regression testing
    expect(JSON.stringify(schemas, null, 2)).toMatchSnapshot('contact-schemas.json');
  });
});
