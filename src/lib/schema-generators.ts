import site from '@config/site';
import { SCHEMA_CONFIG } from '@config/system.js';

// Base schema interfaces
export interface LocalBusinessData {
  name?: string;
  description?: string;
  url?: string;
  telephone?: string;
  email?: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string[];
  sameAs?: string[];
  priceRange?: string;
  areaServed?: string[];
}

export interface ServiceData {
  name: string;
  description: string;
  serviceType: string;
  provider?: {
    name: string;
    url: string;
  };
  areaServed?: string[];
  hasOfferCatalog?: {
    name: string;
    itemListElement: Array<{
      name: string;
      description: string;
      price?: string;
      priceCurrency?: string;
    }>;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export interface CampaignData {
  name: string;
  description: string;
  url: string;
  startDate: string;
  endDate: string;
  offers: Array<{
    '@type': string;
    name: string;
    description: string;
    price: string;
    priceCurrency: string;
    validThrough: string;
    availability: string;
  }>;
  keywords: string[];
  targetAudience: string[];
}

export interface FAQData {
  question: string;
  answer: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface PersonData {
  name?: string;
  url?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: {
    name: string;
    url: string;
  };
  sameAs?: string[];
  knowsAbout?: string[];
  description?: string;
}

export interface ResourceData {
  name: string;
  description: string;
  url: string;
  fileFormat?: string;
  contentSize?: string;
  encodingFormat?: string;
  datePublished?: string;
  dateModified?: string;
  author?: {
    name: string;
    url: string;
  };
  publisher?: {
    name: string;
    url: string;
  };
  keywords?: string[];
  inLanguage?: string;
  isAccessibleForFree?: boolean;
  license?: string;
}

// Schema generation functions
export function generateLocalBusinessSchema(data?: Partial<LocalBusinessData>) {
  const businessData: LocalBusinessData = {
    name: site.titleAlt,
    description: site.description,
    url: site.url,
    telephone: SCHEMA_CONFIG.BUSINESS.PHONE,
    email: SCHEMA_CONFIG.BUSINESS.EMAIL,
    address: {
      streetAddress: SCHEMA_CONFIG.BUSINESS.ADDRESS.STREET,
      addressLocality: SCHEMA_CONFIG.BUSINESS.ADDRESS.LOCALITY,
      addressRegion: SCHEMA_CONFIG.BUSINESS.ADDRESS.REGION,
      postalCode: SCHEMA_CONFIG.BUSINESS.ADDRESS.POSTAL_CODE,
      addressCountry: SCHEMA_CONFIG.BUSINESS.ADDRESS.COUNTRY
    },
    geo: {
      latitude: SCHEMA_CONFIG.BUSINESS.GEO.LATITUDE,
      longitude: SCHEMA_CONFIG.BUSINESS.GEO.LONGITUDE
    },
    openingHours: SCHEMA_CONFIG.BUSINESS.OPENING_HOURS,
    sameAs: [
      site.twitterUrl,
      site.linkedinUrl,
      site.githubUrl,
      site.instagramUrl
    ],
    priceRange: SCHEMA_CONFIG.BUSINESS.PRICE_RANGE,
    areaServed: SCHEMA_CONFIG.BUSINESS.AREA_SERVED,
    ...data
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: businessData.name,
    description: businessData.description,
    url: businessData.url,
    telephone: businessData.telephone,
    email: businessData.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: businessData.address?.streetAddress,
      addressLocality: businessData.address?.addressLocality,
      addressRegion: businessData.address?.addressRegion,
      postalCode: businessData.address?.postalCode,
      addressCountry: businessData.address?.addressCountry
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: businessData.geo?.latitude,
      longitude: businessData.geo?.longitude
    },
    openingHours: businessData.openingHours,
    sameAs: businessData.sameAs,
    priceRange: businessData.priceRange,
    areaServed: businessData.areaServed,
    founder: {
      '@type': 'Person',
      name: site.author.name,
      url: site.author.url
    },
    logo: {
      '@type': 'ImageObject',
      url: `${site.url}${site.image.src}`,
      width: site.image.width,
      height: site.image.height
    }
  };
}

export function generateServiceSchema(serviceData: ServiceData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceData.name,
    description: serviceData.description,
    serviceType: serviceData.serviceType,
    provider: {
      '@type': 'LocalBusiness',
      name: serviceData.provider?.name || site.titleAlt,
      url: serviceData.provider?.url || site.url
    },
    areaServed: serviceData.areaServed || ['India', 'Global'],
    hasOfferCatalog: serviceData.hasOfferCatalog ? {
      '@type': 'OfferCatalog',
      name: serviceData.hasOfferCatalog.name,
      itemListElement: serviceData.hasOfferCatalog.itemListElement.map(item => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: item.name,
          description: item.description
        },
        price: item.price,
        priceCurrency: item.priceCurrency || 'USD'
      }))
    } : undefined,
    aggregateRating: serviceData.aggregateRating ? {
      '@type': 'AggregateRating',
      ratingValue: serviceData.aggregateRating.ratingValue,
      reviewCount: serviceData.aggregateRating.reviewCount
    } : undefined
  };
}

