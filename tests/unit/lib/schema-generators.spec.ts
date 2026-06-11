/**
 * Task ID: TSK-005
 * Description: Unit tests for JSON-LD schema generators
 */

import { vi, describe, it, expect } from 'vitest';
import {
  generateLocalBusinessSchema,
  generateServiceSchema,
  generateFAQPageSchema,
  generateBreadcrumbListSchema,
  generateBreadcrumbsFromPath,
  generatePersonSchema,
  safeSchemaGeneration,
  generateResourceSchema,
  generateCampaignSchema,
  generatePageSchema,
} from '@lib/schema-generators';

vi.mock('@config/site', () => ({
  default: {
    url: 'https://alokprateek.in',
    title: 'Meteoric Teachings',
    titleAlt: 'Meteoric Teachings Alt',
    description: 'Test description',
    author: {
      name: 'Alok Prateek',
      url: 'https://alokprateek.in',
    },
    image: {
      src: '/images/theme/alok-logo.png',
      width: 675,
      height: 675,
    },
    siteLanguage: 'en',
    twitterUrl: 'https://twitter.com/thewhitewulfy',
    linkedinUrl: 'https://www.linkedin.com/in/alokprateek/',
    githubUrl: 'https://github.com/thewhitewulfy',
    instagramUrl: 'https://www.instagram.com/thewhitewulfy/',
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
    TYPES: {
      ARTICLE: 'Article',
      WEB_PAGE: 'WebPage',
      LOCAL_BUSINESS: 'LocalBusiness',
      PERSON: 'Person',
      SERVICE: 'Service',
      FAQ_PAGE: 'FAQPage',
      BREADCRUMB_LIST: 'BreadcrumbList',
    },
  },
}));

describe('generateBreadcrumbsFromPath', () => {
  it('returns home breadcrumb only for root path', () => {
    const result = generateBreadcrumbsFromPath('/');
    expect(result).toEqual([
      { name: 'Home', url: 'https://alokprateek.in' }
    ]);
  });

  it('generates multiple breadcrumbs for a nested path', () => {
    const result = generateBreadcrumbsFromPath('/articles/test-post/');
    expect(result).toEqual([
      { name: 'Home', url: 'https://alokprateek.in' },
      { name: 'Articles', url: 'https://alokprateek.in/articles' },
      { name: 'Test post', url: 'https://alokprateek.in/articles/test-post' }
    ]);
  });

  it('preserves casing and replaces hyphens with spaces', () => {
    const result = generateBreadcrumbsFromPath('/some-category/my-cool-post');
    expect(result).toEqual([
      { name: 'Home', url: 'https://alokprateek.in' },
      { name: 'Some category', url: 'https://alokprateek.in/some-category' },
      { name: 'My cool post', url: 'https://alokprateek.in/some-category/my-cool-post' }
    ]);
  });
});

describe('generateBreadcrumbListSchema', () => {
  it('returns valid BreadcrumbList schema structure', () => {
    const breadcrumbs = [
      { name: 'Home', url: 'https://alokprateek.in' },
      { name: 'Articles', url: 'https://alokprateek.in/articles' }
    ];
    const schema = generateBreadcrumbListSchema(breadcrumbs);
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://alokprateek.in'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Articles',
          item: 'https://alokprateek.in/articles'
        }
      ]
    });
  });
});

describe('generateLocalBusinessSchema', () => {
  it('returns LocalBusiness schema with correct defaults', () => {
    const schema = generateLocalBusinessSchema();
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Meteoric Teachings Alt',
      description: 'Test description',
      url: 'https://alokprateek.in',
      telephone: '+91-9315852108',
      email: 'i@alokprateek.in',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Delhi',
        addressLocality: 'Delhi',
        addressRegion: 'Delhi',
        postalCode: '110001',
        addressCountry: 'IN'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 28.6139,
        longitude: 77.209
      },
      openingHours: ['Mo-Fr 09:00-18:00'],
      sameAs: [
        'https://twitter.com/thewhitewulfy',
        'https://www.linkedin.com/in/alokprateek/',
        'https://github.com/thewhitewulfy',
        'https://www.instagram.com/thewhitewulfy/'
      ],
      priceRange: '$$',
      areaServed: ['India', 'Global'],
      founder: {
        '@type': 'Person',
        name: 'Alok Prateek',
        url: 'https://alokprateek.in'
      },
      logo: {
        '@type': 'ImageObject',
        url: 'https://alokprateek.in/images/theme/alok-logo.png',
        width: 675,
        height: 675
      }
    });
  });

  it('allows overriding default parameters', () => {
    const schema = generateLocalBusinessSchema({
      name: 'Custom Business Name',
      priceRange: '$$$'
    });
    expect(schema.name).toBe('Custom Business Name');
    expect(schema.priceRange).toBe('$$$');
  });
});

