// Analytics Configuration and Types
// Provides TypeScript interfaces for GA4 and Microsoft Clarity integration

// Google Analytics 4 Configuration
export interface GA4Config {
  measurementId: string;
  enhancedMeasurement: boolean;
  conversionEvents: string[];
  customDimensions?: Record<string, string>;
  customMetrics?: Record<string, string>;
}

// Microsoft Clarity Configuration
export interface ClarityConfig {
  projectId: string;
  enableHeatmaps: boolean;
  enableRecordings: boolean;
  privacyMode: 'strict' | 'balanced' | 'relaxed';
  cookieConsent: boolean;
}

// Privacy Configuration
export interface PrivacyConfig {
  enableOptOut: boolean;
  cookieConsentRequired: boolean;
  dataRetentionDays: number;
  anonymizeIp: boolean;
  respectDoNotTrack: boolean;
  consentStorageKey: string;
}

// Analytics Event Base Interface
export interface AnalyticsEvent {
  event_name: string;
  event_parameters: Record<string, any>;
  timestamp?: Date;
  user_id?: string;
  session_id?: string;
}

// Phone Click Event Interface
export interface PhoneClickEvent extends AnalyticsEvent {
  event_name: 'phone_click';
  event_parameters: {
    phone_number: string;
    click_location: string; // header, footer, contact_page, etc.
    page_url: string;
    page_title: string;
  };
}

// Form Submission Event Interface
export interface FormSubmissionEvent extends AnalyticsEvent {
  event_name: 'form_submit';
  event_parameters: {
    form_type: 'contact' | 'newsletter' | 'resource_download';
    form_location: string;
    page_url: string;
    page_title: string;
    success: boolean;
    error_message?: string;
  };
}

// Resource Download Event Interface
export interface ResourceDownloadEvent extends AnalyticsEvent {
  event_name: 'resource_download';
  event_parameters: {
    resource_name: string;
    resource_type: 'pdf' | 'guide' | 'template' | 'checklist';
    download_method: 'form_gate' | 'direct_link';
    page_url: string;
    page_title: string;
    user_email?: string; // Only if provided through form
  };
}

// Conversion Event Interface
export interface ConversionEvent extends AnalyticsEvent {
  event_name: 'conversion';
  event_parameters: {
    conversion_type: 'phone_click' | 'form_submit' | 'resource_download' | 'email_click';
    conversion_value?: number;
    currency?: string;
    page_url: string;
    page_title: string;
  };
}

// Page View Event Interface
export interface PageViewEvent extends AnalyticsEvent {
  event_name: 'page_view';
  event_parameters: {
    page_title: string;
    page_location: string;
    content_group1?: string; // Collection type: articles, works, etc.
    content_group2?: string; // Category or tag
    custom_parameter?: string;
  };
}

// Email Click Event Interface
export interface EmailClickEvent extends AnalyticsEvent {
  event_name: 'email_click';
  event_parameters: {
    email_address: string;
    click_location: string;
    page_url: string;
    page_title: string;
  };
}

// Union type for all event types
export type TrackingEvent =
  | PhoneClickEvent
  | FormSubmissionEvent
  | ResourceDownloadEvent
  | ConversionEvent
  | PageViewEvent
  | EmailClickEvent;

// Analytics Provider Interface
export interface AnalyticsProvider {
  initialize(): Promise<void>;
  trackEvent(event: TrackingEvent): Promise<void>;
  trackPageView(event: PageViewEvent): Promise<void>;
  setUserId(userId: string): void;
  optOut(): void;
  optIn(): void;
  isOptedOut(): boolean;
}

// Combined Analytics Configuration
export interface AnalyticsConfiguration {
  ga4: GA4Config;
  clarity: ClarityConfig;
  privacy: PrivacyConfig;
  enabled: boolean;
  debug: boolean;
}

// Consent Status Interface
export interface ConsentStatus {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: Date;
  version: string;
}

// Analytics Error Interface
export interface AnalyticsError {
  provider: 'ga4' | 'clarity' | 'general';
  error: Error;
  event?: TrackingEvent;
  timestamp: Date;
}

