const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "development",
  entry: path.join(__dirname, "src/stream/stream.ts"),
  output: {
    path: path.join(__dirname, "dist.win"),
    filename: "EntropiaFlowStream.js",
    library: "entropiaFlowStream"
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader"
      },
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    fallback: {
      fs: false,
      child_process: false
    }
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'dist/effects', to: 'effects' },
        { from: 'dist/img/flow128*.png', to: 'img/[name][ext]' },
      ]
    })
  ]
};