describe('generateServiceSchema', () => {
  it('generates Service schema with full offer catalog and rating', () => {
    const serviceData = {
      name: 'Web Development',
      description: 'Building modern web applications',
      serviceType: 'Software Development',
      hasOfferCatalog: {
        name: 'Web Dev Offers',
        itemListElement: [
          { name: 'Standard Site', description: 'Simple site', price: '1000', priceCurrency: 'USD' }
        ]
      },
      aggregateRating: {
        ratingValue: 4.8,
        reviewCount: 25
      }
    };

    const schema = generateServiceSchema(serviceData);
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Web Development',
      description: 'Building modern web applications',
      serviceType: 'Software Development',
      provider: {
        '@type': 'LocalBusiness',
        name: 'Meteoric Teachings Alt',
        url: 'https://alokprateek.in'
      },
      areaServed: ['India', 'Global'],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Web Dev Offers',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Standard Site',
              description: 'Simple site'
            },
            price: '1000',
            priceCurrency: 'USD'
          }
        ]
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 4.8,
        reviewCount: 25
      }
    });
  });
});

describe('generateFAQPageSchema', () => {
  it('generates FAQPage schema from items list', () => {
    const faqs = [
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' }
    ];
    const schema = generateFAQPageSchema(faqs);
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Q1',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A1'
          }
        },
        {
          '@type': 'Question',
          name: 'Q2',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A2'
          }
        }
      ]
    });
  });
});

describe('generatePersonSchema', () => {
  it('returns Person schema with correct defaults', () => {
    const schema = generatePersonSchema();
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Alok Prateek',
      url: 'https://alokprateek.in',
      image: {
        '@type': 'ImageObject',
        url: 'https://alokprateek.in/images/theme/alok-logo.png'
      },
      jobTitle: 'Designer & Developer',
      worksFor: {
        '@type': 'Organization',
        name: 'Meteoric Teachings Alt',
        url: 'https://alokprateek.in'
      },
      sameAs: [
        'https://twitter.com/thewhitewulfy',
        'https://www.linkedin.com/in/alokprateek/',
        'https://github.com/thewhitewulfy',
        'https://www.instagram.com/thewhitewulfy/'
      ],
      knowsAbout: ['Web Design', 'User Experience Design', 'Frontend Development'],
      description: 'Test description'
    });
  });

  it('allows custom overrides', () => {
    const schema = generatePersonSchema({
      name: 'John Doe',
      jobTitle: 'Product Manager'
    });
    expect(schema.name).toBe('John Doe');
    expect(schema.jobTitle).toBe('Product Manager');
  });
});

describe('generateResourceSchema', () => {
  it('generates resource schema correctly', () => {
    const resourceData = {
      name: 'Astro Guide',
      description: 'Learn Astro v4',
      url: 'https://alokprateek.in/assets/astro-guide.pdf',
      fileFormat: 'application/pdf',
      contentSize: '1.5MB'
    };
    const schema = generateResourceSchema(resourceData);
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'DigitalDocument',
      name: 'Astro Guide',
      description: 'Learn Astro v4',
      url: 'https://alokprateek.in/assets/astro-guide.pdf',
      fileFormat: 'application/pdf',
      contentSize: '1.5MB',
      encodingFormat: 'application/pdf',
      datePublished: undefined,
      dateModified: undefined,
      author: {
        '@type': 'Person',
        name: 'Alok Prateek',
        url: 'https://alokprateek.in'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Meteoric Teachings Alt',
        url: 'https://alokprateek.in',
        logo: {
          '@type': 'ImageObject',
          url: 'https://alokprateek.in/images/theme/alok-logo.png'
        }
      },
      keywords: undefined,
      inLanguage: 'en',
      isAccessibleForFree: true,
      license: undefined,
      mainEntity: {
        '@type': 'CreativeWork',
        name: 'Astro Guide',
        description: 'Learn Astro v4',
        creator: {
          '@type': 'Person',
          name: 'Alok Prateek'
        }
      }
    });
  });
});

