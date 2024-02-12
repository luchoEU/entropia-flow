const path = require("path");

module.exports = {
  mode: "development",
  entry: path.join(__dirname, "src/stream/stream.ts"),
  output: {
    path: path.join(__dirname, "dist"),
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
};
