const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: 'chrome>=49',
        // useBuiltIns: 'usage',
        // corejs: {
        //   version: '3.32',
        //   proposals: true, // 使用尚在“提议”阶段特性的 polyfill
        // },
      },
    ],
    '@babel/preset-typescript',
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
  ],
  plugins: [
    'react-refresh/babel',
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
      },
    ],
    ['@babel/plugin-transform-runtime', { corejs: 3 }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-partial-application',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    '@babel/plugin-proposal-throw-expressions',
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: 'css',
      },
    ],
  ],
};

if (process.env.NODE_ENV === 'production') {
  babelConfig.plugins.shift();
}

module.exports = babelConfig;
