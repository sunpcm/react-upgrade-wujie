import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 解决多版本 React 以及内部包寻找 core-js/runtime 的冲突，强制指回主应用模块
      "core-js": path.resolve(__dirname, "node_modules/core-js"),
      "@babel/runtime": path.resolve(__dirname, "node_modules/@babel/runtime"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  server: {
    port: 8000,
  },
});
