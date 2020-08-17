import React from 'react'
import PropTypes from 'prop-types'
import { useStaticQuery, graphql } from 'gatsby'

import Header from './header'
import Footer from './footer'

import '../styles/layout.module.css'
import style from '../styles/grid.module.css'

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
          defaultTheme
          twitterUrl
          githubUrl
          instagramUrl
          feedUrl
          copyrights
          mainMenu {
            title
            path
          }
          footerMenu {
            title
            path
          }
        }
      }
    }
  `)
  const {
    title,
    defaultTheme,
    mainMenu,
    footerMenu,
    twitterUrl,
    githubUrl,
    instagramUrl,
    feedUrl,
    copyrights,
  } = data.site.siteMetadata

  return (
    <div className={style.wrapper}>
      <Header
        siteTitle={title}
        defaultTheme={defaultTheme}
        mainMenu={mainMenu}
      />
      {children}
      <Footer
        footerMenu={footerMenu}
        twitter={twitterUrl}
        github={githubUrl}
        instagram={instagramUrl}
        feed={feedUrl}
        copyrights={copyrights}
      />
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
