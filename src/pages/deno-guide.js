import { graphql, Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'

import site from '../../config/site'

import style from '../styles/archive.module.css'

const metaImage = site.image
const DenoPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => (
  <Layout>
    <SEO
      title={`Guide to Deno | ${site.titleAlt}`}
      path="/deno-guide/"
      description="A guide to get started with Deno, the hard and dirty way."
      metaImage={metaImage}
    />
    <main className={style.main}>
      <div className={style.title}>
        <h1 className={style.heading}>
          <span>Guide to Deno</span>
        </h1>
      </div>

      <div className={style.content}>
        <p>
          A guide to get started with&nbsp;
          <a href="http://deno.land/">Deno</a>, the hard and dirty way.
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

DenoPage.propTypes = {
  data: PropTypes.object.isRequired,
}

export const pageQuery = graphql`
  query DenoQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/posts/deno/" }
        fields: { sourceName: { ne: "comments" } }
        frontmatter: {
          categories: { in: "deno-guide" },
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

export default DenoPage
