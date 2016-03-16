var webpack = require('webpack')
var path = require('path')
var postcssImport = require('postcss-import')
var cssnext = require('postcss-cssnext')
var rucksack = require('rucksack-css')

module.exports = {
  entry: './js/entrypoint.es6',
  output: {
    path: './build', // This is where images AND js will go
    publicPath: 'http://0.0.0.0:5000', // This is used to generate URLs to e.g. images
    filename: 'bundle.js'
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  resolve: {
    root: path.resolve('./'), // allow js/... css/... img/... etc to resolve
    extensions: ['', '.js', '.es6', '.css', '.pcss']
  },
  module: {
    loaders: [
      { test: /\.es6$/, loader: 'babel-loader' },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.pcss$/, loader: 'style-loader!css-loader!postcss-loader' }, // use ! to chain loaders
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'} // inline base64 URLs for <=8k images, direct URLs for the rest
    ]
  },
  watchOptions: {
    poll: true
  },
  postcss: function (webpack) {
    return [cssnext(), rucksack(), postcssImport({addDependencyTo: webpack})]
  }
}