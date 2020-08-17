import React from 'react'
import { graphql } from 'gatsby'
import Comment from './comment'

import style from '../../styles/comments-list.module.css'

const Comments = data => {
  const {
    commentsList: { edges: comments },
  } = data

  const commentTitle = commentLength => {
    if (commentLength < 1) {
      return 'No comments'
    }
    if (commentLength === 1) {
      return '1 comment'
    }
    return `${commentLength} comments`
  }

  // // Check if comments exist
  // if (Object.keys(comments).length === 0) {
  //   return null
  // }
  const commentsList =
    comments && comments.length ? (
      comments.map(({ node }) => {
        const {
          id,
          frontmatter: { name, email, friendlyDate, iso8601Date },
          html,
        } = node

        return (
          <Comment
            key={id}
            name={name}
            friendlyDate={friendlyDate}
            iso8601Date={iso8601Date}
            email={email}
          >
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </Comment>
        )
      })
    ) : (
      <></>
    )

  return (
    <>
      <h2 className={style.title}>{commentTitle(comments.length)}</h2>
      {commentsList}
    </>
  )
}

export default Comments

export const commentsByPath = graphql`
  fragment commentsQueryFragment on Query {
    comments: allMarkdownRemark(
      filter: {
        fields: { sourceName: { eq: "comments" } }
        frontmatter: { _parent: { eq: $path }, published: { ne: false } }
      }
      sort: { fields: frontmatter___date, order: ASC }
    ) {
      edges {
        node {
          ...commentAttributesFragment
        }
      }
    }
  }
`
