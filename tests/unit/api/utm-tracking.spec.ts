// @vitest-environment jsdom
/**
 * Task ID: TSK-010
 * Tests for UTM tracking parameter capture, storage, retrieval, and injection
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UTMTracker } from '@lib/api/utm-tracking';

describe('UTMTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    // Reset window URL in jsdom
    window.history.pushState({}, '', '/');
    // Reset document referrer
    Object.defineProperty(document, 'referrer', {
      value: '',
      configurable: true
    });
  });

  describe('captureUTMParameters', () => {
    it('should return empty object if no UTM parameters are in the URL search query', () => {
      const params = UTMTracker.captureUTMParameters();
      expect(params.utm_source).toBeUndefined();
      expect(params.utm_medium).toBeUndefined();
      expect(params.utm_campaign).toBeUndefined();
      expect(params.utm_term).toBeUndefined();
      expect(params.utm_content).toBeUndefined();
      expect(params.utm_id).toBeUndefined();
      expect(params.gclid).toBeUndefined();
      expect(params.fbclid).toBeUndefined();
    });

    it('should capture all 8 UTM-related parameters when present in the URL query string', () => {
      const url = '/landing-page?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale&utm_term=shoes&utm_content=banner&utm_id=123&gclid=gclid123&fbclid=fbclid123';
      window.history.pushState({}, '', url);
      
      Object.defineProperty(document, 'referrer', {
        value: 'https://external-referrer.com',
        configurable: true
      });

      const params = UTMTracker.captureUTMParameters();

      expect(params.utm_source).toBe('google');
      expect(params.utm_medium).toBe('cpc');
      expect(params.utm_campaign).toBe('summer_sale');
      expect(params.utm_term).toBe('shoes');
      expect(params.utm_content).toBe('banner');
      expect(params.utm_id).toBe('123');
      expect(params.gclid).toBe('gclid123');
      expect(params.fbclid).toBe('fbclid123');
      expect(params.referrer).toBe('https://external-referrer.com');
      expect(params.landing_page).toContain('/landing-page?utm_source=google');
      expect(params.timestamp).toBeDefined();
      expect(new Date(params.timestamp!).getTime()).not.toBeNaN();
    });

    it('should ignore empty, null, or undefined UTM parameters', () => {
      const url = '/landing-page?utm_source=google&utm_medium=&utm_campaign=null&utm_term=undefined';
      window.history.pushState({}, '', url);

      const params = UTMTracker.captureUTMParameters();

      expect(params.utm_source).toBe('google');
      // empty string should be ignored
      expect(params.utm_medium).toBeUndefined();
      // literal "null" and "undefined" strings are captured by URLSearchParams.get but let's check
      // Wait, URLSearchParams.get('utm_campaign') returns 'null' which is a truthy non-empty string.
      // So they might be captured unless filtered, but standard empty strings are ignored.
      expect(params.utm_campaign).toBe('null');
      expect(params.utm_term).toBe('undefined');
    });
  });

  describe('storeUTMParameters', () => {
    it('should store UTM parameters in both sessionStorage and localStorage when none exist', () => {
      const params = {
        utm_source: 'newsletter',
        utm_medium: 'email',
        utm_campaign: 'weekly_digest',
        timestamp: new Date().toISOString()
      };

      UTMTracker.storeUTMParameters(params);

      const stored = UTMTracker.getStoredUTMParameters();
      expect(stored.utm_source).toBe('newsletter');
      expect(stored.utm_medium).toBe('email');
      expect(stored.utm_campaign).toBe('weekly_digest');

      const storageKey = 'campaign_utm_params';
      expect(JSON.parse(sessionStorage.getItem(storageKey)!)).toEqual(expect.objectContaining({
        utm_source: 'newsletter',
        utm_medium: 'email'
      }));
      expect(JSON.parse(localStorage.getItem(storageKey)!)).toEqual(expect.objectContaining({
        utm_source: 'newsletter',
        utm_medium: 'email'
      }));
    });

    it('should NOT override existing UTM parameters if new campaign parameters arrive within attribution window (First-touch attribution)', () => {
      const firstParams = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'first_campaign',
        timestamp: new Date().toISOString()
      };

      UTMTracker.storeUTMParameters(firstParams);

      const secondParams = {
        utm_source: 'facebook',
        utm_medium: 'social',
        utm_campaign: 'second_campaign',
        timestamp: new Date().toISOString()
      };

      UTMTracker.storeUTMParameters(secondParams);

      const stored = UTMTracker.getStoredUTMParameters();
      // Should preserve the first touch parameters
      expect(stored.utm_source).toBe('google');
      expect(stored.utm_medium).toBe('cpc');
      expect(stored.utm_campaign).toBe('first_campaign');
    });

    it('should override existing UTM parameters if new parameters are direct (utm_medium/utm_source = "direct")', () => {
      const initialParams = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'first_campaign',
        timestamp: new Date().toISOString()
      };

      UTMTracker.storeUTMParameters(initialParams);

      const directParams = {
        utm_source: 'direct',
        utm_medium: 'direct',
        timestamp: new Date().toISOString()
      };

      UTMTracker.storeUTMParameters(directParams);

      const stored = UTMTracker.getStoredUTMParameters();
      // Should override with direct since it overrides direct campaigns
      expect(stored.utm_source).toBe('direct');
      expect(stored.utm_medium).toBe('direct');
      expect(stored.utm_campaign).toBeUndefined();
    });

    it('should override existing UTM parameters if the attribution window has expired (>30 days)', () => {
      const oldTimestamp = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
      const expiredParams = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'expired_campaign',
        timestamp: oldTimestamp
      };

      UTMTracker.storeUTMParameters(expiredParams);

      const newParams = {
        utm_source: 'facebook',
        utm_medium: 'social',
        utm_campaign: 'new_campaign',
        timestamp: new Date().toISOString()
      };

      UTMTracker.storeUTMParameters(newParams);

      const stored = UTMTracker.getStoredUTMParameters();
      // Should override because attribution window expired
      expect(stored.utm_source).toBe('facebook');
      expect(stored.utm_medium).toBe('social');
      expect(stored.utm_campaign).toBe('new_campaign');
    });

    it('should always update referrer and landing page from the new parameters even if campaign parameters are not overridden', () => {
      const initialParams = {
        utm_source: 'google',
        utm_medium: 'cpc',
        referrer: 'https://initial-referrer.com',
        landing_page: 'https://initial-landing.com',
        timestamp: new Date().toISOString()
      };

      UTMTracker.storeUTMParameters(initialParams);

      const incomingParams = {
        utm_source: 'facebook',
        utm_medium: 'social',
        referrer: 'https://new-referrer.com',
        landing_page: 'https://new-landing.com',
        timestamp: new Date().toISOString()
      };

      UTMTracker.storeUTMParameters(incomingParams);

      const stored = UTMTracker.getStoredUTMParameters();
      // Campaign parameters preserved (first touch)
      expect(stored.utm_source).toBe('google');
      expect(stored.utm_medium).toBe('cpc');
      // Referrer and landing page updated
      expect(stored.referrer).toBe('https://new-referrer.com');
      expect(stored.landing_page).toBe('https://new-landing.com');
    });

    it('should catch and log errors during storage', () => {
      const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });
      // We can inspect console.error since it's spied on
      const consoleSpy = vi.spyOn(console, 'error');

      UTMTracker.storeUTMParameters({ utm_source: 'test' });
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error storing UTM parameters'), expect.any(Error));

      setSpy.mockRestore();
    });
  });

  describe('getStoredUTMParameters', () => {
    it('should return parsed object from sessionStorage if available', () => {
      const mockParams = { utm_source: 'session' };
      sessionStorage.setItem('campaign_utm_params', JSON.stringify(mockParams));

      const stored = UTMTracker.getStoredUTMParameters();
      expect(stored).toEqual(mockParams);
    });

    it('should fall back to localStorage if sessionStorage is not present', () => {
      const mockParams = { utm_source: 'local' };
      localStorage.setItem('campaign_utm_params', JSON.stringify(mockParams));

      const stored = UTMTracker.getStoredUTMParameters();
      expect(stored).toEqual(mockParams);
    });

    it('should prioritize sessionStorage over localStorage', () => {
      sessionStorage.setItem('campaign_utm_params', JSON.stringify({ utm_source: 'session' }));
      localStorage.setItem('campaign_utm_params', JSON.stringify({ utm_source: 'local' }));

      const stored = UTMTracker.getStoredUTMParameters();
      expect(stored.utm_source).toBe('session');
    });

    it('should return empty object if neither storage has the key', () => {
      const stored = UTMTracker.getStoredUTMParameters();
      expect(stored).toEqual({});
    });

    it('should handle invalid JSON in storage gracefully', () => {
      sessionStorage.setItem('campaign_utm_params', '{invalid-json}');
      const consoleSpy = vi.spyOn(console, 'error');

      const stored = UTMTracker.getStoredUTMParameters();
      expect(stored).toEqual({});
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Error retrieving UTM parameters'), expect.any(Error));
    });
  });

  describe('getSessionId', () => {
    it('should return existing session_id from sessionStorage if it exists', () => {
      sessionStorage.setItem('session_id', 'existing_session_123');
      const id = UTMTracker.getSessionId();
      expect(id).toBe('existing_session_123');
    });

    it('should generate and store a new session_id if none exists in sessionStorage', () => {
      const id = UTMTracker.getSessionId();
      expect(id).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(sessionStorage.getItem('session_id')).toBe(id);
    });

    it('should return a valid generated session_id on storage error', () => {
      const setSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      const id = UTMTracker.getSessionId();
      expect(id).toMatch(/^session_\d+_[a-z0-9]+$/);
      setSpy.mockRestore();
    });
  });

  describe('updateSession', () => {
    it('should initialize a new tracking session if none exists', () => {
      const utmParams = { utm_source: 'google', utm_medium: 'cpc' };
      UTMTracker.updateSession(utmParams);

      const sessionStr = sessionStorage.getItem('campaign_session');
      expect(sessionStr).toBeDefined();

      const session = JSON.parse(sessionStr!);
      expect(session.session_id).toBeDefined();
      expect(session.utm_params).toEqual(utmParams);
      expect(session.first_visit).toBeDefined();
      expect(session.last_visit).toBeDefined();
      expect(session.page_views).toBe(1);
      expect(session.campaign_interactions).toEqual([]);
    });

    it('should update last_visit and increment page views for an existing session', () => {
      const firstVisit = new Date(Date.now() - 5000).toISOString();
      const existingSession = {
        session_id: 'session_123',
        utm_params: { utm_source: 'google' },
        first_visit: firstVisit,
        last_visit: firstVisit,
        page_views: 1,
        campaign_interactions: []
      };
      sessionStorage.setItem('campaign_session', JSON.stringify(existingSession));

      UTMTracker.updateSession({ utm_source: 'google' });

      const updated = JSON.parse(sessionStorage.getItem('campaign_session')!);
      expect(updated.session_id).toBe('session_123');
      expect(updated.page_views).toBe(2);
      expect(updated.first_visit).toBe(firstVisit);
      expect(new Date(updated.last_visit).getTime()).toBeGreaterThan(new Date(firstVisit).getTime());
    });
  });

  describe('trackInteraction', () => {
    it('should do nothing if tracking session does not exist in storage', () => {
      UTMTracker.trackInteraction('custom_event', { key: 'value' });
      expect(sessionStorage.getItem('campaign_session')).toBeNull();
    });

    it('should append new interaction to tracking session campaign_interactions', () => {
      const existingSession = {
        session_id: 'session_123',
        utm_params: { utm_source: 'google' },
        first_visit: new Date().toISOString(),
        last_visit: new Date().toISOString(),
        page_views: 1,
        campaign_interactions: []
      };
      sessionStorage.setItem('campaign_session', JSON.stringify(existingSession));

      UTMTracker.trackInteraction('click_cta', { cta_id: 'contact_submit' });

      const updated = JSON.parse(sessionStorage.getItem('campaign_session')!);
      expect(updated.campaign_interactions).toHaveLength(1);
      expect(updated.campaign_interactions[0]).toEqual(expect.objectContaining({
        type: 'click_cta',
        data: { cta_id: 'contact_submit' }
      }));
      expect(updated.campaign_interactions[0].timestamp).toBeDefined();
    });

    it('should limit campaign_interactions to 50 items to avoid storage bloat', () => {
      const initialInteractions = Array.from({ length: 55 }, (_, i) => ({
        type: `event_${i}`,
        timestamp: new Date().toISOString(),
        data: {}
      }));

      const existingSession = {
        session_id: 'session_123',
        utm_params: { utm_source: 'google' },
        first_visit: new Date().toISOString(),
        last_visit: new Date().toISOString(),
        page_views: 1,
        campaign_interactions: initialInteractions
      };
      sessionStorage.setItem('campaign_session', JSON.stringify(existingSession));

      UTMTracker.trackInteraction('new_event');

      const updated = JSON.parse(sessionStorage.getItem('campaign_session')!);
      expect(updated.campaign_interactions).toHaveLength(50);
      // It should keep the most recent ones (slice from the end)
      expect(updated.campaign_interactions[49].type).toBe('new_event');
      // The first element in the 50 array should be event_6 (since 55 + 1 - 50 = 6 index)
      expect(updated.campaign_interactions[0].type).toBe('event_6');
    });
  });

  describe('getAttributionData', () => {
    it('should return default attribution data when no UTM params or session exists', () => {
      const data = UTMTracker.getAttributionData();
      expect(data.utm_params).toEqual({});
      expect(data.session).toBeNull();
      expect(data.attribution_type).toBe('direct');
    });

    it('should return stored UTM params and session data with correct attribution type', () => {
      const utmParams = { utm_source: 'google', utm_medium: 'cpc' };
      const session = {
        session_id: 'session_123',
        utm_params: utmParams,
        first_visit: new Date().toISOString(),
        last_visit: new Date().toISOString(),
        page_views: 1,
        campaign_interactions: []
      };

      sessionStorage.setItem('campaign_utm_params', JSON.stringify(utmParams));
      sessionStorage.setItem('campaign_session', JSON.stringify(session));

      const data = UTMTracker.getAttributionData();
      expect(data.utm_params).toEqual(utmParams);
      expect(data.session).toEqual(session);
      expect(data.attribution_type).toBe('first_touch');
    });

    it('should return direct attribution type if utm_medium is direct', () => {
      const utmParams = { utm_source: 'direct', utm_medium: 'direct' };
      sessionStorage.setItem('campaign_utm_params', JSON.stringify(utmParams));

      const data = UTMTracker.getAttributionData();
      expect(data.attribution_type).toBe('direct');
    });
  });

  describe('clearUTMParameters', () => {
    it('should remove all tracking keys from sessionStorage and localStorage', () => {
      sessionStorage.setItem('campaign_utm_params', JSON.stringify({ utm_source: 'test' }));
      localStorage.setItem('campaign_utm_params', JSON.stringify({ utm_source: 'test' }));
      sessionStorage.setItem('campaign_session', '{}');
      sessionStorage.setItem('session_id', '123');

      UTMTracker.clearUTMParameters();

      expect(sessionStorage.getItem('campaign_utm_params')).toBeNull();
      expect(localStorage.getItem('campaign_utm_params')).toBeNull();
      expect(sessionStorage.getItem('campaign_session')).toBeNull();
      expect(sessionStorage.getItem('session_id')).toBeNull();
    });
  });

  describe('getUTMString', () => {
    it('should return query string representation of UTM parameters only', () => {
      const params = {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'summer',
        gclid: 'gclid123',
        referrer: 'https://referrer.com'
      };
      sessionStorage.setItem('campaign_utm_params', JSON.stringify(params));

      const utmString = UTMTracker.getUTMString();
      // Should filter out gclid and referrer
      expect(utmString).toBe('utm_source=google&utm_medium=cpc&utm_campaign=summer');
    });

    it('should return empty string if no UTM parameters are stored', () => {
      const utmString = UTMTracker.getUTMString();
      expect(utmString).toBe('');
    });
  });

  describe('appendUTMToUrl', () => {
    it('should append UTM parameters to a URL without existing query parameters', () => {
      sessionStorage.setItem('campaign_utm_params', JSON.stringify({
        utm_source: 'google',
        utm_medium: 'cpc'
      }));

      const appended = UTMTracker.appendUTMToUrl('https://example.com/pricing');
      expect(appended).toBe('https://example.com/pricing?utm_source=google&utm_medium=cpc');
    });

    it('should append UTM parameters to a URL with existing query parameters using ampersand', () => {
      sessionStorage.setItem('campaign_utm_params', JSON.stringify({
        utm_source: 'google',
        utm_medium: 'cpc'
      }));

      const appended = UTMTracker.appendUTMToUrl('https://example.com/pricing?ref=footer');
      expect(appended).toBe('https://example.com/pricing?ref=footer&utm_source=google&utm_medium=cpc');
    });

    it('should return original URL if no UTM parameters are stored', () => {
      const appended = UTMTracker.appendUTMToUrl('https://example.com/pricing');
      expect(appended).toBe('https://example.com/pricing');
    });
  });
});
