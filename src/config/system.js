/**
 * System Configuration Constants
 * 
 * Central location for all system constants, default values, and configuration
 * that are used across the application.
 */



// ============================================================================
// Schema Generation Constants
// ============================================================================

/**
 * Configuration for schema generation.
 * @property {object} BUSINESS - Default business information.
 * @property {string} BUSINESS.PHONE - The phone number of the business.
 * @property {string} BUSINESS.EMAIL - The email address of the business.
 * @property {object} BUSINESS.ADDRESS - The address of the business.
 * @property {string} BUSINESS.ADDRESS.STREET - The street address.
 * @property {string} BUSINESS.ADDRESS.LOCALITY - The locality (e.g., city).
 * @property {string} BUSINESS.ADDRESS.REGION - The region (e.g., state).
 * @property {string} BUSINESS.ADDRESS.POSTAL_CODE - The postal code.
 * @property {string} BUSINESS.ADDRESS.COUNTRY - The country.
 * @property {object} BUSINESS.GEO - The geographical coordinates of the business.
 * @property {number} BUSINESS.GEO.LATITUDE - The latitude.
 * @property {number} BUSINESS.GEO.LONGITUDE - The longitude.
 * @property {string[]} BUSINESS.OPENING_HOURS - The opening hours of the business.
 * @property {string} BUSINESS.PRICE_RANGE - The price range of the business (e.g., "$$").
 * @property {string[]} BUSINESS.AREA_SERVED - The area served by the business.
 * @property {object} PERSON - Default person schema information.
 * @property {string} PERSON.JOB_TITLE - The job title of the person.
 * @property {string[]} PERSON.KNOWS_ABOUT - Topics the person knows about.
 * @property {object} TYPES - Schema types.
 * @property {string} TYPES.ARTICLE - The schema type for an article.
 * @property {string} TYPES.WEB_PAGE - The schema type for a web page.
 * @property {string} TYPES.LOCAL_BUSINESS - The schema type for a local business.
 * @property {string} TYPES.PERSON - The schema type for a person.
 * @property {string} TYPES.SERVICE - The schema type for a service.
 * @property {string} TYPES.FAQ_PAGE - The schema type for an FAQ page.
 * @property {string} TYPES.BREADCRUMB_LIST - The schema type for a breadcrumb list.
 */
export const SCHEMA_CONFIG = {
    // Default business information
    BUSINESS: {
        PHONE: '+91-9315852108',
        EMAIL: 'i@alokprateek.in',
        ADDRESS: {
            STREET: 'Delhi',
            LOCALITY: 'Delhi',
            REGION: 'Delhi',
            POSTAL_CODE: '110001',
            COUNTRY: 'IN'
        },
        GEO: {
            LATITUDE: 28.6139,
            LONGITUDE: 77.2090
        },
        OPENING_HOURS: ['Mo-Fr 09:00-18:00'],
        PRICE_RANGE: '$$',
        AREA_SERVED: ['India', 'Global']
    },

    // Person schema defaults
    PERSON: {
        JOB_TITLE: 'Designer & Developer',
        KNOWS_ABOUT: [
            'Web Design',
            'User Experience Design',
            'Frontend Development',
            'Automation',
            'AI Integration',
            'Whitelabel Solutions'
        ]
    },

    // Schema types
    TYPES: {
        ARTICLE: 'Article',
        WEB_PAGE: 'WebPage',
        LOCAL_BUSINESS: 'LocalBusiness',
        PERSON: 'Person',
        SERVICE: 'Service',
        FAQ_PAGE: 'FAQPage',
        BREADCRUMB_LIST: 'BreadcrumbList'
    }
};

// ============================================================================
// Analytics Configuration
// ============================================================================

/**
 * Configuration for analytics.
 * @property {object} EVENTS - Event types for tracking.
 * @property {string} EVENTS.CONTENT_VIEW - The event type for a content view.
 * @property {string} EVENTS.NEWSLETTER_SIGNUP - The event type for a newsletter signup.
 * @property {string} EVENTS.CONTACT_FORM_SUBMIT - The event type for a contact form submission.
 * @property {object} CATEGORIES - Event categories.
 * @property {string} CATEGORIES.CONTENT - The category for content events.
 * @property {string} CATEGORIES.USER_INTERACTION - The category for user interaction events.
 * @property {string} CATEGORIES.CONVERSION - The category for conversion events.
 * @property {object} DIMENSIONS - Custom dimensions and metrics.
 * @property {string} DIMENSIONS.CONTENT_TYPE - The dimension for content type.
 * @property {string} DIMENSIONS.COLLECTION_NAME - The dimension for collection name.
 */
