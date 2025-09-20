// Analytics Configuration and Types
// Provides TypeScript interfaces for GA4 and Microsoft Clarity integration

/**
 * Interface for Google Analytics 4 configuration.
 * @property {string} measurementId - The GA4 measurement ID.
 * @property {boolean} enhancedMeasurement - Whether to enable enhanced measurement.
 * @property {string[]} conversionEvents - A list of conversion events.
 * @property {Record<string, string>} [customDimensions] - Custom dimensions for GA4.
 * @property {Record<string, string>} [customMetrics] - Custom metrics for GA4.
 */
export interface GA4Config {
  measurementId: string;
  enhancedMeasurement: boolean;
  conversionEvents: string[];
  customDimensions?: Record<string, string>;
  customMetrics?: Record<string, string>;
}

/**
 * Interface for Microsoft Clarity configuration.
 * @property {string} projectId - The Clarity project ID.
 * @property {boolean} enableHeatmaps - Whether to enable heatmaps.
 * @property {boolean} enableRecordings - Whether to enable recordings.
 * @property {'strict' | 'balanced' | 'relaxed'} privacyMode - The privacy mode for Clarity.
 * @property {boolean} cookieConsent - Whether to require cookie consent for Clarity.
 */
export interface ClarityConfig {
  projectId: string;
  enableHeatmaps: boolean;
  enableRecordings: boolean;
  privacyMode: 'strict' | 'balanced' | 'relaxed';
  cookieConsent: boolean;
}

/**
 * Interface for privacy configuration.
 * @property {boolean} enableOptOut - Whether to enable the opt-out feature.
 * @property {boolean} cookieConsentRequired - Whether cookie consent is required.
 * @property {number} dataRetentionDays - The number of days to retain data.
 * @property {boolean} anonymizeIp - Whether to anonymize IP addresses.
 * @property {boolean} respectDoNotTrack - Whether to respect the Do Not Track header.
 * @property {string} consentStorageKey - The key for storing consent in local storage.
 */
export interface PrivacyConfig {
  enableOptOut: boolean;
  cookieConsentRequired: boolean;
  dataRetentionDays: number;
  anonymizeIp: boolean;
  respectDoNotTrack: boolean;
  consentStorageKey: string;
}

/**
 * Base interface for an analytics event.
 * @property {string} event_name - The name of the event.
 * @property {Record<string, any>} event_parameters - The parameters for the event.
 * @property {Date} [timestamp] - The timestamp of the event.
 * @property {string} [user_id] - The user ID.
 * @property {string} [session_id] - The session ID.
 */
export interface AnalyticsEvent {
  event_name: string;
  event_parameters: Record<string, any>;
  timestamp?: Date;
  user_id?: string;
  session_id?: string;
}

/**
 * Interface for a phone click event.
 * @property {'phone_click'} event_name - The name of the event.
 * @property {object} event_parameters - The parameters for the event.
 * @property {string} event_parameters.phone_number - The phone number that was clicked.
 * @property {string} event_parameters.click_location - The location of the click (e.g., header, footer).
 * @property {string} event_parameters.page_url - The URL of the page where the click occurred.
 * @property {string} event_parameters.page_title - The title of the page where the click occurred.
 */
export interface PhoneClickEvent extends AnalyticsEvent {
  event_name: 'phone_click';
  event_parameters: {
    phone_number: string;
    click_location: string; // header, footer, contact_page, etc.
    page_url: string;
    page_title: string;
  };
}

/**
 * Interface for a form submission event.
 * @property {'form_submit'} event_name - The name of the event.
 * @property {object} event_parameters - The parameters for the event.
 * @property {'contact' | 'newsletter' | 'resource_download'} event_parameters.form_type - The type of the form.
 * @property {string} event_parameters.form_location - The location of the form on the page.
 * @property {string} event_parameters.page_url - The URL of the page where the form was submitted.
 * @property {string} event_parameters.page_title - The title of the page where the form was submitted.
 * @property {boolean} event_parameters.success - Whether the form submission was successful.
 * @property {string} [event_parameters.error_message] - The error message if the submission failed.
 */
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

