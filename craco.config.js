const {ESLINT_MODES} = require("@craco/craco");

module.exports = {
  style: {
    postcss: {
      loaderOptions: (postcssLoaderOptions) => {
        postcssLoaderOptions.postcssOptions.plugins = [
          require('postcss-import'),
          require('tailwindcss/nesting'),
          require('tailwindcss')('./tailwind.config.js'),
          require('autoprefixer'),
        ];

        return postcssLoaderOptions;
      },
    },
  },
  eslint: {
    mode: ESLINT_MODES.file,
  }
}