// Event Queue Interface for offline support
export interface EventQueue {
  events: TrackingEvent[];
  maxSize: number;
  flushInterval: number;
}
// GA4 Utility Functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export class GA4Analytics implements AnalyticsProvider {
  private config: GA4Config;
  private privacyConfig: PrivacyConfig;
  private initialized = false;

  constructor(config: GA4Config, privacyConfig: PrivacyConfig) {
    this.config = config;
    this.privacyConfig = privacyConfig;
  }

  async initialize(): Promise<void> {
    if (this.initialized || this.isOptedOut()) {
      return;
    }

    try {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };

      // Configure GA4
      window.gtag('js', new Date());
      window.gtag('config', this.config.measurementId, {
        anonymize_ip: this.privacyConfig.anonymizeIp,
        allow_google_signals: !this.privacyConfig.respectDoNotTrack,
        allow_ad_personalization_signals: false,
        cookie_expires: this.privacyConfig.dataRetentionDays * 24 * 60 * 60,
      });

      // Set up custom dimensions and metrics
      if (this.config.customDimensions) {
        Object.entries(this.config.customDimensions).forEach(([key, value]) => {
          window.gtag('config', this.config.measurementId, {
            custom_map: { [key]: value }
          });
        });
      }

      this.initialized = true;
    } catch (error) {
      console.error('GA4 initialization failed:', error);
      const analyticsError: AnalyticsError = {
        provider: 'ga4',
        error: error as Error,
        timestamp: new Date()
      };
      throw analyticsError;
    }
  }

  async trackEvent(event: TrackingEvent): Promise<void> {
    if (!this.initialized || this.isOptedOut()) {
      return;
    }

    try {
      window.gtag('event', event.event_name, event.event_parameters);
    } catch (error) {
      console.error('GA4 event tracking failed:', error);
    }
  }

  async trackPageView(event: PageViewEvent): Promise<void> {
    if (!this.initialized || this.isOptedOut()) {
      return;
    }

    try {
      window.gtag('config', this.config.measurementId, {
        page_title: event.event_parameters.page_title,
        page_location: event.event_parameters.page_location,
        content_group1: event.event_parameters.content_group1,
        content_group2: event.event_parameters.content_group2,
      });
    } catch (error) {
      console.error('GA4 page view tracking failed:', error);
    }
  }

  setUserId(userId: string): void {
    if (!this.initialized || this.isOptedOut()) {
      return;
    }

    try {
      window.gtag('config', this.config.measurementId, {
        user_id: userId
      });
    } catch (error) {
      console.error('GA4 user ID setting failed:', error);
    }
  }

  optOut(): void {
    localStorage.setItem(this.privacyConfig.consentStorageKey, 'false');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });
    }
  }

  optIn(): void {
    localStorage.setItem(this.privacyConfig.consentStorageKey, 'true');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied'
      });
    }
  }

  isOptedOut(): boolean {
    if (typeof window === 'undefined') return true;

    // Check Do Not Track
    if (this.privacyConfig.respectDoNotTrack && navigator.doNotTrack === '1') {
      return true;
    }

    // Check stored consent
    const consent = localStorage.getItem(this.privacyConfig.consentStorageKey);
    return consent === 'false';
  }

  // Conversion tracking functions
  trackConversion(conversionEvent: ConversionEvent): void {
    if (!this.initialized || this.isOptedOut()) {
      return;
    }

    try {
      window.gtag('event', 'conversion', {
        send_to: this.config.measurementId,
        value: conversionEvent.event_parameters.conversion_value || 1,
        currency: conversionEvent.event_parameters.currency || 'USD',
        transaction_id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        event_category: 'engagement',
        event_label: conversionEvent.event_parameters.conversion_type,
      });
    } catch (error) {
      console.error('GA4 conversion tracking failed:', error);
    }
  }

  // Phone click tracking
  trackPhoneClick(phoneNumber: string, location: string): void {
    const event: PhoneClickEvent = {
      event_name: 'phone_click',
      event_parameters: {
        phone_number: phoneNumber,
        click_location: location,
        page_url: window.location.href,
        page_title: document.title,
      }
    };

    this.trackEvent(event);

    // Also track as conversion
    this.trackConversion({
      event_name: 'conversion',
      event_parameters: {
        conversion_type: 'phone_click',
        conversion_value: 10, // Assign value to phone clicks
        page_url: window.location.href,
        page_title: document.title,
      }
    });
  }

  // Form submission tracking
  trackFormSubmission(formType: string, formLocation: string, success: boolean, errorMessage?: string): void {
    const event: FormSubmissionEvent = {
      event_name: 'form_submit',
      event_parameters: {
        form_type: formType as 'contact' | 'newsletter' | 'resource_download',
        form_location: formLocation,
        page_url: window.location.href,
        page_title: document.title,
        success,
        error_message: errorMessage,
      }
    };

    this.trackEvent(event);

    // Track successful submissions as conversions
    if (success) {
      this.trackConversion({
        event_name: 'conversion',
        event_parameters: {
          conversion_type: 'form_submit',
          conversion_value: formType === 'contact' ? 25 : 5, // Higher value for contact forms
          page_url: window.location.href,
          page_title: document.title,
        }
      });
    }
  }

  // Resource download tracking
  trackResourceDownload(resourceName: string, resourceType: string, downloadMethod: string, userEmail?: string): void {
    const event: ResourceDownloadEvent = {
      event_name: 'resource_download',
      event_parameters: {
        resource_name: resourceName,
        resource_type: resourceType as 'pdf' | 'guide' | 'template' | 'checklist',
        download_method: downloadMethod as 'form_gate' | 'direct_link',
        page_url: window.location.href,
        page_title: document.title,
        user_email: userEmail,
      }
    };

    this.trackEvent(event);

    // Track as conversion
    this.trackConversion({
      event_name: 'conversion',
      event_parameters: {
        conversion_type: 'resource_download',
        conversion_value: 15, // Value for resource downloads
        page_url: window.location.href,
        page_title: document.title,
      }
    });
  }

  // Email click tracking
  trackEmailClick(emailAddress: string, location: string): void {
    const event: EmailClickEvent = {
      event_name: 'email_click',
      event_parameters: {
        email_address: emailAddress,
        click_location: location,
        page_url: window.location.href,
        page_title: document.title,
      }
    };

    this.trackEvent(event);

    // Track as conversion
    this.trackConversion({
      event_name: 'conversion',
      event_parameters: {
        conversion_type: 'email_click',
        conversion_value: 8, // Value for email clicks
        page_url: window.location.href,
        page_title: document.title,
      }
    });
  }
}
// Microsoft Clarity Analytics Implementation
export class ClarityAnalytics implements AnalyticsProvider {
  private config: ClarityConfig;
  private privacyConfig: PrivacyConfig;
  private initialized = false;

