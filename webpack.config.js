var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './client.js',
  output: {
    filename: 'clay-space-edit.js',
    path: './dist'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015'],
      }
    }, {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract(
        'style', // backup loader when not building .css file
        'css!sass' // loaders to preprocess CSS
      )
    }]
  },
  plugins: [
    new ExtractTextPlugin('clay-space-edit.css')
  ]
};
