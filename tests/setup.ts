/**
 * Global Vitest setup file.
 *
 * This file is loaded before every test suite. It configures:
 * 1. Suppressed console noise (but captures for assertions).
 * 2. Global mocks for modules that don't exist outside the Astro compiler.
 *
 * For D1 mocks, import from `tests/mocks/d1.ts` in individual test files.
 * For Astro virtual module mocks, see `tests/mocks/astro-*.ts`.
 */

import { vi, beforeEach, afterEach } from 'vitest';

// ─── Console Suppression ────────────────────────────────────────────────────
// Suppress console.warn and console.error during tests to reduce noise,
// but make them inspectable via vi.spyOn assertions.

const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  vi.restoreAllMocks();
});
