import React from 'react'
import PropTypes from 'prop-types'

import style from '../../styles/icon.module.css'

function ReplyIcon({ className }) {
  return (
    <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
      height="16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${style.icon}`}
    >
      <path d="M11.6 12.8l-1-1 2.7-2.7H5.5C.2 9.1 0 3.9 0 3.7v-.5h1.4v.5c0 .2 0 4.1 4.1 4.1h7.8L10.6 5l1-1L16 8.4l-4.4 4.4z" />
    </svg>
  )
}

ReplyIcon.propTypes = {
  className: PropTypes.string,
}

ReplyIcon.defaultProps = {
  className: undefined,
}

export default ReplyIcon
