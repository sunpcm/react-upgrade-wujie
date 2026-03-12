# 共享 Hook 预构建产物迁移方案（方案二）

## 1. 背景与目标

当前 `@biu/wujie-hooks` 采用“应用侧直接编译 workspace 源码”的消费模式。该模式在 Monorepo 下可行，但会带来以下问题：

- 应用构建配置需要感知并编译 `packages/*` 源码，新增包后容易遗漏配置。
- Babel runtime helper 依赖解析可能跨包失配（例如 `@babel/runtime/helpers/*`）。
- 不同应用对同一共享包的编译链路可能不一致（Babel 版本、插件差异）。
- Dev/Build 时间和稳定性受 workspace 结构影响较大。

本方案目标：将共享包迁移为“**预构建产物消费**”模式。

- 共享包先构建出 `dist`（JS + d.ts）。
- 应用只消费 `dist`，不再直接编译 `packages/*` 源码。
- 新增共享包时，应用侧无需再改 webpack loader include。

---

## 2. 目标架构

### 2.1 包级职责

每个共享包（先从 `@biu/wujie-hooks` 开始）承担完整发布职责：

- 入口源码：`index.ts`、`hooks/*`。
- 构建产物：`dist/index.js`、`dist/index.d.ts`（按需可扩展 ESM/CJS 双产物）。
- `package.json` 的 `main/module/types/exports` 全部指向 `dist`。

### 2.2 应用侧职责

应用只做模块消费：

- `import { useWujieEvent } from "@biu/wujie-hooks"`
- 不再要求 babel-loader include `packages/wujie-hooks` 源码目录。

---

## 3. 实施原则

1. **先最小闭环，再全量推广**：先改 `wujie-hooks`，验证通过后再推广到其他共享包。
2. **兼容优先**：迁移期间允许短期双轨（源码消费 + 产物消费），但最终收敛到产物消费。
3. **依赖边界清晰**：运行时依赖放 `dependencies`，宿主共享依赖放 `peerDependencies`。
4. **可回滚**：每个阶段可独立回滚，不影响主线开发。

---

## 4. 分阶段迁移计划

## 阶段 A：PoC（仅 `@biu/wujie-hooks`）

### A.1 建立构建能力

建议任选其一：

- 方案 A：`tsup`（推荐，配置少、速度快、输出友好）
- 方案 B：`tsc`（纯 TS 编译，简单但对格式控制较弱）

建议产物：

- `dist/index.js`
- `dist/index.d.ts`

建议脚本：

- `build`: 单次构建
- `dev`: watch 构建
- `clean`: 清理 `dist`

### A.2 规范包入口

调整 `packages/wujie-hooks/package.json`：

- `main` -> `./dist/index.js`
- `types` -> `./dist/index.d.ts`
- `exports["."].default` -> `./dist/index.js`
- `exports["."].types` -> `./dist/index.d.ts`
- `files` 仅包含 `dist`（以及必要声明文件）

### A.3 依赖归位

- `react`、`react-dom` 保持 `peerDependencies`。
- `@babel/runtime`（若产物仍依赖 helper）放到 `dependencies`。
- 不把宿主应用专属依赖泄漏到共享包。

### A.4 验证 PoC

验证项：

- `pnpm --filter @biu/wujie-hooks build` 通过。
- 各微应用 `dev/build/typecheck` 通过。
- `@biu/wujie-hooks` 被消费时不再依赖应用编译 `packages/wujie-hooks` 源码。

---

## 阶段 B：应用侧收敛

### B.1 移除对共享源码的编译耦合

在各 Webpack 应用中，评估并逐步移除对 `packages/*` 的 babel-loader include 依赖（或最小化为仅必要场景）。

### B.2 构建编排接入 Turbo

在 `turbo.json` 中建立依赖关系：

- 应用 `dev/build` 依赖共享包 `build` 或 `dev`（watch）
- 保证本地开发和 CI 下顺序稳定

### B.3 开发体验兜底

- 本地联调时启动共享包 watch。
- 应用启动前确保共享包有可用 `dist`。

---

## 阶段 C：模板化推广

将 PoC 经验沉淀为脚手架/模板规则（Plop 模板）：

- 新共享包默认带 `build/dev/clean`。
- 默认 `exports` 指向 `dist`。
- 默认依赖分层规范。

目标：后续新增共享包不再重复踩坑。

---

## 5. 验收标准（Definition of Done）

满足以下条件即视为方案二完成：

1. `@biu/wujie-hooks` 已稳定输出并消费 `dist`。
2. 应用侧不再因共享包 TS 源码而出现 loader 解析错误。
3. 不再出现 `@babel/runtime/helpers/*` 缺失类错误。
4. `pnpm run typecheck`、关键应用 `dev/build` 全部通过。
5. 新增共享包时，不需要改应用 webpack include 才能被消费。

---

## 6. 风险与回滚

### 风险点

- `exports` 配置错误导致“找不到模块/类型声明”。
- watch 构建未启动导致应用拿到过期 `dist`。
- 依赖分层不当导致 peer/dependency 冲突。

### 回滚策略

- 保留阶段性分支。
- 若当日迭代受阻：临时回到“应用直接编译共享源码”模式。
- 回滚时仅恢复入口与 loader 相关配置，不回滚业务代码。

---

## 7. 推荐落地节奏（1 周）

- Day 1-2：完成 `@biu/wujie-hooks` 构建链路与包入口改造。
- Day 3：接入应用验证（react18/react19 优先）。
- Day 4：接入 Turbo 编排与 CI 验证。
- Day 5：沉淀模板规则并发布团队约定。

---

## 8. 结论

方案二的核心价值是：

- 降低应用与共享源码的编译耦合。
- 提升 Monorepo 的可维护性、可预测性和扩展性。
- 把“新增共享包要改宿主配置”的隐性成本前置消除。

建议在当前采用方案一止血后，尽快以 `@biu/wujie-hooks` 为试点推进方案二。
