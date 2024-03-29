import React from 'react'
import PropTypes from 'prop-types'
import { graphql, Link } from 'gatsby'
import Img from 'gatsby-image'
import Layout from '../components/layout'
import SEO from '../components/seo'
import Entry from '../components/entry'

import style from '../styles/archive.module.css'

import site from '../../config/site'

const HomePage = ({ data }) => {
  const {
    site: {
      siteMetadata: { author: siteAuthor },
    },
    featuredPosts: { edges: featuredPosts },
    recentPosts: { edges: recentPosts },
  } = data
  return (
    <Layout>
      <SEO
        title={`${site.title}`}
        path="/"
        description={site.description}
        metaImage={site.image}
      />
      <main id="main" className={style.main}>
        <div className={style.title}>
          <h1 className={style.heading}>
            <span>
              Meteoric Teachings is the personal site of{' '}
              <a href="/about/">Alok&nbsp;Prateek</a>.
            </span>
          </h1>
          <div className={style.intro}>
            <p>
              I'm a multi-talented human with over 11+ years of experience in a
              wide range of design disciplines. I have designed, built and
              tinkered with digital products for a considerable time. I'm
              currently self-employed and am working with a selected freelance
              client base.
            </p>
          </div>
          <Img
            fluid={data.aboutImage.childImageSharp.fluid}
            loading="eager"
            fadeIn={false}
            className={style.cover}
            backgroundColor="var(--input-background-color)"
          />
        </div>
        <div className={style.content}>
          <h2 className={style.subHeading}>
            <span>How can I help you?</span>
          </h2>
          <div>
            <p>
              As a freelancer, I love to work with startups, consultancies, and
              established companies. I don't put a lot of stock in job titles,
              but I've been called a product designer, experience designer, UX
              Developer, Information Architect, full-stack developer, webmaster,
              advisor, creative technologist, or by any other market-defined
              function title. I believe that extensive experience has given me
              practical skills allied with real-world pragmatism.
            </p>
            <p>
              Put simply, I'm great at making things work on the web —
              technically, aesthetically, and always rooted in what your user
              needs. I can help you with:
            </p>
            <ul style={{ marginLeft: '3ch' }}>
              <li>ideation/requirement gathering workshops</li>
              <li>brand identity and collaterals</li>
              <li>planning and development of minimum viable product (MVP)</li>
              <li>systems &amp; information architecture</li>
              <li>migration of web infra between cloud providers</li>
            </ul>
            <p>
              If you have an idea, I can surely help. Do get in touch, and we
              can connect anytime.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link
                to="/contact/"
                className="btn"
                style={{ fontSize: 'larger', marginBottom: '4em' }}
              >
                Get in touch with me.
              </Link>
            </div>
          </div>
          <h2 className={style.subHeading}>
            <span>Recent posts</span>
          </h2>
          <div className={style.list}>
            {recentPosts.map(({ node }) => {
              const {
                id,
                excerpt: autoExcerpt,
                timeToRead,
                frontmatter: { title, date, date_pretty, path, excerpt },
              } = node

              return (
                <Entry
                  key={id}
                  title={title}
                  date={date}
                  datePretty={date_pretty}
                  path={path}
                  timeToRead={timeToRead}
                  excerpt={excerpt || autoExcerpt}
                />
              )
            })}
          </div>
          <h2 className={style.subHeading}>
            <span>Featured articles</span>
          </h2>
          <div className={style.gridList}>
            {featuredPosts.map(({ node }) => {
              const {
                id,
                excerpt: autoExcerpt,
                timeToRead,
                frontmatter: {
                  title,
                  date,
                  date_pretty,
                  path,
                  author,
                  excerpt,
                  image,
                },
              } = node

              return (
                <Entry
                  key={id}
                  title={title}
                  date={date}
                  datePretty={date_pretty}
                  path={path}
                  author={author || siteAuthor}
                  timeToRead={timeToRead}
                  image={image}
                  excerpt={excerpt || autoExcerpt}
                />
              )
            })}
          </div>
          <h2 className={style.subHeading}>
            <span>Explore more on this site</span>
          </h2>
          <div>
            <ul className={`${style.gridListExpanded} ${style.navList}`}>
              <li key="articles">
                <Entry
                  key="articles-home-link"
                  title="Articles"
                  path="/articles/"
                  excerpt="<p>Long pieces of text mostly about design and web development.</p>"
                />
              </li>
              <li key="notes">
                <Entry
                  key="notes-home-link"
                  title="Notes"
                  path="/notes/"
                  excerpt="<p>Rants, inspiration, thoughts, and other things you should find in a blog.</p>"
                />
              </li>
              <li key="works">
                <Entry
                  key="works-home-link"
                  title="Works"
                  path="/work/"
                  excerpt="<p>Hand-picked selection of things I've designed, illustrated,
                  and developed.</p>"
                />
              </li>
              <li key="bibliophile-diaries">
                <Entry
                  key="bibliophile-diaries-home-link"
                  title="Bibliophile Diaries"
                  path="/bibliophile-diaries/"
                  excerpt="<p>Lessons and interesting quotes from books I've read.</p>"
                />
              </li>
              <li key="contact">
                <Entry
                  key="contact-home-link"
                  title="Contact"
                  path="/contact/"
                  excerpt="<p>Ideal ways of sending questions, messages, and
                  love letters to me.</p>"
                />
              </li>
              <li key="support">
                <Entry
                  key="support-home-link"
                  title="Show your support"
                  path="/support/"
                  excerpt="<p>Buy me a coffee or maybe why not buy me a tree?</p>"
                />
              </li>
              <li key="faqs">
                <Entry
                  key="faqs-home-link"
                  title="Frequently asked questions"
                  path="/faqs/"
                  excerpt="<p>There&rsquo;s no such thing as a dumb question&hellip;</p>"
                />
              </li>
              <li key="topics">
                <Entry
                  key="topics-home-link"
                  title="All topics"
                  path="/tag/"
                  excerpt="<p>Archive of all posts organized by topic.</p>"
                />
              </li>
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  )
}