  constructor(config: ClarityConfig, privacyConfig: PrivacyConfig) {
    this.config = config;
    this.privacyConfig = privacyConfig;
  }

  async initialize(): Promise<void> {
    if (this.initialized || this.isOptedOut()) {
      return;
    }

    try {
      // Initialize Clarity
      (function (c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", this.config.projectId, null, null);

      this.initialized = true;
    } catch (error) {
      console.error('Clarity initialization failed:', error);
      const analyticsError: AnalyticsError = {
        provider: 'clarity',
        error: error as Error,
        timestamp: new Date()
      };
      throw analyticsError;
    }
  }

  async trackEvent(event: TrackingEvent): Promise<void> {
    if (!this.initialized || this.isOptedOut()) {
      return;
    }

    try {
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('event', event.event_name, event.event_parameters);
      }
    } catch (error) {
      console.error('Clarity event tracking failed:', error);
    }
  }

  async trackPageView(event: PageViewEvent): Promise<void> {
    if (!this.initialized || this.isOptedOut()) {
      return;
    }

    try {
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('set', 'page_title', event.event_parameters.page_title);
        (window as any).clarity('set', 'page_location', event.event_parameters.page_location);
      }
    } catch (error) {
      console.error('Clarity page view tracking failed:', error);
    }
  }

