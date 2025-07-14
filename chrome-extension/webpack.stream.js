const path = require("path");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: "development",
  entry: {
    clientStream: path.join(__dirname, "src/stream/clientEntry.ts")
  },
  output: {
    path: path.join(__dirname, "dist.win"),
    filename: "[name].js",
    chunkFilename: 'chunks/[name].js',
    assetModuleFilename: 'img/[name].[hash:8].[ext]',
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: path.join(__dirname, "tsconfig.stream.json"),
          }
        }
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 4 * 1024
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      'process': require.resolve('process/'), // Using require.resolve is more robust
    },
    fallback: {
      fs: false,
      child_process: false,
      vm: require.resolve("vm-browserify")
    }
  },
  plugins: [
    //new BundleAnalyzerPlugin()
  ]
};