HomePage.propTypes = {
  data: PropTypes.object.isRequired,
}

export const pageQuery = graphql`
  query HomeQuery {
    site {
      siteMetadata {
        author {
          name
          url
        }
      }
    }
    featuredPosts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/posts/" }
        fields: { sourceName: { ne: "comments" } }
        frontmatter: {
          featured: { eq: true }
          published: { ne: false }
          output: { ne: false }
        }
      }
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 6
    ) {
      edges {
        node {
          id
          excerpt(format: HTML)
          timeToRead
          frontmatter {
            title
            date
            date_pretty: date(formatString: "MMMM Do, YYYY")
            path
            excerpt
            featured
            categories
            image {
              childImageSharp {
                fluid(maxWidth: 400, quality: 75) {
                  ...GatsbyImageSharpFluid_withWebp_noBase64
                }
              }
            }
          }
        }
      }
    }
    recentPosts: allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/posts/" }
        fields: { sourceName: { ne: "comments" } }
        frontmatter: {
          featured: { ne: true }
          published: { ne: false }
          output: { ne: false }
          categories: { nin: "work" }
        }
      }
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 3
    ) {
      edges {
        node {
          id
          excerpt(format: HTML)
          timeToRead
          frontmatter {
            title
            date
            date_pretty: date(formatString: "MMMM Do, YYYY")
            path
            excerpt
          }
        }
      }
    }
    aboutImage: file(relativePath: { eq: "avatar4.png" }) {
      childImageSharp {
        fluid(
          maxWidth: 720
          maxHeight: 480
          quality: 75
          srcSetBreakpoints: [390, 480, 590, 720, 1440]
        ) {
          ...GatsbyImageSharpFluid_withWebp_noBase64
        }
      }
    }
  }
`

export default HomePage
