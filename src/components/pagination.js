import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'

import style from '../styles/pagination.module.css'

const Pagination = ({ nextPath, previousPath, nextLabel, previousLabel }) =>
  previousPath || nextPath ? (
    <nav className={style.pagination}>
      {previousPath ? (
        <Link to={previousPath} rel="prev" className={style.item}>
          <span className={style.iconPrev}>←</span>
          <span className={style.itemText}>{previousLabel}</span>
        </Link>
      ) : (
        <div className={style.item} />
      )}
      {nextPath ? (
        <Link
          to={nextPath}
          rel="next"
          className={`${style.item} ${style.itemRight}`}
        >
          <span className={style.itemText}>{nextLabel}</span>
          <span className={style.iconNext}>→</span>
        </Link>
      ) : (
        <div className={style.item} />
      )}
    </nav>
  ) : null

Pagination.propTypes = {
  nextPath: PropTypes.string,
  previousPath: PropTypes.string,
  nextLabel: PropTypes.string,
  previousLabel: PropTypes.string,
}

export default Pagination
