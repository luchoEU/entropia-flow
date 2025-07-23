const path = require('path');

module.exports = {
  entry: {
    app: './src/app.ts',
    settings: './src/settings.ts',
    streamView: './src/streamView.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'resources/js'),
  },
  externals: {
    clientStream: 'ClientStream',
    Neutralino: 'Neutralino'
  },
  mode: 'development'
};