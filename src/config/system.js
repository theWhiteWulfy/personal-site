/**
 * System Configuration Constants
 * 
 * Central location for all system constants, default values, and configuration
 * that are used across the application.
 */



// ============================================================================
// Schema Generation Constants
// ============================================================================

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