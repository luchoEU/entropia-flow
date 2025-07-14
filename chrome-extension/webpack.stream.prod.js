const { merge } = require('webpack-merge');
const common = require("./webpack.stream.js");
const webpack = require('webpack');

module.exports = merge(common, {
  mode: "production",
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/, // Selects modules from the node_modules directory
          name: 'vendors', // This is the name of the output file
          chunks: 'all', // Selects all chunks (initial, async, etc.)
        },
      },
    },
  },
  plugins: [
    // This replaces process.env.NODE_ENV with 'production' throughout the code
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    })
  ]
});