export const ANALYTICS_CONFIG = {
    // Event types for tracking
    EVENTS: {
        CONTENT_VIEW: 'content_view',
        NEWSLETTER_SIGNUP: 'newsletter_signup',
        CONTACT_FORM_SUBMIT: 'contact_form_submit'
    },

    // Event categories
    CATEGORIES: {
        CONTENT: 'content',
        USER_INTERACTION: 'user_interaction',
        CONVERSION: 'conversion'
    },

    // Custom dimensions and metrics
    DIMENSIONS: {
        CONTENT_TYPE: 'content_type',
        COLLECTION_NAME: 'collection_name'
    }
};

// ============================================================================
// API Configuration
// ============================================================================

/**
 * Configuration for the API.
 * @property {object} RATE_LIMITS - Rate limiting settings.
 * @property {object} RATE_LIMITS.NEWSLETTER - Rate limiting for the newsletter endpoint.
 * @property {number} RATE_LIMITS.NEWSLETTER.WINDOW_MS - The window in milliseconds.
 * @property {number} RATE_LIMITS.NEWSLETTER.MAX_REQUESTS - The maximum number of requests per window.
 * @property {object} RATE_LIMITS.CONTACT_FORM - Rate limiting for the contact form endpoint.
 * @property {number} RATE_LIMITS.CONTACT_FORM.WINDOW_MS - The window in milliseconds.
 * @property {number} RATE_LIMITS.CONTACT_FORM.MAX_REQUESTS - The maximum number of requests per window.
 * @property {object} STATUS_CODES - HTTP status codes.
 * @property {number} STATUS_CODES.SUCCESS - 200 OK.
 * @property {number} STATUS_CODES.CREATED - 201 Created.
 * @property {number} STATUS_CODES.BAD_REQUEST - 400 Bad Request.
 * @property {number} STATUS_CODES.UNAUTHORIZED - 401 Unauthorized.
 * @property {number} STATUS_CODES.FORBIDDEN - 403 Forbidden.
 * @property {number} STATUS_CODES.NOT_FOUND - 404 Not Found.
 * @property {number} STATUS_CODES.TOO_MANY_REQUESTS - 429 Too Many Requests.
 * @property {number} STATUS_CODES.INTERNAL_ERROR - 500 Internal Server Error.
 * @property {object} CONTENT_TYPES - Content types.
 * @property {string} CONTENT_TYPES.JSON - application/json.
 * @property {string} CONTENT_TYPES.FORM - application/x-www-form-urlencoded.
 * @property {string} CONTENT_TYPES.TEXT - text/plain.
 */
export const API_CONFIG = {
    // Rate limiting
    RATE_LIMITS: {
        NEWSLETTER: {
            WINDOW_MS: 300000, // 5 minutes
            MAX_REQUESTS: 3
        },
        CONTACT_FORM: {
            WINDOW_MS: 300000, // 5 minutes
            MAX_REQUESTS: 5
        }
    },

    // Response codes
    STATUS_CODES: {
        SUCCESS: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        TOO_MANY_REQUESTS: 429,
        INTERNAL_ERROR: 500
    },

    // Content types
    CONTENT_TYPES: {
        JSON: 'application/json',
        FORM: 'application/x-www-form-urlencoded',
        TEXT: 'text/plain'
    }
};



// ============================================================================
// Validation Constants
// ============================================================================

/**
 * Configuration for validation.
 * @property {object} CONTENT - Content validation settings.
 * @property {number} CONTENT.TITLE_MIN_LENGTH - The minimum length of a title.
 * @property {number} CONTENT.TITLE_MAX_LENGTH - The maximum length of a title.
 * @property {number} CONTENT.EXCERPT_MIN_LENGTH - The minimum length of an excerpt.
 * @property {number} CONTENT.EXCERPT_MAX_LENGTH - The maximum length of an excerpt.
 * @property {RegExp} CONTENT.SLUG_PATTERN - The pattern for a valid slug.
 * @property {object} USER_INPUT - User input validation settings.
 * @property {number} USER_INPUT.NAME_MIN_LENGTH - The minimum length of a name.
 * @property {number} USER_INPUT.NAME_MAX_LENGTH - The maximum length of a name.
 * @property {RegExp} USER_INPUT.EMAIL_PATTERN - The pattern for a valid email address.
 * @property {RegExp} USER_INPUT.URL_PATTERN - The pattern for a valid URL.
 * @property {object} SECURITY - Security validation settings.
 * @property {string[]} SECURITY.ALLOWED_HTML_TAGS - The allowed HTML tags in user input.
 * @property {number} SECURITY.MAX_REQUEST_SIZE - The maximum request size in bytes.
 * @property {number} SECURITY.CSRF_TOKEN_LENGTH - The length of the CSRF token.
 */
