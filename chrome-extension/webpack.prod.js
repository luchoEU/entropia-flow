const { merge } = require('webpack-merge');
const common = require("./webpack.common.js");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: ['rm dist.zip; cd dist; zip -r ../dist.zip *'],
        blocking: false,
        parallel: false,
      },
    }),
  ]
});
