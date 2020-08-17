/* eslint-disable prefer-object-spread */
const postcssPresetEnv = require('postcss-preset-env')
const postcssNested = require('postcss-nested')
const postcssUrl = require('postcss-url')
const postcssImports = require('postcss-import')
const postcssMixins = require('postcss-mixins')
const cssnano = require('cssnano')

const site = require('./config/site')

require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
  siteMetadata: {
    siteUrl: `${site.url}/`,
    title: site.title,
    titleAlt: site.titleAlt,
    description: site.description,
    image: site.image,
    headline: site.headline,
    siteLanguage: site.siteLanguage,
    ogLanguage: site.ogLanguage,
    pingbackUrl: site.pingbackUrl,
    webmentionUrl: site.webmentionUrl,
    micropubUrl: site.micropubUrl,
    coilUrl: site.coilUrl,
    author: {
      name: site.author.name,
      url: site.author.url,
    },
    twitter: site.twitter,
    twitterUrl: site.twitterUrl,
    facebook: site.facebook,
    githubUrl: site.githubUrl,
    instagramUrl: site.instagramUrl,
    feedUrl: site.feedUrl,

    // Site config
    copyrights: `&copy; 2004&mdash;${new Date().getFullYear()} <a href="https://mademistakes.com/humans.txt">Michael Rose</a>. Some Rights Reserved.<br />Built in Buffalo, New York. (<a href="https://github.com/mmistakes/made-mistakes-gatsby" rel="nofollow">view source</a>)`,
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
  },
  plugins: [
    'babel-preset-gatsby',
    'gatsby-plugin-preact',
    'gatsby-plugin-react-helmet',
    'gatsby-transformer-yaml',
    {
      resolve: `gatsby-source-github-api`,
      options: {
        token: process.env.GITHUB_API_TOKEN,
        graphQLQuery: site.githubApiQuery,
        variables: site.githubApiVariables,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
        ignore: [/\/(node_modules|\.git)\//],
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'posts',
        path: `${__dirname}/src/posts`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'pages',
        path: `${__dirname}/src/pages`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'comments',
        path: `${__dirname}/src/comments`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/data`,
      },
    },
    'gatsby-remark-source-name',
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-2011187-1',
        head: false,
        anonymize: true,
        respectDNT: true,
        cookieDomain: 'mademistakes.com',
      },
    },
    'gatsby-plugin-catch-links',
    {
      resolve: 'gatsby-plugin-postcss',
      options: {
        postCssPlugins: [
          postcssUrl(),
          postcssImports(),
          postcssMixins(),
          postcssNested(),
          postcssPresetEnv({
            importFrom: 'src/styles/variables.modules.css',
            stage: 1,
            features: {
              'custom-properties': true,
              'custom-media-queries': true,
              'color-mod-function': true,
              'nesting-rules': true,
            },
          }),
          cssnano({
            preset: 'default',
          }),
        ],
      },
    },
    'gatsby-plugin-css-customs',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-plugin-sharp',
      options: {
        useMozJpeg: false,
        stripMetadata: true,
        defaultQuality: 75,
      },
    },
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        excerpt_separator: `<!--more-->`,
        plugins: [
          'gatsby-remark-copy-linked-files',
          {
            resolve: 'gatsby-remark-embed-video',
            options: {
              related: false,
              noIframeBorder: true,
              urlOverrides: [
                {
                  id: 'youtube',
                  embedURL: (videoId) =>
                    `https://www.youtube-nocookie.com/embed/${videoId}`,
                },
              ],
            },
          },
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 1100,
              quality: 75,
              wrapperStyle: `background-color: var(--input-background-color);`,
              disableBgImage: true,
              backgroundColor: 'none',
              tracedSVG: false,
              loading: 'lazy',
              linkImagesToOriginal: false,
            },
          },
          {
            resolve: '@weknow/gatsby-remark-twitter',
            options: {
              hideThread: true,
              hideMedia: false,
              align: 'center',
            },
          },
          'gatsby-remark-lazy-load',
          {
            resolve: 'gatsby-remark-smartypants',
            options: {
              dashes: 'oldschool',
            },
          },
          {
            resolve: 'gatsby-remark-custom-blocks',
            options: {
              blocks: {
                notice: {
                  classes: 'notice',
                  title: 'optional',
                },
              },
            },
          },
          'gatsby-remark-abbr',
          'gatsby-remark-numbered-footnotes',
          'gatsby-remark-responsive-iframe',
          {
            resolve: 'gatsby-remark-autolink-headers',
            options: {
              icon: `<svg aria-hidden="true" focusable="false" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>`,
              removeAccents: true,
              enableCustomId: true,
            },
          },
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              classPrefix: 'language-',
              inlineCodeMarker: null,
              aliases: {},
              showLineNumbers: false,
              noInlineHighlight: false,
            },
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-sitemap',
      options: {
        output: '/sitemap.xml',
        exclude: ['/dev-404-page', '/404', '/404.html'],
        createLinkInHead: true,
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }

            allSitePage {
              edges {
                node {
                  path
                }
              }
            }
        }`,
        serialize: ({ site, allSitePage }) =>
          allSitePage.edges.map((edge) => {
            return {
              url: site.siteMetadata.siteUrl + edge.node.path,
              changefreq: 'daily',
              priority: 0.7,
            }
          }),
      },
    },
    {
      resolve: 'gatsby-plugin-feed',
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
              }
            }
          }
        `,
        setup: ({
          query: {
            site: { siteMetadata },
            ...rest
          },
        }) => {
          return {
            ...siteMetadata,
            ...rest,
            custom_namespaces: {
              webfeeds: 'http://webfeeds.org/rss/1.0',
            },
            custom_elements: [
              {
                'webfeeds:logo': site.url + site.favicon,
              },
              {
                'webfeeds:icon': site.url + site.favicon,
              },
              { 'webfeeds:accentColor': '000000' },
            ],
          }
        },
        feeds: [
          {
            query: `
              {
                allMarkdownRemark(
                  limit: 25,
                  filter: {
                    fileAbsolutePath: { regex: "/posts/" }
                    fields: { sourceName: { ne: "comments" } }
                    frontmatter: { published: { ne: false }, output: { ne: false } }
                  }
                  sort: { fields: [frontmatter___date], order: DESC }
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      frontmatter {
                        title
                        excerpt
                        path
                        date
                        image {
                          childImageSharp {
                            fixed(width: 1100) {
                              src
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map((edge) => {
                const {
                  node: {
                    frontmatter: { title, date, path, excerpt, image },
                    excerpt: autoExcerpt,
                    html,
                  },
                } = edge

                const permalink = site.siteMetadata.siteUrl + path
                const imageElement = image
                  ? `<p><img src="${
                      site.siteMetadata.siteUrl +
                      image.childImageSharp.fixed.src
                    }" alt=""></p>`
                  : ``
                let mainContent = html
                // Hacky workaround for relative paths https://github.com/gaearon/overreacted.io/issues/65
                mainContent = mainContent
                  .replace(/href="\//g, `href="${site.siteMetadata.siteUrl}/`)
                  .replace(/src="\//g, `src="${site.siteMetadata.siteUrl}/`)
                  .replace(
                    /"\/static\//g,
                    `"${site.siteMetadata.siteUrl}/static/`
                  )
                  .replace(
                    /,\s*\/static\//g,
                    `,${site.siteMetadata.siteUrl}/static/`
                  )
                  // Replace data-src with src from remark lazyload plugin
                  .replace(/data-src=/g, 'src=')
                  // Replace data-srcset with srcset from remark lazyload plugin
                  .replace(/data-srcset=/g, 'srcset=')
                const footerContent = `<p><a href="${
                  site.siteMetadata.siteUrl + edge.node.frontmatter.path
                }">${
                  edge.node.frontmatter.title
                }</a> was originally published on Made Mistakes.</p>`

                return Object.assign({}, edge.node.frontmatter, {
                  title,
                  description: excerpt || autoExcerpt,
                  date,
                  url: permalink,
                  guid: permalink,
                  custom_elements: [
                    {
                      'content:encoded':
                        imageElement + mainContent + footerContent,
                    },
                  ],
                })
              })
            },
            output: '/atom.xml',
            title: `${site.title} RSS Feed`,
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: site.title,
        short_name: site.titleAlt,
        start_url: '/',
        background_color: site.backgroundColor,
        theme_color: site.themeColor,
        display: 'standalone',
        icon: `src${site.favicon}`,
      },
    },
  ],
}