export const VALIDATION = {
    // Content validation
    CONTENT: {
        TITLE_MIN_LENGTH: 1,
        TITLE_MAX_LENGTH: 200,
        EXCERPT_MIN_LENGTH: 10,
        EXCERPT_MAX_LENGTH: 500,
        SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    },

    // User input validation
    USER_INPUT: {
        NAME_MIN_LENGTH: 2,
        NAME_MAX_LENGTH: 100,
        EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        URL_PATTERN: /^https?:\/\/.+/
    },

    // Security validation
    SECURITY: {
        ALLOWED_HTML_TAGS: ['p', 'br', 'strong', 'em', 'a', 'code'],
        MAX_REQUEST_SIZE: 1024 * 1024, // 1MB
        CSRF_TOKEN_LENGTH: 32
    }
};

// ============================================================================
// Performance Configuration
// ============================================================================

/**
 * Configuration for performance.
 * @property {object} CACHE - Cache settings.
 * @property {number} CACHE.STATIC_ASSETS_TTL - The TTL for static assets in seconds.
 * @property {number} CACHE.API_RESPONSE_TTL - The TTL for API responses in seconds.
 * @property {number} CACHE.DATABASE_QUERY_TTL - The TTL for database queries in seconds.
 * @property {object} RESOURCE_HINTS - Resource hints.
 * @property {string[]} RESOURCE_HINTS.DNS_PREFETCH - A list of domains to prefetch DNS for.
 * @property {string[]} RESOURCE_HINTS.PRECONNECT - A list of domains to preconnect to.
 */
export const PERFORMANCE_CONFIG = {
    // Cache settings
    CACHE: {
        STATIC_ASSETS_TTL: 31536000, // 1 year
        API_RESPONSE_TTL: 300, // 5 minutes
        DATABASE_QUERY_TTL: 60 // 1 minute
    },

    // Resource hints
    RESOURCE_HINTS: {
        DNS_PREFETCH: [
            '//fonts.googleapis.com',
            '//fonts.gstatic.com',
            '//www.google-analytics.com',
            '//www.googletagmanager.com',
            '//clarity.microsoft.com',
            '//webmention.io'
        ],
        PRECONNECT: [
            'https://www.google-analytics.com',
            'https://www.googletagmanager.com'
        ]
    }
};

// ============================================================================
// Error Messages
// ============================================================================

/**
 * A collection of error messages.
 * @property {object} API - API error messages.
 * @property {string} API.INVALID_REQUEST - The error message for an invalid request.
 * @property {string} API.MISSING_PARAMETERS - The error message for missing parameters.
 * @property {string} API.RATE_LIMIT_EXCEEDED - The error message for an exceeded rate limit.
 * @property {string} API.UNAUTHORIZED - The error message for unauthorized access.
 * @property {string} API.INTERNAL_ERROR - The error message for an internal server error.
 * @property {object} VALIDATION - Validation error messages.
 * @property {string} VALIDATION.INVALID_EMAIL - The error message for an invalid email format.
 * @property {string} VALIDATION.INVALID_URL - The error message for an invalid URL format.
 * @property {string} VALIDATION.CONTENT_TOO_LONG - The error message for content that is too long.
 * @property {string} VALIDATION.REQUIRED_FIELD - The error message for a required field.
 */
export const ERROR_MESSAGES = {
    // API errors
    API: {
        INVALID_REQUEST: 'Invalid request format',
        MISSING_PARAMETERS: 'Required parameters missing',
        RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
        UNAUTHORIZED: 'Unauthorized access',
        INTERNAL_ERROR: 'Internal server error'
    },

    // Validation errors
    VALIDATION: {
        INVALID_EMAIL: 'Invalid email format',
        INVALID_URL: 'Invalid URL format',
        CONTENT_TOO_LONG: 'Content exceeds maximum length',
        REQUIRED_FIELD: 'This field is required'
    }
};

// ============================================================================
// Success Messages
// ============================================================================

/**
 * A collection of success messages.
 * @property {string} NEWSLETTER_SUBSCRIBED - The success message for a newsletter subscription.
 * @property {string} CONTACT_FORM_SUBMITTED - The success message for a contact form submission.
 */
export const SUCCESS_MESSAGES = {
    NEWSLETTER_SUBSCRIBED: 'Successfully subscribed to newsletter',
    CONTACT_FORM_SUBMITTED: 'Contact form submitted successfully'
};

// ============================================================================
// Default Export
// ============================================================================

export default {
    SCHEMA_CONFIG,
    ANALYTICS_CONFIG,
    API_CONFIG,
    VALIDATION,
    PERFORMANCE_CONFIG,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES
};