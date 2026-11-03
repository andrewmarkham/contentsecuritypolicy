const { merge } = require('webpack-merge');
const { appConfig, editorConfig } = require('./webpack.common');

const dev = {
  mode: 'development',
  devtool: 'inline-source-map',
};

module.exports = [merge(appConfig, dev), merge(editorConfig, dev)];