/**
 * Interface for a resource download event.
 * @property {'resource_download'} event_name - The name of the event.
 * @property {object} event_parameters - The parameters for the event.
 * @property {string} event_parameters.resource_name - The name of the resource.
 * @property {'pdf' | 'guide' | 'template' | 'checklist'} event_parameters.resource_type - The type of the resource.
 * @property {'form_gate' | 'direct_link'} event_parameters.download_method - The method used to download the resource.
 * @property {string} event_parameters.page_url - The URL of the page where the download occurred.
 * @property {string} event_parameters.page_title - The title of the page where the download occurred.
 * @property {string} [event_parameters.user_email] - The user's email address if provided through a form.
 */
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

/**
 * Interface for a conversion event.
 * @property {'conversion'} event_name - The name of the event.
 * @property {object} event_parameters - The parameters for the event.
 * @property {'phone_click' | 'form_submit' | 'resource_download' | 'email_click'} event_parameters.conversion_type - The type of the conversion.
 * @property {number} [event_parameters.conversion_value] - The value of the conversion.
 * @property {string} [event_parameters.currency] - The currency of the conversion value.
 * @property {string} event_parameters.page_url - The URL of the page where the conversion occurred.
 * @property {string} event_parameters.page_title - The title of the page where the conversion occurred.
 */
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

/**
 * Interface for a page view event.
 * @property {'page_view'} event_name - The name of the event.
 * @property {object} event_parameters - The parameters for the event.
 * @property {string} event_parameters.page_title - The title of the page.
 * @property {string} event_parameters.page_location - The URL of the page.
 * @property {string} [event_parameters.content_group1] - The primary content group of the page.
 * @property {string} [event_parameters.content_group2] - The secondary content group of the page.
 * @property {string} [event_parameters.custom_parameter] - A custom parameter for the event.
 */
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

/**
 * Interface for an email click event.
 * @property {'email_click'} event_name - The name of the event.
 * @property {object} event_parameters - The parameters for the event.
 * @property {string} event_parameters.email_address - The email address that was clicked.
 * @property {string} event_parameters.click_location - The location of the click (e.g., header, footer).
 * @property {string} event_parameters.page_url - The URL of the page where the click occurred.
 * @property {string} event_parameters.page_title - The title of the page where the click occurred.
 */
export interface EmailClickEvent extends AnalyticsEvent {
  event_name: 'email_click';
  event_parameters: {
    email_address: string;
    click_location: string;
    page_url: string;
    page_title: string;
  };
}

/**
 * A union type for all possible tracking events.
 */
export type TrackingEvent =
  | PhoneClickEvent
  | FormSubmissionEvent
  | ResourceDownloadEvent
  | ConversionEvent
  | PageViewEvent
  | EmailClickEvent;

/**
 * Interface for an analytics provider.
 * This interface defines the methods that an analytics provider must implement.
 */
export interface AnalyticsProvider {
  /**
   * Initializes the analytics provider.
   * @returns {Promise<void>} A promise that resolves when the provider is initialized.
   */
  initialize(): Promise<void>;
  /**
   * Tracks an event.
   * @param {TrackingEvent} event - The event to track.
   * @returns {Promise<void>} A promise that resolves when the event is tracked.
   */
  trackEvent(event: TrackingEvent): Promise<void>;
  /**
   * Tracks a page view.
   * @param {PageViewEvent} event - The page view event to track.
   * @returns {Promise<void>} A promise that resolves when the page view is tracked.
   */
  trackPageView(event: PageViewEvent): Promise<void>;
  /**
   * Sets the user ID for the analytics provider.
   * @param {string} userId - The user ID.
   */
  setUserId(userId: string): void;
  /**
   * Opts the user out of tracking.
   */
  optOut(): void;
  /**
   * Opts the user in to tracking.
   */
  optIn(): void;
  /**
   * Checks if the user has opted out of tracking.
   * @returns {boolean} True if the user has opted out, false otherwise.
   */
  isOptedOut(): boolean;
}

