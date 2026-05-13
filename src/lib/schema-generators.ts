import site from '@config/site';
import { SCHEMA_CONFIG } from '@config/system.js';

// Base schema interfaces
/**
 * Interface for Local Business schema data.
 * @see https://schema.org/LocalBusiness
 * @property {string} [name] - The name of the business.
 * @property {string} [description] - A description of the business.
 * @property {string} [url] - The URL of the business website.
 * @property {string} [telephone] - The telephone number of the business.
 * @property {string} [email] - The email address of the business.
 * @property {object} [address] - The address of the business.
 * @property {string} address.streetAddress - The street address.
 * @property {string} address.addressLocality - The locality (e.g., city).
 * @property {string} address.addressRegion - The region (e.g., state).
 * @property {string} address.postalCode - The postal code.
 * @property {string} address.addressCountry - The country.
 * @property {object} [geo] - The geographical coordinates of the business.
 * @property {number} geo.latitude - The latitude.
 * @property {number} geo.longitude - The longitude.
 * @property {string[]} [openingHours] - The opening hours of the business.
 * @property {string[]} [sameAs] - URLs of social media profiles.
 * @property {string} [priceRange] - The price range of the business (e.g., "$$").
 * @property {string[]} [areaServed] - The area served by the business.
 */
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

/**
 * Interface for Service schema data.
 * @see https://schema.org/Service
 * @property {string} name - The name of the service.
 * @property {string} description - A description of the service.
 * @property {string} serviceType - The type of service.
 * @property {object} [provider] - The provider of the service.
 * @property {string} provider.name - The name of the provider.
 * @property {string} provider.url - The URL of the provider.
 * @property {string[]} [areaServed] - The area served by the service.
 * @property {object} [hasOfferCatalog] - A catalog of offers for the service.
 * @property {string} hasOfferCatalog.name - The name of the offer catalog.
 * @property {Array<object>} hasOfferCatalog.itemListElement - A list of offers.
 * @property {string} hasOfferCatalog.itemListElement.name - The name of the offer.
 * @property {string} hasOfferCatalog.itemListElement.description - A description of the offer.
 * @property {string} [hasOfferCatalog.itemListElement.price] - The price of the offer.
 * @property {string} [hasOfferCatalog.itemListElement.priceCurrency] - The currency of the price.
 * @property {object} [aggregateRating] - The aggregate rating of the service.
 * @property {number} aggregateRating.ratingValue - The rating value.
 * @property {number} aggregateRating.reviewCount - The number of reviews.
 */
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

/**
 * Interface for Campaign schema data.
 * @see https://schema.org/Event
 * @property {string} name - The name of the campaign.
 * @property {string} description - A description of the campaign.
 * @property {string} url - The URL of the campaign page.
 * @property {string} startDate - The start date of the campaign in ISO format.
 * @property {string} endDate - The end date of the campaign in ISO format.
 * @property {Array<object>} offers - A list of offers for the campaign.
 * @property {string} offers['@type'] - The type of the offer (e.g., "Offer").
 * @property {string} offers.name - The name of the offer.
 * @property {string} offers.description - A description of the offer.
 * @property {string} offers.price - The price of the offer.
 * @property {string} offers.priceCurrency - The currency of the price.
 * @property {string} offers.validThrough - The expiration date of the offer in ISO format.
 * @property {string} offers.availability - The availability of the offer (e.g., "https://schema.org/InStock").
 * @property {string[]} keywords - Keywords for the campaign.
 * @property {string[]} targetAudience - The target audience for the campaign.
 */
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

/**
 * Interface for FAQ schema data.
 * @see https://schema.org/Question
 * @property {string} question - The question.
 * @property {string} answer - The answer.
 */
export interface FAQData {
  question: string;
  answer: string;
}

/**
 * Interface for Breadcrumb item schema data.
 * @see https://schema.org/ListItem
 * @property {string} name - The name of the breadcrumb item.
 * @property {string} url - The URL of the breadcrumb item.
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Interface for Person schema data.
 * @see https://schema.org/Person
 * @property {string} [name] - The name of the person.
 * @property {string} [url] - The URL of the person's profile.
 * @property {string} [image] - The URL of the person's image.
 * @property {string} [jobTitle] - The job title of the person.
 * @property {object} [worksFor] - The organization the person works for.
 * @property {string} worksFor.name - The name of the organization.
 * @property {string} worksFor.url - The URL of the organization.
 * @property {string[]} [sameAs] - URLs of social media profiles.
 * @property {string[]} [knowsAbout] - Topics the person knows about.
 * @property {string} [description] - A description of the person.
 */
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

