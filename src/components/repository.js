import React from 'react'
import Octicon, { Law, Star } from '@githubprimer/octicons-react'

import style from '../styles/repository.module.css'

const RepositoryHeader = ({ repo }) => {
  return (
    <div className={style.header}>
      <h3 className={style.name}>
        <a
          href={`https://github.com${repo.resourcePath}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {repo.name}
        </a>
      </h3>
    </div>
  )
}

const FooterItem = ({ children }) => (
  <span className={style.footerItem}>{children}</span>
)

const RepositoryFooter = ({ repo }) => {
  const language = repo.languages.edges[0].node

  return (
    <div className={style.footer}>
      <FooterItem>
        <span
          className={style.languageBadge}
          style={{
            backgroundColor: language.color,
          }}
        />{' '}
        {language.name}
      </FooterItem>
      <FooterItem>
        <Octicon icon={Star} verticalAlign="text-top" />{' '}
        {repo.stargazers.totalCount}
      </FooterItem>
      {repo.licenseInfo && (
        <FooterItem>
          <Octicon icon={Law} verticalAlign="text-top" />{' '}
          {repo.licenseInfo.name}
        </FooterItem>
      )}
      <FooterItem>Updated: {repo.updatedAt}</FooterItem>
    </div>
  )
}

const RepositoryDescription = ({ repo }) => (
  <div className={style.description}>
    <p>{repo.description}</p>
  </div>
)

const Repository = ({ repo }) => {
  return (
    <div className={style.repository}>
      <RepositoryHeader repo={repo} />
      <RepositoryDescription repo={repo} />
      <RepositoryFooter repo={repo} />
    </div>
  )
}

export default Repository
