/**
 * @typedef {object} SiteConfig
 * @property {string} title - The title of the site.
 * @property {string} titleAlt - The alternative title for schema.org JSONLD.
 * @property {string} description - The description of the site.
 * @property {string} url - The URL of the site.
 * @property {string} siteLanguage - The language of the site.
 * @property {object} image - The main image for the site.
 * @property {string} image.src - The source of the image.
 * @property {number} image.width - The width of the image.
 * @property {number} image.height - The height of the image.
 * @property {string} ogLanguage - The language for Open Graph tags.
 * @property {string} feedUrl - The URL of the RSS feed.
 * @property {string} copyrights - The copyright notice.
 * @property {string} defaultTheme - The default theme of the site.
 * @property {number} postsPerPage - The number of posts to display per page.
 * @property {string} favicon - The path to the favicon.
 * @property {string} shortName - The short name for the manifest.
 * @property {object} author - The author of the site.
 * @property {string} author.name - The name of the author.
 * @property {string} author.url - The URL of the author's profile.
 * @property {string} themeColor - The theme color for the manifest.
 * @property {string} backgroundColor - The background color for the manifest.
 * @property {object} analytics - The analytics configuration.
 * @property {object} analytics.ga4 - The Google Analytics 4 configuration.
 * @property {string} analytics.ga4.measurementId - The GA4 measurement ID.
 * @property {boolean} analytics.ga4.enhancedMeasurement - Whether to enable enhanced measurement.
 * @property {string[]} analytics.ga4.conversionEvents - A list of conversion events.
 * @property {object} analytics.ga4.customDimensions - Custom dimensions for GA4.
 * @property {object} analytics.ga4.customMetrics - Custom metrics for GA4.
 * @property {object} analytics.clarity - The Microsoft Clarity configuration.
 * @property {string} analytics.clarity.projectId - The Clarity project ID.
 * @property {boolean} analytics.clarity.enableHeatmaps - Whether to enable heatmaps.
 * @property {boolean} analytics.clarity.enableRecordings - Whether to enable recordings.
 * @property {string} analytics.clarity.privacyMode - The privacy mode for Clarity.
 * @property {boolean} analytics.clarity.cookieConsent - Whether to require cookie consent for Clarity.
 * @property {object} analytics.privacy - The privacy configuration.
 * @property {boolean} analytics.privacy.enableOptOut - Whether to enable the opt-out feature.
 * @property {boolean} analytics.privacy.cookieConsentRequired - Whether cookie consent is required.
 * @property {number} analytics.privacy.dataRetentionDays - The number of days to retain data.
 * @property {boolean} analytics.privacy.anonymizeIp - Whether to anonymize IP addresses.
 * @property {boolean} analytics.privacy.respectDoNotTrack - Whether to respect the Do Not Track header.
 * @property {string} analytics.privacy.consentStorageKey - The key for storing consent in local storage.
 * @property {boolean} analytics.enabled - Whether analytics is enabled.
 * @property {boolean} analytics.debug - Whether to enable debug mode for analytics.
 * @property {string} pingbackUrl - The URL for pingbacks.
 * @property {string} webmentionUrl - The URL for webmentions.
 * @property {string} micropubUrl - The URL for micropub.
 * @property {string} staticmanApi - The URL for the Staticman API.
 * @property {string} twitter - The Twitter username.
 * @property {string} twitterUrl - The URL of the Twitter profile.
 * @property {string} facebook - The Facebook site name.
 * @property {string} linkedinUrl - The URL of the LinkedIn profile.
 * @property {string} githubUrl - The URL of the GitHub profile.
 * @property {string} instagramUrl - The URL of the Instagram profile.
 * @property {string} whatsappUrl - The URL for WhatsApp.
 * @property {string} emailAddress - The email address.
 * @property {string} emailUrl - The mailto link for the email address.
 * @property {string} githubApiToken - The GitHub API token.
 * @property {object} reCaptcha - The reCAPTCHA configuration.
 * @property {string} reCaptcha.siteKey - The reCAPTCHA site key.
 * @property {string} reCaptcha.secret - The reCAPTCHA secret key.
 * @property {Array<object>} mainMenu - The main menu items.
 * @property {Array<object>} footerMenu - The footer menu items.
 */
