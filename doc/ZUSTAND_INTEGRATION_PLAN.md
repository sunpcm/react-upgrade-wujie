# Zustand 集成计划（微前端 Monorepo）

## 1. 背景与目标

当前 Monorepo 包含 4 个不同 React 版本的子应用（16.8 / 17 / 18 / 19）和一个 Vite 主应用基座，通过 Wujie（无界）微前端框架运行。引入 Zustand 的目标是：

- 替代各个子应用内部散落的 `useState` 复杂状态，收敛到可预测的 Store。
- **不破坏**微前端的 iframe 沙箱隔离原则——跨应用通信继续走 Wujie Bus，Store 只管应用内部。
- 在 Monorepo 中沉淀统一的 Store 创建规范，降低后续新增子应用的接入成本。

---

## 2. 版本选型（关键决策）

Zustand **v5** 要求 React ≥ 18，v4 支持 React ≥ 16.8。

| 子应用     | React 版本 | Zustand 版本 |
| ---------- | ---------- | ------------ |
| `react168` | 16.8.x     | `^4.5.x`     |
| `react17`  | 17.x       | `^4.5.x`     |
| `react18`  | 18.x       | `^5.x`       |
| `react19`  | 19.x       | `^5.x`       |
| `main-app` | 18.x       | `^5.x`       |

> **结论**：不在 `pnpm-workspace.yaml` 的 `catalog` 里统一 Zustand 版本，而是各应用在自己的 `package.json` 中声明，保持版本隔离。

---

## 3. 架构原则

### 3.1 Store 隔离

Wujie 的 iframe 沙箱保证各子应用的 JS 运行时完全隔离，因此：

- 每个子应用的 Zustand Store **天然隔离**，无需任何额外处理。
- 严禁尝试在子应用之间"共享"同一个 Store 实例——这违背了微前端隔离原则，也无法实现。

### 3.2 跨应用通信分工

```
子应用内部状态变更  →  Zustand Store
跨应用事件通知      →  Wujie Bus（bus.$emit / bus.$on）
主应用 → 子应用传参  →  WujieReact props
```

Wujie Bus 收到的消息，**在子应用内部**再写入 Zustand Store，由 Store 驱动 UI 更新：

```
bus.$on("Echo") → store.setMessage() → React UI re-render
```

### 3.3 共享的是规范，不是实例

在 `packages/` 下新建 `@biu/store-utils`，只提供：

- Store 工厂函数（统一 `devtools` + `immer` 中间件配置）
- TypeScript 工具类型
- 不导出任何 Store 实例

---

## 4. 目录结构变化

```
packages/
  store-utils/          ← 新增：Store 创建工具包
    src/
      createStore.ts    ← 统一中间件封装
      types.ts          ← 通用工具类型
    package.json
    tsconfig.json

apps/
  react18/
    src/
      store/            ← 各应用自己的 Store 目录
        index.ts        ← 统一导出
        messageSlice.ts ← 按功能切片
        countSlice.ts
```

---

## 5. 分阶段实施计划

### 阶段 A：基础设施（Day 1）

#### A.1 新建 `@biu/store-utils` 包

`packages/store-utils/package.json`：

```json
{
  "name": "@biu/store-utils",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "peerDependencies": {
    "zustand": ">=4.5.0"
  }
}
```

`packages/store-utils/src/createStore.ts`：

```ts
import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

/**
 * 统一的 Store 工厂，自动在开发模式下接入 devtools 和 immer。
 * 生产构建时 devtools 中间件会被 tree-shaking 掉。
 */
export function createAppStore<T>(
  name: string,
  initializer: StateCreator<T, [["zustand/immer", never]], []>,
) {
  return create<T>()(
    devtools(immer(initializer), { name, enabled: process.env.NODE_ENV === "development" }),
  );
}
```

#### A.2 更新 `pnpm-workspace.yaml`

无需改动——`packages/*` 的 glob 已覆盖新包。

#### A.3 安装依赖

```bash
# react18 / react19 / main-app
pnpm --filter react18 add zustand@^5
pnpm --filter react19 add zustand@^5
pnpm --filter main-app add zustand@^5

# react168 / react17
pnpm --filter react168 add zustand@^4.5
pnpm --filter react17 add zustand@^4.5

# store-utils 工具包自身不需要安装 zustand（是 peerDependency）
pnpm --filter @biu/store-utils add -D zustand@^5  # 仅用于类型推导

# store-utils 的 immer 依赖
pnpm --filter react18 add immer
# ... 各应用同样安装 immer
```

---

### 阶段 B：react18 试点（Day 2）

以 `react18` 作为试点，将现有 `useState` 状态迁移到 Zustand，并将 Wujie Bus 消息的处理对接到 Store。

#### B.1 创建 Store（Slice 模式）

`apps/react18/src/store/messageSlice.ts`：

```ts
import { StateCreator } from "zustand";

export interface MessageSlice {
  message: string;
  setMessage: (msg: string) => void;
  clearMessage: () => void;
}

export const createMessageSlice: StateCreator<
  MessageSlice,
  [["zustand/immer", never]],
  [],
  MessageSlice
> = (set) => ({
  message: "",
  setMessage: (msg) =>
    set((state) => {
      state.message = msg;
    }),
  clearMessage: () =>
    set((state) => {
      state.message = "";
    }),
});
```

