import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

/**
 * 统一 Store 工厂。
 * Slice 内部使用普通 StateCreator<T, [], [], SliceT>，
 * immer 包装由此工厂统一处理，不需要在 Slice 里声明 mutator。
 */
export function createAppStore<T extends object>(
  name: string,
  initializer: StateCreator<T, [], []>,
) {
  return create<T>()(
    devtools(immer(initializer as StateCreator<T, [["zustand/immer", never]], []>), {
      name,
      enabled: process.env.NODE_ENV === "development",
    }),
  );
}