  setUserId(userId: string): void {
    if (!this.initialized || this.isOptedOut()) {
      return;
    }

    try {
      if (typeof window !== 'undefined' && (window as any).clarity) {
        (window as any).clarity('identify', userId);
      }
    } catch (error) {
      console.error('Clarity user ID setting failed:', error);
    }
  }

  optOut(): void {
    localStorage.setItem(this.privacyConfig.consentStorageKey, 'false');
  }

  optIn(): void {
    localStorage.setItem(this.privacyConfig.consentStorageKey, 'true');
  }

  isOptedOut(): boolean {
    if (typeof window === 'undefined') return true;

    // Check Do Not Track
    if (this.privacyConfig.respectDoNotTrack && navigator.doNotTrack === '1') {
      return true;
    }

    // Check stored consent
    const consent = localStorage.getItem(this.privacyConfig.consentStorageKey);
    return consent === 'false';
  }
}

// Combined Analytics Manager
export class AnalyticsManager {
  private ga4: GA4Analytics | null = null;
  private clarity: ClarityAnalytics | null = null;
  private config: AnalyticsConfiguration;

  constructor(config: AnalyticsConfiguration) {
    this.config = config;

    if (config.ga4) {
      this.ga4 = new GA4Analytics(config.ga4, config.privacy);
    }

    if (config.clarity) {
      this.clarity = new ClarityAnalytics(config.clarity, config.privacy);
    }
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      if (this.ga4) {
        await this.ga4.initialize();
      }

      if (this.clarity) {
        await this.clarity.initialize();
      }
    } catch (error) {
      console.error('Analytics initialization failed:', error);
    }
  }

  async trackEvent(event: TrackingEvent): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      if (this.ga4) {
        await this.ga4.trackEvent(event);
      }

      if (this.clarity) {
        await this.clarity.trackEvent(event);
      }
    } catch (error) {
      console.error('Analytics event tracking failed:', error);
    }
  }

  trackPhoneClick(phoneNumber: string, location: string): void {
    if (this.ga4) {
      this.ga4.trackPhoneClick(phoneNumber, location);
    }
  }

  trackFormSubmission(formType: string, formLocation: string, success: boolean, errorMessage?: string): void {
    if (this.ga4) {
      this.ga4.trackFormSubmission(formType, formLocation, success, errorMessage);
    }
  }

  trackResourceDownload(resourceName: string, resourceType: string, downloadMethod: string, userEmail?: string): void {
    if (this.ga4) {
      this.ga4.trackResourceDownload(resourceName, resourceType, downloadMethod, userEmail);
    }
  }

  trackEmailClick(emailAddress: string, location: string): void {
    if (this.ga4) {
      this.ga4.trackEmailClick(emailAddress, location);
    }
  }

  optOut(): void {
    if (this.ga4) {
      this.ga4.optOut();
    }
    if (this.clarity) {
      this.clarity.optOut();
    }
  }

  optIn(): void {
    if (this.ga4) {
      this.ga4.optIn();
    }
    if (this.clarity) {
      this.clarity.optIn();
    }
  }
}

// Configuration helper functions
export interface AnalyticsConfig {
  ga4: GA4Config & {
    enabled: boolean;
    anonymizeIp: boolean;
    cookieConsent: boolean;
    trackingOptOut: boolean;
  };
  clarity: ClarityConfig & {
    enabled: boolean;
  };
  consentRequired: boolean;
  optOutCookieName: string;
}