/**
 * Interface for the combined analytics configuration.
 * @property {GA4Config} ga4 - The Google Analytics 4 configuration.
 * @property {ClarityConfig} clarity - The Microsoft Clarity configuration.
 * @property {PrivacyConfig} privacy - The privacy configuration.
 * @property {boolean} enabled - Whether analytics is enabled.
 * @property {boolean} debug - Whether to enable debug mode for analytics.
 */
export interface AnalyticsConfiguration {
  ga4: GA4Config;
  clarity: ClarityConfig;
  privacy: PrivacyConfig;
  enabled: boolean;
  debug: boolean;
}

/**
 * Interface for the consent status.
 * @property {boolean} analytics - Whether analytics tracking is enabled.
 * @property {boolean} marketing - Whether marketing tracking is enabled.
 * @property {boolean} functional - Whether functional tracking is enabled.
 * @property {Date} timestamp - The timestamp of when the consent was given.
 * @property {string} version - The version of the consent.
 */
export interface ConsentStatus {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: Date;
  version: string;
}

/**
 * Interface for an analytics error.
 * @property {'ga4' | 'clarity' | 'general'} provider - The analytics provider that produced the error.
 * @property {Error} error - The error object.
 * @property {TrackingEvent} [event] - The event that caused the error.
 * @property {Date} timestamp - The timestamp of the error.
 */
export interface AnalyticsError {
  provider: 'ga4' | 'clarity' | 'general';
  error: Error;
  event?: TrackingEvent;
  timestamp: Date;
}

/**
 * Interface for an event queue for offline support.
 * @property {TrackingEvent[]} events - The events in the queue.
 * @property {number} maxSize - The maximum size of the queue.
 * @property {number} flushInterval - The interval in milliseconds at which to flush the queue.
 */
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

/**
 * A class for interacting with Google Analytics 4.
 * @implements {AnalyticsProvider}
 */
export class GA4Analytics implements AnalyticsProvider {
  private config: GA4Config;
  private privacyConfig: PrivacyConfig;
  private initialized = false;

  /**
   * Creates an instance of GA4Analytics.
   * @param {GA4Config} config - The GA4 configuration.
   * @param {PrivacyConfig} privacyConfig - The privacy configuration.
   */
  constructor(config: GA4Config, privacyConfig: PrivacyConfig) {
    this.config = config;
    this.privacyConfig = privacyConfig;
  }

  /**
   * Initializes the GA4 analytics provider.
   * @returns {Promise<void>} A promise that resolves when the provider is initialized.
   */
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

  /**
   * Tracks an event with GA4.
   * @param {TrackingEvent} event - The event to track.
   * @returns {Promise<void>} A promise that resolves when the event is tracked.
   */
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

  /**
   * Tracks a page view with GA4.
   * @param {PageViewEvent} event - The page view event to track.
   * @returns {Promise<void>} A promise that resolves when the page view is tracked.
   */
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

  /**
   * Sets the user ID for GA4.
   * @param {string} userId - The user ID.
   */
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

