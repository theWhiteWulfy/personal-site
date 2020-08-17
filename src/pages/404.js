import React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'

import style from '../styles/archive.module.css'

import site from '../../config/site'

const NotFoundPage = () => (
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
        <p>Sorry, but the pixels you are looking for are in another castle.</p>
      </div>
    </main>
  </Layout>
)

export default NotFoundPage
