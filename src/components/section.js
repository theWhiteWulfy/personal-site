import React from 'react'
import PropTypes from 'prop-types'

const _ = require('lodash-addons')

const Section = props => (
  <section>
    <h2 className={_.slugify(props.title)}>{props.title}</h2>
    <div dangerouslySetInnerHTML={{ __html: props.description }} />
    {props.children}
  </section>
)

Section.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
}

export default Section
