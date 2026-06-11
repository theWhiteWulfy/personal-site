/**
 * Mock for `astro:transitions` virtual module.
 *
 * In Astro 4, this exports `ViewTransitions`.
 * In Astro 6, `ViewTransitions` is removed and replaced by `ClientRouter`.
 *
 * This mock exports both symbols so tests can validate either state.
 */

import { vi } from 'vitest';

/** Astro 4 component — will be removed in Astro 6 */
export const ViewTransitions = vi.fn();

/** Astro 6 replacement component */
export const ClientRouter = vi.fn();

/**
 * Transition event names (unchanged between v4 and v6):
 *   - 'astro:before-preparation'
 *   - 'astro:after-preparation'
 *   - 'astro:before-swap'
 *   - 'astro:after-swap'
 *   - 'astro:page-load'
 */
export const TRANSITION_EVENTS = {
  BEFORE_PREPARATION: 'astro:before-preparation',
  AFTER_PREPARATION: 'astro:after-preparation',
  BEFORE_SWAP: 'astro:before-swap',
  AFTER_SWAP: 'astro:after-swap',
  PAGE_LOAD: 'astro:page-load',
} as const;
