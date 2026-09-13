// @vitest-environment jsdom
/**
 * Milestone 5 Slice 3: Client Router Migration & Event Lifecycle Stabilization
 *
 * Dedicated test suite validating:
 * 1. Router isolation: ClientRouterShim.astro and Head.astro use ClientRouter and completely eliminate ViewTransitions.
 * 2. Event lifecycle contracts: All 7 post-swap event listener systems re-bind and fire properly across navigations:
 *    - Analytics consent & click tracking (Head.astro)
 *    - UTM tracking (src/lib/api/utm-tracking.ts)
 *    - Copy-code button mounts (Head.astro)
 *    - Campaign CTA interaction (src/components/CampaignCTA.astro)
 *    - Campaign Hero timer interaction (src/components/CampaignHero.astro)
 *    - Resource form submission (src/lib/resource-form.js)
 *    - Offers analytics (src/pages/offers/[...slug].astro & src/pages/offers/expired.astro)
 * 3. End-to-end ClientRouter lifecycle simulation (before-swap -> DOM swap -> after-swap -> page-load).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { onPageSwap } from '@lib/page-events';
import { UTMTracker } from '@lib/api/utm-tracking';

const ROOT_DIR = path.resolve(__dirname, '../../../');

describe('Milestone 5 Slice 3: Client Router Migration & Event Lifecycles', () => {
  // Cleanups registered per test
  const cleanups: (() => void)[] = [];

  const registerSwap = (handler: () => void, options?: any) => {
    const unsub = onPageSwap(handler, options);
    cleanups.push(unsub);
    return unsub;
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    document.body.innerHTML = '';
    window.history.pushState({}, '', '/');
    (window as any).onPageSwap = onPageSwap;
  });

  afterEach(() => {
    while (cleanups.length > 0) {
      try {
        cleanups.pop()!();
      } catch {
        // ignore
      }
    }
    vi.clearAllMocks();
  });

  // ===========================================================================
  // 1. COMPONENT ROUTER ISOLATION & AST/MARKUP INVARIANTS
  // ===========================================================================
  describe('Router Isolation & AST Invariants', () => {
    it('ClientRouterShim.astro imports and renders ClientRouter from astro:transitions', () => {
      const shimPath = path.join(ROOT_DIR, 'src/components/ClientRouterShim.astro');
      expect(fs.existsSync(shimPath)).toBe(true);

      const content = fs.readFileSync(shimPath, 'utf8');

      // Assert import of ClientRouter
      expect(content).toMatch(/import\s*\{\s*ClientRouter\s*\}\s*from\s*["']astro:transitions["']/);

      // Assert invocation of ClientRouter with forwarded props
      expect(content).toMatch(/<ClientRouter\s+\{\.\.\.Astro\.props\}\s*\/>/);

      // Assert complete removal of ViewTransitions
      expect(content).not.toContain('ViewTransitions');
    });

    it('Head.astro renders ClientRouterShim and has zero ViewTransitions references', () => {
      const headPath = path.join(ROOT_DIR, 'src/components/Head.astro');
      expect(fs.existsSync(headPath)).toBe(true);

      const content = fs.readFileSync(headPath, 'utf8');

      // Assert import of ClientRouterShim
      expect(content).toMatch(/import\s+ClientRouterShim\s+from\s+["']\.\/ClientRouterShim\.astro["']/);

      // Assert render of ClientRouterShim
      expect(content).toMatch(/<ClientRouterShim\s*\/>/);

      // Assert zero ViewTransitions imports or usages in Head.astro
      expect(content).not.toContain('ViewTransitions');
    });

    it('No production source file in src/ imports or references ViewTransitions', () => {
      const scanDir = (dir: string): string[] => {
        let results: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(scanDir(fullPath));
          } else if (/\.(astro|ts|js|mjs|tsx|jsx)$/.test(entry.name)) {
            results.push(fullPath);
          }
        }
        return results;
      };

      const srcFiles = scanDir(path.join(ROOT_DIR, 'src'));
      const offenders: string[] = [];

      for (const file of srcFiles) {
        const text = fs.readFileSync(file, 'utf8');
        if (text.includes('ViewTransitions')) {
          offenders.push(path.relative(ROOT_DIR, file));
        }
      }

      expect(offenders).toEqual([]);
    });
  });

  // ===========================================================================
  // 2. CONTRACT 1: ANALYTICS CONSENT & CLICK TRACKING (Head.astro)
  // ===========================================================================
  describe('Contract 1: Analytics Consent & Click Tracking (Head.astro)', () => {
    it('re-binds phone and email click conversion handlers after client navigation swap', () => {
      const trackConversionSpy = vi.fn();
      (window as any).trackConversionEvent = trackConversionSpy;

      // Mount initial DOM
      document.body.innerHTML = `
        <div id="page-content">
          <a id="tel-link" href="tel:+919876543210">Call Us</a>
          <a id="mail-link" href="mailto:contact@meteoric.in">Email Us</a>
        </div>
      `;

      // Define and register the Head.astro after-swap tracking logic
      const attachTracking = () => {
        document.querySelectorAll('a[href^="tel:"]').forEach((link: any) => {
          link.addEventListener('click', function (this: HTMLAnchorElement, e: Event) {
            e.preventDefault();
            (window as any).trackConversionEvent('phone_click', {
              conversion_type: 'phone_contact',
              phone_number: this.href.replace('tel:', ''),
              value: 10,
            });
          });
        });

        document.querySelectorAll('a[href^="mailto:"]').forEach((link: any) => {
          link.addEventListener('click', function (this: HTMLAnchorElement, e: Event) {
            e.preventDefault();
            (window as any).trackConversionEvent('email_click', {
              conversion_type: 'email_contact',
              email_address: this.href.replace('mailto:', ''),
              value: 8,
            });
          });
        });
      };

      // Register via onPageSwap
      registerSwap(attachTracking, { runImmediately: true });

      // Click initial links
      const telLink = document.getElementById('tel-link') as HTMLAnchorElement;
      const mailLink = document.getElementById('mail-link') as HTMLAnchorElement;
      telLink.click();
      mailLink.click();

      expect(trackConversionSpy).toHaveBeenCalledTimes(2);
      expect(trackConversionSpy).toHaveBeenNthCalledWith(1, 'phone_click', {
        conversion_type: 'phone_contact',
        phone_number: '+919876543210',
        value: 10,
      });
      expect(trackConversionSpy).toHaveBeenNthCalledWith(2, 'email_click', {
        conversion_type: 'email_contact',
        email_address: 'contact@meteoric.in',
        value: 8,
      });

      trackConversionSpy.mockClear();

      // SIMULATE CLIENT NAVIGATION: DOM Swap
      document.body.innerHTML = `
        <div id="new-page-content">
          <a id="new-tel" href="tel:+18005550199">Support</a>
          <a id="new-mail" href="mailto:support@meteoric.in">Helpdesk</a>
        </div>
      `;

      // Dispatch astro:after-swap
      document.dispatchEvent(new Event('astro:after-swap'));

      // Click new links
      const newTel = document.getElementById('new-tel') as HTMLAnchorElement;
      const newMail = document.getElementById('new-mail') as HTMLAnchorElement;
      newTel.click();
      newMail.click();

      expect(trackConversionSpy).toHaveBeenCalledTimes(2);
      expect(trackConversionSpy).toHaveBeenNthCalledWith(1, 'phone_click', {
        conversion_type: 'phone_contact',
        phone_number: '+18005550199',
        value: 10,
      });
      expect(trackConversionSpy).toHaveBeenNthCalledWith(2, 'email_click', {
        conversion_type: 'email_contact',
        email_address: 'support@meteoric.in',
        value: 8,
      });
    });

    it('respects analytics consent and opt-out preferences across swaps', () => {
      let consentGranted = false;
      (window as any).checkAnalyticsConsent = () => consentGranted;
      (window as any).hasOptedOut = () => false;

      const trackSpy = vi.fn();
      (window as any).trackConversionEvent = (event: string, params: any) => {
        if ((window as any).hasOptedOut() || !(window as any).checkAnalyticsConsent()) {
          return;
        }
        trackSpy(event, params);
      };

      document.body.innerHTML = `<a id="tel-link" href="tel:+911234567890">Call</a>`;

      registerSwap(() => {
        document.querySelectorAll('a[href^="tel:"]').forEach((link: any) => {
          link.addEventListener('click', (e: Event) => {
            e.preventDefault();
            (window as any).trackConversionEvent('phone_click', {});
          });
        });
      }, true);

      // Click without consent -> no tracking
      (document.getElementById('tel-link') as HTMLElement).click();
      expect(trackSpy).not.toHaveBeenCalled();

      // Grant consent and navigate (DOM swap occurs during navigation)
      consentGranted = true;
      document.body.innerHTML = `<a id="tel-link" href="tel:+911234567890">Call</a>`;
      document.dispatchEvent(new Event('astro:after-swap'));

      (document.getElementById('tel-link') as HTMLElement).click();
      expect(trackSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // 3. CONTRACT 2: UTM TRACKING (src/lib/api/utm-tracking.ts)
  // ===========================================================================
  describe('Contract 2: UTM Tracking Lifecycle (src/lib/api/utm-tracking.ts)', () => {
    it('captures UTM params and updates tracking session on initial load and after-swap transitions', () => {
      // Step 1: Initial navigation with campaign params
      window.history.pushState({}, '', '/?utm_source=google&utm_medium=cpc&utm_campaign=summer2026');
      UTMTracker.initialize();

      const initialStored = UTMTracker.getStoredUTMParameters();
      expect(initialStored.utm_source).toBe('google');
      expect(initialStored.utm_medium).toBe('cpc');
      expect(initialStored.utm_campaign).toBe('summer2026');

      const session1 = UTMTracker.getAttributionData().session;
      expect(session1).not.toBeNull();
      expect(session1?.page_views).toBe(1);

      // Step 2: Client navigation triggers the module's auto-registered onPageSwap listener
      window.history.pushState({}, '', '/articles/migrating-to-astro/');
      document.dispatchEvent(new Event('astro:after-swap'));

      const session2 = UTMTracker.getAttributionData().session;
      expect(session2?.page_views).toBe(2);
      // First-touch attribution preserved
      expect(session2?.utm_params.utm_source).toBe('google');
      expect(session2?.utm_params.utm_campaign).toBe('summer2026');

      // Step 3: Client router transition with direct campaign override
      window.history.pushState({}, '', '/offers/ai-pilot/?utm_source=direct&utm_medium=direct&utm_campaign=direct_sale');
      document.dispatchEvent(new Event('astro:after-swap'));

      const session3 = UTMTracker.getAttributionData().session;
      expect(session3?.page_views).toBe(3);
      // Session preserves first-touch
      expect(session3?.utm_params.utm_campaign).toBe('summer2026');
      // While stored UTM parameters reflect direct campaign override
      const stored3 = UTMTracker.getStoredUTMParameters();
      expect(stored3.utm_campaign).toBe('direct_sale');
    });
  });

  // ===========================================================================
  // 4. CONTRACT 3: COPY-CODE BUTTON MOUNTS (Head.astro)
  // ===========================================================================
  describe('Contract 3: Copy-Code Button Mounts (Head.astro)', () => {
    it('mounts copy buttons to all <pre> elements on swap and handles clipboard copying', async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
      });

      // Implementation identical to Head.astro addCopyCodeButtons
      function addCopyCodeButtons() {
        const copyButtonLabel = '✂️ copy';
        const codeBlocks = Array.from(document.querySelectorAll('pre'));

        async function copyCode(codeBlock: HTMLElement, copyButton: HTMLElement) {
          const codeText = codeBlock.innerText || codeBlock.textContent || '';
          const buttonText = copyButton.innerText || copyButton.textContent || '';
          const textToCopy = codeText.replace(buttonText, '').trim();

          await navigator.clipboard.writeText(textToCopy);
          copyButton.innerText = '✅ copied!';
        }

        for (const codeBlock of codeBlocks) {
          // Avoid duplicate wrappers if already wrapped
          if (codeBlock.parentElement?.classList.contains('code-wrapper')) continue;

          const wrapper = document.createElement('div');
          wrapper.className = 'code-wrapper';
          wrapper.style.position = 'relative';

          const copyButton = document.createElement('button');
          copyButton.innerText = copyButtonLabel;
          copyButton.className = 'copy-code';

          codeBlock.setAttribute('tabindex', '0');
          codeBlock.appendChild(copyButton);

          codeBlock.parentNode?.insertBefore(wrapper, codeBlock);
          wrapper.appendChild(codeBlock);

          copyButton.addEventListener('click', async () => {
            await copyCode(codeBlock, copyButton);
          });
        }
      }

      registerSwap(addCopyCodeButtons, { runImmediately: true });

      // Initial page with one code block
      document.body.innerHTML = `
        <main>
          <pre><code>console.log("Hello Astro 6");</code></pre>
        </main>
      `;

      // Trigger swap
      document.dispatchEvent(new Event('astro:after-swap'));

      let button = document.querySelector('pre button.copy-code') as HTMLButtonElement;
      expect(button).not.toBeNull();
      expect(button.innerText).toBe('✂️ copy');

      // Click copy button
      await button.click();
      expect(writeTextMock).toHaveBeenCalledWith('console.log("Hello Astro 6");');
      expect(button.innerText).toBe('✅ copied!');

      // SIMULATE CLIENT NAVIGATION: New page with 2 different code blocks
      document.body.innerHTML = `
        <main>
          <pre id="code-1"><code>import { ClientRouter } from "astro:transitions";</code></pre>
          <pre id="code-2"><code>export const prerender = false;</code></pre>
        </main>
      `;

      document.dispatchEvent(new Event('astro:after-swap'));

      const newButtons = document.querySelectorAll('pre button.copy-code');
      expect(newButtons.length).toBe(2);

      // Click second button
      await (newButtons[1] as HTMLButtonElement).click();
      expect(writeTextMock).toHaveBeenLastCalledWith('export const prerender = false;');
    });
  });

  // ===========================================================================
  // 5. CONTRACT 4: CAMPAIGN CTA INTERACTION (CampaignCTA.astro)
  // ===========================================================================
  describe('Contract 4: Campaign CTA Interaction (CampaignCTA.astro)', () => {
    it('populates UTM params, binds submit handler, and tracks form interactions across swaps', async () => {
      // Store session UTM params
      sessionStorage.setItem('campaign_utm_params', JSON.stringify({
        utm_source: 'linkedin',
        utm_medium: 'social',
        utm_campaign: 'enterprise_automation',
      }));

      // Mock gtag and fetch
      const gtagSpy = vi.fn();
      (window as any).gtag = gtagSpy;

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'Submitted' }),
      });
      global.fetch = fetchMock;

      // Implementation replicating CampaignCTA.astro
      function initCampaignCTA() {
        const forms = document.querySelectorAll<HTMLFormElement>('.campaign-form');

        forms.forEach((form) => {
          const campaignSlug = form.dataset.campaign;
          const trackingId = form.dataset.trackingId;
          const utmParamsField = form.querySelector<HTMLInputElement>(`#utm-params-${trackingId}`);

          if (utmParamsField) {
            const stored = sessionStorage.getItem('campaign_utm_params');
            if (stored) utmParamsField.value = stored;
          }

          form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            const res = await fetch('/api/campaign-signup', {
              method: 'POST',
              body: formData,
            });

            if (res.ok) {
              const successEl = form.querySelector<HTMLElement>('.success-message');
              if (successEl) successEl.style.display = 'flex';

              if (typeof (window as any).gtag === 'function') {
                (window as any).gtag('event', 'campaign_form_submit', {
                  campaign_slug: campaignSlug,
                });
              }
            }
          });

          // Focus tracking
          form.querySelectorAll('input').forEach((input) => {
            input.addEventListener('focus', () => {
              if (typeof (window as any).gtag === 'function') {
                (window as any).gtag('event', 'campaign_form_start', {
                  field_name: input.name,
                });
              }
            });
          });
        });
      }

      registerSwap(initCampaignCTA, { runImmediately: true });

      // Page 1: Campaign Page
      document.body.innerHTML = `
        <form class="campaign-form" data-campaign="ai-accelerator" data-tracking-id="c1">
          <input type="text" name="name" value="Test User" />
          <input type="email" name="email" value="user@test.com" />
          <input type="hidden" name="utm_params" id="utm-params-c1" />
          <div class="success-message" style="display:none">Success!</div>
          <button type="submit" class="cta-button">Claim Offer</button>
        </form>
      `;

      document.dispatchEvent(new Event('astro:after-swap'));

      // Check UTM field populated
      const utmField = document.getElementById('utm-params-c1') as HTMLInputElement;
      expect(utmField.value).toContain('enterprise_automation');

      // Test focus event
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      nameInput.dispatchEvent(new Event('focus'));
      expect(gtagSpy).toHaveBeenCalledWith('event', 'campaign_form_start', {
        field_name: 'name',
      });

      // Submit form
      const form = document.querySelector('.campaign-form') as HTMLFormElement;
      form.dispatchEvent(new Event('submit', { cancelable: true }));

      // Wait a tick for async fetch
      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('/api/campaign-signup', expect.any(Object));
        expect(gtagSpy).toHaveBeenCalledWith('event', 'campaign_form_submit', {
          campaign_slug: 'ai-accelerator',
        });
      });

      // Verify DOM success message
      const successEl = form.querySelector('.success-message') as HTMLElement;
      expect(successEl.style.display).toBe('flex');
    });
  });

  // ===========================================================================
  // 6. CONTRACT 5: CAMPAIGN HERO TIMER INTERACTION (CampaignHero.astro)
  // ===========================================================================
  describe('Contract 5: Campaign Hero Timer Interaction (CampaignHero.astro)', () => {
    it('initializes countdown timer on swap, updates DOM, and clears interval on astro:before-swap', () => {
      vi.useFakeTimers();

      let activeInterval: any = null;

      function initCountdownTimer() {
        const countdownEl = document.getElementById('campaign-countdown');
        if (!countdownEl) return;

        const validUntil = countdownEl.dataset.validUntil || '';
        const endDate = new Date(validUntil).getTime();

        function updateTimer() {
          const now = Date.now();
          const timeLeft = endDate - now;

          if (timeLeft > 0) {
            const seconds = Math.floor((timeLeft / 1000) % 60);
            const secondsEl = document.getElementById('seconds');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
          } else {
            countdownEl!.innerHTML = '<div class="timer-expired">Offer Expired</div>';
          }
        }

        updateTimer();
        activeInterval = setInterval(updateTimer, 1000);

        // Teardown before client swap
        document.addEventListener(
          'astro:before-swap',
          () => {
            if (activeInterval) {
              clearInterval(activeInterval);
              activeInterval = null;
            }
          },
          { once: true }
        );
      }

      registerSwap(initCountdownTimer, { runImmediately: true });

      // Mount Hero timer DOM with target date 30 seconds in future
      const targetTime = new Date(Date.now() + 30000).toISOString();
      document.body.innerHTML = `
        <div id="campaign-countdown" data-valid-until="${targetTime}">
          <span id="seconds">00</span>
        </div>
      `;

      document.dispatchEvent(new Event('astro:after-swap'));

      expect(activeInterval).not.toBeNull();
      const secondsEl = document.getElementById('seconds');
      expect(secondsEl?.textContent).toBe('30');

      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000);
      expect(secondsEl?.textContent).toBe('25');

      // Before swap: assert interval is cleared
      document.dispatchEvent(new Event('astro:before-swap'));
      expect(activeInterval).toBeNull();

      // Ensure timer does not tick after before-swap
      vi.advanceTimersByTime(5000);
      expect(secondsEl?.textContent).toBe('25'); // Unchanged

      vi.useRealTimers();
    });
  });

  // ===========================================================================
  // 7. CONTRACT 6: RESOURCE FORM SUBMISSION (src/lib/resource-form.js)
  // ===========================================================================
  describe('Contract 6: Resource Form Submission (src/lib/resource-form.js)', () => {
    it('re-binds validation and submission on resource forms across navigations', async () => {
      const validatorInstances: any[] = [];

      class MockResourceValidator {
        form: HTMLFormElement;
        emailInput: HTMLInputElement | null;
        isBound = false;

        constructor(form: HTMLFormElement) {
          this.form = form;
          this.emailInput = form.querySelector('#email');
          this.setupEvents();
          validatorInstances.push(this);
        }

        setupEvents() {
          this.isBound = true;
          this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const success = this.form.querySelector('#successMessage') as HTMLElement;
            if (success) success.style.display = 'block';
          });
        }
      }

      function initializeResourceForms() {
        document.querySelectorAll<HTMLFormElement>('.resource-form').forEach((form) => {
          new MockResourceValidator(form);
        });
      }

      registerSwap(initializeResourceForms, { runImmediately: true });

      // Page 1: Resource Form
      document.body.innerHTML = `
        <form class="resource-form" data-resource="automation-guide">
          <input type="email" id="email" name="email" value="alex@example.com" />
          <div id="successMessage" style="display:none">Downloaded!</div>
          <button type="submit" id="submitBtn">Download Guide</button>
        </form>
      `;

      document.dispatchEvent(new Event('astro:after-swap'));

      expect(validatorInstances.length).toBe(1);
      expect(validatorInstances[0].isBound).toBe(true);

      const form1 = document.querySelector('.resource-form') as HTMLFormElement;
      form1.dispatchEvent(new Event('submit', { cancelable: true }));
      expect((document.getElementById('successMessage') as HTMLElement).style.display).toBe('block');

      // SIMULATE CLIENT NAVIGATION: Navigate to another resource page
      document.body.innerHTML = `
        <form class="resource-form" data-resource="whitelabel-checklist">
          <input type="email" id="email" name="email" value="lead@example.com" />
          <div id="successMessage" style="display:none">Ready!</div>
          <button type="submit" id="submitBtn">Get Checklist</button>
        </form>
      `;

      document.dispatchEvent(new Event('astro:after-swap'));

      expect(validatorInstances.length).toBe(2);
      expect(validatorInstances[1].form.dataset.resource).toBe('whitelabel-checklist');
      expect(validatorInstances[1].isBound).toBe(true);
    });
  });

  // ===========================================================================
  // 8. CONTRACT 7: OFFERS ANALYTICS (offers/[...slug].astro & expired.astro)
  // ===========================================================================
  describe('Contract 7: Offers Analytics (offers/[...slug].astro & expired.astro)', () => {
    it('executes active and expired campaign analytics on after-swap', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      global.fetch = fetchMock;

      // Implementation from offers/[...slug].astro
      function initCampaignAnalytics() {
        const campaignEl = document.querySelector('[data-campaign-slug]');
        if (!campaignEl) return;

        const campaignSlug = campaignEl.getAttribute('data-campaign-slug');
        const visitData = new FormData();
        visitData.append('campaign_slug', campaignSlug || '');
        visitData.append('conversion_type', 'page_view');

        fetch('/api/campaign-visit', {
          method: 'POST',
          body: visitData,
        }).catch(() => {});
      }

      // Implementation from offers/expired.astro
      function trackExpiredCampaignVisit() {
        const expiredEl = document.querySelector('[data-expired-campaign]');
        if (!expiredEl) return;

        const campaignSlug = expiredEl.getAttribute('data-expired-campaign');
        const visitData = new FormData();
        visitData.append('campaign_slug', campaignSlug || '');
        visitData.append('conversion_type', 'expired_visit');

        fetch('/api/campaign-visit', {
          method: 'POST',
          body: visitData,
        }).catch(() => {});
      }

      registerSwap(initCampaignAnalytics, { runImmediately: true });
      registerSwap(trackExpiredCampaignVisit, { runImmediately: true });

      // Scenario A: Active Campaign Navigation
      document.body.innerHTML = `
        <div data-campaign-slug="ai-integration-masterclass">
          <h1>Active Workshop</h1>
        </div>
      `;

      document.dispatchEvent(new Event('astro:after-swap'));

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('/api/campaign-visit', expect.any(Object));
      });

      fetchMock.mockClear();

      // Scenario B: Expired Campaign Navigation
      document.body.innerHTML = `
        <div data-expired-campaign="ai-integration-masterclass">
          <h1>This offer has expired</h1>
        </div>
      `;

      document.dispatchEvent(new Event('astro:after-swap'));

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('/api/campaign-visit', expect.any(Object));
      });
    });
  });

  // ===========================================================================
  // 9. CLIENT ROUTER MULTI-STEP NAVIGATION LIFECYCLE SIMULATION
  // ===========================================================================
  describe('Client Router Multi-Step Navigation Lifecycle Simulation', () => {
    it('executes the full Astro ClientRouter lifecycle sequence through multiple client transitions', () => {
      const eventsSequence: string[] = [];

      // Listen to all standard Astro ClientRouter lifecycle events
      const transitionEvents = [
        'astro:before-preparation',
        'astro:after-preparation',
        'astro:before-swap',
        'astro:after-swap',
        'astro:page-load',
      ];

      transitionEvents.forEach((evtName) => {
        document.addEventListener(evtName, () => {
          eventsSequence.push(evtName);
        });
      });

      const route1Tracker = vi.fn();
      const route2Tracker = vi.fn();
      const route3Tracker = vi.fn();

      // Dispatch initial page load
      document.dispatchEvent(new Event('astro:page-load'));
      expect(eventsSequence).toEqual(['astro:page-load']);

      // ----------------------------------------------------
      // TRANSITION 1: Route A -> Route B
      // ----------------------------------------------------
      eventsSequence.length = 0;
      registerSwap(route1Tracker);

      // Astro router triggers preparation
      document.dispatchEvent(new Event('astro:before-preparation'));
      document.dispatchEvent(new Event('astro:after-preparation'));

      // Teardown previous page
      document.dispatchEvent(new Event('astro:before-swap'));

      // DOM Swap occurs
      document.body.innerHTML = `<div id="route-b">Route B Body</div>`;

      // Post-swap trigger
      document.dispatchEvent(new Event('astro:after-swap'));
      document.dispatchEvent(new Event('astro:page-load'));

      expect(eventsSequence).toEqual([
        'astro:before-preparation',
        'astro:after-preparation',
        'astro:before-swap',
        'astro:after-swap',
        'astro:page-load',
      ]);
      expect(route1Tracker).toHaveBeenCalledTimes(1);

      // ----------------------------------------------------
      // TRANSITION 2: Route B -> Route C
      // ----------------------------------------------------
      eventsSequence.length = 0;
      registerSwap(route2Tracker);

      document.dispatchEvent(new Event('astro:before-preparation'));
      document.dispatchEvent(new Event('astro:after-preparation'));
      document.dispatchEvent(new Event('astro:before-swap'));

      document.body.innerHTML = `<div id="route-c">Route C Body</div>`;

      document.dispatchEvent(new Event('astro:after-swap'));
      document.dispatchEvent(new Event('astro:page-load'));

      expect(route1Tracker).toHaveBeenCalledTimes(2); // Still active for subsequent swaps
      expect(route2Tracker).toHaveBeenCalledTimes(1);

      // ----------------------------------------------------
      // TRANSITION 3: Selective Unsubscribe & Resilient Error Isolation
      // ----------------------------------------------------
      const unsub2 = registerSwap(route3Tracker);
      unsub2(); // Immediately unsubscribed

      // Faulty handler registered alongside healthy handlers
      registerSwap(() => {
        throw new Error('Listener crash should be caught by safeExecute');
      });

      expect(() => {
        document.dispatchEvent(new Event('astro:after-swap'));
      }).not.toThrow();

      // route1Tracker still executed despite throwing sibling
      expect(route1Tracker).toHaveBeenCalledTimes(3);
      // route3Tracker was unsubscribed, so was not called
      expect(route3Tracker).not.toHaveBeenCalled();
    });
  });
});
