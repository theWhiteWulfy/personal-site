import React, { lazy, Suspense } from 'react'
import PropTypes from 'prop-types'
import { graphql, Link } from 'gatsby'
import { useInView } from 'react-intersection-observer'

import SEO from '../components/seo'
import Layout from '../components/layout'
import Document from '../components/document'
import CommentsList from '../components/comments/comments-list'
// import CommentForm from '../components/comments/comment-form'
import Pagination from '../components/pagination'
import site from '../../config/site'

import style from '../styles/post.module.css'

const CommentForm = lazy(() => import('../components/comments/comment-form'))

const PostTemplate = ({ data, pageContext }) => {
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
      tags,
      toc,
      comments: commentsEnabled,
      comments_locked: commentsLocked,
      hide_meta: hideMeta,
    },
    excerpt: autoExcerpt,
    timeToRead,
    tableOfContents,
    id,
    html,
  } = data.markdownRemark
  const { comments } = data
  const { next, previous } = pageContext
  const metaImage = image ? image.childImageSharp.fixed : site.image
  const twitterCardType = image ? 'summary_large_image' : 'summary'
  const previousPath = previous && previous.frontmatter.path
  const previousLabel = previous && previous.frontmatter.title
  const nextPath = next && next.frontmatter.path
  const nextLabel = next && next.frontmatter.title
  const [ref, inView] = useInView({
    triggerOnce: true,
  })

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
          hideMeta={hideMeta}
          datePublished={date}
          dateModified={last_modified_at}
          datePretty={date_pretty}
          dateFromNow={date_from_now}
          dateModifiedFromNow={last_modified_at_from_now}
          path={path}
          author={site.author}
          timeToRead={timeToRead}
          toc={toc}
          tableOfContents={tableOfContents}
          image={image}
          html={html}
          tags={tags}
          previousPost={previous}
          nextPost={next}
        />
        <section className={style.comments}>
          {commentsEnabled && (
            <>
              {comments && <CommentsList commentsList={comments} />}
              {commentsLocked ? (
                <div className="custom-block notice">
                  <div className="custom-block-heading">
                    Comments are closed
                  </div>
                  <div className="custom-block-body">
                    If you have a question concerning the content of this page,
                    please feel free to <Link to="/contact/">contact me</Link>.
                  </div>
                </div>
              ) : (
                <div ref={ref}>
                  {inView && (
                    <Suspense fallback={<div>Loading...</div>}>
                      <CommentForm slug={path} />
                    </Suspense>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Pagination
        previousPath={previousPath}
        previousLabel={previousLabel}
        nextPath={nextPath}
        nextLabel={nextLabel}
      />
    </Layout>
  )
}

export default PostTemplate

PostTemplate.propTypes = {
  data: PropTypes.object.isRequired,
  pageContext: PropTypes.shape({
    next: PropTypes.object,
    previous: PropTypes.object,
  }),
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
        author
        excerpt
        tags
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
        toc
        comments
        comments_locked
        hide_meta
      }
      id
      html
      excerpt
      timeToRead
      tableOfContents(pathToSlugField: "frontmatter.path", maxDepth: 3)
    }
    ...commentsQueryFragment
  }
`
