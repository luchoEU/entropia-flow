const path = require("path");
const { merge } = require('webpack-merge');
const common = require("./webpack.stream.js");
const webpack = require('webpack');

module.exports = merge(common, {
  mode: "production",

  // --- OVERRIDE 1: Change output to prevent filename conflicts ---
  // We go back to a static filename because we know there will only be one file.
  output: {
    path: path.join(__dirname, "dist.single"),
    filename: 'clientStream.bundle.js', // A new name for our single bundle
  },

  // --- OVERRIDE 2: Disable all code splitting ---
  // This explicitly turns off the vendors chunk and other automatic splitting.
  optimization: {
    splitChunks: false, 
  },

  // --- OVERRIDE 3: Force all images to be inlined ---
  // This replaces the asset rule from your common config.
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/inline' // This forces ALL assets into the JS bundle as Base64.
      }
    ]
  },
  
  // --- OVERRIDE 4: The Magic Plugin ---
  // This is the most important part. It tells Webpack to merge all dynamic chunks.
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1, // Allow a maximum of only one chunk.
    }),
    
    // It's still a good idea to include the production environment variable
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
    })
  ]
});
