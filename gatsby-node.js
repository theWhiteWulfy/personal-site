const _ = require('lodash-addons')
const { paginate } = require('gatsby-awesome-pagination')
const { forEach, uniq, filter, not, isNil, flatMap } = require('rambdax')
const path = require('path')
const sharp = require('sharp')

const postTemplate = path.resolve(`./src/templates/post.js`)
const pageTemplate = path.resolve(`./src/templates/page.js`)
const categoriesTemplate = path.resolve(`./src/templates/categories.js`)
const tagsTemplate = path.resolve(`./src/templates/tags.js`)

// Sharp GLib-CRITICAL fix
// https://github.com/gatsbyjs/gatsby/issues/6291#issuecomment-505097465
sharp.simd(false)
sharp.cache(false)

exports.createPages = ({ actions, graphql, getNodes }) => {
  const { createPage } = actions
  const allNodes = getNodes()

  return graphql(`
    {
      posts: allMarkdownRemark(
        filter: {
          fields: { sourceName: { eq: "posts" } }
          frontmatter: { published: { ne: false }, output: { ne: false } }
        }
        sort: { fields: [frontmatter___date], order: DESC }
      ) {
        edges {
          node {
            frontmatter {
              path
              title
              categories
              tags
            }
            fileAbsolutePath
          }
        }
      }
      pages: allMarkdownRemark(
        filter: {
          fields: { sourceName: { eq: "pages" } }
          frontmatter: { published: { ne: false } }
        }
      ) {
        edges {
          node {
            frontmatter {
              path
              title
            }
            fileAbsolutePath
          }
        }
      }
      site {
        siteMetadata {
          postsPerPage
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      return Promise.reject(result.errors)
    }

    const {
      site: { siteMetadata },
    } = result.data

    const postsNodes = allNodes.filter(
      ({ internal, fileAbsolutePath, frontmatter }) =>
        internal.type === 'MarkdownRemark' &&
        fileAbsolutePath.indexOf('/posts/') !== -1 &&
        frontmatter.published !== false
    )
    const posts = result.data.posts.edges
    const pages = result.data.pages.edges

    // Create Markdown posts
    posts.forEach(({ node }, index) => {
      const previous = index === posts.length - 1 ? null : posts[index + 1].node
      const next = index === 0 ? null : posts[index - 1].node
      createPage({
        path: node.frontmatter.path,
        component: postTemplate,
        context: {
          next,
          previous,
        },
      })
    })

    // Create Markdown pages
    pages.forEach(({ node }) => {
      createPage({
        path: node.frontmatter.path,
        component: pageTemplate,
      })
    })

    // Create paginated category pages
    const categories = ['articles', 'mastering-paper', 'notes']
    // const categories = filter(
    //   category => not(isNil(category)),
    //   uniq(flatMap(post => post.frontmatter.categories, postsNodes))
    // )

    forEach(category => {
      const postsWithCategory = postsNodes.filter(
        post =>
          post.frontmatter.categories &&
          post.frontmatter.categories.indexOf(category) !== -1
      )

      const categoryPrefix = ({ pageNumber }) =>
        pageNumber === 0 ? `/${category}/` : `/${category}/page`

      paginate({
        createPage,
        items: postsWithCategory,
        component: categoriesTemplate,
        itemsPerPage: siteMetadata.postsPerPage,
        pathPrefix: categoryPrefix,
        context: {
          category,
        },
      })
    }, categories)

    // Create tag pages
    const tags = filter(
      tag => not(isNil(tag)),
      uniq(flatMap(post => post.frontmatter.tags, postsNodes))
    )

    forEach(tag => {
      const postsWithTag = postsNodes.filter(
        post =>
          post.frontmatter.tags && post.frontmatter.tags.indexOf(tag) !== -1
      )

      const tagPrefix = ({ pageNumber }) =>
        pageNumber === 0
          ? `/tag/${_.slugify(tag)}/`
          : `/tag/${_.slugify(tag)}/page`

      paginate({
        createPage,
        items: postsWithTag,
        component: tagsTemplate,
        itemsPerPage: siteMetadata.postsPerPage,
        pathPrefix: tagPrefix,
        context: {
          tag,
        },
      })
    }, tags)

    return {
      categories,
      tags,
    }
  })
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type MarkdownRemark implements Node {
      frontmatter: Frontmatter!
    }

    type Frontmatter {
      title: String!
      date: Date @dateformat
      last_modified_at: Date @dateformat
      author: String
      path: String!
      categories: [String!]
      tags: [String!]
      excerpt: String
      image: File @fileByRelativePath
      thumbnail: File @fileByRelativePath
      published: Boolean
      toc: Boolean
      featured: Boolean
      comments: Boolean
      comments_locked: Boolean
      hide_meta: Boolean
      _parent: String!
    }

    type TaxonomyYaml implements Node {
      id: String!
      name: String
      excerpt: String
      html: String
    }
  `
  createTypes(typeDefs)
}
