import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import firebase from './firebase'
import TwitterIcon from './icons/twitter-icon'
import LinkedinIcon from './icons/linkedin-icon'
import GithubIcon from './icons/github-icon'
import InstagramIcon from './icons/instagram-icon'
import RSSIcon from './icons/rss-icon'

import style from '../styles/footer.module.css'

const FooterMenu = ({ footerMenu }) => {
  const menu = footerMenu.slice(0)

  return menu.map((menuItem, index) => (
    <li key={index}>
      <Link href={menuItem.path}>{menuItem.title}</Link>
    </li>
  ))
}

const NewsletterForm = () => {
  // useState() hook captures the value from the input value
  const [subsemail, setEmail] = useState('')
  const [visible, setVisible] = useState(true)
  const visiblityconditional = visible
    ? 'contact-form-show'
    : 'contact-form-hide'
  const visiblityunconditional = visible
    ? 'contact-form-hide'
    : 'contact-form-show'
  // The onSubmit function we takes the 'e' or event and submits it to Firebase
  const onNLSubmit = (e) => {
    e.preventDefault() // preventDefault is important because it prevents the whole page from reloading
    firebase
      .firestore()
      .collection('newsletter')
      .add({
        subsemail,
        timestamp: new Date().toISOString(),
      })
      // then will reset the form to nothing
      .then(() => {
        setVisible(!visible)
      })
  }

  return (
    <div className="custom-block notice newsletter-footer">
      <div className="custom-block-heading nw-title">
        <strong>Subscribe to my monthly newsletter!</strong>
      </div>
      <form
        id="newsletter-form"
        name="newsletter-form"
        acceptCharset="UTF-8"
        autoComplete="off"
        encType="multipart/form-data"
        method="post"
        onSubmit={onNLSubmit}
      >
        <div className={`${'form-group' + ' '}${visiblityconditional}`}>
          <label htmlFor="subsemail">
            Please enter your email ID
            <input
              id="subsemail"
              name="subsemail"
              type="email"
              spellCheck="false"
              maxLength={511}
              placeholder="This will remain private."
              required
              pattern="[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
              value={subsemail}
              onChange={(e) => setEmail(e.currentTarget.value)}
            />
          </label>
        </div>
        <div className={`${'form-group' + ' '}${visiblityconditional}`}>
          <button
            id="saveNLForm"
            name="saveNLForm"
            className="btn submit"
            type="submit"
          >
            Sign me up!
          </button>
        </div>

        <div
          className={`${'custom-block-body' + ' '}${visiblityunconditional}`}
        >
          You have successfully registered for my newsletter!
        </div>
      </form>
    </div>
  )
}

const Footer = ({
  footerMenu,
  twitter,
  github,
  linkedin,
  instagram,
  feed,
  copyrights,
}) => (
  <footer id="footer" className={style.footer}>
    <ul className={style.menu}>
      <FooterMenu footerMenu={footerMenu} />
    </ul>
    <ul className={style.menuSocial}>
      {linkedin && (
        <li>
          <a href={linkedin} rel="nofollow">
            <LinkedinIcon />
            <span className={style.iconLabel}>LinkedIn</span>
          </a>
        </li>
      )}
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
    <NewsletterForm />
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
  linkedin: PropTypes.string,
  feed: PropTypes.string,
  copyrights: PropTypes.string,
}

export default Footer
