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
  googleAnalyticsID: 'UA-85177250-1',

  // Indie web
  pingbackUrl: 'https://webmention.io/alokprateek.in/xmlrpc',
  webmentionUrl: 'https://webmention.io/alokprateek.in/webmention',
  micropubUrl: 'https://mm-micropub-to-github.herokuapp.com/micropub/main',
  staticmanApi:
    'https://meteoric-teachings.herokuapp.com/v2/entry/theWhiteWulfy/personal-site/master/comments',

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

  twitter: '@thewhitewulfy', // Twitter username
  twitterUrl: 'https://twitter.com/thewhitewulfy',
  facebook: 'Meteoric Teachings', // Facebook site name
  linkedinUrl: 'https://www.linkedin.com/in/alokprateek/',
  githubUrl: 'https://github.com/thewhitewulfy',
  instagramUrl: 'https://www.instagram.com/thewhitewulfy/',
  feedUrl: '/atom.xml',
  githubApiToken: process.env.GITHUB_API_TOKEN,
  reCaptcha: {
    siteKey: '6LeYVMQZAAAAAEgY7amRTLlepClKbmkcxbrr5-yG',
    secret:
      // eslint-disable-next-line max-len
      'F3N1PkfFCaf3RAhFf1J8+OYqRSxmOtPrD2K7bI8NkdvG8j8tfoU7EG3RWcOqG2CSLTdHCfD2Tt+888SF0ZkYwWDpSkELxVB3lmzAo9Ah18fNQ2P9lswpW1yMa6vd2IZL8qf4CJ0Kxew6UabcCW0moJ60Hc7Pp0zG4cViehD1a9S2JQ6Jarg4KZ2kYtLFBbO2zzrxqSAlyb3WTwtoMibAHLvBVXU6Wf90aJt8ejD1VADaPq7HiXJZhI/70NHMPtKcVCQkuy20Z4Vt6EDDX7u+5u70FdfUNTB6X2eqiklT5+M+G8Goaj4BoUjzNBToXKrFThJKDDXTX8kC7BBAeoz933IYSbAJJxIwkF/icMCdYriUPSI/1GgryylSseOb7x5opHWEX/9Z7ooYKhJq6pQzqmOVuM6gH9C13stNp+8IK2VJlcxLAhsOpKc9Frze2AMR3LpvirgLvR2cvCsJttK06ebznoldVyCdFmeI1RVZjSvQhY8cpnGjrSWNptPs3hVfsBVo8NDutDIooRy3EKTErRdrvFg66VKlHuub2HTYcEs2nWhDSsJImYLFEIGsq5PPY0u6giSI0xi5xWxGWmVyA27ZR9blMLIkYI3EBGyFze6fSUMuzK+C2YbUrxFdu3PZnndd0LGtpHZgZQncJKfRuJiEQ6j3YZ705H1E5y3Ap9Q=',
  },
  // Site config
  copyrights: `&copy; 2010&mdash;${new Date().getFullYear()} <a href="https://alokprateek.in/humans.txt">Alok Prateek</a>. Some Rights Reserved.<br />Built with crafty intentions in Delhi, India.`,
  defaultTheme: 'light',
  postsPerPage: 10,
  mainMenu: [
    {
      title: 'Articles',
      path: '/articles/',
    },
    {
      title: 'Notes',
      path: '/notes/',
    },
    {
      title: 'Works',
      path: '/work/',
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