export function generateFAQPageSchema(faqs: FAQData[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function generateBreadcrumbListSchema(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url
    }))
  };
}

export function generateBreadcrumbsFromPath(path: string, baseUrl: string = site.url): BreadcrumbItem[] {
  const pathSegments = path.split('/').filter(segment => segment !== '');
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: baseUrl }
  ];

  let currentPath = '';
  pathSegments.forEach(segment => {
    currentPath += `/${segment}`;
    const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    breadcrumbs.push({
      name,
      url: `${baseUrl}${currentPath}`
    });
  });

  return breadcrumbs;
}

export function generatePersonSchema(personData?: Partial<PersonData>) {
  const defaultPersonData: PersonData = {
    name: site.author.name,
    url: site.author.url,
    image: `${site.url}${site.image.src}`,
    jobTitle: SCHEMA_CONFIG.PERSON.JOB_TITLE,
    worksFor: {
      name: site.titleAlt,
      url: site.url
    },
    sameAs: [
      site.twitterUrl,
      site.linkedinUrl,
      site.githubUrl,
      site.instagramUrl
    ],
    knowsAbout: SCHEMA_CONFIG.PERSON.KNOWS_ABOUT,
    description: site.description,
    ...personData
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: defaultPersonData.name,
    url: defaultPersonData.url,
    image: {
      '@type': 'ImageObject',
      url: defaultPersonData.image
    },
    jobTitle: defaultPersonData.jobTitle,
    worksFor: {
      '@type': 'Organization',
      name: defaultPersonData.worksFor?.name,
      url: defaultPersonData.worksFor?.url
    },
    sameAs: defaultPersonData.sameAs,
    knowsAbout: defaultPersonData.knowsAbout,
    description: defaultPersonData.description
  };
}

// Utility function to safely generate schema with error handling
export function safeSchemaGeneration<T>(
  generator: () => T,
  fallback: T | null = null
): T | null {
  try {
    return generator();
  } catch (error) {
    console.error('Schema generation error:', error);
    return fallback;
  }
}

// Combined schema generator for different page types
export interface PageSchemaOptions {
  pageType: 'article' | 'service' | 'faq' | 'home' | 'about' | 'contact' | 'resource' | 'campaign' | 'default';
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  author?: Partial<PersonData>;
  serviceData?: ServiceData;
  faqs?: FAQData[];
  resourceData?: ResourceData;
  campaignData?: CampaignData;
  includeBreadcrumbs?: boolean;
  includeLocalBusiness?: boolean;
}

