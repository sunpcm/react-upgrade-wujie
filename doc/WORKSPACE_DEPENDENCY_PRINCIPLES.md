# Monorepo 依赖管理与编译原则

在我们的 React 多版本微前端 Monorepo 架构中，为了避免依赖冲突、包体积膨胀以及“多实例对象”的报错，我们遵循 **“内部包纯净无依赖，主应用全权大兜底”** 的核心哲学。

## 1. 核心思想

- **共享包（`packages/*`）**：只负责输出纯净的 ES6+（或 TS）源码，不负责代码降级、不内置 polyfill、不内置 React 运行时。不配置任何复杂且独立的 `.babelrc`。
- **宿主应用（`apps/*`）**：直接引用共享包的**源码**进行编译。由宿主应用自己的构建工具（Webpack/Vite + Babel）统一负责代码的降级（Babel transform）、Polyfill 注入（core-js）以及底层框架库（React）的单例解析。

## 2. 常见问题与解决方案

### 2.1 React 多版本冲突（Invalid hook call）

**现象**：在页面中渲染 `packages/` 下的组件时，浏览器控制台抛出 `Invalid hook call` 或 `Cannot read properties of null (reading 'useMemo')`。
**原因**：主应用使用的是 `react@16`，而内部包由于独立开发或类型提示的需要，在 `devDependencies` 安装了 `react@18`。Webpack 在编译内部包源码时，就近解析到了内部包自己的 React，导致打包了多份不同版本的 React。
**对策**：在主应用的构建配置中，使用 `alias` 强行将 `react` 和 `react-dom` 指向主应用自身的 `node_modules`。

### 2.2 Polyfill 找不到模块（Can't resolve 'core-js/modules/...'）

**现象**：编译时报错找不到 `core-js/modules/es.array.map.js` 等模块。
**原因**：宿主应用的 Babel 配置了 `useBuiltIns: "usage"`，会在所有被编译的文件（包括内部包的文件）中自动发掘并注入（插入 `import "core-js/modules/..."`）对应的 polyfill 引用。但由于内部包本身并未安装 `core-js`，因此从内部包所在目录向上查找时宣告失败。
**对策**：在主应用端再次利用 `alias` 拦截，将 `core-js` 和 `@babel/runtime` 强制指向宿主自己的依赖。这样内部包就可以保持绝对纯净，无需安装这些运行时库。

## 3. 开发者操作指南

### A. 写内部包（`packages/*`）

1. **尽情挥洒现代语法**：放心使用 `?.`、`??`、`Promise`、`Array.prototype.map` 等高版本语法，无需关心降级。
2. **拒绝运行时依赖**：**不要**在内部包的 `dependencies` 中安装 `core-js` 或 `@babel/runtime`。
3. **正确声明 Peer**：如果有 React 等强约定生态库，请放在 `peerDependencies` 中。

### B. 写宿主应用（`apps/*`）

确保每一个宿主应用的 `package.json` 的 `dependencies` 里都切实安装了：

- `react` / `react-dom`
- `core-js`
- `@babel/runtime`

并且，**必须**在其构建工具中加入如下统一拦截规范：

#### Webpack 规范示例 (`apps/*/config/webpack.common.js`)

```javascript
module.exports = {
  // ...
  resolve: {
    alias: {
      // 强制所有注入的 polyfill 和 helper 都从本应用的 node_modules 寻找，
      // 从而允许 workspace 的内部包保持纯净，不再需要单独安装运行时依赖
      "core-js": path.resolve(__dirname, "../node_modules/core-js"),
      "@babel/runtime": path.resolve(__dirname, "../node_modules/@babel/runtime"),

      // 解决多版本 React 冲突："Invalid hook call"
      react: path.resolve(__dirname, "../node_modules/react"),
      "react-dom": path.resolve(__dirname, "../node_modules/react-dom"),

      // 如果有其他共享状态库需要单例，也在这里添加，例如 zustand
      // "zustand": path.resolve(__dirname, "../node_modules/zustand"),
    },
  },
};
```

#### Vite 规范示例 (`apps/main-app/vite.config.ts`)

```typescript
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  // ...
  resolve: {
    alias: {
      "core-js": path.resolve(__dirname, "node_modules/core-js"),
      "@babel/runtime": path.resolve(__dirname, "node_modules/@babel/runtime"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
});
```
