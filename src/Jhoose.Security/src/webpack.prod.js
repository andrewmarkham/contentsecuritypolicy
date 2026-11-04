const { merge } = require('webpack-merge');
const { appConfig, editorConfig } = require('./webpack.common');

// No source maps; production mode minifies. File names stay stable because
// cache busting is done with the assembly version in the admin view, and
// module.config references inline-editor-bundle.js by name.
const prod = {
  mode: 'production',
  devtool: false,
};

module.exports = [merge(appConfig, prod), merge(editorConfig, prod)];
