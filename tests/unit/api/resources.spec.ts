/**
 * Unit tests for the resource allowlist and metadata registry
 * (Milestone 3, sub-task 3.2).
 */

import { describe, it, expect } from 'vitest';
import { RESOURCES, isValidResource, type ResourceMeta } from '../../../src/lib/api/resources';

describe('Resource registry', () => {
  it('should expose exactly the three downloadable resources', () => {
    expect(Object.keys(RESOURCES).sort()).toEqual([
      'ai-integration-playbook',
      'automation-guide',
      'whitelabel-checklist',
    ]);
  });

  it('should map every resource to its R2 PDF filename', () => {
    expect(RESOURCES['automation-guide'].filename).toBe('automation-guide.pdf');
    expect(RESOURCES['whitelabel-checklist'].filename).toBe('whitelabel-checklist.pdf');
    expect(RESOURCES['ai-integration-playbook'].filename).toBe('ai-integration-playbook.pdf');
  });

  it('should define complete metadata for every resource', () => {
    for (const meta of Object.values(RESOURCES) as ResourceMeta[]) {
      expect(meta.filename).toMatch(/\.pdf$/);
      expect(meta.contentType).toBe('application/pdf');
      expect(meta.displayName.length).toBeGreaterThan(0);
      expect(meta.maxDownloads).toBeGreaterThan(0);
    }
  });
});

describe('isValidResource', () => {
  it.each(Object.keys(RESOURCES))('should accept allowlist key "%s"', (key) => {
    expect(isValidResource(key)).toBe(true);
  });

  it.each([
    '',
    'unknown-resource',
    'Automation-Guide',
    'AUTOMATION_GUIDE',
    '../../etc/passwd',
    'automation-guide.pdf',
    'automation-guide ',
  ])('should reject "%s"', (candidate) => {
    expect(isValidResource(candidate)).toBe(false);
  });
});
