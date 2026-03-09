# React Micro Frontend with Wujie (多版本 React 微前端架构)

本项目是一个基于 [Wujie (无界)](https://wujie-micro.github.io/doc/) 实现的微前端架构 Monorepo 仓库。主旨是提供一个主应用基座，用于丝滑且隔离地运行和统筹多个包含不同 React 历史版本（16.8、17、18、19）的子应用。

## 🏗 架构总览

本仓库使用 `pnpm` + `Turborepo` 进行 Monorepo 工程化管理，主要分为两大模块：

- **主应用基座 (`apps/main-app`)**：基于 Vite + React 18。仅作为微前端容器，负责全局路由及基于 `<WujieReact>` 的子应用按需加载与预加载。
- **子应用集群 (`apps/react*`)**：基于 Webpack 构建。作为完全独立的 App 运行于专属端口，包含 React 16.8 到 19 的多个版本体系，通过 Wujie 接入并在主应用中被渲染。

## 🛠 技术栈

- **微前端框架**: Wujie (无界 web components + iframe 隔离)
- **包管理 & 构建**: pnpm workspace, Turborepo
- **基座应用栈**: React 18, React Router v6, Vite, TypeScript
- **子应用栈**: React (16.8 / 17 / 18 / 19), Webpack 5, Babel

## 🚀 快速启动

### 1. 安装依赖

请确保你的包管理器是 `pnpm`，在根目录执行：

```bash
pnpm install
```

### 2. 本地开发

使用 Turbo 一键启动所有基座和子应用的开发服务器：

```bash
pnpm dev
```

该命令会同时启动以下服务：

- 基座主应用 (main-app) -> `http://localhost:8000` ✨ **(入口访问这里)**
- react168 子应用 -> `http://localhost:8168`
- react17 子应用 -> `http://localhost:8017`
- react18 子应用 -> `http://localhost:8018`
- react19 子应用 -> `http://localhost:8019`

### 3. 构建产物

一键并行构建所有应用及依赖：

```bash
pnpm build
```

## 📂 目录结构

```text
react-micro-wujie/
├── apps/                    # 应用目录
│   ├── main-app/            # 基座主应用 (Vite + React 18)
│   ├── react168/            # 子应用 (Webpack + React 16.8.x)
│   ├── react17/             # 子应用 (Webpack + React 17.x)
│   ├── react18/             # 子应用 (Webpack + React 18.x)
│   └── react19/             # 子应用 (Webpack + React 19.x)
├── packages/                # 共享工具与组件库
│   ├── configs/             # 存放复用的各种配置 (eslint, tsconfig, prettier等)
│   └── ui-lib/              # 跨子应用共用的 React UI 组件库
├── plop-templates/          # Plop.js 模板文件，用于快速生成规范包
├── package.json
└── turbo.json               # TurboRepo 任务编排配置
```

## 📝 核心脚本 (Scripts)

在根目录下，你可以运行以下核心命令：

- `pnpm dev`: 一键启动整个微前端集群环境
- `pnpm dev:main`: 仅启动基座主应用
- `pnpm dev:react168`: 仅启动 react168 子应用
- `pnpm lint`: 并行执行整个工作区的代码静态检查
- `pnpm format`: 格式化所有代码格式
- `pnpm clean:all`: 深度清理所有 `node_modules` 和构建缓存 (如 `.turbo`, `dist`)
