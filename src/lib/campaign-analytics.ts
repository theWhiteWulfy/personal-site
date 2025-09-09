/**
 * Campaign Analytics Utility
 * Handles GA4 event tracking and conversion tracking for campaigns
 */

export interface CampaignEvent {
  event_name: string;
  campaign_slug?: string;
  campaign_title?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  conversion_type?: string;
  conversion_value?: number;
  form_type?: string;
  tracking_id?: string;
  session_id?: string;
  page_location?: string;
  timestamp?: string;
  user_id?: string;
}
  
export interface CampaignConversion {
  campaign_slug: string;
  conversion_type: 'page_view' | 'form_submit' | 'cta_click' | 'phone_click' | 'email_click' | 'download' | 'signup';
  conversion_value?: number;
  form_type?: string;
  utm_params?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
  session_data?: {
    session_id: string;
    page_views: number;
    time_on_site: number;
  };
  user_data?: {
    user_id?: string;
    email?: string;
    name?: string;
  };
}

export interface CampaignAnalyticsConfig {
  ga4_measurement_id?: string;
  enable_debug?: boolean;
  conversion_goals?: {
    [key: string]: {
      value: number;
      currency: string;
    };
  };
}

/**
 * Campaign Analytics Manager
 * Handles all campaign-related analytics tracking
 */
export class CampaignAnalytics {
  private config: CampaignAnalyticsConfig;
  private isGtagAvailable: boolean = false;

  constructor(config: CampaignAnalyticsConfig = {}) {
    this.config = {
      enable_debug: false,
      conversion_goals: {
        'form_submit': { value: 50, currency: 'INR' },
        'signup': { value: 100, currency: 'INR' },
        'phone_click': { value: 25, currency: 'INR' },
        'email_click': { value: 15, currency: 'INR' },
        'download': { value: 30, currency: 'INR' }
      },
      ...config
    };

    this.checkGtagAvailability();
  }

  /**
   * Check if gtag is available
   */
  private checkGtagAvailability(): void {
    this.isGtagAvailable = typeof window !== 'undefined' && typeof (window as any).gtag === 'function';
    
    if (this.config.enable_debug && !this.isGtagAvailable) {
      console.warn('Campaign Analytics: gtag not available');
    }
  }

  /**
   * Track campaign page view
   */
  trackCampaignPageView(campaignSlug: string, campaignTitle?: string, utmParams?: any): void {
    const event: CampaignEvent = {
      event_name: 'campaign_page_view',
      campaign_slug: campaignSlug,
      campaign_title: campaignTitle,
      utm_source: utmParams?.utm_source,
      utm_medium: utmParams?.utm_medium,
      utm_campaign: utmParams?.utm_campaign,
      utm_term: utmParams?.utm_term,
      utm_content: utmParams?.utm_content,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString()
    };

    this.sendEvent(event);
    this.logDebug('Campaign page view tracked', event);
  }

  /**
   * Track campaign form submission
   */
  trackCampaignFormSubmit(conversion: CampaignConversion): void {
    const conversionValue = this.getConversionValue(conversion.conversion_type);
    
    const event: CampaignEvent = {
      event_name: 'campaign_form_submit',
      campaign_slug: conversion.campaign_slug,
      conversion_type: conversion.conversion_type,
      conversion_value: conversion.conversion_value || conversionValue,
      form_type: conversion.form_type,
      utm_source: conversion.utm_params?.utm_source,
      utm_medium: conversion.utm_params?.utm_medium,
      utm_campaign: conversion.utm_params?.utm_campaign,
      utm_term: conversion.utm_params?.utm_term,
      utm_content: conversion.utm_params?.utm_content,
      session_id: conversion.session_data?.session_id,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString()
    };

    this.sendEvent(event);
    this.sendConversionEvent(event);
    this.logDebug('Campaign form submission tracked', event);
  }

  /**
   * Track campaign CTA click
   */
  trackCampaignCTAClick(campaignSlug: string, ctaText: string, ctaPosition?: string, utmParams?: any): void {
    const event: CampaignEvent = {
      event_name: 'campaign_cta_click',
      campaign_slug: campaignSlug,
      conversion_type: 'cta_click',
      utm_source: utmParams?.utm_source,
      utm_medium: utmParams?.utm_medium,
      utm_campaign: utmParams?.utm_campaign,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString()
    };

    // Add custom parameters for CTA tracking
    const customEvent = {
      ...event,
      cta_text: ctaText,
      cta_position: ctaPosition
    };

    this.sendEvent(customEvent);
    this.logDebug('Campaign CTA click tracked', customEvent);
  }

