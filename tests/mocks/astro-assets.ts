/**
 * Mock for `astro:assets` virtual module.
 *
 * Astro's `<Image />` component and `getImage()` helper are only
 * available inside the Astro compiler. This provides stubs.
 */

import { vi } from 'vitest';

/** Stub for the `<Image />` component */
export const Image = vi.fn();

/** Stub for `getImage()` utility */
export const getImage = vi.fn(async (options: any) => ({
  src: options?.src || '/mock-image.png',
  attributes: {
    width: options?.width || 100,
    height: options?.height || 100,
    alt: options?.alt || '',
  },
}));
