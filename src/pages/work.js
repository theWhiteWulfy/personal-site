import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
// import Octicon, { MarkGithub } from '@githubprimer/octicons-react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import Entry from '../components/entry'
// import Repository from '../components/repository'

import style from '../styles/archive.module.css'

import site from '../../config/site'

const WorksPage = ({ data }) => {
  const {
    site: {
      siteMetadata: { author: siteAuthor },
    },
    allMarkdownRemark: { edges: posts },
    // githubData: { data: github },
  } = data
  return (
    <Layout>
      <SEO
        title={`Works - ${site.title}`}
        path="/work/"
        description="A selection of things I've designed, illustrated, and developed."
        metaImage={site.image}
      />
      <main id="main" className={style.main}>
        <div className={style.title}>
          <h1 className={style.heading}>
            <span>Works</span>
          </h1>
        </div>
        <div className={style.content}>
          <div className={style.intro}>
            <p>
              A selection of things I&rsquo;ve designed, illustrated, and
              developed.
            </p>
          </div>
          <h2 className={style.subHeading}>
            <span>Featured work</span>
          </h2>
          <div className={style.gridList}>
            {posts.map(({ node }) => {
              const {
                id,
                excerpt: autoExcerpt,
                frontmatter: { title, path, author, image, excerpt },
              } = node

              return (
                <Entry
                  key={id}
                  title={title}
                  path={path}
                  author={author || siteAuthor}
                  image={image}
                  excerpt={excerpt || autoExcerpt}
                />
              )
            })}
          </div>
        </div>
      </main>
    </Layout>
  )
}

WorksPage.propTypes = {
  data: PropTypes.object.isRequired,
}

export const pageQuery = graphql`
  query WorksQuery {
    site {
      siteMetadata {
        author {
          name
          url
        }
      }
    }
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/posts/" }
        fields: { sourceName: { ne: "comments" } }
        frontmatter: { categories: { in: "work" }, published: { ne: false } }
      }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          id
          excerpt(format: HTML)
          timeToRead
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            path
            author
            excerpt
            featured
            categories
            image {
              childImageSharp {
                fluid(maxWidth: 400, quality: 75) {
                  ...GatsbyImageSharpFluid_noBase64
                }
              }
            }
          }
        }
      }
    }
  }
`

export default WorksPage
