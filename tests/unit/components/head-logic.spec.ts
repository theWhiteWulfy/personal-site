/**
 * Task ID: TSK-014
 * Description: Unit tests for component logic of Head.astro (schema generation and analytics setup)
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as schemaGenerators from '@lib/schema-generators';
import { initializeAnalyticsConfig } from '@lib/analytics';
import site from '@config/site';

vi.mock('@config/site', () => ({
  default: {
    url: 'https://alokprateek.in',
    title: 'Meteoric Teachings',
    titleAlt: 'Meteoric Teachings Alt',
    description: 'Test description',
    siteLanguage: 'en',
    author: {
      name: 'Alok Prateek',
      url: 'https://alokprateek.in',
    },
    image: {
      src: '/images/theme/alok-logo.png',
      width: 675,
      height: 675,
    },
  }
}));

vi.mock('@config/system.js', () => ({
  SCHEMA_CONFIG: {
    BUSINESS: {
      PHONE: '+91-9315852108',
      EMAIL: 'i@alokprateek.in',
      ADDRESS: {
        STREET: 'Delhi',
        LOCALITY: 'Delhi',
        REGION: 'Delhi',
        POSTAL_CODE: '110001',
        COUNTRY: 'IN',
      },
      GEO: {
        LATITUDE: 28.6139,
        LONGITUDE: 77.2090,
      },
      OPENING_HOURS: ['Mo-Fr 09:00-18:00'],
      PRICE_RANGE: '$$',
      AREA_SERVED: ['India', 'Global'],
    },
    PERSON: {
      JOB_TITLE: 'Designer & Developer',
      KNOWS_ABOUT: [
        'Web Design',
        'User Experience Design',
        'Frontend Development',
      ],
    },
  },
}));

// Replicate the exact frontmatter logic for Head.astro schema assembly and generation
function runHeadSchemaLogic(props: any, currentPath: string = '/') {
  const title = props.title !== undefined ? props.title : site.title;
  const description = props.description !== undefined ? props.description : site.description;
  const datePublished = props.datePublished;
  const dateModified = props.dateModified !== undefined ? props.dateModified : '2026-06-12T00:00:00Z'; // stable default for test
  const path = props.path !== undefined ? props.path : currentPath;
  const article = props.article !== undefined ? props.article : false;
  
  let author = props.author;
  if (author === undefined) {
    author = {
      name: site.author.name,
      url: site.author.url,
    };
  }

  const pageType = props.pageType !== undefined ? props.pageType : (article ? 'article' : 'default');
  const serviceData = props.serviceData;
  const faqs = props.faqs;
  const campaignData = props.campaignData;
  const includeBreadcrumbs = props.includeBreadcrumbs !== undefined ? props.includeBreadcrumbs : true;
  const includeLocalBusiness = props.includeLocalBusiness !== undefined ? props.includeLocalBusiness : false;

  // Assembly of PageSchemaOptions (Test 1 targets this object structure)
  const schemaOptions: schemaGenerators.PageSchemaOptions = {
    pageType,
    title,
    description,
    path,
    datePublished,
    dateModified,
    author: author ? {
      name: author.name,
      url: author.url
    } : undefined,
    serviceData,
    faqs,
    campaignData,
    includeBreadcrumbs,
    includeLocalBusiness
  };

  let pageSchemas: any[] = [];
  try {
    pageSchemas = schemaGenerators.generatePageSchema(schemaOptions);
    
    if (!Array.isArray(pageSchemas)) {
      throw new Error('Schema generation returned invalid format');
    }
    
    pageSchemas = pageSchemas.filter(schema => {
      if (!schema || typeof schema !== 'object') {
        return false;
      }
      if (!schema['@context'] || !schema['@type']) {
        return false;
      }
      return true;
    });
    
  } catch (error) {
    // Fallback logic inside catch block
    const fallbackSchema = schemaGenerators.safeSchemaGeneration(() => {
      const baseSchema: any = {
        '@context': 'https://schema.org',
        '@type': article ? 'Article' : 'WebPage',
        url: `${site.url}${path}`,
        name: title,
        description: description,
        inLanguage: site.siteLanguage,
        dateModified: dateModified
      };
      
      if (author?.name || site.author?.name) {
        baseSchema.author = {
          '@type': 'Person',
          name: author?.name || site.author.name,
          ...(author?.url || site.author.url ? { url: author?.url || site.author.url } : {})
        };
      }
      
      if (article) {
        baseSchema.publisher = {
          '@type': 'Organization',
          name: site.titleAlt,
          logo: {
            '@type': 'ImageObject',
            url: `${site.url}${site.image.src}`
          }
        };
        
        if (datePublished) {
          baseSchema.datePublished = datePublished;
        }
      }
      
      return [baseSchema];
    }, []);
    
    pageSchemas = fallbackSchema || [];
  }
  
  if (pageSchemas.length === 0) {
    pageSchemas = [{
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      url: `${site.url}${path}`,
      name: title,
      description: description,
      inLanguage: site.siteLanguage
    }];
  }

  return { schemaOptions, pageSchemas };
}

describe('TSK-014: Head.astro Logic Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1) PageSchemaOptions Assembly from Props', () => {
    it('correctly assembles PageSchemaOptions when all props are specified', () => {
      const mockProps = {
        title: 'Custom Title',
        description: 'Custom Description',
        path: '/custom-path',
        article: true,
        author: { name: 'Jane Doe', url: 'https://jane.doe' },
        serviceData: { name: 'Service', description: 'Desc', serviceType: 'Type' },
        faqs: [{ question: 'Q', answer: 'A' }],
        includeBreadcrumbs: false,
        includeLocalBusiness: true,
        datePublished: '2026-06-12T00:00:00Z',
        dateModified: '2026-06-12T12:00:00Z',
      };

      const { schemaOptions } = runHeadSchemaLogic(mockProps);

      expect(schemaOptions).toEqual({
        pageType: 'article',
        title: 'Custom Title',
        description: 'Custom Description',
        path: '/custom-path',
        datePublished: '2026-06-12T00:00:00Z',
        dateModified: '2026-06-12T12:00:00Z',
        author: { name: 'Jane Doe', url: 'https://jane.doe' },
        serviceData: { name: 'Service', description: 'Desc', serviceType: 'Type' },
        faqs: [{ question: 'Q', answer: 'A' }],
        campaignData: undefined,
        includeBreadcrumbs: false,
        includeLocalBusiness: true,
      });
    });

    it('applies defaults from site config and Astro context when props are omitted', () => {
      const mockProps = {};
      const { schemaOptions } = runHeadSchemaLogic(mockProps, '/fallback-path');

      expect(schemaOptions).toEqual({
        pageType: 'default',
        title: 'Meteoric Teachings',
        description: 'Test description',
        path: '/fallback-path',
        datePublished: undefined,
        dateModified: '2026-06-12T00:00:00Z',
        author: {
          name: 'Alok Prateek',
          url: 'https://alokprateek.in',
        },
        serviceData: undefined,
        faqs: undefined,
        campaignData: undefined,
        includeBreadcrumbs: true,
        includeLocalBusiness: false,
      });
    });
  });

  describe('2) Error Handling with Fallback to Article/WebPage', () => {
    it('catches generatePageSchema errors and falls back to Article schema if article=true', () => {
      // Mock generatePageSchema to throw
      const generatePageSchemaSpy = vi.spyOn(schemaGenerators, 'generatePageSchema')
        .mockImplementation(() => {
          throw new Error('Simulated schema generation error');
        });

      const mockProps = {
        title: 'Error Article',
        description: 'Testing fallback',
        path: '/error-article',
        article: true,
        datePublished: '2026-06-12T00:00:00Z',
        dateModified: '2026-06-12T12:00:00Z',
        author: { name: 'Jane Doe', url: 'https://jane.doe' }
      };

      const { pageSchemas } = runHeadSchemaLogic(mockProps);

      expect(generatePageSchemaSpy).toHaveBeenCalled();
      expect(pageSchemas).toHaveLength(1);
      
      const fallbackSchema = pageSchemas[0];
      expect(fallbackSchema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'Article',
        url: 'https://alokprateek.in/error-article',
        name: 'Error Article',
        description: 'Testing fallback',
        inLanguage: 'en',
        dateModified: '2026-06-12T12:00:00Z',
        author: {
          '@type': 'Person',
          name: 'Jane Doe',
          url: 'https://jane.doe'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Meteoric Teachings Alt',
          logo: {
            '@type': 'ImageObject',
            url: 'https://alokprateek.in/images/theme/alok-logo.png'
          }
        },
        datePublished: '2026-06-12T00:00:00Z'
      });
    });

    it('catches generatePageSchema errors and falls back to WebPage schema if article=false', () => {
      // Mock generatePageSchema to throw
      const generatePageSchemaSpy = vi.spyOn(schemaGenerators, 'generatePageSchema')
        .mockImplementation(() => {
          throw new Error('Simulated schema generation error');
        });

      const mockProps = {
        title: 'Error WebPage',
        description: 'Testing fallback page',
        path: '/error-webpage',
        article: false,
        dateModified: '2026-06-12T12:00:00Z',
        author: { name: 'Jane Doe', url: 'https://jane.doe' }
      };

      const { pageSchemas } = runHeadSchemaLogic(mockProps);

      expect(generatePageSchemaSpy).toHaveBeenCalled();
      expect(pageSchemas).toHaveLength(1);
      
      const fallbackSchema = pageSchemas[0];
      expect(fallbackSchema).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: 'https://alokprateek.in/error-webpage',
        name: 'Error WebPage',
        description: 'Testing fallback page',
        inLanguage: 'en',
        dateModified: '2026-06-12T12:00:00Z',
        author: {
          '@type': 'Person',
          name: 'Jane Doe',
          url: 'https://jane.doe'
        }
      });
    });
  });

  describe('3) Empty pageSchemas Fallback', () => {
    it('creates minimal WebPage schema if pageSchemas is empty', () => {
      // Mock generatePageSchema to return empty array
      vi.spyOn(schemaGenerators, 'generatePageSchema').mockReturnValue([]);

      const mockProps = {
        title: 'Empty Schemas',
        description: 'Testing minimal fallback',
        path: '/empty-schemas'
      };

      const { pageSchemas } = runHeadSchemaLogic(mockProps);

      expect(pageSchemas).toHaveLength(1);
      expect(pageSchemas[0]).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: 'https://alokprateek.in/empty-schemas',
        name: 'Empty Schemas',
        description: 'Testing minimal fallback',
        inLanguage: 'en'
      });
    });

    it('creates minimal WebPage schema if safeSchemaGeneration fails inside catch', () => {
      // Mock generatePageSchema to throw
      vi.spyOn(schemaGenerators, 'generatePageSchema').mockImplementation(() => {
        throw new Error('First error');
      });

      // Mock safeSchemaGeneration to return null or throw (so it returns default fallback [])
      vi.spyOn(schemaGenerators, 'safeSchemaGeneration').mockReturnValue(null);

      const mockProps = {
        title: 'Catch Block Failure',
        description: 'Testing minimal fallback on total failure',
        path: '/catch-failure'
      };

      const { pageSchemas } = runHeadSchemaLogic(mockProps);

      expect(pageSchemas).toHaveLength(1);
      expect(pageSchemas[0]).toEqual({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: 'https://alokprateek.in/catch-failure',
        name: 'Catch Block Failure',
        description: 'Testing minimal fallback on total failure',
        inLanguage: 'en'
      });
    });
  });

  describe('4) initializeAnalyticsConfig with mock site config', () => {
    it('correctly maps analytics config options', () => {
      const mockSiteConfig = {
        analytics: {
          enabled: true,
          ga4: {
            measurementId: 'G-1234567890',
            enhancedMeasurement: true,
            conversionEvents: ['event_1'],
            customDimensions: { dim1: 'val1' },
            customMetrics: { met1: 'val2' }
          },
          clarity: {
            projectId: 'clarity_proj_123',
            enableHeatmaps: true,
            enableRecordings: true,
            privacyMode: 'strict' as const,
            cookieConsent: true
          },
          privacy: {
            enableOptOut: true,
            cookieConsentRequired: true,
            dataRetentionDays: 180,
            anonymizeIp: true,
            respectDoNotTrack: true,
            consentStorageKey: 'custom_consent_key'
          }
        }
      };

      const config = initializeAnalyticsConfig(mockSiteConfig);

      expect(config).toEqual({
        ga4: {
          enabled: true,
          measurementId: 'G-1234567890',
          enhancedMeasurement: true,
          conversionEvents: ['event_1'],
          anonymizeIp: true,
          cookieConsent: true,
          trackingOptOut: true,
          customDimensions: { dim1: 'val1' },
          customMetrics: { met1: 'val2' }
        },
        clarity: {
          enabled: true,
          projectId: 'clarity_proj_123',
          enableHeatmaps: true,
          enableRecordings: true,
          privacyMode: 'strict',
          cookieConsent: true
        },
        consentRequired: true,
        optOutCookieName: 'custom_consent_key'
      });
    });

    it('disables GA4/Clarity if placeholder IDs are used', () => {
      const mockSiteConfig = {
        analytics: {
          enabled: true,
          ga4: {
            measurementId: 'G-XXXXXXXXXX',
          },
          clarity: {
            projectId: 'XXXXXXXXXX',
          }
        }
      };

      const config = initializeAnalyticsConfig(mockSiteConfig);

      expect(config.ga4.enabled).toBe(false);
      expect(config.clarity.enabled).toBe(false);
    });

    it('disables GA4/Clarity if analytics is disabled overall', () => {
      const mockSiteConfig = {
        analytics: {
          enabled: false,
          ga4: {
            measurementId: 'G-1234567890',
          },
          clarity: {
            projectId: 'clarity_proj_123',
          }
        }
      };

      const config = initializeAnalyticsConfig(mockSiteConfig);

      expect(config.ga4.enabled).toBe(false);
      expect(config.clarity.enabled).toBe(false);
    });
  });
});
