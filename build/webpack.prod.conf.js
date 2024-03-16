const chalk = require('chalk');
const { merge } = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const baseConfig = require('./webpack.base.conf');

const prodConfig = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {},
          compress: {},
          safari10: true,
        },
        parallel: true,
      }),
    ],
  },
  externals: [nodeExternals()],
  plugins: [
    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
    }),
    // new BundleAnalyzerPlugin({
    //   analyzerPort: 8899,
    // }),
  ],
};

module.exports = merge(baseConfig, prodConfig);
