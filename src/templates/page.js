import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'

import SEO from '../components/seo'
import Layout from '../components/layout'
import Document from '../components/document'
import site from '../../config/site'

const PageTemplate = ({ data }) => {
  const {
    frontmatter: {
      title,
      date,
      date_pretty,
      date_from_now,
      last_modified_at,
      last_modified_at_from_now,
      path,
      image,
      excerpt,
      toc,
    },
    excerpt: autoExcerpt,
    id,
    html,
  } = data.markdownRemark
  const metaImage = image ? image.childImageSharp.fixed : site.image
  const twitterCardType = image ? 'summary_large_image' : 'summary'

  return (
    <Layout>
      <SEO
        title={`${title} - ${site.titleAlt}`}
        path={path}
        datePublished={date}
        dateModified={last_modified_at}
        description={excerpt || autoExcerpt}
        metaImage={metaImage}
        twitterCardType={twitterCardType}
        article
      />
      <main id="main">
        <Document
          key={id}
          title={title}
          hideMeta
          datePublished={date}
          dateModified={last_modified_at}
          datePretty={date_pretty}
          dateFromNow={date_from_now}
          dateModifiedFromNow={last_modified_at_from_now}
          path={path}
          image={image}
          toc={toc}
          html={html}
          author={site.author}
        />
      </main>
    </Layout>
  )
}

export default PageTemplate

PageTemplate.propTypes = {
  data: PropTypes.object.isRequired,
}

export const pageQuery = graphql`
  query($path: String) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      frontmatter {
        title
        date
        date_pretty: date(formatString: "MMMM Do, YYYY")
        date_from_now: date(fromNow: true)
        last_modified_at
        last_modified_at_from_now: last_modified_at(fromNow: true)
        path
        excerpt
        toc
        image {
          childImageSharp {
            fluid(maxWidth: 1100, quality: 75) {
              ...GatsbyImageSharpFluid_noBase64
            }
            fixed(width: 1100, quality: 75) {
              src
              height
              width
            }
          }
        }
      }
      id
      html
      excerpt
    }
  }
`
