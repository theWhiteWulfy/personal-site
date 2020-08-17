import PropTypes from 'prop-types'
import React from 'react'
import { Helmet } from 'react-helmet'

const TwitterCard = ({ type, username, title, description, image }) => (
  <Helmet>
    {username && <meta name="twitter:creator" content={username} />}
    <meta name="twitter:card" content={type} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
  </Helmet>
)

export default TwitterCard

TwitterCard.propTypes = {
  type: PropTypes.string,
  username: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
}

TwitterCard.defaultProps = {
  type: 'summary',
  username: null,
}
