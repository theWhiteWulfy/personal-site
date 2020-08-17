import React from 'react'
import { Helmet } from 'react-helmet'
import PropTypes from 'prop-types'
import { useStaticQuery, graphql } from 'gatsby'
import OpenGraph from './open-graph'
import TwitterCard from './twitter-card'

const SEO = ({
  title,
  description,
  metaImage,
  twitterCardType,
  path,
  article,
  datePublished,
  dateModified,
}) => {
  const { site } = useStaticQuery(query)

  const {
    buildTime,
    siteMetadata: {
      siteUrl,
      defaultTitle,
      defaultDescription,
      defaultBanner,
      siteLanguage,
      ogLanguage,
      pingbackUrl,
      webmentionUrl,
      micropubUrl,
      coilUrl,
      author,
      twitter,
      facebook,
    },
  } = site

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${metaImage.src || defaultBanner}`,
    url: `${siteUrl}${path || ''}`,
  }

  // schema.org in JSONLD format
  // https://developers.google.com/search/docs/guides/intro-structured-data

  const schemaOrgWebPage = {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    url: siteUrl,
    inLanguage: siteLanguage,
    mainEntityOfPage: siteUrl,
    description: defaultDescription,
    name: defaultTitle,
    author: {
      '@type': 'Person',
      name: author.name,
    },
    copyrightHolder: {
      '@type': 'Person',
      name: author.name,
    },
    creator: {
      '@type': 'Person',
      name: author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: defaultTitle,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}${defaultBanner}`,
      },
    },
    datePublished,
    dateModified: buildTime,
    image: {
      '@type': 'ImageObject',
      url: seo.image,
    },
  }

  let schemaArticle = null

  if (article) {
    schemaArticle = {
      '@context': 'http://schema.org',
      '@type': 'Article',
      author: {
        '@type': 'Person',
        name: author.name,
      },
      creator: {
        '@type': 'Person',
        name: author.name,
      },
      publisher: {
        '@type': 'Organization',
        name: defaultTitle,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}${defaultBanner}`,
        },
      },
      headline: seo.title,
      datePublished,
      dateModified,
      description: seo.description,
      inLanguage: siteLanguage,
      url: seo.url,
      name: seo.title,
      image: {
        '@type': 'ImageObject',
        url: seo.image,
      },
      mainEntityOfPage: seo.url,
    }
  }

  return (
    <>
      <Helmet title={seo.title}>
        <html lang={siteLanguage} />
        <link rel="canonical" href={seo.url} />
        {pingbackUrl && <link rel="pingback" href={pingbackUrl} />}
        {webmentionUrl && <link rel="webmention" href={webmentionUrl} />}
        {micropubUrl && <link rel="micropub" href={micropubUrl} />}
        {coilUrl && <meta name="monetization" content={coilUrl} />}
        <meta name="description" content={seo.description} />
        <meta name="image" content={seo.image} />
        {/* Insert schema.org data conditionally (webpage/article) */}
        {!article && (
          <script type="application/ld+json">
            {JSON.stringify(schemaOrgWebPage)}
          </script>
        )}
        {article && (
          <script type="application/ld+json">
            {JSON.stringify(schemaArticle)}
          </script>
        )}
      </Helmet>
      <OpenGraph
        description={seo.description}
        image={seo.image}
        title={seo.title}
        type={article ? 'article' : 'website'}
        url={seo.url}
        locale={ogLanguage}
        name={facebook}
      />
      <TwitterCard
        type={twitterCardType}
        title={seo.title}
        image={seo.image}
        description={seo.description}
        username={twitter}
      />
    </>
  )
}

export default SEO

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  datePublished: PropTypes.string,
  dateModified: PropTypes.string,
  metaImage: PropTypes.shape({
    src: PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number,
  }),
  path: PropTypes.string,
  article: PropTypes.bool,
}

SEO.defaultProps = {
  title: null,
  description: null,
  datePublished: null,
  dateModified: null,
  metaImage: null,
  path: null,
  article: false,
}

const query = graphql`
  query SEO {
    site {
      buildTime(formatString: "YYYY-MM-DD")
      siteMetadata {
        siteUrl
        defaultTitle: title
        defaultDescription: description
        defaultBanner: image {
          src
        }
        siteLanguage
        ogLanguage
        pingbackUrl
        webmentionUrl
        micropubUrl
        coilUrl
        author {
          name
          url
        }
        twitter
        facebook
      }
    }
  }
`
