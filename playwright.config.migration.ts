import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

const config = (baseConfig as any).default || baseConfig;

export default defineConfig({
  ...config,
  testDir: './tests/migration',
});
