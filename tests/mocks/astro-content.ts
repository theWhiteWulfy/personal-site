/**
 * Mock for `astro:content` virtual module.
 *
 * Astro's content collections API (`getCollection`, `getEntry`, `defineCollection`)
 * is only available inside the Astro compiler pipeline. For Vitest unit tests,
 * this module provides stub implementations.
 *
 * Individual tests should override these mocks using `vi.mocked()` for
 * specific test scenarios (e.g., returning a custom list of articles).
 */

import { vi } from 'vitest';

// Re-export Zod for schema validation tests
// The real `z` from `astro:content` is just Zod — we use the same package.
export { z } from 'astro/zod';

/**
 * Stub for `defineCollection`.
 * Returns whatever config is passed in, since we only need the schema
 * definition to be importable — Astro handles the runtime wiring.
 */
export const defineCollection = vi.fn((config: any) => config);

/**
 * Stub for `getCollection`.
 * Default: returns an empty array. Override in tests via:
 *   vi.mocked(getCollection).mockResolvedValue([...])
 */
export const getCollection = vi.fn(async (_name: string) => []);

/**
 * Stub for `getEntry`.
 * Default: returns undefined. Override in tests as needed.
 */
export const getEntry = vi.fn(async (_collection: string, _slug: string) => undefined);

/**
 * Stub for the `render` function (Astro 5+ style).
 * In Astro 4, rendering is `entry.render()`. In Astro 5+, it's `render(entry)`.
 * This stub supports the newer style for migration tests.
 */
export const render = vi.fn(async (_entry: any) => ({
  Content: vi.fn(),
  headings: [],
  remarkPluginFrontmatter: {},
}));
