var ExtractTextPlugin = require('extract-text-webpack-plugin'),
  path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'clay-space-edit.js',
    path: path.resolve(__dirname, './dist')
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
        use: ExtractTextPlugin.extract({
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
    new ExtractTextPlugin('clay-space-edit.css')
  ]
};
