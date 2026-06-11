/**
 * Task ID: TSK-028
 * Description: Unit tests validating the Astro configuration (astro.config.mjs),
 * PostCSS config (postcss.config.cjs), and TypeScript configuration (tsconfig.json)
 */

import { vi, describe, it, expect } from 'vitest';
import { createRequire } from 'module';
import * as fs from 'fs';
import * as path from 'path';

// ─── MODULE MOCKS ───────────────────────────────────────────────────────────
// Self-contained mocks that attach the passed options to the returned object.
// This allows testing options without complex hoisted variable scope.

vi.mock('@astrojs/sitemap', () => ({
  default: (options: any) => ({
    name: '@astrojs/sitemap',
    __options: options,
  }),
}));

vi.mock('@astrojs/mdx', () => ({
  default: (options: any) => ({
    name: '@astrojs/mdx',
    __options: options,
  }),
}));

vi.mock('@playform/compress', () => ({
  default: (options: any) => ({
    name: '@playform/compress',
    __options: options,
  }),
}));

vi.mock('vite-plugin-pwa', () => ({
  VitePWA: (options: any) => ({
    name: 'vite-plugin-pwa',
    __options: options,
  }),
}));

vi.mock('@astrojs/cloudflare', () => ({
  default: (options: any) => ({
    name: '@astrojs/cloudflare',
    __options: options,
  }),
}));

// Now import the astro config and the remark plugins / manifest
import config from '../../astro.config.mjs';
import { remarkReadingTime } from '@lib/remark-reading-time.mjs';
import { remarkModifiedTime } from '@lib/remark-modified-time.mjs';
import { manifest } from '@config/manifest';

describe('Astro Build Configuration (astro.config.mjs)', () => {
  it('should have the correct site URL', () => {
    expect(config.site).toBe('https://alokprateek.in/');
  });

  it('should have output set to hybrid', () => {
    expect(config.output).toBe('hybrid');
  });

  it('should have the correct markdown settings', () => {
    expect(config.markdown).toBeDefined();
    expect(config.markdown?.syntaxHighlight).toBe('prism');
    
    // Check remark plugins
    expect(config.markdown?.remarkPlugins).toBeDefined();
    expect(config.markdown?.remarkPlugins).toHaveLength(2);
    expect(config.markdown?.remarkPlugins).toContain(remarkReadingTime);
    expect(config.markdown?.remarkPlugins).toContain(remarkModifiedTime);
  });

  it('should call and include required integrations', () => {
    expect(config.integrations).toBeDefined();
    const integrations = config.integrations || [];
    
    const sitemapIntegration = integrations.find((i: any) => i.name === '@astrojs/sitemap');
    const mdxIntegration = integrations.find((i: any) => i.name === '@astrojs/mdx');
    const compressIntegration = integrations.find((i: any) => i.name === '@playform/compress');
    
    expect(sitemapIntegration).toBeDefined();
    expect(mdxIntegration).toBeDefined();
    expect(compressIntegration).toBeDefined();
  });

  it('should include VitePWA plugin with correct configuration', () => {
    expect(config.vite).toBeDefined();
    expect(config.vite?.plugins).toBeDefined();
    
    const plugins = config.vite?.plugins || [];
    const flatPlugins = (plugins as any).flat(10);
    const pwaPlugin = flatPlugins.find((plugin: any) => plugin?.name === 'vite-plugin-pwa');
    
    expect(pwaPlugin).toBeDefined();
    expect((pwaPlugin as any).__options).toEqual({
      registerType: "autoUpdate",
      manifest,
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}'],
        navigateFallback: null
      }
    });
  });

  it('should configure the Cloudflare adapter with correct options', () => {
    expect(config.adapter).toBeDefined();
    expect(config.adapter?.name).toBe('@astrojs/cloudflare');
    expect((config.adapter as any)?.__options).toEqual({
      platformProxy: {
        enabled: true,
      },
      imageService: 'passthrough',
    });
  });
});

describe('PostCSS Configuration (postcss.config.cjs)', () => {
  it('should load and define 7 plugins', () => {
    const require = createRequire(import.meta.url);
    const postcssConfig = require('../../postcss.config.cjs');
    
    expect(postcssConfig).toBeDefined();
    expect(postcssConfig.plugins).toBeDefined();
    expect(postcssConfig.plugins).toBeInstanceOf(Array);
    expect(postcssConfig.plugins).toHaveLength(7);
  });
});

describe('TypeScript Configuration (tsconfig.json)', () => {
  it('should have the correct compilerOptions and extends properties', () => {
    const tsconfigPath = path.resolve(__dirname, '../../tsconfig.json');
    const tsconfigRaw = fs.readFileSync(tsconfigPath, 'utf8');
    const tsconfig = JSON.parse(tsconfigRaw);

    expect(tsconfig.extends).toBe('astro/tsconfigs/strict');
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.strictNullChecks).toBe(true);
    expect(tsconfig.compilerOptions.baseUrl).toBe('.');
    expect(tsconfig.compilerOptions.paths).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@*']).toEqual(['./src/*']);
    expect(tsconfig.exclude).toBeDefined();
    expect(tsconfig.exclude).toContain('dist');
    expect(tsconfig.exclude).toContain('public/web/experiment/js');
  });
});