export function initializeAnalyticsConfig(siteConfig: any): AnalyticsConfig {
  const analytics = siteConfig.analytics || {};

  return {
    ga4: {
      enabled: analytics.enabled && analytics.ga4?.measurementId !== 'G-XXXXXXXXXX',
      measurementId: analytics.ga4?.measurementId || '',
      enhancedMeasurement: analytics.ga4?.enhancedMeasurement ?? true,
      conversionEvents: analytics.ga4?.conversionEvents || [
        'phone_click',
        'form_submit',
        'resource_download',
        'email_click'
      ],
      anonymizeIp: analytics.privacy?.anonymizeIp ?? true,
      cookieConsent: analytics.privacy?.cookieConsentRequired ?? true,
      trackingOptOut: analytics.privacy?.enableOptOut ?? true,
      customDimensions: analytics.ga4?.customDimensions || {},
      customMetrics: analytics.ga4?.customMetrics || {},
    },
    clarity: {
      enabled: analytics.enabled && analytics.clarity?.projectId !== 'XXXXXXXXXX',
      projectId: analytics.clarity?.projectId || '',
      enableHeatmaps: analytics.clarity?.enableHeatmaps ?? true,
      enableRecordings: analytics.clarity?.enableRecordings ?? true,
      privacyMode: analytics.clarity?.privacyMode || 'balanced',
      cookieConsent: analytics.privacy?.cookieConsentRequired ?? true,
    },
    consentRequired: analytics.privacy?.cookieConsentRequired ?? true,
    optOutCookieName: analytics.privacy?.consentStorageKey || 'meteoric_analytics_consent',
  };
}

// Global analytics instance
let globalAnalytics: AnalyticsManager | null = null;

export function getAnalyticsInstance(): AnalyticsManager | null {
  return globalAnalytics;
}

export function initializeGlobalAnalytics(config: AnalyticsConfiguration): AnalyticsManager {
  globalAnalytics = new AnalyticsManager(config);
  return globalAnalytics;
}// Form tracking utilities for client-side use
export const FormTracker = {
  // Track form submission with detailed parameters
  trackSubmission: (formType: string, formLocation: string, success: boolean, errorMessage?: string) => {
    if (typeof window === 'undefined') return;

    try {
      // Track with GA4 if available
      if ((window as any).trackConversionEvent) {
        (window as any).trackConversionEvent('form_submit', {
          form_type: formType,
          form_location: formLocation,
          success: success,
          error_message: errorMessage,
          conversion_type: 'form_submission',
          value: formType === 'contact' ? 25 : formType === 'newsletter' ? 5 : 10
        });
      }

      // Track with Clarity if available
      if ((window as any).clarity) {
        (window as any).clarity('event', 'form_submit', {
          form_type: formType,
          form_location: formLocation,
          success: success
        });
      }

      console.log(`Form tracking: ${formType} form ${success ? 'submitted' : 'failed'} at ${formLocation}`);
    } catch (error) {
      console.warn('Form tracking failed:', error);
    }
  },

  // Track form field interactions
  trackFieldInteraction: (formType: string, fieldName: string, action: string) => {
    if (typeof window === 'undefined') return;

    try {
      if ((window as any).trackEngagementEvent) {
        (window as any).trackEngagementEvent('form_interaction', {
          form_type: formType,
          field_name: fieldName,
          action: action, // focus, blur, change, etc.
          event_category: 'form_engagement'
        });
      }
    } catch (error) {
      console.warn('Form field tracking failed:', error);
    }
  },

  // Track form validation errors
  trackValidationError: (formType: string, fieldName: string, errorType: string) => {
    if (typeof window === 'undefined') return;

    try {
      if ((window as any).trackEngagementEvent) {
        (window as any).trackEngagementEvent('form_validation_error', {
          form_type: formType,
          field_name: fieldName,
          error_type: errorType,
          event_category: 'form_validation'
        });
      }
    } catch (error) {
      console.warn('Form validation tracking failed:', error);
    }
  },

  // Track form abandonment
  trackAbandonment: (formType: string, fieldsCompleted: number, totalFields: number) => {
    if (typeof window === 'undefined') return;

    try {
      if ((window as any).trackEngagementEvent) {
        (window as any).trackEngagementEvent('form_abandonment', {
          form_type: formType,
          fields_completed: fieldsCompleted,
          total_fields: totalFields,
          completion_rate: (fieldsCompleted / totalFields) * 100,
          event_category: 'form_engagement'
        });
      }
    } catch (error) {
      console.warn('Form abandonment tracking failed:', error);
    }
  }
};

