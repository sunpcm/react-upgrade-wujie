const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");

module.exports = {
  // 1. 入口 (Entry)
  // Webpack 从这里开始分析依赖图 (Dependency Graph)
  entry: path.resolve(__dirname, "../src/index.tsx"),
  // 2. 解析 (Resolve)
  // 告诉 Webpack 如何寻找模块
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  // 模块规则 (Module Rules) - 也就是 Loaders
  module: {
    rules: [
      // === 处理 JS/TS ===
      {
        test: /\.(ts|js)x?$/,
        // 新增 include (白名单)：
        include: [
          // 本项目源码 (当前目录是 build，往上两级找到 src)
          path.resolve(__dirname, "../src"),

          // 所有共享包源码（新增 package 无需再改此处）
          path.resolve(__dirname, "../../../packages"),
        ],
        use: [
          {
            loader: "babel-loader",
            options: {
              // 🟢 关键修复：强制指定配置文件路径
              // 告诉 Babel：无论编译哪里的文件，都用我应用根目录下的 .babelrc.js
              configFile: path.resolve(__dirname, "../.babelrc.js"),
            },
          },
        ],
      },
      // === 处理图片/字体资源 (Webpack 5 新特性) ===
      // 以前需要 file-loader/url-loader，现在内置了

      // 针对 SVG 的特殊处理
      // 只写 type: 'asset'，Webpack 会把它当图片处理，你得到的永远是一个字符串路径，无法像组件那样修改 fill 颜色或 stroke 宽度。
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ["@svgr/webpack"], // 把它转成组件
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset",
      },
    ],
  },
  plugins: [
    // 自动把打包后的 js/css 注入到 index.html
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
      filename: "index.html",
      title: "Webpack React TS", // 可以在 HTML 中引用 <%= htmlWebpackPlugin.options.title %>
    }),
    new Dotenv({
      // 智能选择：如果是 dev 环境，就读 .env.development
      // 如果是 prod 环境，就读 .env.production
      path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV}`),
    }),
  ],
  cache: process.env.CI
    ? false
    : {
        type: "filesystem",
        cacheDirectory: path.resolve(__dirname, "../.webpack_cache"),
        buildDependencies: {
          config: [
            __filename,
            path.resolve(__dirname, "./webpack.dev.js"),
            path.resolve(__dirname, "./webpack.prod.js"),
            path.resolve(__dirname, "../.babelrc.js"),
            path.resolve(__dirname, "../postcss.config.js"),
            path.resolve(__dirname, "../src/styles.css"),
          ],
        },
        name: process.env.NODE_ENV,
      },
};
