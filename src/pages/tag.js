import { graphql, Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'

import site from '../../config/site'

import style from '../styles/archive.module.css'

const _ = require('lodash-addons')

const metaImage = site.image

// Sort object alphabetically function
const propComparator = (propName) => (a, b) =>
  a[propName].toLowerCase() == b[propName].toLowerCase()
    ? 0
    : a[propName].toLowerCase() < b[propName].toLowerCase()
    ? -1
    : 1

const TagsPage = ({
  data: {
    allMarkdownRemark: { group },
  },
}) => (
  <Layout>
    <SEO
      title={`All tags | ${site.titleAlt}`}
      path="/tag/"
      description="An archive of posts organized by topic."
      metaImage={metaImage}
    />
    <main id="main" className={style.main}>
      <div className={style.title}>
        <h1 className={style.heading}>
          <span>All tags</span>
        </h1>
      </div>
      <div className={style.content}>
        <h2 className={style.subHeading}>
          <span>Browse by topic</span>
        </h2>
        <div className={style.columnList}>
          <ul>
            {group.sort(propComparator(`fieldValue`)).map((tag) => (
              <li key={tag.fieldValue}>
                <Link to={`/tag/${_.slugify(tag.fieldValue)}/`}>
                  <strong>{tag.fieldValue}</strong>{' '}
                  <span className={style.count}>{tag.totalCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  </Layout>
)

TagsPage.propTypes = {
  data: PropTypes.object.isRequired,
}

export const pageQuery = graphql`
  query TagsQuery {
    allMarkdownRemark(filter: { frontmatter: { published: { ne: false } } }) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }
    }
  }
`

export default TagsPage