// Newsletter form specific tracking
export const NewsletterTracker = {
  trackSubscription: (success: boolean, email?: string, errorMessage?: string) => {
    FormTracker.trackSubmission('newsletter', 'footer', success, errorMessage);

    if (success && typeof window !== 'undefined') {
      // Track as conversion with higher value for newsletter signups
      if ((window as any).trackConversionEvent) {
        (window as any).trackConversionEvent('newsletter_signup', {
          conversion_type: 'newsletter_subscription',
          value: 15,
          email_provided: !!email
        });
      }
    }
  },

  trackEmailValidation: (isValid: boolean, _email: string) => {
    if (!isValid) {
      FormTracker.trackValidationError('newsletter', 'email', 'invalid_format');
    }
  }
};

// Contact form specific tracking
export const ContactTracker = {
  trackSubmission: (success: boolean, formData?: any, errorMessage?: string) => {
    FormTracker.trackSubmission('contact', 'contact_page', success, errorMessage);

    if (success && typeof window !== 'undefined') {
      // Track as high-value conversion
      if ((window as any).trackConversionEvent) {
        (window as any).trackConversionEvent('contact_form', {
          conversion_type: 'contact_inquiry',
          value: 50, // High value for contact form submissions
          has_message: !!(formData?.message),
          has_phone: !!(formData?.phone),
          inquiry_type: formData?.subject || 'general'
        });
      }
    }
  },

  trackFieldCompletion: (fieldName: string) => {
    FormTracker.trackFieldInteraction('contact', fieldName, 'completed');
  }
};

// Resource download form tracking
export const ResourceTracker = {
  trackDownloadRequest: (resourceName: string, success: boolean, formData?: any, errorMessage?: string) => {
    FormTracker.trackSubmission('resource_download', 'resource_page', success, errorMessage);

    if (success && typeof window !== 'undefined') {
      // Track resource download conversion
      if ((window as any).trackConversionEvent) {
        (window as any).trackConversionEvent('resource_download', {
          conversion_type: 'lead_generation',
          resource_name: resourceName,
          value: 20,
          user_role: formData?.role,
          user_workplace: formData?.workplace
        });
      }
    }
  },

  trackResourceAccess: (resourceName: string, resourceType: string) => {
    if (typeof window !== 'undefined' && (window as any).trackEngagementEvent) {
      (window as any).trackEngagementEvent('resource_access', {
        resource_name: resourceName,
        resource_type: resourceType,
        event_category: 'content_engagement'
      });
    }
  }
};
// Privacy-compliant analytics initialization and consent management
export class PrivacyManager {
  private consentStorageKey: string;
  private optOutStorageKey: string;
  private consentVersion: string = '1.0';

  constructor(consentKey: string = 'meteoric_analytics_consent', optOutKey: string = 'meteoric_analytics_optout') {
    this.consentStorageKey = consentKey;
    this.optOutStorageKey = optOutKey;
  }

