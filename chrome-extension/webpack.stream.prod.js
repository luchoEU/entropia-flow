const { merge } = require('webpack-merge');
const common = require("./webpack.stream.js");

module.exports = merge(common, {
  mode: "production"
});
