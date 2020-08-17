module.exports = {
  // pathPrefix: '/', // Prefix for all links. If you deploy your site to example.com/portfolio your pathPrefix should be "portfolio"
  title: 'Metoric Teachings', // Navigation and site title
  titleAlt: 'Metoric Teachings', // Title for schema.org JSONLD
  description: 'Personal website of developer and designer Alok Prateek (@thewhitewulfy).',
  url: 'https://alokprateek.in', // Domain of your site. No trailing slash!
  siteLanguage: 'en', // Language Tag on <html> element
  image: {
    // Used for SEO, relative to /static/ folder
    src: '/images/theme/alok-logo.png',
    width: 512,
    height: 512,
  },
  ogLanguage: 'en_US', // Facebook Language
  pingbackUrl: 'https://webmention.io/alokprateek.in/xmlrpc',
  webmentionUrl: 'https://webmention.io/alokprateek.in/webmention',
  micropubUrl: 'https://mm-micropub-to-github.herokuapp.com/micropub/main',
  coilUrl: '$coil.xrptipbot.com/AbwB-yidQNanSI2lYyTJJw',
  googleAnalyticsID: '',
  staticmanApi:
    'https://mm-staticman.herokuapp.com/v2/entry/mmistakes/made-mistakes-gatsby/master/comments',

  // JSONLD / Manifest
  favicon: '/images/theme/alok-logo.png', // Used for manifest favicon generation
  shortName: 'Metoric Teachings', // shortname for manifest. MUST be shorter than 12 characters
  author: {
    // Author for schema.org JSONLD
    name: 'Alok Prateek',
    url: 'https://alokprateek.in',
  },
  themeColor: '#ffffff',
  backgroundColor: '#111111',

  twitter: '@thewhitewulfy', // Twitter username
  twitterUrl: 'https://twitter.com/thewhitewulfy',
  facebook: 'Metoric Teachings', // Facebook site name
  linkedinUrl: 'https://www.linkedin.com/in/alokprateek/',
  githubUrl: 'https://github.com/thewhitewulfy',
  instagramUrl: 'https://www.instagram.com/thewhitewulfy/',
  feedUrl: '/atom.xml',
  githubApiToken: process.env.GITHUB_API_TOKEN,
  githubApiQuery: `query ($number_of_repos: Int!) {
    viewer {
      name
      avatarUrl
      isHireable
      resourcePath
      repositories(last: $number_of_repos, privacy: PUBLIC, orderBy: { field: STARGAZERS, direction:ASC } ) {
        nodes {
          name
          description
          homepageUrl
          forkCount
          createdAt
          updatedAt
          resourcePath
          languages(last: 1, orderBy: { field: SIZE, direction:ASC } ) {
            edges {
              node {
                name
                color
              }
            }
          }
          licenseInfo {
            name
          }
          stargazers {
            totalCount
          }
        }
      }
    }
  }`,
  githubApiVariables: {
    number_of_repos: 5,
  },
  reCaptcha: {
    siteKey: '6Ld6GbkZAAAAADbn1evv7zBU3XAUADBmRw8Tz4bn',
    secret: '6Ld6GbkZAAAAAGJ6psvqF-9sHf3H8BTouWxvW7ww',
  },
}
