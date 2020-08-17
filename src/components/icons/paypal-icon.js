import React from 'react'
import PropTypes from 'prop-types'

import style from '../../styles/icon.module.css'

function PaypalIcon({ className }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      height="16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${style.icon}`}
    >
      <path d="M14.38 3.74a3.09 3.09 0 00-.52-.5 5.87 5.87 0 01-.13 1.53 6.34 6.34 0 01-2.17 3.65 6.35 6.35 0 01-4 1.38H5.29l-.73 3.36a1.44 1.44 0 01-1.4 1.14h-1l-.18.83a.69.69 0 00.14.6.72.72 0 00.56.27h2.45a.73.73 0 00.71-.57l.84-3.93h2.79A5.49 5.49 0 0014.99 7a3.76 3.76 0 00-.61-3.26z" />
      <path d="M3.87 13l.84-3.93h2.85a5.62 5.62 0 003.58-1.22 5.63 5.63 0 001.94-3.24 3.77 3.77 0 00-.61-3.29 3.85 3.85 0 00-3-1.32h-6.1a.74.74 0 00-.71.57L.02 12.71a.72.72 0 00.7.87h2.45a.72.72 0 00.7-.58zM6.11 2.77h1.92a1.36 1.36 0 011.1.52 1.51 1.51 0 01.22 1.32 2.45 2.45 0 01-2.24 1.87H5.27z" />
    </svg>
  )
}

PaypalIcon.propTypes = {
  className: PropTypes.string,
}

PaypalIcon.defaultProps = {
  className: undefined,
}

export default PaypalIcon