export function generateResourceSchema(resourceData: ResourceData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: resourceData.name,
    description: resourceData.description,
    url: resourceData.url,
    fileFormat: resourceData.fileFormat || 'application/pdf',
    contentSize: resourceData.contentSize,
    encodingFormat: resourceData.encodingFormat || 'application/pdf',
    datePublished: resourceData.datePublished,
    dateModified: resourceData.dateModified,
    author: resourceData.author || {
      '@type': 'Person',
      name: site.author.name,
      url: site.author.url
    },
    publisher: resourceData.publisher || {
      '@type': 'Organization',
      name: site.titleAlt,
      url: site.url,
      logo: {
        '@type': 'ImageObject',
        url: `${site.url}${site.image.src}`
      }
    },
    keywords: resourceData.keywords,
    inLanguage: resourceData.inLanguage || site.siteLanguage,
    isAccessibleForFree: resourceData.isAccessibleForFree !== false,
    license: resourceData.license,
    mainEntity: {
      '@type': 'CreativeWork',
      name: resourceData.name,
      description: resourceData.description,
      creator: resourceData.author || {
        '@type': 'Person',
        name: site.author.name
      }
    }
  };
}

export function generateCampaignSchema(campaignData: CampaignData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: campaignData.name,
    description: campaignData.description,
    url: campaignData.url,
    startDate: campaignData.startDate,
    endDate: campaignData.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    location: {
      '@type': 'VirtualLocation',
      url: campaignData.url
    },
    organizer: {
      '@type': 'Organization',
      name: site.titleAlt,
      url: site.url,
      logo: {
        '@type': 'ImageObject',
        url: `${site.url}${site.image.src}`
      }
    },
    offers: campaignData.offers.map(offer => ({
      '@type': 'Offer',
      name: offer.name,
      description: offer.description,
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      validThrough: offer.validThrough,
      availability: offer.availability,
      url: campaignData.url,
      seller: {
        '@type': 'Organization',
        name: site.titleAlt,
        url: site.url
      }
    })),
    keywords: campaignData.keywords.join(', '),
    audience: {
      '@type': 'Audience',
      audienceType: campaignData.targetAudience.join(', ')
    },
    inLanguage: site.siteLanguage,
    isAccessibleForFree: false
  };
}

export function generatePageSchema(options: PageSchemaOptions) {
  const schemas: any[] = [];

  // Always include breadcrumbs unless explicitly disabled
  if (options.includeBreadcrumbs !== false) {
    const breadcrumbs = generateBreadcrumbsFromPath(options.path);
    schemas.push(safeSchemaGeneration(() => generateBreadcrumbListSchema(breadcrumbs)));
  }

  // Include LocalBusiness schema for home, about, contact, or service pages
  if (options.includeLocalBusiness || ['home', 'about', 'contact', 'service'].includes(options.pageType)) {
    schemas.push(safeSchemaGeneration(() => generateLocalBusinessSchema()));
  }

  // Include Person schema for about page or when author data is provided
  if (options.pageType === 'about' || options.author) {
    schemas.push(safeSchemaGeneration(() => generatePersonSchema(options.author)));
  }

  // Include Service schema for service pages
  if (options.pageType === 'service' && options.serviceData) {
    schemas.push(safeSchemaGeneration(() => generateServiceSchema(options.serviceData!)));
  }

  // Include FAQ schema for FAQ pages
  if (options.pageType === 'faq' && options.faqs) {
    schemas.push(safeSchemaGeneration(() => generateFAQPageSchema(options.faqs!)));
  }

  // Include Resource schema for resource pages
  if (options.pageType === 'resource' && options.resourceData) {
    schemas.push(safeSchemaGeneration(() => generateResourceSchema(options.resourceData!)));
  }

  // Include Campaign schema for campaign pages
  if (options.pageType === 'campaign' && options.campaignData) {
    schemas.push(safeSchemaGeneration(() => generateCampaignSchema(options.campaignData!)));
  }

  // Base page/article schema
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': options.pageType === 'article' ? 'Article' : 'WebPage',
    url: `${site.url}${options.path}`,
    name: options.title,
    description: options.description,
    inLanguage: site.siteLanguage,
    datePublished: options.datePublished,
    dateModified: options.dateModified || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: options.author?.name || site.author.name,
      url: options.author?.url || site.author.url
    },
    publisher: {
      '@type': 'Organization',
      name: site.titleAlt,
      logo: {
        '@type': 'ImageObject',
        url: `${site.url}${site.image.src}`
      }
    }
  };

  schemas.unshift(baseSchema);

  // Filter out null schemas and return
  return schemas.filter(schema => schema !== null);
}