  /**
   * Track campaign phone click
   */
  trackCampaignPhoneClick(campaignSlug: string, phoneNumber: string, utmParams?: any): void {
    const conversionValue = this.getConversionValue('phone_click');
    
    const event: CampaignEvent = {
      event_name: 'campaign_phone_click',
      campaign_slug: campaignSlug,
      conversion_type: 'phone_click',
      conversion_value: conversionValue,
      utm_source: utmParams?.utm_source,
      utm_medium: utmParams?.utm_medium,
      utm_campaign: utmParams?.utm_campaign,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString()
    };

    // Add custom parameters for phone tracking
    const customEvent = {
      ...event,
      phone_number: phoneNumber
    };

    this.sendEvent(customEvent);
    this.sendConversionEvent(event);
    this.logDebug('Campaign phone click tracked', customEvent);
  }

  /**
   * Track campaign email click
   */
  trackCampaignEmailClick(campaignSlug: string, emailAddress: string, utmParams?: any): void {
    const conversionValue = this.getConversionValue('email_click');
    
    const event: CampaignEvent = {
      event_name: 'campaign_email_click',
      campaign_slug: campaignSlug,
      conversion_type: 'email_click',
      conversion_value: conversionValue,
      utm_source: utmParams?.utm_source,
      utm_medium: utmParams?.utm_medium,
      utm_campaign: utmParams?.utm_campaign,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString()
    };

    // Add custom parameters for email tracking
    const customEvent = {
      ...event,
      email_address: emailAddress
    };

    this.sendEvent(customEvent);
    this.sendConversionEvent(event);
    this.logDebug('Campaign email click tracked', customEvent);
  }

  /**
   * Track campaign form interaction (field focus, etc.)
   */
  trackCampaignFormInteraction(campaignSlug: string, fieldName: string, interactionType: string, utmParams?: any): void {
    const event: CampaignEvent = {
      event_name: 'campaign_form_interaction',
      campaign_slug: campaignSlug,
      utm_source: utmParams?.utm_source,
      utm_medium: utmParams?.utm_medium,
      utm_campaign: utmParams?.utm_campaign,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString()
    };

    // Add custom parameters for form interaction tracking
    const customEvent = {
      ...event,
      field_name: fieldName,
      interaction_type: interactionType
    };

    this.sendEvent(customEvent);
    this.logDebug('Campaign form interaction tracked', customEvent);
  }

  /**
   * Track campaign conversion goal achievement
   */
  trackCampaignConversion(conversion: CampaignConversion): void {
    const conversionValue = conversion.conversion_value || this.getConversionValue(conversion.conversion_type);
    
    const event: CampaignEvent = {
      event_name: 'campaign_conversion',
      campaign_slug: conversion.campaign_slug,
      conversion_type: conversion.conversion_type,
      conversion_value: conversionValue,
      form_type: conversion.form_type,
      utm_source: conversion.utm_params?.utm_source,
      utm_medium: conversion.utm_params?.utm_medium,
      utm_campaign: conversion.utm_params?.utm_campaign,
      utm_term: conversion.utm_params?.utm_term,
      utm_content: conversion.utm_params?.utm_content,
      session_id: conversion.session_data?.session_id,
      user_id: conversion.user_data?.user_id,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString()
    };

    this.sendEvent(event);
    this.sendConversionEvent(event);
    this.logDebug('Campaign conversion tracked', event);
  }

