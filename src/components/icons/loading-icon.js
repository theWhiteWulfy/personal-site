import React from 'react'
import PropTypes from 'prop-types'

import style from '../../styles/icon.module.css'

function LoadingIcon({ className }) {
  return (
    <svg
      viewBox="0 0 16 16"
      height="16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${style.icon}`}
    >
      <title>Loading...</title>
      <path d="M12.44 4.57a.75.75 0 10-.75-.75.76.76 0 00.75.75zm1.86 2.76a.94.94 0 10.94.94.93.93 0 00-.94-.94zm-1.86 4.43a1.12 1.12 0 101.11 1.11 1.09 1.09 0 00-1.11-1.11zM7.9 13.37a1.32 1.32 0 000 2.63 1.32 1.32 0 100-2.63zm-4.51-2a1.5 1.5 0 101.5 1.5 1.5 1.5 0 00-1.5-1.5zm-.31-3.1A1.54 1.54 0 101.54 9.8a1.55 1.55 0 001.54-1.53zm.31-6.09a1.65 1.65 0 101.64 1.64 1.64 1.64 0 00-1.64-1.64zM7.9 0a1.94 1.94 0 101.94 1.94A1.94 1.94 0 007.9 0z" />
    </svg>
  )
}

LoadingIcon.propTypes = {
  className: PropTypes.string,
}

LoadingIcon.defaultProps = {
  className: undefined,
}

export default LoadingIcon