  /**
   * Opts the user out of GA4 tracking.
   */
  optOut(): void {
    localStorage.setItem(this.privacyConfig.consentStorageKey, 'false');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });
    }
  }

  /**
   * Opts the user in to GA4 tracking.
   */
  optIn(): void {
    localStorage.setItem(this.privacyConfig.consentStorageKey, 'true');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied'
      });
    }
  }

  /**
   * Checks if the user has opted out of GA4 tracking.
   * @returns {boolean} True if the user has opted out, false otherwise.
   */
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

  /**
   * Tracks a conversion event with GA4.
   * @param {ConversionEvent} conversionEvent - The conversion event to track.
   */
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

  /**
   * Tracks a phone click event with GA4.
   * @param {string} phoneNumber - The phone number that was clicked.
   * @param {string} location - The location of the click (e.g., header, footer).
   */
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

  /**
   * Tracks a form submission event with GA4.
   * @param {string} formType - The type of the form.
   * @param {string} formLocation - The location of the form on the page.
   * @param {boolean} success - Whether the form submission was successful.
   * @param {string} [errorMessage] - The error message if the submission failed.
   */
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

  /**
   * Tracks a resource download event with GA4.
   * @param {string} resourceName - The name of the resource.
   * @param {string} resourceType - The type of the resource.
   * @param {string} downloadMethod - The method used to download the resource.
   * @param {string} [userEmail] - The user's email address if provided through a form.
   */
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

  /**
   * Tracks an email click event with GA4.
   * @param {string} emailAddress - The email address that was clicked.
   * @param {string} location - The location of the click (e.g., header, footer).
   */
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
/**
 * A class for interacting with Microsoft Clarity.
 * @implements {AnalyticsProvider}
 */
export class ClarityAnalytics implements AnalyticsProvider {
  private config: ClarityConfig;
  private privacyConfig: PrivacyConfig;
  private initialized = false;

  /**
   * Creates an instance of ClarityAnalytics.
   * @param {ClarityConfig} config - The Clarity configuration.
   * @param {PrivacyConfig} privacyConfig - The privacy configuration.
   */
  constructor(config: ClarityConfig, privacyConfig: PrivacyConfig) {
    this.config = config;
    this.privacyConfig = privacyConfig;
  }

  /**
   * Initializes the Clarity analytics provider.
   * @returns {Promise<void>} A promise that resolves when the provider is initialized.
   */
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

  /**
   * Tracks an event with Clarity.
   * @param {TrackingEvent} event - The event to track.
   * @returns {Promise<void>} A promise that resolves when the event is tracked.
   */
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

  /**
   * Tracks a page view with Clarity.
   * @param {PageViewEvent} event - The page view event to track.
   * @returns {Promise<void>} A promise that resolves when the page view is tracked.
   */
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

  /**
   * Sets the user ID for Clarity.
   * @param {string} userId - The user ID.
   */
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

  /**
   * Opts the user out of Clarity tracking.
   */
  optOut(): void {
    localStorage.setItem(this.privacyConfig.consentStorageKey, 'false');
  }

  /**
   * Opts the user in to Clarity tracking.
   */
  optIn(): void {
    localStorage.setItem(this.privacyConfig.consentStorageKey, 'true');
  }

  /**
   * Checks if the user has opted out of Clarity tracking.
   * @returns {boolean} True if the user has opted out, false otherwise.
   */
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

/**
 * A class for managing multiple analytics providers.
 */
export class AnalyticsManager {
  private ga4: GA4Analytics | null = null;
  private clarity: ClarityAnalytics | null = null;
  private config: AnalyticsConfiguration;

  /**
   * Creates an instance of AnalyticsManager.
   * @param {AnalyticsConfiguration} config - The combined analytics configuration.
   */
  constructor(config: AnalyticsConfiguration) {
    this.config = config;

    if (config.ga4) {
      this.ga4 = new GA4Analytics(config.ga4, config.privacy);
    }

    if (config.clarity) {
      this.clarity = new ClarityAnalytics(config.clarity, config.privacy);
    }
  }

  /**
   * Initializes all analytics providers.
   * @returns {Promise<void>} A promise that resolves when all providers are initialized.
   */
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

  /**
   * Tracks an event with all analytics providers.
   * @param {TrackingEvent} event - The event to track.
   * @returns {Promise<void>} A promise that resolves when the event is tracked.
   */
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

