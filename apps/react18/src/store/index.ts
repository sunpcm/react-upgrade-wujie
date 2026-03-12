import { createAppStore } from "@biu/store-utils";
import { createCountSlice, CountSlice } from "./countSlice";
import { createMessageSlice, MessageSlice } from "./messageSlice";

export type AppStore = MessageSlice & CountSlice;

export const useAppStore = createAppStore<AppStore>("react18", (...args) => ({
  ...createMessageSlice(...args),
  ...createCountSlice(...args),
}));