describe('generateCampaignSchema', () => {
  it('generates Campaign schema correctly', () => {
    const campaignData = {
      name: 'Summer Sale',
      description: 'Big discounts',
      url: 'https://alokprateek.in/campaigns/summer-sale',
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2024-08-31T23:59:59Z',
      offers: [
        {
          '@type': 'Offer',
          name: 'VIP Ticket',
          description: 'Special access',
          price: '99',
          priceCurrency: 'USD',
          validThrough: '2024-06-30T23:59:59Z',
          availability: 'https://schema.org/InStock'
        }
      ],
      keywords: ['sale', 'summer'],
      targetAudience: ['Developers', 'Designers']
    };

    const schema = generateCampaignSchema(campaignData);
    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Summer Sale',
      description: 'Big discounts',
      url: 'https://alokprateek.in/campaigns/summer-sale',
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2024-08-31T23:59:59Z',
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      location: {
        '@type': 'VirtualLocation',
        url: 'https://alokprateek.in/campaigns/summer-sale'
      },
      organizer: {
        '@type': 'Organization',
        name: 'Meteoric Teachings Alt',
        url: 'https://alokprateek.in',
        logo: {
          '@type': 'ImageObject',
          url: 'https://alokprateek.in/images/theme/alok-logo.png'
        }
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'VIP Ticket',
          description: 'Special access',
          price: '99',
          priceCurrency: 'USD',
          validThrough: '2024-06-30T23:59:59Z',
          availability: 'https://schema.org/InStock',
          url: 'https://alokprateek.in/campaigns/summer-sale',
          seller: {
            '@type': 'Organization',
            name: 'Meteoric Teachings Alt',
            url: 'https://alokprateek.in'
          }
        }
      ],
      keywords: 'sale, summer',
      audience: {
        '@type': 'Audience',
        audienceType: 'Developers, Designers'
      },
      inLanguage: 'en',
      isAccessibleForFree: false
    });
  });
});

describe('safeSchemaGeneration', () => {
  it('returns generated schema on success', () => {
    const result = safeSchemaGeneration(() => 'success', 'fallback');
    expect(result).toBe('success');
  });

  it('returns fallback and logs error on generator failure', () => {
    const result = safeSchemaGeneration(() => {
      throw new Error('fail');
    }, 'fallback');
    expect(result).toBe('fallback');
    expect(console.error).toHaveBeenCalledWith(
      'Schema generation error:',
      expect.any(Error)
    );
  });
});

