import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  // apiParser: {},
  // resolve: {
  //   // 配置入口文件路径，API 解析将从这里开始
  //   entryFile: './src/index.ts',
  // },
  base: '/harvest-sheet/',
  publicPath: '/harvest-sheet/',
  themeConfig: {
    // name: '@zhenliang/sheet',
  },
});
