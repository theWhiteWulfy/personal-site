module.exports = {
  // pathPrefix: '/', // Prefix for all links. If you deploy your site to example.com/portfolio your pathPrefix should be "portfolio"
  title: 'Made Mistakes', // Navigation and site title
  titleAlt: 'Made Mistakes', // Title for schema.org JSONLD
  description: 'Personal website of designer Michael Rose (@mmistakes).',
  url: 'https://mademistakes.com', // Domain of your site. No trailing slash!
  siteLanguage: 'en', // Language Tag on <html> element
  image: {
    // Used for SEO, relative to /static/ folder
    src: '/images/made-mistakes-logo.png',
    width: 384,
    height: 384,
  },
  ogLanguage: 'en_US', // Facebook Language
  pingbackUrl: 'https://webmention.io/mademistakes.com/xmlrpc',
  webmentionUrl: 'https://webmention.io/mademistakes.com/webmention',
  micropubUrl: 'https://mm-micropub-to-github.herokuapp.com/micropub/main',
  coilUrl: '$coil.xrptipbot.com/AbwB-yidQNanSI2lYyTJJw',
  googleAnalyticsID: '',
  staticmanApi:
    'https://mm-staticman.herokuapp.com/v2/entry/mmistakes/made-mistakes-gatsby/master/comments',

  // JSONLD / Manifest
  favicon: '/images/made-mistakes-logo.png', // Used for manifest favicon generation
  shortName: 'Made Mistakes', // shortname for manifest. MUST be shorter than 12 characters
  author: {
    // Author for schema.org JSONLD
    name: 'Michael Rose',
    url: 'https://mademistakes.com',
  },
  themeColor: '#ffffff',
  backgroundColor: '#111111',

  twitter: '@mmistakes', // Twitter username
  twitterUrl: 'https://twitter.com/mmistakes',
  facebook: 'Made Mistakes', // Facebook site name
  githubUrl: 'https://github.com/mmistakes',
  instagramUrl: 'https://www.instagram.com/mmistakes/',
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
    siteKey: '6LdRBykTAAAAAFB46MnIu6ixuxwu9W1ihFF8G60Q',
    secret:
      'uK2DH+wELCxTtM0MmfKfT0W5GPt0B+dGVZ3L4IeYtnKRQ7a/zkdRUmi0z6J7K4BumST/CKuKnk4l3EUpDxWnA0E29kpMzbmhukm0vXCZfGg6zLETxcPXTWcrRchAp59oe77OdRlXjNe01nqL6fohmFv5lBT1SrxfORvBxvSsyTrrBXG1b5JJLleP9o4LGDK15lPCASEehWxpNTs+jxE/VUemMvedGautUBQyK5PRGaKJQb+xe9wl+9GgwueASRbGPl6yUnytUFy3V59yg+WbhbJJhA3dEKW4vnUu4jcgLL8FusCQQjDSvy0Ypqq3Dfx35L5YVfmLW+FrtYNvoD6zhA==',
  },
}
