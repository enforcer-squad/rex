import { defineConfig } from 'dumi';
import pkg from './package.json';

// const sdkPath = `SDK@http://172.16.6.40:8000/viewer_c_sdk/sdkEntry.js`;

export default defineConfig({
  themeConfig: {
    name: '',
    favicons: '/favicon.ico',
    logo: '/logo.png',
    // 多语言时配置对象，key 为语言名
    // nav: {
    //   'zh-CN': [
    //     { title: '指南', link: '/guide' },
    //     { title: '组件', link: '/components/carousel' },
    //     { title: '更新日志', link: '/changelog' },
    //   ],
    // },
    footer: 'Copyright © 2023 | Powered by Enforcer-Squad',
    socialLinks: {
      github: 'https://github.com/enforcer-squad',
    },

    // chainWebpack(memo:any) {
    //   // 设置 alias
    //   const Plugin = new ModuleFederationPlugin({
    //     name: 'CTA',
    //     filename: 'CTA.js',
    //     remotes: {
    //       SDK: sdkPath,
    //     },
    //     exposes: {},
    //   }),
    //   // 添加额外插件
    //   memo.plugin('hello').use(Plugin, [...args]);
    // },
    // antd风格配置
    // title: '业务组件库',
    // actions: {
    //   'zh-CN': [
    //     { type: 'primary', text: '开始使用', link: '/guide/introduce' },
    //   ],
    //   'en-US': [
    //     { type: 'primary', text: 'Start', link: '/guide/introduce-en' },
    //   ],
    // },
    // features: [
    //   {
    //     title: '开箱即用',
    //     details: '接入简单，安装即使用，全面融入 Ant Design 5.0 风格。',
    //   },

    //   {
    //     title: '开箱即用',
    //     details: '接入简单，安装即使用，全面融入 Ant Design 5.0 风格。',
    //   },
    //   {
    //     title: '开箱即用',
    //     details: '接入简单，安装即使用，全面融入 Ant Design 5.0 风格。',
    //   },
    //   {
    //     title: '开箱即用',
    //     details: '接入简单，安装即使用，全面融入 Ant Design 5.0 风格。',
    //   },
    // ],
  },
  // 因为文档联邦模块冲突，所以将mfsu功能关闭
  // mfsu: false,
  resolve: {
    // [pkg.name]: '/dist/index.js',
    // docDirs: ['docs/**/*', 'src'],
  },
  outputPath: 'docs_dist',
  chainWebpack(memo: any, { webpack }: any) {
    memo.resolve.alias.set(pkg.name, '/dist/index.js');
  },
  proxy: {
    '/api': {
      target: 'http://172.16.4.5:8000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
