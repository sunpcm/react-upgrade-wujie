import { StateCreator } from "zustand";

export interface MessageSlice {
  message: string;
  setMessage: (msg: string) => void;
  clearMessage: () => void;
}

// Slice 使用普通 StateCreator，不声明 immer mutator。
// immer 在 createAppStore 工厂层统一注入，这里直接用 plain set。
export const createMessageSlice: StateCreator<MessageSlice, [], [], MessageSlice> = (set) => ({
  message: "",
  setMessage: (msg) => set({ message: msg }),
  clearMessage: () => set({ message: "" }),
});
