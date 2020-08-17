import 'lazysizes'

require('./src/styles/global.css')
require('./src/styles/typeface-inter.css')
require('fontsource-zilla-slab')
require('./src/styles/prism.css')

export const onClientEntry = () => {
  // IntersectionObserver polyfill for gatsby-image (Safari, IE)
  if (typeof window.IntersectionObserver === `undefined`) {
    import(`intersection-observer`)
  }
}
