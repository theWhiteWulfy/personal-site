// Analytics Testing Utilities for Chrome DevTools
// This file provides utilities for testing and debugging analytics implementation

export class AnalyticsDebugger {
  private debugMode: boolean = false;
  private eventLog: any[] = [];

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
    this.setupDebugConsole();
  }

  // Enable debug mode
  enableDebug(): void {
    this.debugMode = true;
    console.log('🔍 Analytics Debug Mode Enabled');
    this.logSystemInfo();
  }

  // Disable debug mode
  disableDebug(): void {
    this.debugMode = false;
    console.log('🔍 Analytics Debug Mode Disabled');
  }

  // Log system information for debugging
  private logSystemInfo(): void {
    if (!this.debugMode) return;

    console.group('📊 Analytics System Information');
    console.log('User Agent:', navigator.userAgent);
    console.log('Do Not Track:', navigator.doNotTrack);
    console.log('Cookies Enabled:', navigator.cookieEnabled);
    console.log('Page URL:', window.location.href);
    console.log('Referrer:', document.referrer);
    console.log('Screen Resolution:', `${screen.width}x${screen.height}`);
    console.log('Viewport Size:', `${window.innerWidth}x${window.innerHeight}`);
    console.groupEnd();
  }

  // Test GA4 integration
  testGA4Integration(): void {
    console.group('🔍 Testing GA4 Integration');

    try {
      // Check if gtag is loaded
      if (typeof (window as any).gtag === 'function') {
        console.log('✅ GA4 gtag function is available');

        // Check dataLayer
        if ((window as any).dataLayer && Array.isArray((window as any).dataLayer)) {
          console.log('✅ dataLayer is initialized:', (window as any).dataLayer.length, 'items');

          // Log recent dataLayer entries
          const recentEntries = (window as any).dataLayer.slice(-5);
          console.log('📋 Recent dataLayer entries:', recentEntries);
        } else {
          console.warn('⚠️ dataLayer not found or not an array');
        }

        // Test event firing
        this.testGA4EventFiring();

      } else {
        console.error('❌ GA4 gtag function not found');
      }
    } catch (error) {
      console.error('❌ GA4 integration test failed:', error);
    }

    console.groupEnd();
  }

  // Test Clarity integration
  testClarityIntegration(): void {
    console.group('🔍 Testing Microsoft Clarity Integration');

    try {
      if (typeof (window as any).clarity === 'function') {
        console.log('✅ Microsoft Clarity function is available');

        // Test Clarity event
        (window as any).clarity('event', 'debug_test', {
          test_type: 'integration_check',
          timestamp: new Date().toISOString()
        });

        console.log('📤 Test event sent to Clarity');
      } else {
        console.error('❌ Microsoft Clarity function not found');
      }
    } catch (error) {
      console.error('❌ Clarity integration test failed:', error);
    }

    console.groupEnd();
  }

  // Test GA4 event firing
  private testGA4EventFiring(): void {
    try {
      // Test basic event
      (window as any).gtag('event', 'debug_test', {
        event_category: 'debug',
        event_label: 'integration_test',
        value: 1,
        debug: true
      });

      console.log('📤 Test event sent to GA4');

      // Test conversion event
      (window as any).gtag('event', 'conversion', {
        send_to: 'GA_MEASUREMENT_ID', // This would be replaced with actual ID
        value: 1,
        currency: 'USD',
        transaction_id: 'debug_' + Date.now()
      });

      console.log('📤 Test conversion event sent to GA4');

    } catch (error) {
      console.error('❌ GA4 event firing test failed:', error);
    }
  }

  // Test phone click tracking
  testPhoneClickTracking(): void {
    console.group('🔍 Testing Phone Click Tracking');

    try {
      // Find phone links
      const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
      console.log(`📞 Found ${phoneLinks.length} phone links`);

      if (phoneLinks.length > 0) {
        phoneLinks.forEach((link, index) => {
          console.log(`📞 Phone link ${index + 1}:`, link.getAttribute('href'));
        });

        // Test tracking function
        if (typeof (window as any).trackConversionEvent === 'function') {
          (window as any).trackConversionEvent('phone_click', {
            conversion_type: 'phone_contact',
            phone_number: 'test_number',
            value: 10,
            debug: true
          });
          console.log('📤 Test phone click event sent');
        } else {
          console.warn('⚠️ trackConversionEvent function not available');
        }
      } else {
        console.warn('⚠️ No phone links found on page');
      }
    } catch (error) {
      console.error('❌ Phone click tracking test failed:', error);
    }

    console.groupEnd();
  }

  // Test email click tracking
  testEmailClickTracking(): void {
    console.group('🔍 Testing Email Click Tracking');

    try {
      // Find email links
      const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
      console.log(`📧 Found ${emailLinks.length} email links`);

      if (emailLinks.length > 0) {
        emailLinks.forEach((link, index) => {
          console.log(`📧 Email link ${index + 1}:`, link.getAttribute('href'));
        });

        // Test tracking function
        if (typeof (window as any).trackConversionEvent === 'function') {
          (window as any).trackConversionEvent('email_click', {
            conversion_type: 'email_contact',
            email_address: 'test@example.com',
            value: 8,
            debug: true
          });
          console.log('📤 Test email click event sent');
        } else {
          console.warn('⚠️ trackConversionEvent function not available');
        }
      } else {
        console.warn('⚠️ No email links found on page');
      }
    } catch (error) {
      console.error('❌ Email click tracking test failed:', error);
    }

    console.groupEnd();
  }

  // Test form tracking
  testFormTracking(): void {
    console.group('🔍 Testing Form Tracking');

    try {
      // Find forms
      const forms = document.querySelectorAll('form');
      console.log(`📝 Found ${forms.length} forms`);

      forms.forEach((form, index) => {
        const formId = form.id || `form_${index + 1}`;
        console.log(`📝 Form ${index + 1}:`, formId);

        // Log form fields
        const inputs = form.querySelectorAll('input, textarea, select');
        console.log(`  - ${inputs.length} form fields`);
      });

      // Test form submission tracking
      if (typeof (window as any).trackConversionEvent === 'function') {
        (window as any).trackConversionEvent('form_submit', {
          form_type: 'test_form',
          form_location: 'debug_test',
          success: true,
          debug: true
        });
        console.log('📤 Test form submission event sent');
      }
    } catch (error) {
      console.error('❌ Form tracking test failed:', error);
    }

    console.groupEnd();
  }

  // Test privacy compliance
  testPrivacyCompliance(): void {
    console.group('🔍 Testing Privacy Compliance');

    try {
      // Check privacy manager
      if (typeof (window as any).privacyManager === 'object') {
        const privacyManager = (window as any).privacyManager;
        console.log('✅ Privacy manager is available');
        console.log('🔒 Has consent:', privacyManager.hasConsent());
        console.log('🔒 Has opted out:', privacyManager.hasOptedOut());
        console.log('🔒 Should load analytics:', privacyManager.shouldLoadAnalytics());

        const consentStatus = privacyManager.getConsentStatus();
        if (consentStatus) {
          console.log('🔒 Consent status:', consentStatus);
        }
      } else {
        console.warn('⚠️ Privacy manager not available');
      }

      // Check Do Not Track
      if (navigator.doNotTrack === '1') {
        console.log('🔒 Do Not Track is enabled');
      } else {
        console.log('🔒 Do Not Track is not enabled');
      }

      // Check consent cookies
      const cookies = document.cookie.split(';');
      const consentCookies = cookies.filter(cookie =>
        cookie.includes('consent') || cookie.includes('analytics')
      );
      console.log('🍪 Consent-related cookies:', consentCookies);

    } catch (error) {
      console.error('❌ Privacy compliance test failed:', error);
    }

    console.groupEnd();
  }

  // Monitor network requests
  monitorNetworkRequests(): void {
    if (!this.debugMode) return;

    console.log('🌐 Monitoring analytics network requests...');

    // Override fetch to monitor requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [resource, _config] = args;
      let url: string;

      if (typeof resource === 'string') {
        url = resource;
      } else if (resource instanceof URL) {
        url = resource.href;
      } else if (resource instanceof Request) {
        url = resource.url;
      } else {
        url = String(resource);
      }

      if (this.isAnalyticsRequest(url)) {
        console.log('📡 Analytics request:', url);
      }

      return originalFetch.apply(window, args);
    };

    // Monitor image requests (for GA4 measurement protocol)
    const originalImage = window.Image;
    window.Image = function (width?: number, height?: number) {
      const img = new originalImage(width, height);
      const originalSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');

      Object.defineProperty(img, 'src', {
        set: function (value) {
          if (value && value.includes('google-analytics.com')) {
            console.log('📡 GA4 measurement request:', value);
          }
          originalSrc?.set?.call(this, value);
        },
        get: originalSrc?.get
      });

      return img;
    } as any;
  }

  // Check if URL is analytics-related
  private isAnalyticsRequest(url: string): boolean {
    const analyticsHosts = [
      'google-analytics.com',
      'googletagmanager.com',
      'clarity.ms',
      'doubleclick.net'
    ];

    return analyticsHosts.some(host => url.includes(host));
  }

  // Run comprehensive test suite
  runFullTestSuite(): void {
    console.log('🚀 Running Analytics Test Suite');
    console.log('================================');

    this.enableDebug();
    this.testGA4Integration();
    this.testClarityIntegration();
    this.testPhoneClickTracking();
    this.testEmailClickTracking();
    this.testFormTracking();
    this.testPrivacyCompliance();
    this.monitorNetworkRequests();

    console.log('✅ Analytics test suite completed');
    console.log('Check the Network tab in DevTools to verify requests');
    console.log('Use GA4 DebugView to see real-time events');
  }

  // Get event log
  getEventLog(): any[] {
    return this.eventLog;
  }

  // Clear event log
  clearEventLog(): void {
    this.eventLog = [];
    console.log('🗑️ Event log cleared');
  }

  // Setup debug console commands
  private setupDebugConsole(): void {
    if (typeof window !== 'undefined') {
      (window as any).analyticsDebugger = this;

      // Add helpful console commands
      console.log('🔧 Analytics Debugger loaded. Available commands:');
      console.log('  - analyticsDebugger.runFullTestSuite()');
      console.log('  - analyticsDebugger.testGA4Integration()');
      console.log('  - analyticsDebugger.testClarityIntegration()');
      console.log('  - analyticsDebugger.testPhoneClickTracking()');
      console.log('  - analyticsDebugger.testEmailClickTracking()');
      console.log('  - analyticsDebugger.testFormTracking()');
      console.log('  - analyticsDebugger.testPrivacyCompliance()');
    }
  }
}

