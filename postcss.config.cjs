// postcss.config.js
module.exports = {
    plugins: [
      require('postcss-import')(),
      require('postcss-url')(),
      require('postcss-mixins')(),
      require('postcss-nested')(),
      require('postcss-preset-env')({
        importFrom: 'src/styles/variables.modules.css',
        stage: 1,
        features: {
          'custom-properties': true,
          'custom-media-queries': true,
          'nesting-rules': true,
        },
      }),
      require('cssnano')({
        preset: 'default',
      }),
    ],
  };