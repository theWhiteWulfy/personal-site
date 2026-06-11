/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Mirror the tsconfig `"@*": ["./src/*"]` pattern
      // Each commonly used alias is explicitly mapped for test clarity
      '@components': resolve(__dirname, './src/components'),
      '@layouts': resolve(__dirname, './src/layouts'),
      '@lib': resolve(__dirname, './src/lib'),
      '@config': resolve(__dirname, './src/config'),
      '@styles': resolve(__dirname, './src/styles'),
      '@images': resolve(__dirname, './src/images'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/config': resolve(__dirname, './src/config'),

      // Stub virtual Astro modules that cannot be resolved outside the Astro compiler
      'astro:content': resolve(__dirname, './tests/mocks/astro-content.ts'),
      'astro:transitions': resolve(__dirname, './tests/mocks/astro-transitions.ts'),
      'astro:assets': resolve(__dirname, './tests/mocks/astro-assets.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node', // Default; per-file override with `// @vitest-environment jsdom`
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'src/lib/**/*.mjs', 'src/pages/api/**/*.ts', 'src/config/**/*.js'],
      exclude: ['src/**/*.astro', 'src/**/*.css'],
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './tests/coverage',
    },
    // Timeout for async D1 mock operations
    testTimeout: 10_000,
  },
});
