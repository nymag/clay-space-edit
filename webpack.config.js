var ExtractTextPlugin = require('extract-text-webpack-plugin'),
  webpack = require('webpack'),
  path = require('path'),
  nodeEnv = process.env.NODE_ENV || 'production';

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'clay-space-edit.js',
    path: path.resolve(__dirname, './dist'),
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
              preserveWhitespace: !process.env.NODE_ENV === 'production',
              loaders: {
                css: 'vue-style-loader!css-loader!postcss-loader',
                sass: 'vue-style-loader!css-loader!postcss-loader!sass-loader'
              }
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
    new ExtractTextPlugin('clay-space-edit.css'),
    new webpack.EnvironmentPlugin(['NODE_ENV'])
  ]
};
