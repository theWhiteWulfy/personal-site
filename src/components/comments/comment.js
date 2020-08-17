import React from 'react'
import { graphql } from 'gatsby'
import PropTypes from 'prop-types'

import style from '../../styles/comment.module.css'

const Comment = props => {
  const { name, email, friendlyDate, iso8601Date, children } = props

  return (
    <div className={style.comment}>
      <div className={style.avatar}>
        <img
          src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
          data-srcset={`https://www.gravatar.com/avatar/${email}?d=mm&s=60 1x, https://www.gravatar.com/avatar/${email}?d=mm&s=120 2x`}
          alt=""
          className="lazyload"
        />
      </div>
      <div className={style.main}>
        <header className={style.meta}>
          <strong className={`${style.name} "h-card"`}>{name}</strong> on{' '}
          <time dateTime={iso8601Date}>{friendlyDate}</time>
        </header>
        <div className={style.message}>{children}</div>
      </div>
    </div>
  )
}

Comment.propTypes = {
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  friendlyDate: PropTypes.string.isRequired,
  iso8601Date: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}

export default Comment

export const commentQuery = graphql`
  fragment commentAttributesFragment on MarkdownRemark {
    id
    frontmatter {
      name
      email
      friendlyDate: date(formatString: "MMMM DD, YYYY")
      iso8601Date: date
      published
    }
    html
  }
`
