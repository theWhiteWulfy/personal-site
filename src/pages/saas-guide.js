import { graphql, Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'

import site from '../../config/site'

import style from '../styles/archive.module.css'

const metaImage = site.image
const SaasPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => (
  <Layout>
    <SEO
      title={`SaaS Guide | ${site.titleAlt}`}
      path="/saas-guide/"
      description="Getting started with building your own software as a service platform."
      metaImage={metaImage}
    />
    <main className={style.main}>
      <div className={style.title}>
        <h1 className={style.heading}>
          <span>SaaS Guide</span>
        </h1>
      </div>

      <div className={style.content}>
        <p>
          For the past one year I've been accumulating my knowledge in the field
          of Software-as-a-Service and got several leads. This is my attempt to
          attempt to put that knowledge into one single place and organize
          facts, information, my thoughts, and opinions at one single place.
        </p>
        <p>
          My plan was to complete a post a day, but the challenge is eating way
          too much time. Instead I’m going to keep things as they are happen
          happen as they happen.
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

SaasPage.propTypes = {
  data: PropTypes.object.isRequired,
}

export const pageQuery = graphql`
  query SaasQuery {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/posts/saas-guide/" }
        fields: { sourceName: { ne: "comments" } }
        frontmatter: {
          categories: { in: "saas-guide" },
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

export default SaasPage
