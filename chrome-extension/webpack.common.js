const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = {
  entry: {
    view: path.join(__dirname, "src/view/index.tsx"),
    background: path.join(__dirname, "src/background/background.ts"),
    content: path.join(__dirname, "src/content/content.ts")
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader"
      },
      {
        exclude: /node_modules/,
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader" // Creates style nodes from JS strings
          },
          {
            loader: "css-loader" // Translates CSS into CommonJS
          },
          {
            loader: "sass-loader" // Compiles Sass to CSS
          }
        ]
      }
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
    new NodePolyfillPlugin()
  ]
};
