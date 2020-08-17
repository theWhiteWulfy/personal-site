import React from 'react'
import Masonry from 'react-masonry-component'
import Img from 'gatsby-image'
import PropTypes from 'prop-types'
import { graphql, Link } from 'gatsby'
import SEO from '../components/seo'
import Layout from '../components/layout'

import site from '../../config/site'
import style from '../styles/document.module.css'

const metaImage = site.image

// This would normally be in a Redux store or some other global data store.
if (typeof window !== `undefined`) {
  window.postsToShow = 20
}

class Gallery extends React.Component {
  constructor() {
    super()
    let postsToShow = 20
    if (typeof window !== `undefined`) {
      postsToShow = window.postsToShow
    }

    this.state = {
      showingMore: postsToShow > 20,
      postsToShow,
    }
  }

  componentDidMount() {
    window.addEventListener(`scroll`, this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener(`scroll`, this.handleScroll)
    window.postsToShow = this.state.postsToShow
  }

  handleScroll = () => {
    if (!this.ticking) {
      this.ticking = true
      requestAnimationFrame(() => this.update())
    }
  }

  update() {
    const distanceToBottom =
      document.documentElement.offsetHeight -
      (window.pageYOffset + window.innerHeight)
    if (this.state.showingMore && distanceToBottom < 100) {
      this.setState(prevState => ({ postsToShow: prevState.postsToShow + 20 }))
    }
    this.ticking = false
  }

  render() {
    const posts = this.props.data.allMarkdownRemark.edges.map(e => e.node)
    const postsSize = this.props.data.allMarkdownRemark.edges.length

    return (
      <Layout>
        <SEO
          title={`PaperFaces iPad project - ${site.title}`}
          path="/paperfaces/"
          description="PaperFaces portraits painted digitally with Paper for
          iOS on an iPad. Find time lapse videos, in-process screenshots, and more."
          metaImage={metaImage}
        />
        <main id="main" className={style.document}>
          <div className={style.title}>
            <h1 className={style.heading}>
              <span>PaperFaces iPad project</span>
            </h1>
          </div>
          {this.props.data.file.childImageSharp.fluid && (
            <Img
              fluid={this.props.data.file.childImageSharp.fluid}
              className={style.cover}
              backgroundColor="var(--input-background-color)"
            />
          )}
          <div className={style.content}>
            <p>
              PaperFaces was an illustration project by designer Michael Rose —
              hey that’s me! For two years I drew the faces of strangers
              everyday using an iPad, a stylus, and{' '}
              <strong>Paper for iOS</strong>. I occasionally post new portraits
              here, but certainly not as frequently as I used to.
            </p>
            <p>
              If you scroll down far enough you can see how my technique evolved
              from faceless gestures into realistic portraits.
            </p>
          </div>
          <div className={style.gallery}>
            <Masonry className={style.grid}>
              {posts.slice(0, this.state.postsToShow).map(post => {
                const image = post.frontmatter.thumbnail
                  ? post.frontmatter.thumbnail
                  : post.frontmatter.image

                return (
                  <div key={post.id} className={style.gridItem}>
                    <Link to={post.frontmatter.path}>
                      <Img
                        fluid={image.childImageSharp.fluid}
                        backgroundColor="var(--input-background-color)"
                      />
                    </Link>
                  </div>
                )
              })}
            </Masonry>
            {postsSize <= this.postsToShow ||
              (!this.state.showingMore && (
                <button
                  type="button"
                  data-testid="load-more"
                  className={style.loadMore}
                  onClick={() => {
                    this.setState({
                      postsToShow: this.state.postsToShow + 20,
                      showingMore: true,
                    })
                  }}
                >
                  Load more
                </button>
              ))}
          </div>
        </main>
      </Layout>
    )
  }
}

Gallery.propTypes = {
  data: PropTypes.object.isRequired,
}

export const pageQuery = graphql`
  query PaperfacesQuery {
    site {
      siteMetadata {
        title
      }
    }
    file(relativePath: { eq: "paperfaces-project-feature.jpg" }) {
      childImageSharp {
        fluid(maxWidth: 1100, quality: 75) {
          ...GatsbyImageSharpFluid_noBase64
        }
        fixed(width: 1100, quality: 75) {
          src
          height
          width
        }
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { categories: { in: "paperfaces" } } }
    ) {
      edges {
        node {
          id
          frontmatter {
            title
            path
            image {
              childImageSharp {
                fluid(maxHeight: 400, quality: 75) {
                  ...GatsbyImageSharpFluid_noBase64
                }
              }
            }
            thumbnail {
              childImageSharp {
                fluid(maxHeight: 400, quality: 75) {
                  ...GatsbyImageSharpFluid_noBase64
                }
              }
            }
          }
        }
      }
    }
  }
`

export default Gallery
