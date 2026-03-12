# 微前端改造计划 (Wujie + Monorepo)

本项目计划基于无界 (Wujie) 将当前 repo 改造为微前端架构，由一个主应用基座(React 18)统筹运行多个不同版本的 React 子应用(16.8, 17, 18, 19)。

## 阶段一：子应用改造 (Sub-apps Configuration)

由于 Wujie 加载子应用资源时依赖 `fetch`，因此需要为所有子应用配置跨域，并固定端口以便主应用请求。

1. **统一端口映射**：
   - `react168` -> `8168`
   - `react17` -> `8017`
   - `react18` -> `8018`
   - `react19` -> `8019`
2. **修改 Webpack 配置**：
   - 修改 `apps/react*/config/webpack.dev.js`，在 `devServer` 中添加 `headers: { "Access-Control-Allow-Origin": "*" }`。
   - 相应修改各个 `package.json` 中的 `start` 脚本，指定 `--port <对应端口>`。

## 阶段二：创建主应用基座 (Main App Initialization)

1. **初始化目录**：在 `apps/` 目录下新建 `main-app`。
2. **生成工程配置**：
   - 创建 `package.json`，依赖 `react@18`, `react-dom@18`, `wujie-react`, `react-router-dom`, `vite` 等。
   - 创建 `vite.config.ts`。
   - 配置 `tsconfig.json` 并继承自 `packages/configs/tsconfig/base.json`。

## 阶段三：主应用基座代码开发 (Main App Development)

1. **实现布局骨架**：开发带侧边栏/顶部导航的骨架，用于切换不同子应用。
2. **集成 Wujie**：
   - 使用 `WujieReact` 组件加载各个子应用的 URL (例如 `http://localhost:8168/`)。
   - 配置 `wujie` 的预加载 (preload) 优化体验。

## 阶段四：Monorepo 工程化联调 (Orchestration)

1. 梳理 root 目录下的 `package.json` 和 `turbo.json`。
2. 确保可以通过 `pnpm dev` 一键启动所有应用（主应用 + 4个子应用）。
3. 整体联调，验证 React 16, 17, 18, 19 在同一个基座内丝滑切换。
