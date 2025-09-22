/**
 * Resource download analytics tracking utilities
 */

import type { ResourceDownloadEvent, FormSubmissionEvent, ConversionEvent } from '@/lib/analytics';

// Resource download tracking configuration
export interface ResourceTrackingConfig {
  resourceName: string;
  resourceCategory: string;
  resourceValue?: number;
  userId?: string;
  sessionId?: string;
}


/**
 * Track resource form submission event
 */
export function trackResourceFormSubmission(_config: ResourceTrackingConfig): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const formEvent: FormSubmissionEvent = {
    event_name: 'form_submit',
    event_parameters: {
      form_type: 'resource_download',
      form_location: 'resource_page',
      page_url: window.location.href,
      page_title: document.title,
      success: true,
    }
  };

  try {
    window.gtag('event', formEvent.event_name, formEvent.event_parameters);
    console.log('Resource form submission tracked:', formEvent);
  } catch (error) {
    console.error('Failed to track resource form submission:', error);
  }
}

/**
 * Track successful resource download event
 */
export function trackResourceDownload(config: ResourceTrackingConfig): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const downloadEvent: ResourceDownloadEvent = {
    event_name: 'resource_download',
    event_parameters: {
      resource_name: config.resourceName,
      resource_type: 'guide',
      download_method: 'form_gate',
      page_url: window.location.href,
      page_title: document.title,
    }
  };

  try {
    window.gtag('event', downloadEvent.event_name, downloadEvent.event_parameters);
    console.log('Resource download tracked:', downloadEvent);
  } catch (error) {
    console.error('Failed to track resource download:', error);
  }
}

/**
 * Track lead generation conversion event
 */
export function trackLeadConversion(config: ResourceTrackingConfig): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const conversionEvent: ConversionEvent = {
    event_name: 'conversion',
    event_parameters: {
      conversion_type: 'resource_download',
      conversion_value: config.resourceValue || 10,
      currency: 'USD',
      page_url: window.location.href,
      page_title: document.title,
    }
  };

  try {
    window.gtag('event', conversionEvent.event_name, conversionEvent.event_parameters);
    
    // Also track as a GA4 conversion event
    window.gtag('event', 'generate_lead', {
      value: config.resourceValue || 10,
      currency: 'USD',
      content_group1: 'resource_download',
      resource_name: config.resourceName,
      resource_category: config.resourceCategory
    });
    
    console.log('Lead conversion tracked:', conversionEvent);
  } catch (error) {
    console.error('Failed to track lead conversion:', error);
  }
}

/**
 * Track resource page view with enhanced parameters
 */
export function trackResourcePageView(resourceName: string, resourceCategory: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  try {
    window.gtag('event', 'page_view', {
      page_title: `Resource: ${resourceName}`,
      page_location: window.location.href,
      content_group1: 'resource_page',
      content_group2: resourceCategory,
      resource_name: resourceName,
      resource_category: resourceCategory
    });
    
    console.log('Resource page view tracked:', { resourceName, resourceCategory });
  } catch (error) {
    console.error('Failed to track resource page view:', error);
  }
}


/**
 * Generate session ID for tracking
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get or create session ID
 */
export function getSessionId(): string {
  const storageKey = 'resource_session_id';
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const { sessionId, timestamp } = JSON.parse(stored);
      
      // Check if session is still valid
      if (Date.now() - timestamp < sessionTimeout) {
        return sessionId;
      }
    }
  } catch (error) {
    console.error('Failed to retrieve session ID:', error);
  }
  
  // Generate new session ID
  const newSessionId = generateSessionId();
  
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      sessionId: newSessionId,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Failed to store session ID:', error);
  }
  
  return newSessionId;
}

/**
 * Track complete resource download funnel
 */
export function trackResourceFunnel(
  step: 'page_view' | 'form_start' | 'form_submit' | 'download_complete',
  config: ResourceTrackingConfig,
  formData?: Record<string, any>
): void {
  // Track in GA4
  switch (step) {
    case 'page_view':
      trackResourcePageView(config.resourceName, config.resourceCategory);
      break;
    case 'form_start':
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'begin_checkout', {
          content_group1: 'resource_download',
          resource_name: config.resourceName,
          resource_category: config.resourceCategory
        });
      }
      break;
    case 'form_submit':
      trackResourceFormSubmission(config);
      break;
    case 'download_complete':
      trackResourceDownload(config);
      trackLeadConversion(config);

      // Send detailed lead data to Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'resource_lead', {
          ...formData,
          resource_name: config.resourceName,
          resource_category: config.resourceCategory,
          resource_value: config.resourceValue,
          event_category: 'resource_engagement',
          event_label: `Lead: ${config.resourceName}`
        });
      }
      break;
  }
}