// Initialize debugger in development
export function initializeAnalyticsDebugger(): AnalyticsDebugger {
  const analyticsDebugger = new AnalyticsDebugger(true);

  // Auto-run tests in development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    setTimeout(() => {
      analyticsDebugger.runFullTestSuite();
    }, 2000);
  }

  return analyticsDebugger;
}

// Chrome DevTools testing guide
export const TESTING_GUIDE = {
  ga4: {
    network: 'Check Network tab for requests to google-analytics.com and googletagmanager.com',
    debugView: 'Use GA4 DebugView in Google Analytics to see real-time events',
    console: 'Check console for gtag function and dataLayer array',
    events: 'Test events by clicking phone/email links or submitting forms'
  },
  clarity: {
    network: 'Check Network tab for requests to clarity.ms',
    console: 'Check console for clarity function availability',
    dashboard: 'View recordings and heatmaps in Microsoft Clarity dashboard'
  },
  privacy: {
    cookies: 'Check Application tab > Cookies for consent preferences',
    localStorage: 'Check Application tab > Local Storage for consent data',
    doNotTrack: 'Test with Do Not Track enabled in browser settings'
  },
  performance: {
    lighthouse: 'Run Lighthouse audit to check performance impact',
    networkTab: 'Monitor script loading times and sizes',
    coreWebVitals: 'Check Core Web Vitals scores before and after'
  }
};