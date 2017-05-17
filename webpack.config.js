var ExtractTextPlugin = require('extract-text-webpack-plugin'),
  webpack = require('webpack'),
  path = require('path'),
  nodeEnv = process.env.NODE_ENV || 'production';


// TODO: Add in test function: `"test": "NODE_ENV=testing webpack test.js -d --target node && node --require source-map-support/register test-bundle.js #; npm run lint",`
module.exports = {
  entry: nodeEnv === 'testing' ? './test.js' : './src/index.js',
  output: {
    filename: nodeEnv === 'testing' ? 'test-bundle.js' : 'clay-space-edit.js',
    path: path.resolve(__dirname, nodeEnv === 'testing' ? '.' : './dist'),
  },
  // sub in empty modules for Node built-ins
  // so webpack doesn't complain about not being able to find the modules
  // https://github.com/pugjs/pug-loader/issues/8
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              extractCSS: process.env.NODE_ENV === 'production',
              preserveWhitespace: !process.env.NODE_ENV === 'production'
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015']
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        // don't inject styles when we don't have a window
        use: nodeEnv === 'testing'
            ? 'null-loader'
            : ExtractTextPlugin.extract({
              fallback: 'style-loader', // backup loader when not building .css file
              use: [
                'css-loader',
                'sass-loader'
              ]
            })
      },
      {
        test: /\.svg$/,
        use: 'raw-loader'
      }
    ]
  },
  resolve: {
    alias: {
      references: path.resolve('./src/services/references.js')
    }
  },
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV'])
  ].concat(
    nodeEnv === 'testing'
      ? []
      : [new ExtractTextPlugin('clay-space-edit.css')]
  )
};