/**
 * Interface for Resource schema data (e.g., a downloadable PDF).
 * @see https://schema.org/DigitalDocument
 * @property {string} name - The name of the resource.
 * @property {string} description - A description of the resource.
 * @property {string} url - The URL of the resource.
 * @property {string} [fileFormat] - The file format of the resource (e.g., "application/pdf").
 * @property {string} [contentSize] - The size of the resource (e.g., "1.2 MB").
 * @property {string} [encodingFormat] - The encoding format of the resource.
 * @property {string} [datePublished] - The date the resource was published in ISO format.
 * @property {string} [dateModified] - The date the resource was last modified in ISO format.
 * @property {object} [author] - The author of the resource.
 * @property {string} author.name - The name of the author.
 * @property {string} author.url - The URL of the author's profile.
 * @property {object} [publisher] - The publisher of the resource.
 * @property {string} publisher.name - The name of the publisher.
 * @property {string} publisher.url - The URL of the publisher.
 * @property {string[]} [keywords] - Keywords for the resource.
 * @property {string} [inLanguage] - The language of the resource.
 * @property {boolean} [isAccessibleForFree] - Whether the resource is accessible for free.
 * @property {string} [license] - The license of the resource.
 */
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
/**
 * Generates a LocalBusiness schema object.
 * @param {Partial<LocalBusinessData>} [data] - Optional data to override the default business data.
 * @returns {object} The LocalBusiness schema object.
 */
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

/**
 * Generates a Service schema object.
 * @param {ServiceData} serviceData - The data for the service.
 * @returns {object} The Service schema object.
 */
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

/**
 * Generates a FAQPage schema object.
 * @param {FAQData[]} faqs - An array of FAQ data.
 * @returns {object} The FAQPage schema object.
 */
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

/**
 * Generates a BreadcrumbList schema object.
 * @param {BreadcrumbItem[]} breadcrumbs - An array of breadcrumb items.
 * @returns {object} The BreadcrumbList schema object.
 */
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

/**
 * Generates an array of breadcrumb items from a given path.
 * @param {string} path - The path to generate breadcrumbs from.
 * @param {string} [baseUrl=site.url] - The base URL to prepend to the breadcrumb URLs.
 * @returns {BreadcrumbItem[]} An array of breadcrumb items.
 */
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

/**
 * Generates a Person schema object.
 * @param {Partial<PersonData>} [personData] - Optional data to override the default person data.
 * @returns {object} The Person schema object.
 */
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
/**
 * A utility function that wraps a schema generation function in a try/catch block.
 * If the generator function throws an error, it logs the error and returns a fallback value.
 * @template T
 * @param {() => T} generator - The function that generates the schema.
 * @param {T | null} [fallback=null] - The fallback value to return if the generator fails.
 * @returns {T | null} The generated schema or the fallback value.
 */
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
/**
 * Interface for the options object passed to the `generatePageSchema` function.
 * @property {'article' | 'service' | 'faq' | 'home' | 'about' | 'contact' | 'resource' | 'campaign' | 'default'} pageType - The type of the page.
 * @property {string} title - The title of the page.
 * @property {string} description - A description of the page.
 * @property {string} path - The path of the page.
 * @property {string} [datePublished] - The date the page was published in ISO format.
 * @property {string} [dateModified] - The date the page was last modified in ISO format.
 * @property {Partial<PersonData>} [author] - The author of the page.
 * @property {ServiceData} [serviceData] - Data for a service page.
 * @property {FAQData[]} [faqs] - Data for an FAQ page.
 * @property {ResourceData} [resourceData] - Data for a resource page.
 * @property {CampaignData} [campaignData] - Data for a campaign page.
 * @property {boolean} [includeBreadcrumbs] - Whether to include breadcrumbs.
 * @property {boolean} [includeLocalBusiness] - Whether to include local business schema.
 */
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

/**
 * Generates a DigitalDocument schema object for a resource.
 * @param {ResourceData} resourceData - The data for the resource.
 * @returns {object} The DigitalDocument schema object.
 */
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

/**
 * Generates an Event schema object for a campaign.
 * @param {CampaignData} campaignData - The data for the campaign.
 * @returns {object} The Event schema object.
 */
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

/**
 * Generates an array of schema objects for a page.
 * This function acts as a master generator that calls other schema generators based on the page type.
 * @param {PageSchemaOptions} options - The options for generating the page schema.
 * @returns {any[]} An array of schema objects.
 */
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