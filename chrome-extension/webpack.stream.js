const path = require("path");

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
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 819200, // Files smaller than 800 KB will be inlined as Base64
            }
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
  }
};
