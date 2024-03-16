const path = require('path');
const { globSync } = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';

const resolve = dir => {
  return path.resolve(__dirname, '..', dir);
};

const getCssLoaders = () => {
  const sourceMap = !isProd;
  const lastLoader = !isProd ? 'style-loader' : MiniCssExtractPlugin.loader;
  const cssInclude = [/demos/];
  const loaders = [
    {
      test: /\.css$/,
      use: [
        { loader: lastLoader },
        {
          loader: 'css-loader',
        },
      ],
      include: resolve('node_modules'),
    },
    {
      test: /\.global\.css$/,
      use: [
        { loader: lastLoader },
        {
          loader: 'css-loader',
        },
        {
          loader: 'postcss-loader',
        },
      ],
    },
    {
      test: /^(?!.*\.global).*\.css$/,
      use: [
        { loader: lastLoader },
        {
          loader: 'css-loader',
          options: {
            modules: { localIdentName: '[hash:base64:6]' },
            sourceMap,
            importLoaders: 1,
          },
        },
        { loader: 'postcss-loader', options: { sourceMap } },
      ],
      include: cssInclude,
    },
    {
      test: /\.global\.less$/,
      use: [
        { loader: lastLoader },
        {
          loader: 'css-loader',
          options: { sourceMap, importLoaders: 2 },
        },
        { loader: 'postcss-loader', options: { sourceMap } },
        { loader: 'less-loader', options: { sourceMap } },
      ],
      include: cssInclude,
    },
    {
      test: /^(?!.*\.global).*\.less$/,
      use: [
        { loader: lastLoader },
        {
          loader: 'css-loader',
          options: {
            modules: { localIdentName: '[hash:base64:6]' },
            sourceMap,
            importLoaders: 2,
          },
        },
        { loader: 'postcss-loader', options: { sourceMap } },
        { loader: 'less-loader', options: { sourceMap } },
      ],
      include: cssInclude,
    },
  ];
  return loaders;
};

const getEntries = () => {
  let indexs = globSync('demos/*/index.ts');
  const htmlPlugins = [
    new HtmlWebpackPlugin({
      template: resolve('demos/index.html'),
      filename: 'demos/index.html',
      inject: 'body',
      chunks: ['demos/index'],
    }),
  ];

  const entries = indexs.reduce(
    (ret, file) => {
      const [, entry] = file.split('/');
      ret[`demos/${entry}`] = resolve(file);
      htmlPlugins.push(
        new HtmlWebpackPlugin({
          template: resolve(`demos/${entry}/index.html`),
          filename: `demos/${entry}/index.html`,
          inject: 'body',
          chunks: [`demos/${entry}`],
        }),
      );
      return ret;
    },
    { 'demos/index': resolve('demos/index.ts') },
  );
  return { entries, htmlPlugins };
};

module.exports = {
  resolve,
  isProd,
  getCssLoaders,
  getEntries,
};