  /**
   * Tracks a phone click event with all analytics providers.
   * @param {string} phoneNumber - The phone number that was clicked.
   * @param {string} location - The location of the click (e.g., header, footer).
   */
  trackPhoneClick(phoneNumber: string, location: string): void {
    if (this.ga4) {
      this.ga4.trackPhoneClick(phoneNumber, location);
    }
  }

  /**
   * Tracks a form submission event with all analytics providers.
   * @param {string} formType - The type of the form.
   * @param {string} formLocation - The location of the form on the page.
   * @param {boolean} success - Whether the form submission was successful.
   * @param {string} [errorMessage] - The error message if the submission failed.
   */
  trackFormSubmission(formType: string, formLocation: string, success: boolean, errorMessage?: string): void {
    if (this.ga4) {
      this.ga4.trackFormSubmission(formType, formLocation, success, errorMessage);
    }
  }

  /**
   * Tracks a resource download event with all analytics providers.
   * @param {string} resourceName - The name of the resource.
   * @param {string} resourceType - The type of the resource.
   * @param {string} downloadMethod - The method used to download the resource.
   * @param {string} [userEmail] - The user's email address if provided through a form.
   */
  trackResourceDownload(resourceName: string, resourceType: string, downloadMethod: string, userEmail?: string): void {
    if (this.ga4) {
      this.ga4.trackResourceDownload(resourceName, resourceType, downloadMethod, userEmail);
    }
  }

  /**
   * Tracks an email click event with all analytics providers.
   * @param {string} emailAddress - The email address that was clicked.
   * @param {string} location - The location of the click (e.g., header, footer).
   */
  trackEmailClick(emailAddress: string, location: string): void {
    if (this.ga4) {
      this.ga4.trackEmailClick(emailAddress, location);
    }
  }

  /**
   * Opts the user out of all analytics tracking.
   */
  optOut(): void {
    if (this.ga4) {
      this.ga4.optOut();
    }
    if (this.clarity) {
      this.clarity.optOut();
    }
  }

