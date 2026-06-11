/**
 * Task ID: TSK-022
 * Description: E2E tests for 404 error page handling
 */

import { test, expect } from '@playwright/test';

test.describe('404 Error Page E2E Tests', () => {
  test('navigating to a non-existent URL returns 404 and renders 404 page', async ({ page }) => {
    // 1. Navigate to a non-existent URL
    const response = await page.goto('/this-page-does-not-exist-12345/');
    
    // 2. Assert response status is 404
    expect(response?.status()).toBe(404);
    
    // 3. Assert user-friendly "not found" message
    await expect(page.locator('h1:has-text("404: Not found")')).toBeVisible();
    await expect(page.locator('h1:has-text("Yep, you\'re lost.")')).toBeVisible();
    await expect(page.locator('text=Sorry, the pixels you are looking for are in another castle')).toBeVisible();
    
    // 4. Assert Layout wrapper renders (header and footer present)
    const header = page.locator('header');
    await expect(header.first()).toBeVisible();
    
    const footer = page.locator('footer#footer');
    await expect(footer).toBeVisible();
  });
});
