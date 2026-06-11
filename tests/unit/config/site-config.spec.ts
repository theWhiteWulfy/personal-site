/**
 * Task ID: TSK-029
 * Unit tests for site configuration file.
 */

import { describe, it, expect } from 'vitest';
import site from '@config/site.js';

describe('Site Configuration', () => {
  it('should have a valid url with no trailing slash', () => {
    expect(site.url).toBe('https://alokprateek.in');
    expect(site.url.endsWith('/')).toBe(false);
  });

  it('should have a non-empty site title', () => {
    expect(site.title).toBeTypeOf('string');
    expect(site.title.trim()).not.toBe('');
  });

  it('should have a valid author object', () => {
    expect(site.author).toBeTypeOf('object');
    expect(site.author).not.toBeNull();
    expect(site.author.name).toBeTypeOf('string');
    expect(site.author.name.trim()).not.toBe('');
    expect(site.author.url).toBeTypeOf('string');
    expect(site.author.url.trim()).not.toBe('');
  });

  it('should have valid image properties', () => {
    expect(site.image).toBeTypeOf('object');
    expect(site.image).not.toBeNull();
    expect(site.image.src).toBeTypeOf('string');
    expect(site.image.src.trim()).not.toBe('');
    expect(site.image.width).toBeTypeOf('number');
    expect(site.image.width).toBeGreaterThan(0);
    expect(site.image.height).toBeTypeOf('number');
    expect(site.image.height).toBeGreaterThan(0);
  });

  it('should have site language set to "en"', () => {
    expect(site.siteLanguage).toBe('en');
  });

  it('should have a valid GA4 measurement ID starting with "G-"', () => {
    expect(site.analytics).toBeTypeOf('object');
    expect(site.analytics.ga4).toBeTypeOf('object');
    expect(site.analytics.ga4.measurementId).toBeTypeOf('string');
    expect(site.analytics.ga4.measurementId).toMatch(/^G-[A-Z0-9]+$/);
  });

  it('should have a valid Clarity project ID set', () => {
    expect(site.analytics.clarity).toBeTypeOf('object');
    expect(site.analytics.clarity.projectId).toBeTypeOf('string');
    expect(site.analytics.clarity.projectId.trim()).not.toBe('');
  });

  it('should have IP anonymization enabled', () => {
    expect(site.analytics.privacy).toBeTypeOf('object');
    expect(site.analytics.privacy.anonymizeIp).toBe(true);
  });

  it('should have a valid mainMenu array with valid links', () => {
    expect(Array.isArray(site.mainMenu)).toBe(true);
    expect(site.mainMenu.length).toBeGreaterThan(0);
    
    site.mainMenu.forEach((item) => {
      expect(item).toBeTypeOf('object');
      expect(item.title).toBeTypeOf('string');
      expect(item.title.trim()).not.toBe('');
      expect(item.path).toBeTypeOf('string');
      expect(item.path.startsWith('/')).toBe(true);
    });
  });

  it('should have a valid footerMenu array with valid links', () => {
    expect(Array.isArray(site.footerMenu)).toBe(true);
    expect(site.footerMenu.length).toBeGreaterThan(0);

    site.footerMenu.forEach((item) => {
      expect(item).toBeTypeOf('object');
      expect(item.title).toBeTypeOf('string');
      expect(item.title.trim()).not.toBe('');
      expect(item.path).toBeTypeOf('string');
      expect(item.path.startsWith('/')).toBe(true);
    });
  });
});
