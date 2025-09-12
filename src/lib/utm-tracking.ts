/**
 * UTM Parameter Tracking Utility
 * Captures, stores, and manages UTM parameters for campaign attribution
 */

export interface UTMParameters {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  utm_id?: string | null;
  gclid?: string | null; // Google Ads click ID
  fbclid?: string | null; // Facebook click ID
  referrer?: string;
  landing_page?: string;
  timestamp?: string;
  session_id?: string;
}

export interface TrackingSession {
  session_id: string;
  utm_params: UTMParameters;
  first_visit: string;
  last_visit: string;
  page_views: number;
  campaign_interactions: Array<{
    type: string;
    timestamp: string;
    data: any;
  }>;
}

export class UTMTracker {
  private static readonly STORAGE_KEY = 'campaign_utm_params';
  private static readonly SESSION_KEY = 'campaign_session';
  private static readonly ATTRIBUTION_WINDOW = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Capture UTM parameters from current URL
   */
  static captureUTMParameters(): UTMParameters {
    if (typeof window === 'undefined') return {};

    const urlParams = new URLSearchParams(window.location.search);
    
    const utmParams: UTMParameters = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content'),
      utm_id: urlParams.get('utm_id'),
      gclid: urlParams.get('gclid'),
      fbclid: urlParams.get('fbclid'),
      referrer: document.referrer || undefined,
      landing_page: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Only return parameters that have values
    const filteredParams: UTMParameters = {};
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        filteredParams[key as keyof UTMParameters] = value;
      }
    });

    return filteredParams;
  }

  /**
   * Store UTM parameters with attribution logic
   */
  static storeUTMParameters(params: UTMParameters): void {
    if (typeof window === 'undefined') return;

    try {
      // Get existing parameters
      const existingParams = this.getStoredUTMParameters();
      
      // Attribution logic: First-touch attribution with override for direct campaigns
      let finalParams = existingParams;
      
      // If we have new UTM parameters, decide whether to override
      if (Object.keys(params).some(key => key.startsWith('utm_') && params[key as keyof UTMParameters])) {
        // Override if:
        // 1. No existing parameters
        // 2. New parameters are from a direct campaign (utm_medium = 'direct' or utm_source = 'direct')
        // 3. Attribution window has expired
        const shouldOverride = !existingParams.timestamp ||
          params.utm_medium === 'direct' ||
          params.utm_source === 'direct' ||
          this.isAttributionExpired(existingParams.timestamp);

        if (shouldOverride) {
          finalParams = { ...params };
        }
      }

      // Always update referrer and landing page for the current session
      finalParams.referrer = params.referrer || finalParams.referrer;
      finalParams.landing_page = params.landing_page || finalParams.landing_page;
      finalParams.timestamp = finalParams.timestamp || params.timestamp;

      // Store in both sessionStorage and localStorage
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalParams));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalParams));

      // Update session tracking
      this.updateSession(finalParams);

    } catch (error) {
      console.error('Error storing UTM parameters:', error);
    }
  }

  /**
   * Get stored UTM parameters
   */
  static getStoredUTMParameters(): UTMParameters {
    if (typeof window === 'undefined') return {};

    try {
      // Try sessionStorage first, then localStorage
      const sessionData = sessionStorage.getItem(this.STORAGE_KEY);
      const localData = localStorage.getItem(this.STORAGE_KEY);
      
      const data = sessionData || localData;
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error retrieving UTM parameters:', error);
      return {};
    }
  }

  /**
   * Generate or get session ID
   */
  static getSessionId(): string {
    if (typeof window === 'undefined') return '';

    try {
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        sessionStorage.setItem('session_id', sessionId);
      }
      return sessionId;
    } catch (error) {
      console.error('Error managing session ID:', error);
      return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
  }

  /**
   * Update session tracking data
   */
  static updateSession(utmParams: UTMParameters): void {
    if (typeof window === 'undefined') return;

    try {
      const sessionId = this.getSessionId();
      const now = new Date().toISOString();
      
      let session: TrackingSession;
      const existingSession = sessionStorage.getItem(this.SESSION_KEY);
      
      if (existingSession) {
        session = JSON.parse(existingSession);
        session.last_visit = now;
        session.page_views += 1;
      } else {
        session = {
          session_id: sessionId,
          utm_params: utmParams,
          first_visit: now,
          last_visit: now,
          page_views: 1,
          campaign_interactions: []
        };
      }

      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }

  /**
   * Track campaign interaction
   */
  static trackInteraction(type: string, data: any = {}): void {
    if (typeof window === 'undefined') return;

    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      if (!sessionData) return;

      const session: TrackingSession = JSON.parse(sessionData);
      session.campaign_interactions.push({
        type,
        timestamp: new Date().toISOString(),
        data
      });

      // Keep only last 50 interactions to prevent storage bloat
      if (session.campaign_interactions.length > 50) {
        session.campaign_interactions = session.campaign_interactions.slice(-50);
      }

      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  /**
   * Get complete attribution data for form submissions
   */
  static getAttributionData(): {
    utm_params: UTMParameters;
    session: TrackingSession | null;
    attribution_type: 'first_touch' | 'last_touch' | 'direct';
  } {
    const utmParams = this.getStoredUTMParameters();
    let session: TrackingSession | null = null;

    try {
      const sessionData = sessionStorage.getItem(this.SESSION_KEY);
      session = sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error getting session data:', error);
    }

    // Determine attribution type
    let attributionType: 'first_touch' | 'last_touch' | 'direct' = 'direct';
    if (utmParams.utm_source || utmParams.utm_medium) {
      attributionType = utmParams.utm_medium === 'direct' ? 'direct' : 'first_touch';
    }

    return {
      utm_params: utmParams,
      session,
      attribution_type: attributionType
    };
  }

  /**
   * Clear stored UTM parameters (for testing or privacy compliance)
   */
  static clearUTMParameters(): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem(this.SESSION_KEY);
      sessionStorage.removeItem('session_id');
    } catch (error) {
      console.error('Error clearing UTM parameters:', error);
    }
  }

  /**
   * Check if attribution window has expired
   */
  private static isAttributionExpired(timestamp?: string): boolean {
    if (!timestamp) return true;
    
    try {
      const storedTime = new Date(timestamp).getTime();
      const now = Date.now();
      return (now - storedTime) > this.ATTRIBUTION_WINDOW;
    } catch (error) {
      return true;
    }
  }

  /**
   * Initialize UTM tracking on page load
   */
  static initialize(): void {
    if (typeof window === 'undefined') return;

    // Capture current UTM parameters
    const currentParams = this.captureUTMParameters();
    
    // Store them if any exist
    if (Object.keys(currentParams).length > 0) {
      this.storeUTMParameters(currentParams);
    } else {
      // Update session even without new UTM params
      const existingParams = this.getStoredUTMParameters();
      this.updateSession(existingParams);
    }

    // Track page view
    this.trackInteraction('page_view', {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer
    });
  }

  /**
   * Get UTM parameters as URL search params string
   */
  static getUTMString(): string {
    const params = this.getStoredUTMParameters();
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value && key.startsWith('utm_')) {
        searchParams.set(key, value.toString());
      }
    });

    return searchParams.toString();
  }

  /**
   * Append UTM parameters to a URL
   */
  static appendUTMToUrl(url: string): string {
    const utmString = this.getUTMString();
    if (!utmString) return url;

    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${utmString}`;
  }
}

// Auto-initialize on script load
if (typeof window !== 'undefined') {
  // Initialize immediately if DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UTMTracker.initialize());
  } else {
    UTMTracker.initialize();
  }

  // Re-initialize on Astro page transitions
  document.addEventListener('astro:after-swap', () => UTMTracker.initialize());
}

// Export for use in other modules
export default UTMTracker;