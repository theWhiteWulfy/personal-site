import React from 'react'
import { Link, graphql } from 'gatsby'
import StringSimilarity from 'string-similarity'
import Layout from '../components/layout'
import SEO from '../components/seo'
import style from '../styles/archive.module.css'
import site from '../../config/site'

export default ({ location, data }) => {
  const pages = data.allSitePage.nodes.map(({ path }) => path)
  const pathname = location.pathname
  const result = StringSimilarity.findBestMatch(pathname, pages).bestMatch
  function renderContent() {
    return result.rating > 0.6 ? (
      <>
        <h1 className={style.heading}>
          <span>
            You were probably looking for{' '}
            <Link to={result.target} className="is-special-blue">
              {result.target}
            </Link>
          </span>
        </h1>
        <h3 className={style.intro}>
          Not the Pokemon you're after? <br />
          <Link to="/">Go back home</Link> and catch another pokemon.
        </h3>
      </>
    ) : (
      <>
        <h1 className={style.heading}>Yep, you're lost.</h1>
        <h3 className={style.intro}>
          Sorry, the pixels you are looking for are in another castle. But if
          you want to keep exploring this castle, you can go
          <Link to="/">back to the gates</Link>.
        </h3>
      </>
    )
  }

  return (
    <Layout>
      <SEO
        title={`Page not found - ${site.titleAlt}`}
        description="Sorry, but the pixels you are looking for are in another castle."
        metaImage={site.image}
      />
      <main id="main" className={style.main}>
        <div className={style.title}>
          <h1 className={style.heading}>
            <span>404: Not found</span>
          </h1>
        </div>
        <div className={style.content}>
          {renderContent()}
          <Link to="/"></Link>
        </div>
      </main>
    </Layout>
  )
}

export const pageQuery = graphql`
  {
    allSitePage(
      filter: { path: { nin: ["/dev-404-page", "/404", "/404.html"] } }
    ) {
      nodes {
        path
      }
    }
  }
`
