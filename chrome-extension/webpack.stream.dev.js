const { merge } = require('webpack-merge');
const common = require("./webpack.stream.js");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map"
});
