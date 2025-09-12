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