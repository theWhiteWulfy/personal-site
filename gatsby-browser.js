import 'lazysizes'
import React from 'react'
import ReactDOM from 'react-dom'

require('./src/styles/global.css')
require('./src/styles/typeface-prompt.css')
require('fontsource-zilla-slab')
require('./src/styles/prism.css')

export const onClientEntry = () => {
  // IntersectionObserver polyfill for gatsby-image (Safari, IE)
  if (typeof window.IntersectionObserver === `undefined`) {
    import(`intersection-observer`)
  }
}

export const onServiceWorkerUpdateReady = () => {
  // window.location.reload(true)
  const root = document.body.appendChild(document.createElement('div'))
  ReactDOM.render(
    <div id="sw-toast">
      <p className="sw-toast-text">
        Site has been updated. Please refresh to see the latest version.
      </p>
      <button
        type="submit"
        onClick={() => window.location.reload(true)}
        className="btn sw-toast-btn"
      >
        Refresh
      </button>
    </div>,
    root
  )
}
