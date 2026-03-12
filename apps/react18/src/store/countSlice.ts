import { StateCreator } from "zustand";

export interface CountSlice {
  count: number;
  increment: () => void;
}

// Slice 使用普通 StateCreator，不声明 immer mutator。
export const createCountSlice: StateCreator<CountSlice, [], [], CountSlice> = (set, get) => ({
  count: 0,
  increment: () => set({ count: get().count + 1 }),
});