const site = {
  // pathPrefix: '/', // Prefix for all links. If you deploy your site to example.com/portfolio your pathPrefix should be "portfolio"
  title: 'Meteoric Teachings', // Navigation and site title
  titleAlt: 'Meteoric Teachings', // Title for schema.org JSONLD
  // eslint-disable-next-line prettier/prettier
  description: 'Alok Prateek is a multi-talented human with over 11+ years of experience in a wide range of design disciplines.',
  url: 'https://alokprateek.in', // Domain of your site. No trailing slash!
  siteLanguage: 'en', // Language Tag on <html> element
  image: {
    // Used for SEO, relative to /static/ folder
    src: '/images/theme/alok-logo.png',
    width: 675,
    height: 675,
  },
  ogLanguage: 'en_US', // Facebook Language

  // Site config
  feedUrl: '/rss.xml',
  copyrights: `&copy; 2010&mdash;${new Date().getFullYear()} <a href="https://alokprateek.in/humans.txt">Alok Prateek</a>. Some Rights Reserved.<br />Built with crafty intentions in Delhi, India.`,
  defaultTheme: 'light',
  postsPerPage: 10,

  // JSONLD / Manifest
  favicon: '/images/theme/alok-logo.png', // Used for manifest favicon generation
  shortName: 'Meteoric Teachings', // shortname for manifest. MUST be shorter than 12 characters
  author: {
    // Author for schema.org JSONLD
    name: 'Alok Prateek',
    url: 'https://alokprateek.in',
  },
  themeColor: '#ffffff',
  backgroundColor: '#111111',
  
  // Analytics Configuration
  analytics: {
    ga4: {
      measurementId: 'G-RGPN7NRJDQ', 
      enhancedMeasurement: true,
      conversionEvents: [
        'phone_click',
        'form_submit', 
        'resource_download',
        'email_click'
      ],
      customDimensions: {
        content_group1: 'custom_dimension_1', // Collection type
        content_group2: 'custom_dimension_2', // Category/tag
      },
      customMetrics: {
        engagement_score: 'custom_metric_1',
        conversion_value: 'custom_metric_2',
      }
    },
    clarity: {
      projectId: 'sw2f0ourfn', // Replace with actual Clarity project ID
      enableHeatmaps: true,
      enableRecordings: true,
      privacyMode: 'balanced',
      cookieConsent: true,
    },
    privacy: {
      enableOptOut: true,
      cookieConsentRequired: true,
      dataRetentionDays: 365,
      anonymizeIp: true,
      respectDoNotTrack: true,
      consentStorageKey: 'meteoric_analytics_consent',
    },
    enabled: true,
    debug: false, // Set to true for development
  },

  // Indie web
  pingbackUrl: 'https://webmention.io/alokprateek.in/xmlrpc',
  webmentionUrl: 'https://webmention.io/alokprateek.in/webmention',
  micropubUrl: '', //todo: add url after creating the api for micropub
  staticmanApi:
    'https://meteoric-teachings.herokuapp.com/v2/entry/theWhiteWulfy/personal-site/master/comments',

  // Social links and ids
  twitter: '@thewhitewulfy', // Twitter username
  twitterUrl: 'https://twitter.com/thewhitewulfy',
  facebook: 'Meteoric Teachings', // Facebook site name
  linkedinUrl: 'https://www.linkedin.com/in/alokprateek/',
  githubUrl: 'https://github.com/thewhitewulfy',
  instagramUrl: 'https://www.instagram.com/thewhitewulfy/',
  whatsappUrl: 'https://wa.me/919315852108', // WhatsApp number with country code
  emailAddress: 'i@alokprateek.in', // Email address
  emailUrl: 'mailto:i@alokprateek.in',

  // tokens and keys
  githubApiToken: process.env.GITHUB_API_TOKEN,
  reCaptcha: {
    siteKey: '',
    secret:
      // eslint-disable-next-line max-len
      '',
  },


  // Menus - header(main) & footer
  mainMenu: [
    {
      title: 'Articles',
      path: '/articles/',
    },
    {
      title: 'Services',
      path: '/services/',
    },
    {
      title: 'Works',
      path: '/works/',
    },
    {
      title: 'About',
      path: '/about/',
    },
    {
      title: 'Contact',
      path: '/contact/',
    },
  ],
  footerMenu: [
    {
      title: 'Support me',
      path: '/support/',
    },
    {
      title: 'FAQs',
      path: '/faqs/',
    },
    {
      title: 'Terms & policies',
      path: '/terms/',
    },
    {
      title: 'Sitemap',
      path: '/sitemap/',
    },
  ],
  
}

export default site;