  /**
   * Send event to Google Analytics
   */
  private sendEvent(event: CampaignEvent): void {
    if (!this.isGtagAvailable) {
      this.logDebug('gtag not available, event not sent', event);
      return;
    }

    try {
      // Clean up event parameters (remove undefined values)
      const cleanEvent: any = {};
      Object.entries(event).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanEvent[key] = value;
        }
      });

      // Send to GA4
      (window as any).gtag('event', event.event_name, cleanEvent);
      
      this.logDebug('Event sent to GA4', cleanEvent);
    } catch (error) {
      console.error('Error sending campaign analytics event:', error);
    }
  }

  /**
   * Send conversion event with enhanced parameters
   */
  private sendConversionEvent(event: CampaignEvent): void {
    if (!this.isGtagAvailable) return;

    try {
      const conversionEvent = {
        event_name: 'conversion',
        campaign_slug: event.campaign_slug,
        conversion_type: event.conversion_type,
        value: event.conversion_value || 0,
        currency: this.config.conversion_goals?.[event.conversion_type || '']?.currency || 'INR',
        utm_source: event.utm_source,
        utm_medium: event.utm_medium,
        utm_campaign: event.utm_campaign,
        utm_term: event.utm_term,
        utm_content: event.utm_content
      };

      // Clean up conversion event parameters
      const cleanConversionEvent: any = {};
      Object.entries(conversionEvent).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          cleanConversionEvent[key] = value;
        }
      });

      (window as any).gtag('event', 'conversion', cleanConversionEvent);
      
      this.logDebug('Conversion event sent to GA4', cleanConversionEvent);
    } catch (error) {
      console.error('Error sending conversion event:', error);
    }
  }

  /**
   * Get conversion value for a specific conversion type
   */
  private getConversionValue(conversionType: string): number {
    return this.config.conversion_goals?.[conversionType]?.value || 0;
  }

  /**
   * Debug logging
   */
  private logDebug(message: string, data?: any): void {
    if (this.config.enable_debug) {
      console.log(`[Campaign Analytics] ${message}`, data);
    }
  }

  /**
   * Get UTM parameters from stored data
   */
  getStoredUTMParams(): any {
    if (typeof window === 'undefined') return {};

    try {
      const storedParams = sessionStorage.getItem('campaign_utm_params');
      return storedParams ? JSON.parse(storedParams) : {};
    } catch (error) {
      console.error('Error retrieving UTM parameters:', error);
      return {};
    }
  }

  /**
   * Initialize campaign analytics for a specific campaign
   */
  initializeCampaign(campaignSlug: string, campaignTitle?: string): void {
    // Track initial page view
    const utmParams = this.getStoredUTMParams();
    this.trackCampaignPageView(campaignSlug, campaignTitle, utmParams);

    // Set up automatic event listeners
    this.setupEventListeners(campaignSlug);
  }

  /**
   * Set up automatic event listeners for campaign tracking
   */
  private setupEventListeners(campaignSlug: string): void {
    if (typeof window === 'undefined') return;

    const utmParams = this.getStoredUTMParams();

    // Track CTA clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('.cta-button, .campaign-cta a, [data-track="cta"]')) {
        const ctaText = target.textContent?.trim() || '';
        const ctaPosition = this.getElementPosition(target);
        this.trackCampaignCTAClick(campaignSlug, ctaText, ctaPosition, utmParams);
      }
    });

    // Track phone clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('a[href^="tel:"]')) {
        const phoneNumber = (target as HTMLAnchorElement).href.replace('tel:', '');
        this.trackCampaignPhoneClick(campaignSlug, phoneNumber, utmParams);
      }
    });

    // Track email clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('a[href^="mailto:"]')) {
        const emailAddress = (target as HTMLAnchorElement).href.replace('mailto:', '');
        this.trackCampaignEmailClick(campaignSlug, emailAddress, utmParams);
      }
    });

    // Track form interactions
    document.addEventListener('focus', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('.campaign-form input, .campaign-form textarea')) {
        const fieldName = (target as HTMLInputElement).name || 'unknown';
        this.trackCampaignFormInteraction(campaignSlug, fieldName, 'focus', utmParams);
      }
    }, true);
  }

  /**
   * Get element position for tracking
   */
  private getElementPosition(element: HTMLElement): string {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    return `x:${Math.round(rect.left)},y:${Math.round(rect.top + scrollTop)}`;
  }
}

// Create default instance
export const campaignAnalytics = new CampaignAnalytics({
  enable_debug: process.env.NODE_ENV === 'development'
});

// Export utility functions for direct use
export const trackCampaignPageView = (campaignSlug: string, campaignTitle?: string, utmParams?: any) => {
  campaignAnalytics.trackCampaignPageView(campaignSlug, campaignTitle, utmParams);
};

export const trackCampaignFormSubmit = (conversion: CampaignConversion) => {
  campaignAnalytics.trackCampaignFormSubmit(conversion);
};

export const trackCampaignConversion = (conversion: CampaignConversion) => {
  campaignAnalytics.trackCampaignConversion(conversion);
};

export const initializeCampaignAnalytics = (campaignSlug: string, campaignTitle?: string) => {
  campaignAnalytics.initializeCampaign(campaignSlug, campaignTitle);
};