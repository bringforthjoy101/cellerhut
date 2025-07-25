const path = require('path')
const rewireAliases = require('react-app-rewire-aliases')

module.exports = function override(config, env) {
  require('react-app-rewire-postcss')(config, {
    plugins: loader => [require('postcss-rtl')()]
  })

  config = rewireAliases.aliasesOptions({
    '@src': path.resolve(__dirname, 'src'),
    '@assets': path.resolve(__dirname, 'src/@core/assets'),
    '@components': path.resolve(__dirname, 'src/@core/components'),
    '@layouts': path.resolve(__dirname, 'src/@core/layouts'),
    '@store': path.resolve(__dirname, 'src/redux'),
    '@styles': path.resolve(__dirname, 'src/@core/scss'),
    '@configs': path.resolve(__dirname, 'src/configs'),
    '@utils': path.resolve(__dirname, 'src/utility/Utils'),
    '@hooks': path.resolve(__dirname, 'src/utility/hooks')
  })(config, env)

  // Configure SASS without node-sass dependency
  const oneOf = config.module.rules.find(rule => rule.oneOf).oneOf
  const sassRule = {
    test: /\.s[ac]ss$/i,
    use: [
      require.resolve('style-loader'),
      require.resolve('css-loader'),
      {
        loader: require.resolve('sass-loader'),
        options: {
          implementation: require('sass'),
          sassOptions: {
            includePaths: ['node_modules', 'src/assets']
          }
        }
      }
    ]
  }

  oneOf.unshift(sassRule)
  return config
}
