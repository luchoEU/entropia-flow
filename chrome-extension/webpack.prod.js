const { merge } = require('webpack-merge');
const common = require("./webpack.common.js");
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: ['node scripts/post-build.mjs'],
        blocking: false,
        parallel: false,
      },
    }),
  ],
});