`apps/react18/src/store/countSlice.ts`：

```ts
import { StateCreator } from "zustand";

export interface CountSlice {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const createCountSlice: StateCreator<
  CountSlice,
  [["zustand/immer", never]],
  [],
  CountSlice
> = (set) => ({
  count: 0,
  increment: () =>
    set((state) => {
      state.count += 1;
    }),
  decrement: () =>
    set((state) => {
      state.count -= 1;
    }),
});
```

`apps/react18/src/store/index.ts`：

```ts
import { createAppStore } from "@biu/store-utils";
import { createMessageSlice, MessageSlice } from "./messageSlice";
import { createCountSlice, CountSlice } from "./countSlice";

type AppStore = MessageSlice & CountSlice;

export const useAppStore = createAppStore<AppStore>("react18", (...a) => ({
  ...createMessageSlice(...a),
  ...createCountSlice(...a),
}));
```

#### B.2 改造 App.tsx——Bus 消息写入 Store

```tsx
import { useEffect } from "react";
import { useWujieEvent } from "@biu/wujie-hooks";
import { useAppStore } from "./store";

const App = () => {
  const count = useAppStore((s) => s.count);
  const increment = useAppStore((s) => s.increment);
  const message = useAppStore((s) => s.message);
  const setMessage = useAppStore((s) => s.setMessage);

  // Wujie Bus 消息 → 写入 Store
  useWujieEvent("Echo", (msg: string) => setMessage(msg));

  useEffect(() => {
    const bus = window.$wujie?.bus;
    if (bus) bus.$emit("react18-ready");
  }, []);

  return (
    // ... 其余 JSX 不变，使用 store 里的 count / message
  );
};
```

#### B.3 验收

- `react18` 收到 `Echo` 消息后 UI 正常展示。
- React DevTools + Redux DevTools（Zustand devtools 兼容）中可看到 Store 状态时序。
- 无 TS 类型错误。

---

### 阶段 C：推广至其他子应用（Day 3-4）

按照阶段 B 的模式，依次对 `react168`、`react17`、`react19` 做相同的迁移。注意：

- `react168` / `react17` 使用 Zustand v4，`createAppStore` 工厂中的 `immer` 中间件语法与 v5 略有差异，需在工厂内做版本兼容处理（或为 v4 单独提供一个 `createAppStoreV4`）。
- 各子应用的 Store 文件结构保持一致（`store/index.ts` + Slice 文件），方便日后代码阅读。

---

### 阶段 D：主应用接入（Day 4）

主应用 `main-app` 本身承担路由和子应用容器职责，状态相对简单。可用 Zustand 管理：

- 当前激活的子应用名称
- 全局通知/Toast 状态
- 用户偏好设置

不建议在主应用 Store 里存放子应用的业务数据——子应用与主应用的状态边界应清晰。

---

### 阶段 E：Turbo 编排收敛（Day 5）

如果 `@biu/store-utils` 将来迁移为预构建产物（参考 `WUJIE_HOOKS_BUILD_PLAN.md` 方案二），在 `turbo.json` 中添加依赖关系：

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

（已有 `^build` 依赖，新包接入后自动生效。）

---

## 6. 最佳实践清单

| 规则                             | 说明                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| **按 Slice 拆分**                | 每个功能域一个 Slice，通过 `createAppStore` 组合，避免一个巨型 Store               |
| **选择器精确订阅**               | `useAppStore(s => s.count)` 而非 `useAppStore()`，减少不必要的重渲染               |
| **immer 写不可变**               | 所有 `set` 调用通过 immer draft 写法，避免手写展开运算符的出错风险                 |
| **devtools 命名**                | 每个应用的 Store 命名不同（`react18`、`react19`...），方便在 Redux DevTools 中区分 |
| **不跨应用共享 Store**           | 严格通过 Wujie Bus 做跨应用通知，Store 只是 Bus 消息的"落地层"                     |
| **避免在 Store 中存 React 引用** | Store 内只存纯数据（string / number / plain object / array）                       |
| **异步 action 用 get**           | 异步操作在 `set` 之外用 `get()` 读取最新状态，避免闭包过期值问题                   |

---

## 7. 风险与规避

| 风险                                                   | 规避策略                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Zustand v4/v5 API 差异导致 `@biu/store-utils` 类型报错 | 为 v4 应用单独提供兼容入口 `createStore.v4.ts`，或用条件类型抹平差异           |
| immer 增大 bundle 体积                                 | 生产环境只在复杂 Slice 里用 immer，简单状态可直接 `set({})`                    |
| StrictMode 双调用导致 Store 初始化两次                 | Zustand create 是单例，天然幂等，StrictMode 不影响正确性                       |
| 子应用热重载（HMR）后 Store 状态丢失                   | 开发体验可接受；如需保留，可配合 `zustand/middleware/persist` + sessionStorage |

---

## 8. 验收标准

1. `pnpm --filter react18 typecheck` 通过，无 Zustand 相关类型错误。
2. React DevTools + Redux DevTools 中能看到 `react18` Store 的状态变更时序。
3. Wujie Bus `Echo` 消息到达后，UI 正常渲染，不再依赖 `useState` 直接接收。
4. 各子应用 Store 互相隔离，刷新其中一个不影响其他。
5. `pnpm build`（全量构建）通过，无因 Zustand 引入的构建错误。