  // Check if user has given consent
  hasConsent(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const consent = localStorage.getItem(this.consentStorageKey);
      const consentData = consent ? JSON.parse(consent) : null;

      // Check if consent exists and is current version
      return consentData &&
        consentData.analytics === true &&
        consentData.version === this.consentVersion &&
        new Date(consentData.timestamp) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // 1 year expiry
    } catch (error) {
      console.warn('Error checking consent:', error);
      return false;
    }
  }

  // Check if user has opted out
  hasOptedOut(): boolean {
    if (typeof window === 'undefined') return true;

    try {
      // Check Do Not Track header
      if (navigator.doNotTrack === '1') {
        return true;
      }

      // Check stored opt-out preference
      const optOut = localStorage.getItem(this.optOutStorageKey);
      return optOut === 'true';
    } catch (error) {
      console.warn('Error checking opt-out status:', error);
      return true; // Default to opted out on error
    }
  }

  // Set user consent
  setConsent(analytics: boolean, marketing: boolean = false, functional: boolean = true): void {
    if (typeof window === 'undefined') return;

    try {
      const consentData: ConsentStatus = {
        analytics,
        marketing,
        functional,
        timestamp: new Date(),
        version: this.consentVersion
      };

      localStorage.setItem(this.consentStorageKey, JSON.stringify(consentData));

      // Update GA4 consent if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          'analytics_storage': analytics ? 'granted' : 'denied',
          'ad_storage': marketing ? 'granted' : 'denied',
          'functionality_storage': functional ? 'granted' : 'denied',
          'personalization_storage': 'denied', // Always deny for privacy
          'security_storage': 'granted' // Always allow security
        });
      }

      // Trigger consent change event
      this.triggerConsentChangeEvent(consentData);
    } catch (error) {
      console.error('Error setting consent:', error);
    }
  }

  // Set opt-out preference
  setOptOut(optOut: boolean): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.optOutStorageKey, optOut.toString());

      if (optOut) {
        // Clear any existing consent
        localStorage.removeItem(this.consentStorageKey);

        // Update GA4 consent to denied
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'functionality_storage': 'denied',
            'personalization_storage': 'denied'
          });
        }
      }

      // Trigger opt-out change event
      this.triggerOptOutChangeEvent(optOut);
    } catch (error) {
      console.error('Error setting opt-out preference:', error);
    }
  }

  // Get current consent status
  getConsentStatus(): ConsentStatus | null {
    if (typeof window === 'undefined') return null;

    try {
      const consent = localStorage.getItem(this.consentStorageKey);
      return consent ? JSON.parse(consent) : null;
    } catch (error) {
      console.warn('Error getting consent status:', error);
      return null;
    }
  }

  // Check if analytics should be loaded
  shouldLoadAnalytics(): boolean {
    return !this.hasOptedOut() && this.hasConsent();
  }

  // Initialize consent mode for GA4
  initializeConsentMode(): void {
    if (typeof window === 'undefined') return;

    try {
      // Set default consent state (denied by default for privacy)
      if ((window as any).gtag) {
        (window as any).gtag('consent', 'default', {
          'analytics_storage': 'denied',
          'ad_storage': 'denied',
          'functionality_storage': 'denied',
          'personalization_storage': 'denied',
          'security_storage': 'granted'
        });
      }

      // Update consent based on stored preferences
      if (this.shouldLoadAnalytics()) {
        const consentStatus = this.getConsentStatus();
        if (consentStatus && (window as any).gtag) {
          (window as any).gtag('consent', 'update', {
            'analytics_storage': consentStatus.analytics ? 'granted' : 'denied',
            'ad_storage': consentStatus.marketing ? 'granted' : 'denied',
            'functionality_storage': consentStatus.functional ? 'granted' : 'denied'
          });
        }
      }
    } catch (error) {
      console.error('Error initializing consent mode:', error);
    }
  }

  // Trigger custom events for consent changes
  private triggerConsentChangeEvent(consentData: ConsentStatus): void {
    if (typeof window === 'undefined') return;

    try {
      const event = new CustomEvent('analytics:consent-changed', {
        detail: consentData
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.warn('Error triggering consent change event:', error);
    }
  }

  private triggerOptOutChangeEvent(optedOut: boolean): void {
    if (typeof window === 'undefined') return;

    try {
      const event = new CustomEvent('analytics:optout-changed', {
        detail: { optedOut }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.warn('Error triggering opt-out change event:', error);
    }
  }

  // Clear all stored preferences (for testing or reset)
  clearAllPreferences(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.consentStorageKey);
      localStorage.removeItem(this.optOutStorageKey);
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  }
}

// Cookie consent banner utilities
export class ConsentBanner {
  private privacyManager: PrivacyManager;
  private bannerElement: HTMLElement | null = null;
  private isVisible: boolean = false;

  constructor(privacyManager: PrivacyManager) {
    this.privacyManager = privacyManager;
  }

  // Check if banner should be shown
  shouldShow(): boolean {
    return !this.privacyManager.hasConsent() && !this.privacyManager.hasOptedOut();
  }

  // Create and show consent banner
  show(): void {
    if (typeof window === 'undefined' || this.isVisible || !this.shouldShow()) {
      return;
    }

    try {
      this.createBannerElement();
      this.attachEventListeners();
      this.isVisible = true;
    } catch (error) {
      console.error('Error showing consent banner:', error);
    }
  }

  // Hide consent banner
  hide(): void {
    if (this.bannerElement) {
      this.bannerElement.remove();
      this.bannerElement = null;
      this.isVisible = false;
    }
  }

  private createBannerElement(): void {
    const banner = document.createElement('div');
    banner.id = 'analytics-consent-banner';
    banner.innerHTML = `
      <div class="consent-banner-content">
        <div class="consent-banner-text">
          <h3>Privacy & Analytics</h3>
          <p>We use analytics to improve your experience. You can opt out at any time.</p>
        </div>
        <div class="consent-banner-actions">
          <button id="consent-accept" class="consent-btn consent-accept">Accept</button>
          <button id="consent-decline" class="consent-btn consent-decline">Decline</button>
          <button id="consent-customize" class="consent-btn consent-customize">Customize</button>
        </div>
      </div>
    `;

    // Add styles
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--background-color, #fff);
      border-top: 2px solid var(--border-color, #ddd);
      padding: 1rem;
      z-index: 1000;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
    `;

    document.body.appendChild(banner);
    this.bannerElement = banner;
  }

  private attachEventListeners(): void {
    if (!this.bannerElement) return;

    const acceptBtn = this.bannerElement.querySelector('#consent-accept');
    const declineBtn = this.bannerElement.querySelector('#consent-decline');
    const customizeBtn = this.bannerElement.querySelector('#consent-customize');

    acceptBtn?.addEventListener('click', () => {
      this.privacyManager.setConsent(true, false, true);
      this.hide();
      this.reloadAnalytics();
    });

    declineBtn?.addEventListener('click', () => {
      this.privacyManager.setOptOut(true);
      this.hide();
    });

    customizeBtn?.addEventListener('click', () => {
      this.showCustomizeModal();
    });
  }

  private showCustomizeModal(): void {
    // Implementation for detailed consent customization
    // This would show a modal with granular consent options
    console.log('Customize consent modal would be shown here');
  }

  private reloadAnalytics(): void {
    // Reload analytics after consent is given
    if (typeof window !== 'undefined' && (window as any).initializeAnalytics) {
      (window as any).initializeAnalytics();
    }
  }
}

// Global privacy manager instance
let globalPrivacyManager: PrivacyManager | null = null;
let globalConsentBanner: ConsentBanner | null = null;

export function getPrivacyManager(): PrivacyManager {
  if (!globalPrivacyManager) {
    globalPrivacyManager = new PrivacyManager();
  }
  return globalPrivacyManager;
}

export function getConsentBanner(): ConsentBanner {
  if (!globalConsentBanner) {
    globalConsentBanner = new ConsentBanner(getPrivacyManager());
  }
  return globalConsentBanner;
}

// Initialize privacy-compliant analytics
export function initializePrivacyCompliantAnalytics(siteConfig: any): void {
  if (typeof window === 'undefined') return;

  try {
    const privacyManager = getPrivacyManager();
    const consentBanner = getConsentBanner();

    // Initialize consent mode first
    privacyManager.initializeConsentMode();

    // Show consent banner if needed
    if (consentBanner.shouldShow()) {
      // Delay showing banner slightly to avoid blocking page load
      setTimeout(() => {
        consentBanner.show();
      }, 1000);
    }

    // Initialize analytics if consent is already given
    if (privacyManager.shouldLoadAnalytics()) {
      const analyticsConfig = initializeAnalyticsConfig(siteConfig);
      const analyticsManager = initializeGlobalAnalytics({
        ga4: analyticsConfig.ga4,
        clarity: analyticsConfig.clarity,
        privacy: {
          enableOptOut: true,
          cookieConsentRequired: analyticsConfig.consentRequired,
          dataRetentionDays: 365,
          anonymizeIp: analyticsConfig.ga4.anonymizeIp,
          respectDoNotTrack: true,
          consentStorageKey: analyticsConfig.optOutCookieName
        },
        enabled: true,
        debug: false
      });

      analyticsManager.initialize();
    }

    // Make privacy functions globally available
    (window as any).privacyManager = privacyManager;
    (window as any).consentBanner = consentBanner;

  } catch (error) {
    console.error('Error initializing privacy-compliant analytics:', error);
  }
}