describe('generatePageSchema', () => {
  it('generates schemas including breadcrumbs and base WebPage schema by default', () => {
    const options = {
      pageType: 'default' as const,
      title: 'About Page',
      description: 'All about us',
      path: '/about-us'
    };
    const schemas = generatePageSchema(options);
    expect(schemas).toHaveLength(2);

    const baseWebPage = schemas[0];
    expect(baseWebPage).toEqual(expect.objectContaining({
      '@type': 'WebPage',
      name: 'About Page',
      description: 'All about us',
      url: 'https://alokprateek.in/about-us'
    }));

    const breadcrumbs = schemas[1];
    expect(breadcrumbs['@type']).toBe('BreadcrumbList');
  });

  it('generates base Article schema for article pages', () => {
    const options = {
      pageType: 'article' as const,
      title: 'Awesome Blog',
      description: 'Some blog post',
      path: '/articles/awesome-blog'
    };
    const schemas = generatePageSchema(options);
    expect(schemas[0]['@type']).toBe('Article');
  });

  it('omits breadcrumbs if includeBreadcrumbs is false', () => {
    const options = {
      pageType: 'default' as const,
      title: 'About Page',
      description: 'All about us',
      path: '/about-us',
      includeBreadcrumbs: false
    };
    const schemas = generatePageSchema(options);
    expect(schemas).toHaveLength(1);
    expect(schemas[0]['@type']).toBe('WebPage');
  });

  it('includes LocalBusiness schema for home, about, contact, and service page types', () => {
    const homeOptions = {
      pageType: 'home' as const,
      title: 'Home Page',
      description: 'Welcome home',
      path: '/'
    };
    const schemas = generatePageSchema(homeOptions);
    const hasLocalBusiness = schemas.some(s => s['@type'] === 'LocalBusiness');
    expect(hasLocalBusiness).toBe(true);
  });

  it('includes Person schema for about page or if author object is supplied', () => {
    const aboutOptions = {
      pageType: 'about' as const,
      title: 'About',
      description: 'About me',
      path: '/about'
    };
    const schemas = generatePageSchema(aboutOptions);
    const hasPerson = schemas.some(s => s['@type'] === 'Person');
    expect(hasPerson).toBe(true);
  });

  it('includes Service schema for service pages', () => {
    const serviceOptions = {
      pageType: 'service' as const,
      title: 'Consulting',
      description: 'Web development consulting',
      path: '/services/consulting',
      serviceData: {
        name: 'Consulting',
        description: 'Web development consulting',
        serviceType: 'IT Consulting'
      }
    };
    const schemas = generatePageSchema(serviceOptions);
    const hasService = schemas.some(s => s['@type'] === 'Service');
    expect(hasService).toBe(true);
  });

  it('includes FAQ schema for faq pages', () => {
    const faqOptions = {
      pageType: 'faq' as const,
      title: 'FAQs',
      description: 'Frequently asked questions',
      path: '/faqs',
      faqs: [
        { question: 'Why Astro?', answer: 'Because it is fast.' }
      ]
    };
    const schemas = generatePageSchema(faqOptions);
    const hasFAQ = schemas.some(s => s['@type'] === 'FAQPage');
    expect(hasFAQ).toBe(true);
  });

  it('includes DigitalDocument schema for resource pages', () => {
    const resourceOptions = {
      pageType: 'resource' as const,
      title: 'Whitepaper',
      description: 'Download whitepaper',
      path: '/resources/whitepaper',
      resourceData: {
        name: 'Whitepaper',
        description: 'Download whitepaper',
        url: 'https://alokprateek.in/resources/whitepaper.pdf'
      }
    };
    const schemas = generatePageSchema(resourceOptions);
    const hasDoc = schemas.some(s => s['@type'] === 'DigitalDocument');
    expect(hasDoc).toBe(true);
  });

  it('includes Campaign schema for campaign pages', () => {
    const campaignOptions = {
      pageType: 'campaign' as const,
      title: 'Discount Offer',
      description: 'Limited time discount',
      path: '/campaigns/discount',
      campaignData: {
        name: 'Discount Offer',
        description: 'Limited time discount',
        url: 'https://alokprateek.in/campaigns/discount',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        offers: [],
        keywords: [],
        targetAudience: []
      }
    };
    const schemas = generatePageSchema(campaignOptions);
    const hasCampaign = schemas.some(s => s['@type'] === 'Event');
    expect(hasCampaign).toBe(true);
  });

  it('filters out any null schemas generated by a throwing sub-generator', () => {
    // Force generateLocalBusinessSchema to throw (since it reads site.titleAlt, etc., we can mock site values to throw or cause an error)
    // Actually, safeSchemaGeneration handles errors and returns null.
    // Let's spy on generateLocalBusinessSchema or make it throw an error temporarily via mock/spy.
    const options = {
      pageType: 'home' as const,
      title: 'Home Page',
      description: 'Welcome home',
      path: '/'
    };
    
    // We can spy on and mock implementation to throw
    const originalLocalBusiness = generateLocalBusinessSchema;
    vi.spyOn(console, 'error'); // already mocked by setup.ts
    
    // We mock safeSchemaGeneration indirectly by throwing in a helper. But safeSchemaGeneration wraps the generator.
    // In our test, options pageType is home, which triggers generateLocalBusinessSchema.
    // If we throw inside generateLocalBusinessSchema, we should see the list has fewer items.
    // Let's modify a property of site that generateLocalBusinessSchema expects to be a string or object.
    // But since it's imported, we can just spy on it:
    // However, it is an exported function called directly. In ES modules, spying on named exports called internally is tricky,
    // but generatePageSchema calls it inside the same module. Let's see if we can trigger an error.
    // We can cause an error by passing bad options that cause a sub-generator like generateCampaignSchema to throw (e.g. if we pass campaignData as null but call it).
    // Let's pass campaignData that lacks offers or keywords (e.g., campaignData: { offers: null } as any)
    const badOptions = {
      pageType: 'campaign' as const,
      title: 'Bad Campaign',
      description: 'This will fail',
      path: '/campaigns/bad',
      campaignData: {
        name: 'Bad',
        description: 'Bad',
        url: 'url',
        startDate: 'date',
        endDate: 'date',
        offers: null as any // will throw in mapping offers
      } as any
    };
    const schemas = generatePageSchema(badOptions);
    // The campaign schema should fail and be filtered out.
    // Breadcrumbs (1), base WebPage (1) -> total 2. Event/Campaign is omitted because it threw.
    expect(schemas).toHaveLength(2);
    expect(schemas.some(s => s['@type'] === 'Event')).toBe(false);
  });
});
