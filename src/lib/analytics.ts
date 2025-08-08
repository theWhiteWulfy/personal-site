/**
 * Analytics Configuration and Tracking Utilities
 * 
 * Provides comprehensive analytics integration for GA4 and Microsoft Clarity
 * with privacy-compliant initialization and engagement event tracking.
 */

// ============================================================================
// Type Definitions and Interfaces
// ============================================================================

export interface GA4Config {
  measurementId: string;
  enabled: boolean;
  cookieConsent: boolean;
  anonymizeIp: boolean;
  trackingOptOut: boolean;
  customDimensions?: Record<string, string>;
}

export interface ClarityConfig {
  projectId: string;
  enabled: boolean;
  cookieConsent: boolean;
  trackingOptOut: boolean;
}

export interface AnalyticsConfig {
  ga4: GA4Config;
  clarity: ClarityConfig;
  privacyMode: boolean;
  consentRequired: boolean;
  optOutCookieName: string;
}

export interface EngagementEvent {
  event_name: 'reaction_click' | 'comment_submit' | 'micropub_create' | 'content_view' | 'content_share';
  event_parameters: {
    content_id: string;
    content_type: string;
    reaction_type?: 'like' | 'love' | 'bookmark';
    engagement_type: string;
    user_identifier?: string;
    timestamp?: number;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface ConversionEvent {
  event_name: 'contact_form_submit' | 'newsletter_signup' | 'phone_click' | 'email_click';
  event_parameters: {
    conversion_type: string;
    value?: number;
    currency?: string;
    content_id?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface CustomEventParameters {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameter_1?: string;
  custom_parameter_2?: string;
  custom_parameter_3?: string;
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// Analytics Configuration Management
// ============================================================================

/**
 * Default analytics configuration
 */
export const defaultAnalyticsConfig: AnalyticsConfig = {
  ga4: {
    measurementId: '',
    enabled: false,
    cookieConsent: false,
    anonymizeIp: true,
    trackingOptOut: false,
    customDimensions: {}
  },
  clarity: {
    projectId: '',
    enabled: false,
    cookieConsent: false,
    trackingOptOut: false
  },
  privacyMode: true,
  consentRequired: true,
  optOutCookieName: 'analytics_opt_out'
};

/**
 * Initialize analytics configuration from site config
 */
export function initializeAnalyticsConfig(siteConfig: any): AnalyticsConfig {
  return {
    ga4: {
      measurementId: siteConfig.ga4MeasurementId || '',
      enabled: Boolean(siteConfig.ga4MeasurementId && siteConfig.enableAnalytics),
      cookieConsent: siteConfig.requireCookieConsent || true,
      anonymizeIp: siteConfig.anonymizeIp !== false,
      trackingOptOut: false,
      customDimensions: siteConfig.ga4CustomDimensions || {}
    },
    clarity: {
      projectId: siteConfig.clarityProjectId || '',
      enabled: Boolean(siteConfig.clarityProjectId && siteConfig.enableAnalytics),
      cookieConsent: siteConfig.requireCookieConsent || true,
      trackingOptOut: false
    },
    privacyMode: siteConfig.privacyMode !== false,
    consentRequired: siteConfig.requireCookieConsent !== false,
    optOutCookieName: siteConfig.optOutCookieName || 'analytics_opt_out'
  };
}

// ============================================================================
// Privacy and Consent Management
// ============================================================================

/**
 * Check if user has opted out of analytics tracking
 */
export function hasOptedOut(config: AnalyticsConfig): boolean {
  if (typeof window === 'undefined') return true;
  
  try {
    const optOutCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${config.optOutCookieName}=`));
    
    return optOutCookie?.split('=')[1] === 'true';
  } catch (error) {
    console.warn('Analytics: Error checking opt-out status:', error);
    return true; // Default to opted out on error
  }
}

/**
 * Set user opt-out preference
 */
export function setOptOutPreference(config: AnalyticsConfig, optOut: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // 1 year expiry
    
    document.cookie = `${config.optOutCookieName}=${optOut}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    
    // Disable GA4 tracking if opting out
    if (optOut && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
    }
  } catch (error) {
    console.warn('Analytics: Error setting opt-out preference:', error);
  }
}

/**
 * Check if analytics can be initialized based on privacy settings
 */
export function canInitializeAnalytics(config: AnalyticsConfig): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check opt-out status
  if (hasOptedOut(config)) return false;
  
  // If consent is required but not given, don't initialize
  if (config.consentRequired && !hasConsentBeenGiven(config)) return false;
  
  return true;
}

/**
 * Check if user has given consent for analytics
 */
export function hasConsentBeenGiven(config: AnalyticsConfig): boolean {
  if (!config.consentRequired) return true;
  if (typeof window === 'undefined') return false;
  
  try {
    const consentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('analytics_consent='));
    
    return consentCookie?.split('=')[1] === 'true';
  } catch (error) {
    console.warn('Analytics: Error checking consent status:', error);
    return false;
  }
}

/**
 * Set user consent for analytics
 */
export function setAnalyticsConsent(config: AnalyticsConfig, consent: boolean): void {
  if (typeof window === 'undefined') return;
  
  try {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    
    document.cookie = `analytics_consent=${consent}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    
    if (consent && !hasOptedOut(config)) {
      // Initialize analytics if consent is given and user hasn't opted out
      initializeAnalytics(config);
    }
  } catch (error) {
    console.warn('Analytics: Error setting consent:', error);
  }
}

// ============================================================================
// Analytics Initialization
// ============================================================================

/**
 * Initialize Google Analytics 4
 */
export function initializeGA4(config: GA4Config): void {
  if (typeof window === 'undefined' || !config.enabled || !config.measurementId) return;
  
  try {
    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    
    window.gtag('js', new Date());
    
    // Configure GA4 with privacy settings
    const ga4Config: any = {
      anonymize_ip: config.anonymizeIp,
      allow_google_signals: !config.trackingOptOut,
      allow_ad_personalization_signals: !config.trackingOptOut
    };
    
    // Add custom dimensions
    if (config.customDimensions) {
      Object.assign(ga4Config, config.customDimensions);
    }
    
    window.gtag('config', config.measurementId, ga4Config);
    
    // Set consent mode if required
    if (config.cookieConsent) {
      window.gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
    }
    
    console.log('Analytics: GA4 initialized successfully');
  } catch (error) {
    console.error('Analytics: Error initializing GA4:', error);
  }
}

/**
 * Initialize Microsoft Clarity
 */
export function initializeClarity(config: ClarityConfig): void {
  if (typeof window === 'undefined' || !config.enabled || !config.projectId) return;
  
  try {
    (function(c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
      c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments) };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", config.projectId, null, null);
    
    console.log('Analytics: Microsoft Clarity initialized successfully');
  } catch (error) {
    console.error('Analytics: Error initializing Clarity:', error);
  }
}

/**
 * Initialize all analytics services
 */
export function initializeAnalytics(config: AnalyticsConfig): void {
  if (!canInitializeAnalytics(config)) {
    console.log('Analytics: Initialization skipped due to privacy settings');
    return;
  }
  
  // Initialize GA4
  if (config.ga4.enabled) {
    initializeGA4(config.ga4);
  }
  
  // Initialize Clarity
  if (config.clarity.enabled) {
    initializeClarity(config.clarity);
  }
  
  console.log('Analytics: All services initialized');
}// ============================================================================
// Event Tracking Functions
// ============================================================================

/**
 * Track engagement events (reactions, comments, content interactions)
 */
export function trackEngagementEvent(event: EngagementEvent, config?: AnalyticsConfig): void {
  if (typeof window === 'undefined') return;
  
  // Check privacy settings
  if (config && !canInitializeAnalytics(config)) {
    console.log('Analytics: Event tracking skipped due to privacy settings');
    return;
  }
  
  try {
    // Track with GA4
    if (window.gtag) {
      window.gtag('event', event.event_name, {
        ...event.event_parameters,
        event_category: 'engagement',
        custom_parameter_1: event.event_parameters.content_type,
        custom_parameter_2: event.event_parameters.engagement_type,
        custom_parameter_3: event.event_parameters.reaction_type || ''
      });
    }
    
    // Track with Clarity (custom event)
    if (window.clarity) {
      window.clarity('event', event.event_name, {
        content_id: event.event_parameters.content_id,
        content_type: event.event_parameters.content_type,
        engagement_type: event.event_parameters.engagement_type
      });
    }
    
    console.log('Analytics: Engagement event tracked:', event.event_name);
  } catch (error) {
    console.warn('Analytics: Error tracking engagement event:', error);
  }
}

/**
 * Track conversion events (form submissions, contact interactions)
 */
export function trackConversionEvent(event: ConversionEvent, config?: AnalyticsConfig): void {
  if (typeof window === 'undefined') return;
  
  // Check privacy settings
  if (config && !canInitializeAnalytics(config)) {
    console.log('Analytics: Conversion tracking skipped due to privacy settings');
    return;
  }
  
  try {
    // Track with GA4
    if (window.gtag) {
      window.gtag('event', event.event_name, {
        ...event.event_parameters,
        event_category: 'conversion',
        value: event.event_parameters.value || 1,
        currency: event.event_parameters.currency || 'USD'
      });
    }
    
    // Track with Clarity
    if (window.clarity) {
      window.clarity('event', event.event_name, {
        conversion_type: event.event_parameters.conversion_type,
        value: event.event_parameters.value || 1
      });
    }
    
    console.log('Analytics: Conversion event tracked:', event.event_name);
  } catch (error) {
    console.warn('Analytics: Error tracking conversion event:', error);
  }
}

/**
 * Track custom events with flexible parameters
 */
export function trackCustomEvent(
  eventName: string, 
  parameters: CustomEventParameters, 
  config?: AnalyticsConfig
): void {
  if (typeof window === 'undefined') return;
  
  // Check privacy settings
  if (config && !canInitializeAnalytics(config)) {
    console.log('Analytics: Custom event tracking skipped due to privacy settings');
    return;
  }
  
  try {
    // Track with GA4
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: parameters.event_category || 'custom',
        event_label: parameters.event_label || '',
        value: parameters.value || 0,
        custom_parameter_1: parameters.custom_parameter_1 || '',
        custom_parameter_2: parameters.custom_parameter_2 || '',
        custom_parameter_3: parameters.custom_parameter_3 || '',
        ...parameters
      });
    }
    
    // Track with Clarity
    if (window.clarity) {
      window.clarity('event', eventName, parameters);
    }
    
    console.log('Analytics: Custom event tracked:', eventName);
  } catch (error) {
    console.warn('Analytics: Error tracking custom event:', error);
  }
}

// ============================================================================
// Specialized Engagement Tracking Functions
// ============================================================================

/**
 * Track reaction clicks (like, love, bookmark)
 */
export function trackReactionClick(
  contentId: string,
  contentType: string,
  reactionType: 'like' | 'love' | 'bookmark',
  userIdentifier?: string,
  config?: AnalyticsConfig
): void {
  trackEngagementEvent({
    event_name: 'reaction_click',
    event_parameters: {
      content_id: contentId,
      content_type: contentType,
      reaction_type: reactionType,
      engagement_type: 'reaction',
      user_identifier: userIdentifier,
      timestamp: Date.now()
    }
  }, config);
}

/**
 * Track comment submissions
 */
export function trackCommentSubmit(
  contentId: string,
  contentType: string,
  userIdentifier?: string,
  config?: AnalyticsConfig
): void {
  trackEngagementEvent({
    event_name: 'comment_submit',
    event_parameters: {
      content_id: contentId,
      content_type: contentType,
      engagement_type: 'comment',
      user_identifier: userIdentifier,
      timestamp: Date.now()
    }
  }, config);
}

/**
 * Track content views with engagement metrics
 */
export function trackContentView(
  contentId: string,
  contentType: string,
  readingTime?: number,
  config?: AnalyticsConfig
): void {
  trackEngagementEvent({
    event_name: 'content_view',
    event_parameters: {
      content_id: contentId,
      content_type: contentType,
      engagement_type: 'view',
      reading_time: readingTime,
      timestamp: Date.now()
    }
  }, config);
}

/**
 * Track content sharing
 */
export function trackContentShare(
  contentId: string,
  contentType: string,
  shareMethod: string,
  config?: AnalyticsConfig
): void {
  trackEngagementEvent({
    event_name: 'content_share',
    event_parameters: {
      content_id: contentId,
      content_type: contentType,
      engagement_type: 'share',
      share_method: shareMethod,
      timestamp: Date.now()
    }
  }, config);
}

/**
 * Track Micropub content creation
 */
export function trackMicropubCreate(
  contentType: string,
  postType: string,
  config?: AnalyticsConfig
): void {
  trackEngagementEvent({
    event_name: 'micropub_create',
    event_parameters: {
      content_id: `micropub_${Date.now()}`,
      content_type: contentType,
      engagement_type: 'creation',
      post_type: postType,
      timestamp: Date.now()
    }
  }, config);
}

// ============================================================================
// Conversion Tracking Functions
// ============================================================================

/**
 * Track newsletter signups
 */
export function trackNewsletterSignup(email?: string, config?: AnalyticsConfig): void {
  trackConversionEvent({
    event_name: 'newsletter_signup',
    event_parameters: {
      conversion_type: 'newsletter',
      value: 1,
      email_provided: Boolean(email)
    }
  }, config);
}

/**
 * Track contact form submissions
 */
export function trackContactFormSubmit(formType: string, config?: AnalyticsConfig): void {
  trackConversionEvent({
    event_name: 'contact_form_submit',
    event_parameters: {
      conversion_type: 'contact',
      form_type: formType,
      value: 5 // Assign value to contact form submissions
    }
  }, config);
}

/**
 * Track phone number clicks
 */
export function trackPhoneClick(phoneNumber: string, config?: AnalyticsConfig): void {
  trackConversionEvent({
    event_name: 'phone_click',
    event_parameters: {
      conversion_type: 'phone_contact',
      phone_number: phoneNumber.replace(/[^\d]/g, ''), // Remove formatting
      value: 10 // Higher value for direct contact
    }
  }, config);
}

/**
 * Track email link clicks
 */
export function trackEmailClick(emailAddress: string, config?: AnalyticsConfig): void {
  trackConversionEvent({
    event_name: 'email_click',
    event_parameters: {
      conversion_type: 'email_contact',
      email_address: emailAddress,
      value: 8 // High value for direct contact
    }
  }, config);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate user identifier for tracking (privacy-compliant)
 */
export function generateUserIdentifier(): string {
  if (typeof window === 'undefined') return 'server';
  
  try {
    // Use a combination of factors that don't personally identify the user
    const factors = [
      navigator.userAgent.length,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      navigator.language
    ];
    
    // Create a simple hash
    const hash = factors.join('|');
    let hashCode = 0;
    for (let i = 0; i < hash.length; i++) {
      const char = hash.charCodeAt(i);
      hashCode = ((hashCode << 5) - hashCode) + char;
      hashCode = hashCode & hashCode; // Convert to 32-bit integer
    }
    
    return `user_${Math.abs(hashCode)}`;
  } catch (error) {
    console.warn('Analytics: Error generating user identifier:', error);
    return `user_${Date.now()}`;
  }
}

/**
 * Get current page information for analytics
 */
export function getCurrentPageInfo(): { page_title: string; page_location: string; page_path: string } {
  if (typeof window === 'undefined') {
    return {
      page_title: '',
      page_location: '',
      page_path: ''
    };
  }
  
  return {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  };
}

/**
 * Create enhanced event parameters with page context
 */
export function createEnhancedEventParameters(
  baseParameters: Record<string, any>
): CustomEventParameters {
  const pageInfo = getCurrentPageInfo();
  const userIdentifier = generateUserIdentifier();
  
  return {
    ...baseParameters,
    page_title: pageInfo.page_title,
    page_location: pageInfo.page_location,
    page_path: pageInfo.page_path,
    user_identifier: userIdentifier,
    timestamp: Date.now(),
    session_id: getSessionId()
  };
}

/**
 * Get or create session ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  
  try {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  } catch (error) {
    console.warn('Analytics: Error managing session ID:', error);
    return `session_${Date.now()}`;
  }
}

/**
 * Batch event tracking for performance
 */
export class AnalyticsEventBatcher {
  private events: Array<{ type: string; data: any }> = [];
  private batchSize: number = 10;
  private flushInterval: number = 5000; // 5 seconds
  private timer: NodeJS.Timeout | null = null;
  private config?: AnalyticsConfig;

  constructor(config?: AnalyticsConfig, batchSize: number = 10, flushInterval: number = 5000) {
    this.config = config;
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.startTimer();
  }

  addEvent(type: 'engagement' | 'conversion' | 'custom', data: any): void {
    this.events.push({ type, data });
    
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  flush(): void {
    if (this.events.length === 0) return;
    
    const eventsToProcess = [...this.events];
    this.events = [];
    
    eventsToProcess.forEach(({ type, data }) => {
      switch (type) {
        case 'engagement':
          trackEngagementEvent(data, this.config);
          break;
        case 'conversion':
          trackConversionEvent(data, this.config);
          break;
        case 'custom':
          trackCustomEvent(data.name, data.parameters, this.config);
          break;
      }
    });
  }

  private startTimer(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }

  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush(); // Flush remaining events
  }
}

// ============================================================================
// Global Type Declarations
// ============================================================================

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    clarity: (action: string, ...args: any[]) => void;
    trackEngagementEvent: (eventName: string, parameters: any) => void;
    trackConversionEvent: (eventName: string, parameters: any) => void;
    setAnalyticsConsent: (consent: boolean) => void;
    setOptOutPreference: (optOut: boolean) => void;
    checkAnalyticsConsent: () => boolean;
    hasOptedOut: () => boolean;
  }
}

// ============================================================================
// Export Default Configuration
// ============================================================================

export default {
  initializeAnalyticsConfig,
  initializeAnalytics,
  trackEngagementEvent,
  trackConversionEvent,
  trackCustomEvent,
  trackReactionClick,
  trackCommentSubmit,
  trackContentView,
  trackContentShare,
  trackMicropubCreate,
  trackNewsletterSignup,
  trackContactFormSubmit,
  trackPhoneClick,
  trackEmailClick,
  generateUserIdentifier,
  getCurrentPageInfo,
  createEnhancedEventParameters,
  AnalyticsEventBatcher,
  hasOptedOut,
  setOptOutPreference,
  canInitializeAnalytics,
  hasConsentBeenGiven,
  setAnalyticsConsent
};