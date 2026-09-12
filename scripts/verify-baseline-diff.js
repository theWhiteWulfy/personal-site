#!/usr/bin/env node

/**
 * =============================================================================
 * Regression Verification Runner (verify-baseline-diff.js)
 * =============================================================================
 *
 * Verifies the post-upgrade build output and code contracts against the
 * pre-upgrade baseline established in `docs/baseline/` and documented in
 * `docs/seo_invariants.md`, `PROJECT.md`, and `ORIGINAL_REQUEST.md`.
 *
 * 4-Tier Test Architecture:
 *   - Tier 1: Feature Coverage (Collections, RSS, Sitemaps, API route configs)
 *   - Tier 2: Boundary & Corner Cases (URL normalization, XML trailing slashes,
 *             OG tags, JSON-LD schemas, API error responses, 404 page)
 *   - Tier 3: Cross-Feature Interactions (Page rendering, Client Router events,
 *             analytics consent contract, collections + breadcrumbs)
 *   - Tier 4: Real-World Regression Diff against baseline snapshots in `docs/baseline/`
 *             (HTML structure, RSS channel & items, sitemap index & shard URLs)
 *
 * Usage:
 *   node scripts/verify-baseline-diff.js
 *   npm run test:regression
 *   node scripts/verify-baseline-diff.js --tier=1,4
 *   node scripts/verify-baseline-diff.js --verbose
 *
 * Exit Codes:
 *   0: All regression checks passed
 *   1: One or more assertions failed
 * =============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = fs.existsSync(path.join(ROOT_DIR, 'dist', 'client'))
  ? path.join(ROOT_DIR, 'dist', 'client')
  : path.join(ROOT_DIR, 'dist');
const BASELINE_DIR = path.join(ROOT_DIR, 'docs', 'baseline');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// -----------------------------------------------------------------------------
// Terminal Formatting & Reporter Harness
// -----------------------------------------------------------------------------
const useColor = !process.env.NO_COLOR && process.stdout.isTTY !== false;

const colors = {
  reset: useColor ? '\x1b[0m' : '',
  bold: useColor ? '\x1b[1m' : '',
  dim: useColor ? '\x1b[2m' : '',
  green: useColor ? '\x1b[32m' : '',
  red: useColor ? '\x1b[31m' : '',
  yellow: useColor ? '\x1b[33m' : '',
  cyan: useColor ? '\x1b[36m' : '',
  magenta: useColor ? '\x1b[35m' : '',
  blue: useColor ? '\x1b[34m' : '',
  gray: useColor ? '\x1b[90m' : '',
};

class TestHarness {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.selectedTiers = options.tiers || [1, 2, 3, 4];
    this.results = {
      1: { name: 'Tier 1: Feature Coverage', passed: 0, failed: 0, tests: [] },
      2: { name: 'Tier 2: Boundary & Corner Cases', passed: 0, failed: 0, tests: [] },
      3: { name: 'Tier 3: Cross-Feature Interactions', passed: 0, failed: 0, tests: [] },
      4: { name: 'Tier 4: Real-World Baseline Regression Diff', passed: 0, failed: 0, tests: [] },
    };
    this.currentTier = 1;
    this.currentSuite = '';
  }

  setTier(tierNumber) {
    this.currentTier = tierNumber;
  }

  suite(suiteName) {
    this.currentSuite = suiteName;
    console.log(`\n  ${colors.bold}${colors.cyan}${suiteName}${colors.reset}`);
  }

  test(name, fn) {
    const tierData = this.results[this.currentTier];
    try {
      fn();
      tierData.passed++;
      tierData.tests.push({ name, passed: true, suite: this.currentSuite });
      console.log(`    ${colors.green}✓${colors.reset} ${name}`);
    } catch (err) {
      tierData.failed++;
      const message = err.message || String(err);
      tierData.tests.push({ name, passed: false, error: message, suite: this.currentSuite });
      console.log(`    ${colors.red}✗${colors.reset} ${name}`);
      console.log(`      ${colors.red}Error: ${message}${colors.reset}`);
      if (this.verbose && err.stack) {
        console.log(`      ${colors.gray}${err.stack.split('\n').slice(1, 4).join('\n      ')}${colors.reset}`);
      }
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message || 'Values not equal'}: expected [${expected}], received [${actual}]`);
    }
  }

  printSummary(durationMs) {
    console.log(`\n${colors.bold}======================================================================${colors.reset}`);
    console.log(`${colors.bold}                REGRESSION VERIFICATION SUITE SUMMARY                 ${colors.reset}`);
    console.log(`${colors.bold}======================================================================${colors.reset}\n`);

    let totalPassed = 0;
    let totalFailed = 0;

    for (const tierNum of [1, 2, 3, 4]) {
      if (!this.selectedTiers.includes(tierNum)) continue;
      const t = this.results[tierNum];
      totalPassed += t.passed;
      totalFailed += t.failed;
      const total = t.passed + t.failed;
      const passRate = total > 0 ? ((t.passed / total) * 100).toFixed(1) : '0.0';
      const statusColor = t.failed === 0 ? colors.green : colors.red;
      const statusIcon = t.failed === 0 ? '✓' : '✗';

      console.log(
        `  ${statusColor}${statusIcon} ${t.name.padEnd(46)}${colors.reset} ` +
        `Passed: ${String(t.passed).padStart(2)}/${String(total).padEnd(2)} ` +
        `(${passRate}%)`
      );
    }

    const grandTotal = totalPassed + totalFailed;
    const overallRate = grandTotal > 0 ? ((totalPassed / grandTotal) * 100).toFixed(1) : '0.0';

    console.log(`\n${colors.bold}----------------------------------------------------------------------${colors.reset}`);
    console.log(
      `  ${colors.bold}Total Checks:${colors.reset} ${grandTotal}  |  ` +
      `${colors.green}${colors.bold}Passed:${colors.reset} ${totalPassed}  |  ` +
      `${totalFailed > 0 ? colors.red : colors.gray}${colors.bold}Failed:${colors.reset} ${totalFailed}  |  ` +
      `Success Rate: ${overallRate}%  |  Duration: ${(durationMs / 1000).toFixed(2)}s`
    );
    console.log(`${colors.bold}======================================================================${colors.reset}`);

    if (totalFailed > 0) {
      console.log(`\n${colors.red}${colors.bold}FAILED CHECKS BREAKDOWN:${colors.reset}`);
      for (const tierNum of [1, 2, 3, 4]) {
        if (!this.selectedTiers.includes(tierNum)) continue;
        const failedTests = this.results[tierNum].tests.filter((t) => !t.passed);
        if (failedTests.length > 0) {
          console.log(`\n  ${colors.bold}Tier ${tierNum}:${colors.reset}`);
          for (const ft of failedTests) {
            console.log(`    ${colors.red}✗ [${ft.suite}] ${ft.name}${colors.reset}`);
            console.log(`      ${colors.yellow}${ft.error}${colors.reset}`);
          }
        }
      }
      console.log('');
      return false;
    }

    console.log(`\n${colors.green}${colors.bold}All regression verification tests passed successfully!${colors.reset}\n`);
    return true;
  }
}

// -----------------------------------------------------------------------------
// Baseline HTML and Dist Pair Mapping
// -----------------------------------------------------------------------------
const HTML_PAIRS = [
  {
    name: 'Home Index',
    collection: 'root',
    pageType: 'home',
    baseline: path.join(BASELINE_DIR, 'index.html'),
    dist: path.join(DIST_DIR, 'index.html'),
    expectedCanonical: 'https://alokprateek.in/',
  },
  {
    name: 'Article Detail',
    collection: 'articles',
    pageType: 'article',
    baseline: path.join(BASELINE_DIR, 'article-migrating-to-astro.html'),
    dist: path.join(DIST_DIR, 'articles', 'migrating-to-astro', 'index.html'),
    expectedCanonical: 'https://alokprateek.in/articles/migrating-to-astro/',
  },
  {
    name: 'Bibliophile Diaries Detail',
    collection: 'bibliophilediaries',
    pageType: 'bibliophilediaries',
    baseline: path.join(BASELINE_DIR, 'bibliophilediaries-basics.html'),
    dist: path.join(DIST_DIR, 'bibliophilediaries', 'basics', 'index.html'),
    expectedCanonical: 'https://alokprateek.in/bibliophilediaries/basics/',
  },
  {
    name: 'FAQ Detail',
    collection: 'faqs',
    pageType: 'faq',
    baseline: path.join(BASELINE_DIR, 'faq-pricing.html'),
    dist: path.join(DIST_DIR, 'faqs', 'pricing', 'index.html'),
    expectedCanonical: 'https://alokprateek.in/faqs/pricing/',
  },
  {
    name: 'Illustration Detail',
    collection: 'illustrations',
    pageType: 'illustration',
    baseline: path.join(BASELINE_DIR, 'illustration-cards.html'),
    dist: path.join(DIST_DIR, 'illustrations', 'cards', 'index.html'),
    expectedCanonical: 'https://alokprateek.in/illustrations/cards/',
  },
  {
    name: 'Note Detail',
    collection: 'notes',
    pageType: 'note',
    baseline: path.join(BASELINE_DIR, 'note-day-0.html'),
    dist: path.join(DIST_DIR, 'notes', 'day-0', 'index.html'),
    expectedCanonical: 'https://alokprateek.in/notes/day-0/',
  },
  {
    name: 'SaaS Guide Detail',
    collection: 'saasguide',
    pageType: 'saasguide',
    baseline: path.join(BASELINE_DIR, 'saasguide-getting-started.html'),
    dist: path.join(DIST_DIR, 'saasguide', 'getting-started', 'index.html'),
    expectedCanonical: 'https://alokprateek.in/saasguide/getting-started/',
  },
  {
    name: 'Tag Detail',
    collection: 'tag',
    pageType: 'tag',
    baseline: path.join(BASELINE_DIR, 'tag-academic.html'),
    dist: path.join(DIST_DIR, 'tag', 'academic', 'index.html'),
    expectedCanonical: 'https://alokprateek.in/tag/academic/',
  },
  {
    name: 'Work Detail',
    collection: 'works',
    pageType: 'work',
    baseline: path.join(BASELINE_DIR, 'work-baario.html'),
    dist: path.join(DIST_DIR, 'works', 'baario', 'index.html'),
    expectedCanonical: 'https://alokprateek.in/works/baario/',
  },
];

// Helper: load and parse XML with JSDOM
function parseXml(xmlContent) {
  const dom = new JSDOM(xmlContent, { contentType: 'text/xml' });
  return dom.window.document;
}

// Helper: load and parse HTML with JSDOM
function parseHtml(htmlContent) {
  const dom = new JSDOM(htmlContent);
  return dom.window.document;
}

// Helper: safe file read
function readTextFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

// -----------------------------------------------------------------------------
// TIER 1: Feature Coverage
// -----------------------------------------------------------------------------
function runTier1(harness) {
  harness.setTier(1);
  console.log(`\n${colors.bold}${colors.blue}=== TIER 1: FEATURE COVERAGE ===${colors.reset}`);

  // 1. Content Collections Coverage
  harness.suite('Content Collections Architecture');

  harness.test('src/content/config.ts exports all 8 specified collections', () => {
    const configPath = path.join(SRC_DIR, 'content', 'config.ts');
    const content = readTextFile(configPath);

    const expectedCollections = [
      'articles',
      'notes',
      'works',
      'illustrations',
      'bibliophilediaries',
      'faqs',
      'saasguide',
      'albums',
    ];

    const collectionsExportRegex = /export\s+const\s+collections\s*=\s*\{([^}]+)\}/;
    const match = content.match(collectionsExportRegex);
    harness.assert(match, 'export const collections = { ... } declaration not found in src/content/config.ts');

    const exportedKeys = match[1].split(',').map((s) => s.trim()).filter(Boolean);
    for (const coll of expectedCollections) {
      harness.assert(
        exportedKeys.includes(coll),
        `Collection '${coll}' is missing from exported collections in src/content/config.ts`
      );
    }
  });

  harness.test('Content source directories exist for all 8 collections', () => {
    const expectedCollections = [
      'articles',
      'notes',
      'works',
      'illustrations',
      'bibliophilediaries',
      'faqs',
      'saasguide',
      'albums',
    ];

    for (const coll of expectedCollections) {
      const collDir = path.join(SRC_DIR, 'content', coll);
      harness.assert(fs.existsSync(collDir), `Content directory missing: ${collDir}`);
    }
  });

  harness.test('Rendered output pages exist in dist for all content collections', () => {
    const publicCollections = [
      'articles',
      'notes',
      'works',
      'illustrations',
      'bibliophilediaries',
      'faqs',
      'saasguide',
    ];

    for (const coll of publicCollections) {
      const collDistDir = path.join(DIST_DIR, coll);
      harness.assert(fs.existsSync(collDistDir), `Collection output missing in dist: ${collDistDir}`);
    }
  });

  // 2. RSS Feed Coverage
  harness.suite('RSS Feed Generation');

  harness.test('dist/rss.xml exists and has valid 2.0 schema structure', () => {
    const rssPath = path.join(DIST_DIR, 'rss.xml');
    const rssXml = readTextFile(rssPath);
    const doc = parseXml(rssXml);

    const rssTag = doc.querySelector('rss');
    harness.assert(rssTag, 'Root <rss> tag not found in dist/rss.xml');
    harness.assertEqual(rssTag.getAttribute('version'), '2.0', 'RSS root version is not 2.0');

    const channel = doc.querySelector('channel');
    harness.assert(channel, '<channel> element missing in dist/rss.xml');

    const title = channel.querySelector('title')?.textContent;
    const link = channel.querySelector('link')?.textContent;
    const description = channel.querySelector('description')?.textContent;

    harness.assertEqual(title, 'Meteoric Teachings', 'RSS feed channel title mismatch');
    harness.assertEqual(link, 'https://alokprateek.in/', 'RSS feed channel link mismatch');
    harness.assert(description && description.length > 0, 'RSS channel description is empty');
  });

  harness.test('dist/rss.xml items contain valid title, link, pubDate, and RFC 2822 timestamps', () => {
    const rssPath = path.join(DIST_DIR, 'rss.xml');
    const rssXml = readTextFile(rssPath);
    const doc = parseXml(rssXml);

    const items = Array.from(doc.querySelectorAll('item'));
    harness.assert(items.length > 0, 'RSS feed contains 0 items');

    for (const item of items) {
      const title = item.querySelector('title')?.textContent?.trim();
      const link = item.querySelector('link')?.textContent?.trim();
      const pubDate = item.querySelector('pubDate')?.textContent?.trim();

      harness.assert(title && title.length > 0, `RSS item has missing or empty title`);
      harness.assert(link && link.startsWith('https://alokprateek.in/'), `RSS item link invalid: ${link}`);
      harness.assert(pubDate && !isNaN(Date.parse(pubDate)), `RSS item has invalid pubDate: ${pubDate}`);
    }
  });

  harness.test('dist/rss.xml strictly includes permitted collections and excludes disallowed collections', () => {
    const rssPath = path.join(DIST_DIR, 'rss.xml');
    const rssXml = readTextFile(rssPath);
    const doc = parseXml(rssXml);

    const allowedPrefixes = [
      'https://alokprateek.in/articles/',
      'https://alokprateek.in/notes/',
      'https://alokprateek.in/works/',
      'https://alokprateek.in/bibliophilediaries/',
      'https://alokprateek.in/saasguide/',
    ];
    const disallowedPrefixes = [
      'https://alokprateek.in/faqs/',
      'https://alokprateek.in/illustrations/',
      'https://alokprateek.in/albums/',
    ];

    const items = Array.from(doc.querySelectorAll('item'));
    for (const item of items) {
      const link = item.querySelector('link')?.textContent?.trim() || '';
      for (const disallowed of disallowedPrefixes) {
        harness.assert(
          !link.startsWith(disallowed),
          `Disallowed collection found in RSS feed item: ${link}`
        );
      }
      const matchesAllowed = allowedPrefixes.some((prefix) => link.startsWith(prefix));
      harness.assert(matchesAllowed, `RSS item link not in allowed collections set: ${link}`);
    }
  });

  // 3. Sitemaps Coverage
  harness.suite('Sitemaps Integration');

  harness.test('dist/sitemap-index.xml and dist/sitemap-0.xml exist and parse cleanly', () => {
    const sitemapIndexPath = path.join(DIST_DIR, 'sitemap-index.xml');
    const sitemap0Path = path.join(DIST_DIR, 'sitemap-0.xml');

    const indexXml = readTextFile(sitemapIndexPath);
    const sitemap0Xml = readTextFile(sitemap0Path);

    const indexDoc = parseXml(indexXml);
    const sitemap0Doc = parseXml(sitemap0Xml);

    harness.assert(indexDoc.querySelector('sitemapindex'), '<sitemapindex> root missing in sitemap-index.xml');
    harness.assert(sitemap0Doc.querySelector('urlset'), '<urlset> root missing in sitemap-0.xml');

    const loc = indexDoc.querySelector('sitemap loc')?.textContent?.trim();
    harness.assertEqual(loc, 'https://alokprateek.in/sitemap-0.xml', 'Sitemap index shard reference mismatch');
  });

  harness.test('dist/sitemap-0.xml includes core pages, content collections, and tags', () => {
    const sitemap0Path = path.join(DIST_DIR, 'sitemap-0.xml');
    const sitemap0Xml = readTextFile(sitemap0Path);
    const doc = parseXml(sitemap0Xml);

    const urls = Array.from(doc.querySelectorAll('url loc')).map((el) => el.textContent?.trim());
    harness.assert(urls.length >= 50, `Sitemap-0 has suspiciously low URL count: ${urls.length}`);

    const expectedIncluded = [
      'https://alokprateek.in/',
      'https://alokprateek.in/about/',
      'https://alokprateek.in/contact/',
      'https://alokprateek.in/terms/',
      'https://alokprateek.in/support/',
      'https://alokprateek.in/sitemap/',
      'https://alokprateek.in/articles/',
      'https://alokprateek.in/notes/',
      'https://alokprateek.in/works/',
    ];

    for (const expUrl of expectedIncluded) {
      harness.assert(urls.includes(expUrl), `Required URL missing from sitemap-0.xml: ${expUrl}`);
    }
  });

  harness.test('dist/sitemap-0.xml strictly excludes all server-rendered /api/ endpoints', () => {
    const sitemap0Path = path.join(DIST_DIR, 'sitemap-0.xml');
    const sitemap0Xml = readTextFile(sitemap0Path);
    const doc = parseXml(sitemap0Xml);

    const urls = Array.from(doc.querySelectorAll('url loc')).map((el) => el.textContent?.trim() || '');
    for (const u of urls) {
      const pathname = new URL(u).pathname;
      harness.assert(!pathname.startsWith('/api/'), `Server-rendered API route leaked into sitemap: ${u}`);
    }
  });

  // 4. API Routes Configuration Coverage
  harness.suite('API Route Configuration & DB Guards');

  const apiRouteFiles = [
    'campaign-signup.ts',
    'campaign-visit.ts',
    'campaigns.ts',
    'leadform.ts',
    'newsletter.ts',
    'resource-download.ts',
    'serve-resource.ts',
  ];

  harness.test('All 7 API route handler source files exist in src/pages/api/', () => {
    for (const file of apiRouteFiles) {
      const fullPath = path.join(SRC_DIR, 'pages', 'api', file);
      harness.assert(fs.existsSync(fullPath), `API route file missing: ${fullPath}`);
    }
  });

  harness.test('All 7 API routes export prerender = false for Cloudflare SSR', () => {
    for (const file of apiRouteFiles) {
      const fullPath = path.join(SRC_DIR, 'pages', 'api', file);
      const content = readTextFile(fullPath);
      harness.assert(
        /export\s+const\s+prerender\s*=\s*false/.test(content),
        `Missing 'export const prerender = false' in ${file}`
      );
    }
  });

  harness.test('All 7 API routes guard database access with getDatabase(locals)', () => {
    for (const file of apiRouteFiles) {
      const fullPath = path.join(SRC_DIR, 'pages', 'api', file);
      const content = readTextFile(fullPath);
      harness.assert(
        /import\s+.*getDatabase.*from\s+['"]@\/lib\/api\/database['"]/.test(content),
        `Missing import of getDatabase from '@/lib/api/database' in ${file}`
      );
      harness.assert(
        /getDatabase\s*\(\s*locals\s*\)/.test(content),
        `Missing invocation of getDatabase(locals) in ${file}`
      );
    }
  });
}

// -----------------------------------------------------------------------------
// TIER 2: Boundary & Corner Cases
// -----------------------------------------------------------------------------
function runTier2(harness) {
  harness.setTier(2);
  console.log(`\n${colors.bold}${colors.blue}=== TIER 2: BOUNDARY & CORNER CASES ===${colors.reset}`);

  // 1. URL Normalization & Trailing Slashes
  harness.suite('URL Normalization Invariants');

  harness.test('File extension endpoints (.xml) have NO trailing slash', () => {
    // Check sitemap-index.xml
    const sitemapIndexPath = path.join(DIST_DIR, 'sitemap-index.xml');
    const indexXml = readTextFile(sitemapIndexPath);
    const indexDoc = parseXml(indexXml);
    const locs = Array.from(indexDoc.querySelectorAll('sitemap loc')).map((el) => el.textContent?.trim());

    for (const loc of locs) {
      harness.assert(
        !loc.endsWith('.xml/'),
        `Sitemap index contains trailing slash on XML shard: ${loc}`
      );
    }

    // Check site config feedUrl
    const siteConfigPath = path.join(SRC_DIR, 'config', 'site.js');
    if (fs.existsSync(siteConfigPath)) {
      const siteConfig = readTextFile(siteConfigPath);
      harness.assert(
        !siteConfig.includes('/rss.xml/'),
        'site.js contains trailing slash in /rss.xml/'
      );
    }
  });

  harness.test('Rendered HTML <link rel="alternate"> RSS feed URL has NO trailing slash', () => {
    for (const pair of HTML_PAIRS) {
      if (!fs.existsSync(pair.dist)) continue;
      const doc = parseHtml(readTextFile(pair.dist));
      const rssLink = doc.querySelector('link[rel="alternate"][type="application/rss+xml"]');
      harness.assert(rssLink, `Missing RSS alternate link in ${pair.name}`);
      const href = rssLink.getAttribute('href');
      harness.assertEqual(
        href,
        'https://alokprateek.in/rss.xml',
        `RSS alternate link has trailing slash or invalid URL in ${pair.name}`
      );
    }
  });

  harness.test('Rendered HTML canonical URLs have trailing slashes for content routes', () => {
    for (const pair of HTML_PAIRS) {
      if (!fs.existsSync(pair.dist)) continue;
      const doc = parseHtml(readTextFile(pair.dist));
      const canonical = doc.querySelector('link[rel="canonical"]');
      harness.assert(canonical, `Missing canonical link in ${pair.name}`);
      const href = canonical.getAttribute('href');

      harness.assertEqual(
        href,
        pair.expectedCanonical,
        `Canonical URL mismatch in ${pair.name}`
      );
      harness.assert(
        href.endsWith('/'),
        `Canonical URL missing trailing slash in ${pair.name}: ${href}`
      );
      harness.assert(
        !href.replace('https://', '').includes('//'),
        `Canonical URL contains double slashes in ${pair.name}: ${href}`
      );
    }
  });

  // 2. Open Graph & Twitter Social Tags
  harness.suite('Social Metadata (Open Graph & Twitter)');

  harness.test('Rendered HTML contains valid og:site_name, og:title, og:url, and og:type', () => {
    for (const pair of HTML_PAIRS) {
      if (!fs.existsSync(pair.dist)) continue;
      const doc = parseHtml(readTextFile(pair.dist));

      const siteName = doc.querySelector('meta[property="og:site_name"]')?.getAttribute('content');
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
      const ogUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute('content');
      const ogType = doc.querySelector('meta[property="og:type"]')?.getAttribute('content');

      harness.assertEqual(siteName, 'Meteoric Teachings', `og:site_name mismatch in ${pair.name}`);
      harness.assert(ogTitle && ogTitle.length > 0, `og:title is empty in ${pair.name}`);
      harness.assertEqual(ogUrl, pair.expectedCanonical, `og:url does not match canonical in ${pair.name}`);

      const expectedType = (pair.pageType === 'article' || pair.pageType === 'note') ? 'article' : 'website';
      harness.assertEqual(ogType, expectedType, `og:type mismatch in ${pair.name}`);
    }
  });

  harness.test('Rendered HTML contains valid twitter:card and twitter:creator', () => {
    for (const pair of HTML_PAIRS) {
      if (!fs.existsSync(pair.dist)) continue;
      const doc = parseHtml(readTextFile(pair.dist));

      const card = doc.querySelector('meta[property="twitter:card"]')?.getAttribute('content');
      const creator = doc.querySelector('meta[name="twitter:creator"]')?.getAttribute('content');

      harness.assertEqual(card, 'summary_large_image', `twitter:card mismatch in ${pair.name}`);
      harness.assertEqual(creator, '@thewhitewulfy', `twitter:creator mismatch in ${pair.name}`);
    }
  });

  // 3. Schema.org JSON-LD Verification
  harness.suite('JSON-LD Schema Verification');

  harness.test('All JSON-LD scripts are valid JSON with @context and non-empty @type', () => {
    for (const pair of HTML_PAIRS) {
      if (!fs.existsSync(pair.dist)) continue;
      const doc = parseHtml(readTextFile(pair.dist));
      const schemaScripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));

      harness.assert(schemaScripts.length > 0, `No JSON-LD schemas found in ${pair.name}`);

      for (let idx = 0; idx < schemaScripts.length; idx++) {
        const text = schemaScripts[idx].textContent;
        let schema;
        try {
          schema = JSON.parse(text);
        } catch (e) {
          throw new Error(`JSON-LD #${idx} in ${pair.name} failed to parse: ${e.message}`);
        }

        harness.assertEqual(schema['@context'], 'https://schema.org', `Schema #${idx} in ${pair.name} missing @context`);
        harness.assert(
          typeof schema['@type'] === 'string' && schema['@type'].length > 0,
          `Schema #${idx} in ${pair.name} missing @type`
        );
      }
    }
  });

  harness.test('Home page emits WebPage, BreadcrumbList, and Person schemas', () => {
    const homePath = path.join(DIST_DIR, 'index.html');
    const doc = parseHtml(readTextFile(homePath));
    const schemas = Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).map((el) =>
      JSON.parse(el.textContent)
    );
    const types = schemas.map((s) => s['@type']);

    harness.assert(types.includes('WebPage'), 'Home page missing WebPage schema');
    harness.assert(types.includes('BreadcrumbList'), 'Home page missing BreadcrumbList schema');
    harness.assert(types.includes('Person'), 'Home page missing Person schema');
  });

  harness.test('Article page emits Article and BreadcrumbList schemas with author metadata', () => {
    const articlePath = path.join(DIST_DIR, 'articles', 'migrating-to-astro', 'index.html');
    const doc = parseHtml(readTextFile(articlePath));
    const schemas = Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).map((el) =>
      JSON.parse(el.textContent)
    );

    const articleSchema = schemas.find((s) => s['@type'] === 'Article');
    harness.assert(articleSchema, 'Article page missing Article schema');
    harness.assert(articleSchema.author, 'Article schema missing author');
    harness.assertEqual(articleSchema.author.name, 'Alok Prateek', 'Article author name mismatch');
  });

  // 4. Fallbacks & 404 Error Page
  harness.suite('Error Fallback & 404 Invariants');

  harness.test('Database guard contract returns 500 when locals.runtime.env.DB is missing', async () => {
    const dbModulePath = path.join(SRC_DIR, 'lib', 'api', 'database.ts');
    harness.assert(fs.existsSync(dbModulePath), 'Database helper src/lib/api/database.ts missing');
    const code = readTextFile(dbModulePath);

    harness.assert(
      code.includes('export function getDatabase'),
      'src/lib/api/database.ts does not export getDatabase'
    );
    harness.assert(
      code.includes('status: 500') || code.includes('status = 500'),
      'getDatabase does not configure status 500 on missing DB'
    );
  });

  harness.test('dist/404.html exists with proper viewport, title, and structure', () => {
    const notFoundPath = path.join(DIST_DIR, '404.html');
    harness.assert(fs.existsSync(notFoundPath), '404.html output missing in dist/');

    const doc = parseHtml(readTextFile(notFoundPath));
    const title = doc.querySelector('title')?.textContent;
    const viewport = doc.querySelector('meta[name="viewport"]')?.getAttribute('content');

    harness.assert(title && title.length > 0, '404.html has empty title');
    harness.assert(viewport && viewport.includes('width=device-width'), '404.html missing viewport meta');
  });
}

// -----------------------------------------------------------------------------
// TIER 3: Cross-Feature Interactions
// -----------------------------------------------------------------------------
function runTier3(harness) {
  harness.setTier(3);
  console.log(`\n${colors.bold}${colors.blue}=== TIER 3: CROSS-FEATURE INTERACTIONS ===${colors.reset}`);

  // 1. Client Router Lifecycle Listeners
  harness.suite('Client Router Lifecycle Listeners (astro:after-swap)');

  const swapListenerTargets = [
    { file: 'src/components/Head.astro', desc: 'tel/mailto click tracking and copy code buttons' },
    { file: 'src/components/CampaignCTA.astro', desc: 'initCampaignCTA listener' },
    { file: 'src/components/CampaignHero.astro', desc: 'initCountdownTimer listener' },
    { file: fs.existsSync(path.join(ROOT_DIR, 'src', 'lib', 'api', 'utm-tracking.ts')) ? 'src/lib/api/utm-tracking.ts' : 'src/lib/utm-tracking.ts', desc: 'UTMTracker.initialize listener' },
    { file: 'src/lib/resource-form.js', desc: 'initializeResourceForms listener' },
    { file: 'src/pages/offers/[...slug].astro', desc: 'initCampaignAnalytics listener' },
    { file: 'src/pages/offers/expired.astro', desc: 'trackExpiredCampaignVisit listener' },
  ];

  harness.test('All 8 documented post-swap listener points are wired up in source files', () => {
    for (const target of swapListenerTargets) {
      const fullPath = path.join(ROOT_DIR, target.file);
      harness.assert(fs.existsSync(fullPath), `Target file missing: ${target.file}`);
      const content = readTextFile(fullPath);

      const hasAfterSwap = content.includes('astro:after-swap');
      const hasOnPageSwap = content.includes('onPageSwap');

      harness.assert(
        hasAfterSwap || hasOnPageSwap,
        `File ${target.file} (${target.desc}) does not register astro:after-swap or onPageSwap listener`
      );
    }
  });

  harness.test('Rendered HTML pages include post-swap listener inline scripts', () => {
    const indexPath = path.join(DIST_DIR, 'index.html');
    const html = readTextFile(indexPath);

    harness.assert(
      html.includes('astro:after-swap'),
      'Rendered dist/index.html does not contain astro:after-swap event listener'
    );
    harness.assert(
      html.includes('addCopyCodeButtons'),
      'Rendered dist/index.html does not contain addCopyCodeButtons reattachment script'
    );
  });

  // 2. Analytics Consent & Opt-Out Global Contract
  harness.suite('Analytics Consent & Privacy Contract');

  harness.test('Rendered HTML contains global analytics helper functions on window', () => {
    const indexPath = path.join(DIST_DIR, 'index.html');
    const html = readTextFile(indexPath);

    const requiredGlobals = [
      'window.checkAnalyticsConsent',
      'window.hasOptedOut',
      'window.setAnalyticsConsent',
      'window.setOptOutPreference',
      'window.trackEngagementEvent',
      'window.trackConversionEvent',
    ];

    for (const g of requiredGlobals) {
      harness.assert(
        html.includes(g),
        `Global analytics function missing in rendered HTML: ${g}`
      );
    }
  });

  harness.test('Rendered HTML configures analytics consent cookies correctly', () => {
    const indexPath = path.join(DIST_DIR, 'index.html');
    const html = readTextFile(indexPath);

    harness.assert(
      html.includes('analytics_consent='),
      "Consent cookie 'analytics_consent' missing from inline analytics script"
    );
    harness.assert(
      html.includes('meteoric_analytics_consent'),
      "Opt-out cookie 'meteoric_analytics_consent' missing from inline analytics script"
    );
  });

  // 3. Collection Data + Dynamic Routing
  harness.suite('Collections Data & Taxonomy Rendering');

  harness.test('Collection detail pages render hierarchical BreadcrumbList JSON-LD', () => {
    const articlePath = path.join(DIST_DIR, 'articles', 'migrating-to-astro', 'index.html');
    const doc = parseHtml(readTextFile(articlePath));

    const schemas = Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).map((el) =>
      JSON.parse(el.textContent)
    );
    const breadcrumb = schemas.find((s) => s['@type'] === 'BreadcrumbList');
    harness.assert(breadcrumb, 'BreadcrumbList missing on article page');

    const items = breadcrumb.itemListElement;
    harness.assert(Array.isArray(items) && items.length >= 3, 'BreadcrumbList does not have at least 3 hierarchy items');
    harness.assertEqual(items[0].name, 'Home', 'First breadcrumb item is not Home');
    harness.assertEqual(items[1].name, 'Articles', 'Second breadcrumb item is not Articles');
  });

  harness.test('Collection detail pages render main content article with semantic structure', () => {
    for (const pair of HTML_PAIRS) {
      if (pair.collection === 'root' || pair.collection === 'tag') continue;
      if (!fs.existsSync(pair.dist)) continue;

      const doc = parseHtml(readTextFile(pair.dist));
      const main = doc.querySelector('main') || doc.querySelector('article');
      harness.assert(main, `Semantic <main> or <article> missing in ${pair.name}`);

      const h1 = doc.querySelector('h1');
      harness.assert(h1 && h1.textContent.trim().length > 0, `<h1> heading missing in ${pair.name}`);
    }
  });
}

// -----------------------------------------------------------------------------
// TIER 4: Real-World Regression Diff Against Baseline Snapshots
// -----------------------------------------------------------------------------
function runTier4(harness) {
  harness.setTier(4);
  console.log(`\n${colors.bold}${colors.blue}=== TIER 4: REAL-WORLD REGRESSION DIFF AGAINST BASELINE ===${colors.reset}`);

  // 1. HTML Snapshots Equivalence
  harness.suite('Rendered HTML Baseline Snapshots Equivalence');

  harness.test('All 9 baseline HTML snapshot files exist in docs/baseline/', () => {
    for (const pair of HTML_PAIRS) {
      harness.assert(
        fs.existsSync(pair.baseline),
        `Baseline snapshot missing: ${pair.baseline}`
      );
    }
  });

  for (const pair of HTML_PAIRS) {
    harness.test(`HTML regression diff for [${pair.name}] against baseline snapshot`, () => {
      harness.assert(fs.existsSync(pair.baseline), `Baseline snapshot missing: ${pair.baseline}`);
      harness.assert(fs.existsSync(pair.dist), `Dist build file missing: ${pair.dist}`);

      const baselineHtml = readTextFile(pair.baseline);
      const distHtml = readTextFile(pair.dist);

      const bDoc = parseHtml(baselineHtml);
      const dDoc = parseHtml(distHtml);

      // 1. Compare <title>
      const bTitle = bDoc.querySelector('title')?.textContent?.trim();
      const dTitle = dDoc.querySelector('title')?.textContent?.trim();
      harness.assertEqual(dTitle, bTitle, `<title> tag mismatch in ${pair.name}`);

      // 2. Compare <link rel="canonical">
      const bCanon = bDoc.querySelector('link[rel="canonical"]')?.getAttribute('href');
      const dCanon = dDoc.querySelector('link[rel="canonical"]')?.getAttribute('href');
      harness.assertEqual(dCanon, bCanon, `Canonical link mismatch in ${pair.name}`);

      // 3. Compare <meta name="description">
      const bDesc = bDoc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim();
      const dDesc = dDoc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim();
      harness.assertEqual(dDesc, bDesc, `meta description mismatch in ${pair.name}`);

      // 4. Compare Open Graph tags
      const bOgTitle = bDoc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim();
      const dOgTitle = dDoc.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim();
      harness.assertEqual(dOgTitle, bOgTitle, `og:title mismatch in ${pair.name}`);

      const bOgUrl = bDoc.querySelector('meta[property="og:url"]')?.getAttribute('content');
      const dOgUrl = dDoc.querySelector('meta[property="og:url"]')?.getAttribute('content');
      harness.assertEqual(dOgUrl, bOgUrl, `og:url mismatch in ${pair.name}`);

      const bOgType = bDoc.querySelector('meta[property="og:type"]')?.getAttribute('content');
      const dOgType = dDoc.querySelector('meta[property="og:type"]')?.getAttribute('content');
      harness.assertEqual(dOgType, bOgType, `og:type mismatch in ${pair.name}`);

      // 5. Compare JSON-LD Schemas (@type sequence and count)
      const bSchemas = Array.from(bDoc.querySelectorAll('script[type="application/ld+json"]')).map((el) =>
        JSON.parse(el.textContent)
      );
      const dSchemas = Array.from(dDoc.querySelectorAll('script[type="application/ld+json"]')).map((el) =>
        JSON.parse(el.textContent)
      );

      harness.assertEqual(
        dSchemas.length,
        bSchemas.length,
        `JSON-LD schema count mismatch in ${pair.name}`
      );

      const bTypes = bSchemas.map((s) => s['@type']).join(',');
      const dTypes = dSchemas.map((s) => s['@type']).join(',');
      harness.assertEqual(dTypes, bTypes, `JSON-LD @type sequence mismatch in ${pair.name}`);

      // 6. Compare primary <h1> heading text
      const bH1 = bDoc.querySelector('h1')?.textContent?.trim() || '';
      const dH1 = dDoc.querySelector('h1')?.textContent?.trim() || '';
      harness.assertEqual(dH1, bH1, `<h1> text mismatch in ${pair.name}`);
    });
  }

  // 2. RSS Feed Baseline Comparison
  harness.suite('RSS Feed Baseline Equivalence');

  harness.test('dist/rss.xml channel metadata exactly matches docs/baseline/rss.xml', () => {
    const baselineRssPath = path.join(BASELINE_DIR, 'rss.xml');
    const distRssPath = path.join(DIST_DIR, 'rss.xml');

    const bDoc = parseXml(readTextFile(baselineRssPath));
    const dDoc = parseXml(readTextFile(distRssPath));

    const bTitle = bDoc.querySelector('channel title')?.textContent?.trim();
    const dTitle = dDoc.querySelector('channel title')?.textContent?.trim();
    harness.assertEqual(dTitle, bTitle, 'RSS channel title does not match baseline');

    const bDesc = bDoc.querySelector('channel description')?.textContent?.trim();
    const dDesc = dDoc.querySelector('channel description')?.textContent?.trim();
    harness.assertEqual(dDesc, bDesc, 'RSS channel description does not match baseline');

    const bLink = bDoc.querySelector('channel link')?.textContent?.trim();
    const dLink = dDoc.querySelector('channel link')?.textContent?.trim();
    harness.assertEqual(dLink, bLink, 'RSS channel link does not match baseline');
  });

  harness.test('dist/rss.xml exact item count and link URLs match baseline (zero URL drift)', () => {
    const baselineRssPath = path.join(BASELINE_DIR, 'rss.xml');
    const distRssPath = path.join(DIST_DIR, 'rss.xml');

    const bDoc = parseXml(readTextFile(baselineRssPath));
    const dDoc = parseXml(readTextFile(distRssPath));

    const bItems = Array.from(bDoc.querySelectorAll('item'));
    const dItems = Array.from(dDoc.querySelectorAll('item'));

    harness.assertEqual(dItems.length, bItems.length, 'RSS item count does not match baseline');

    const bLinks = bItems.map((it) => it.querySelector('link')?.textContent?.trim());
    const dLinks = dItems.map((it) => it.querySelector('link')?.textContent?.trim());

    for (let i = 0; i < bLinks.length; i++) {
      harness.assertEqual(
        dLinks[i],
        bLinks[i],
        `RSS item #${i} link mismatch (possible URL drift)`
      );
    }
  });

  // 3. Sitemap Index & Shard Baseline Comparison
  harness.suite('Sitemaps Baseline Equivalence');

  harness.test('dist/sitemap-index.xml exactly matches docs/baseline/sitemap-index.xml', () => {
    const baselineIndexPath = path.join(BASELINE_DIR, 'sitemap-index.xml');
    const distIndexPath = path.join(DIST_DIR, 'sitemap-index.xml');

    const bXml = readTextFile(baselineIndexPath).trim().replace(/\r\n/g, '\n');
    const dXml = readTextFile(distIndexPath).trim().replace(/\r\n/g, '\n');

    harness.assertEqual(dXml, bXml, 'dist/sitemap-index.xml content does not match baseline');
  });

  harness.test('dist/sitemap-0.xml exact URL set matches docs/baseline/sitemap-0.xml', () => {
    const baselineSitemapPath = path.join(BASELINE_DIR, 'sitemap-0.xml');
    const distSitemapPath = path.join(DIST_DIR, 'sitemap-0.xml');

    const bDoc = parseXml(readTextFile(baselineSitemapPath));
    const dDoc = parseXml(readTextFile(distSitemapPath));

    const bUrls = new Set(
      Array.from(bDoc.querySelectorAll('url loc')).map((el) => el.textContent?.trim() || '')
    );
    const dUrls = new Set(
      Array.from(dDoc.querySelectorAll('url loc')).map((el) => el.textContent?.trim() || '')
    );

    harness.assertEqual(dUrls.size, bUrls.size, 'Sitemap URL count does not match baseline');

    const added = [];
    const missing = [];

    for (const u of bUrls) {
      if (!dUrls.has(u)) missing.push(u);
    }
    for (const u of dUrls) {
      if (!bUrls.has(u)) added.push(u);
    }

    if (missing.length > 0 || added.length > 0) {
      throw new Error(
        `Sitemap URL set mismatch:\n` +
        `  Missing from dist (${missing.length}): ${missing.slice(0, 5).join(', ')}\n` +
        `  Unexpected in dist (${added.length}): ${added.slice(0, 5).join(', ')}`
      );
    }
  });
}

// -----------------------------------------------------------------------------
// CLI Argument Parsing & Runner Execution
// -----------------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Regression Verification Runner (verify-baseline-diff.js)

Usage:
  node scripts/verify-baseline-diff.js [options]
  npm run test:regression

Options:
  --tier=<tiers>     Comma-separated list of tiers to run (1,2,3,4 or 'all') [default: all]
  --verbose          Print detailed error stack traces and diagnostics
  --help, -h         Show this help message
`);
    process.exit(0);
  }

  const verbose = args.includes('--verbose');
  let tiers = [1, 2, 3, 4];

  const tierArg = args.find((a) => a.startsWith('--tier='));
  if (tierArg) {
    const tierVal = tierArg.replace('--tier=', '').trim();
    if (tierVal !== 'all') {
      tiers = tierVal.split(',').map((t) => parseInt(t.trim(), 10)).filter((n) => !isNaN(n));
    }
  }

  console.log(`${colors.bold}Starting 4-Tier Regression Verification Suite...${colors.reset}`);
  console.log(`Root Directory:     ${ROOT_DIR}`);
  console.log(`Dist Directory:     ${DIST_DIR}`);
  console.log(`Baseline Directory: ${BASELINE_DIR}`);
  console.log(`Selected Tiers:     ${tiers.join(', ')}\n`);

  if (!fs.existsSync(DIST_DIR)) {
    console.error(
      `${colors.red}${colors.bold}ERROR: dist/ directory not found.${colors.reset}\n` +
      `Please run '${colors.cyan}npm run build${colors.reset}' before running the regression verification runner.`
    );
    process.exit(1);
  }

  const startTime = Date.now();
  const harness = new TestHarness({ verbose, tiers });

  if (tiers.includes(1)) runTier1(harness);
  if (tiers.includes(2)) runTier2(harness);
  if (tiers.includes(3)) runTier3(harness);
  if (tiers.includes(4)) runTier4(harness);

  const durationMs = Date.now() - startTime;
  const success = harness.printSummary(durationMs);

  process.exit(success ? 0 : 1);
}

main();
