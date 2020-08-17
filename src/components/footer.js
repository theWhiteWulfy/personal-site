import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'

import TwitterIcon from './icons/twitter-icon'
import GithubIcon from './icons/github-icon'
import InstagramIcon from './icons/instagram-icon'
import RSSIcon from './icons/rss-icon'

import style from '../styles/footer.module.css'

const FooterMenu = ({ footerMenu }) => {
  const menu = footerMenu.slice(0)

  return menu.map((menuItem, index) => (
    <li key={index}>
      <Link to={menuItem.path}>{menuItem.title}</Link>
    </li>
  ))
}

const Footer = ({
  footerMenu,
  twitter,
  github,
  instagram,
  feed,
  copyrights,
}) => (
  <footer id="footer" className={style.footer}>
    <ul className={style.menu}>
      <FooterMenu footerMenu={footerMenu} />
    </ul>
    <ul className={style.menuSocial}>
      {twitter && (
        <li>
          <a href={twitter} rel="nofollow">
            <TwitterIcon />
            <span className={style.iconLabel}>Twitter</span>
          </a>
        </li>
      )}
      {github && (
        <li>
          <a href={github} rel="nofollow">
            <GithubIcon />
            <span className={style.iconLabel}>GitHub</span>
          </a>
        </li>
      )}
      {instagram && (
        <li>
          <a href={instagram} rel="nofollow">
            <InstagramIcon />
            <span className={style.iconLabel}>Instagram</span>
          </a>
        </li>
      )}
      {feed && (
        <li>
          <a href={feed}>
            <RSSIcon />
            <span className={style.iconLabel}>RSS feed</span>
          </a>
        </li>
      )}
    </ul>
    {copyrights && (
      <div
        className={style.copyright}
        dangerouslySetInnerHTML={{
          __html: copyrights,
        }}
      />
    )}
  </footer>
)

Footer.propTypes = {
  footerMenu: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      path: PropTypes.string,
    })
  ),
  twitter: PropTypes.string,
  github: PropTypes.string,
  instagram: PropTypes.string,
  feed: PropTypes.string,
  copyrights: PropTypes.string,
}

export default Footer
