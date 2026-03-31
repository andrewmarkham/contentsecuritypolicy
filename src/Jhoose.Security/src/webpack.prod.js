const { merge } = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
  mode: "production",
  output: {
    filename: "csp-app.[contenthash:8].js",
    clean: true,
  },
});
