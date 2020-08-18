import { graphql, Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'

import site from '../../config/site'

import style from '../styles/archive.module.css'

const metaImage = site.image
const IllustrationPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => (
  <Layout>
    <SEO
      title={`Vector Illustrations | ${site.titleAlt}`}
      path="/illustrations/"
      description="Illustrations made digitally."
      metaImage={metaImage}
    />
    <main className={style.main}>
      <div className={style.title}>
        <h1 className={style.heading}>
          <span>Vector Illustrations</span>
        </h1>
      </div>

      <div className={style.content}>
        <p>
          Vector Illustrations and graphics have become a staple essentials of
          the web as they engage, fascinate and connect audiences to your brand.
          I have experience of designing all sorts of graphics for the web as
          well as the print media. This collection gallery can guide you in
          exploring my works.
        </p>
        <p>
          If you scroll down far enough you can see how my technique has evolved
          from 2008 to present date.
        </p>

        <ul>
          {edges.map((post) => (
            <li key={post.node.id}>
              <Link to={post.node.frontmatter.path}>
                {post.node.frontmatter.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  </Layout>
)

IllustrationPage.propTypes = {
  data: PropTypes.object.isRequired,
}

export const pageQuery = graphql`
  query IllustrationQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/posts/illustrations/" }
        fields: { sourceName: { ne: "comments" } }
        frontmatter: {
          categories: { in: "illustrations" },
          published: { ne: false },
          output: { ne: false }
        }
      }
      sort: { fields: [frontmatter___order], order: ASC }
    ) {
      edges {
        node {
          id
          frontmatter {
            path
            title
          }
          fileAbsolutePath
        }
      }
    }
  }
`

export default IllustrationPage