  /**
   * Opts the user in to all analytics tracking.
   */
  optIn(): void {
    if (this.ga4) {
      this.ga4.optIn();
    }
    if (this.clarity) {
      this.clarity.optIn();
    }
  }
}

/**
 * Interface for the analytics configuration used by the `initializeAnalyticsConfig` function.
 * @property {object} ga4 - The Google Analytics 4 configuration.
 * @property {boolean} ga4.enabled - Whether GA4 is enabled.
 * @property {boolean} ga4.anonymizeIp - Whether to anonymize IP addresses.
 * @property {boolean} ga4.cookieConsent - Whether to require cookie consent.
 * @property {boolean} ga4.trackingOptOut - Whether to enable the opt-out feature.
 * @property {object} clarity - The Microsoft Clarity configuration.
 * @property {boolean} clarity.enabled - Whether Clarity is enabled.
 * @property {boolean} consentRequired - Whether consent is required for analytics.
 * @property {string} optOutCookieName - The name of the opt-out cookie.
 */
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

/**
 * Initializes the analytics configuration from the site configuration.
 * @param {any} siteConfig - The site configuration object.
 * @returns {AnalyticsConfig} The analytics configuration.
 */
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

/**
 * Gets the global analytics manager instance.
 * @returns {AnalyticsManager | null} The global analytics manager instance.
 */
export function getAnalyticsInstance(): AnalyticsManager | null {
  return globalAnalytics;
}

/**
 * Initializes the global analytics manager instance.
 * @param {AnalyticsConfiguration} config - The combined analytics configuration.
 * @returns {AnalyticsManager} The global analytics manager instance.
 */
export function initializeGlobalAnalytics(config: AnalyticsConfiguration): AnalyticsManager {
  globalAnalytics = new AnalyticsManager(config);
  return globalAnalytics;
}/**
 * An object that provides form tracking utilities for client-side use.
 * @property {function} trackSubmission - Tracks a form submission.
 * @property {function} trackFieldInteraction - Tracks a form field interaction.
 * @property {function} trackValidationError - Tracks a form validation error.
 * @property {function} trackAbandonment - Tracks form abandonment.
 */
export const FormTracker = {
  /**
   * Tracks a form submission.
   * @param {string} formType - The type of the form.
   * @param {string} formLocation - The location of the form on the page.
   * @param {boolean} success - Whether the form submission was successful.
   * @param {string} [errorMessage] - The error message if the submission failed.
   */
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

  /**
   * Tracks a form field interaction.
   * @param {string} formType - The type of the form.
   * @param {string} fieldName - The name of the field.
   * @param {string} action - The action that was performed (e.g., focus, blur, change).
   */
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

  /**
   * Tracks a form validation error.
   * @param {string} formType - The type of the form.
   * @param {string} fieldName - The name of the field.
   * @param {string} errorType - The type of the validation error.
   */
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

  /**
   * Tracks form abandonment.
   * @param {string} formType - The type of the form.
   * @param {number} fieldsCompleted - The number of fields that were completed.
   * @param {number} totalFields - The total number of fields in the form.
   */
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

/**
 * An object that provides newsletter form tracking utilities.
 * @property {function} trackSubscription - Tracks a newsletter subscription.
 * @property {function} trackEmailValidation - Tracks an email validation error.
 */
export const NewsletterTracker = {
  /**
   * Tracks a newsletter subscription.
   * @param {boolean} success - Whether the subscription was successful.
   * @param {string} [email] - The user's email address.
   * @param {string} [errorMessage] - The error message if the subscription failed.
   */
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

  /**
   * Tracks an email validation error.
   * @param {boolean} isValid - Whether the email address is valid.
   * @param {string} _email - The email address that was validated.
   */
  trackEmailValidation: (isValid: boolean, _email: string) => {
    if (!isValid) {
      FormTracker.trackValidationError('newsletter', 'email', 'invalid_format');
    }
  }
};

/**
 * An object that provides contact form tracking utilities.
 * @property {function} trackSubmission - Tracks a contact form submission.
 * @property {function} trackFieldCompletion - Tracks a contact form field completion.
 */
export const ContactTracker = {
  /**
   * Tracks a contact form submission.
   * @param {boolean} success - Whether the submission was successful.
   * @param {any} [formData] - The form data.
   * @param {string} [errorMessage] - The error message if the submission failed.
   */
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

  /**
   * Tracks a contact form field completion.
   * @param {string} fieldName - The name of the field that was completed.
   */
  trackFieldCompletion: (fieldName: string) => {
    FormTracker.trackFieldInteraction('contact', fieldName, 'completed');
  }
};

/**
 * An object that provides resource download form tracking utilities.
 * @property {function} trackDownloadRequest - Tracks a resource download request.
 * @property {function} trackResourceAccess - Tracks a resource access.
 */
export const ResourceTracker = {
  /**
   * Tracks a resource download request.
   * @param {string} resourceName - The name of the resource.
   * @param {boolean} success - Whether the download request was successful.
   * @param {any} [formData] - The form data.
   * @param {string} [errorMessage] - The error message if the request failed.
   */
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

  /**
   * Tracks a resource access.
   * @param {string} resourceName - The name of the resource.
   * @param {string} resourceType - The type of the resource.
   */
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
/**
 * A class for managing user privacy and consent.
 */
export class PrivacyManager {
  private consentStorageKey: string;
  private optOutStorageKey: string;
  private consentVersion: string = '1.0';

  /**
   * Creates an instance of PrivacyManager.
   * @param {string} [consentKey='meteoric_analytics_consent'] - The key for storing consent in local storage.
   * @param {string} [optOutKey='meteoric_analytics_optout'] - The key for storing the opt-out preference in local storage.
   */
  constructor(consentKey: string = 'meteoric_analytics_consent', optOutKey: string = 'meteoric_analytics_optout') {
    this.consentStorageKey = consentKey;
    this.optOutStorageKey = optOutKey;
  }

  /**
   * Checks if the user has given consent for analytics tracking.
   * @returns {boolean} True if consent is given, false otherwise.
   */
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

  /**
   * Checks if the user has opted out of analytics tracking.
   * @returns {boolean} True if the user has opted out, false otherwise.
   */
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

  /**
   * Sets the user's consent for analytics tracking.
   * @param {boolean} analytics - Whether to enable analytics tracking.
   * @param {boolean} [marketing=false] - Whether to enable marketing tracking.
   * @param {boolean} [functional=true] - Whether to enable functional tracking.
   */
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

  /**
   * Sets the user's preference for opting out of analytics tracking.
   * @param {boolean} optOut - True to opt out, false to opt in.
   */
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

  /**
   * Gets the current consent status.
   * @returns {ConsentStatus | null} The current consent status, or null if not set.
   */
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

  /**
   * Checks if analytics should be loaded.
   * @returns {boolean} True if analytics should be loaded, false otherwise.
   */
  shouldLoadAnalytics(): boolean {
    return !this.hasOptedOut() && this.hasConsent();
  }

  /**
   * Initializes the consent mode for GA4.
   */
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

  /**
   * Triggers a custom event to indicate that the consent has changed.
   * @private
   * @param {ConsentStatus} consentData - The new consent data.
   */
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

  /**
   * Triggers a custom event to indicate that the opt-out preference has changed.
   * @private
   * @param {boolean} optedOut - The new opt-out preference.
   */
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

  /**
   * Clears all stored privacy preferences.
   */
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

/**
 * A class for managing the cookie consent banner.
 */
export class ConsentBanner {
  private privacyManager: PrivacyManager;
  private bannerElement: HTMLElement | null = null;
  private isVisible: boolean = false;

  /**
   * Creates an instance of ConsentBanner.
   * @param {PrivacyManager} privacyManager - The privacy manager instance.
   */
  constructor(privacyManager: PrivacyManager) {
    this.privacyManager = privacyManager;
  }

  /**
   * Checks if the consent banner should be shown.
   * @returns {boolean} True if the banner should be shown, false otherwise.
   */
  shouldShow(): boolean {
    return !this.privacyManager.hasConsent() && !this.privacyManager.hasOptedOut();
  }

  /**
   * Creates and shows the consent banner.
   */
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

  /**
   * Hides the consent banner.
   */
  hide(): void {
    if (this.bannerElement) {
      this.bannerElement.remove();
      this.bannerElement = null;
      this.isVisible = false;
    }
  }

  /**
   * Creates the consent banner element.
   * @private
   */
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

  /**
   * Attaches event listeners to the consent banner buttons.
   * @private
   */
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

  /**
   * Shows the customize consent modal.
   * @private
   */
  private showCustomizeModal(): void {
    // Implementation for detailed consent customization
    // This would show a modal with granular consent options
    console.log('Customize consent modal would be shown here');
  }

  /**
   * Reloads the analytics scripts after consent is given.
   * @private
   */
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

/**
 * Gets the global privacy manager instance.
 * @returns {PrivacyManager} The global privacy manager instance.
 */
export function getPrivacyManager(): PrivacyManager {
  if (!globalPrivacyManager) {
    globalPrivacyManager = new PrivacyManager();
  }
  return globalPrivacyManager;
}

/**
 * Gets the global consent banner instance.
 * @returns {ConsentBanner} The global consent banner instance.
 */
export function getConsentBanner(): ConsentBanner {
  if (!globalConsentBanner) {
    globalConsentBanner = new ConsentBanner(getPrivacyManager());
  }
  return globalConsentBanner;
}

/**
 * Initializes privacy-compliant analytics.
 * @param {any} siteConfig - The site configuration object.
 */
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