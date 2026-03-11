import { useEffect, useLayoutEffect, useRef } from "react";
// 可选：如果你想让基座也能用这个 Hook，把主应用的 bus 引入进来
// import wujie from 'wujie';

/**
 * 安全使用无界 EventBus 的自定义 Hook (支持主/子应用兼容及泛型)
 * @param eventName 事件名称
 * @param callback 回调函数
 */
export function useWujieEvent<T extends any[]>(eventName: string, callback: (...args: T) => void) {
  const callbackRef = useRef(callback);

  // 优化 1：使用 useLayoutEffect 确保回调函数在任何事件触发前完成更新
  useLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = (...args: any[]) => {
      // 断言参数类型，传递给真实的回调
      callbackRef.current(...(args as T));
    };

    // 优化 2：兼容获取 Bus 的逻辑
    // 优先尝试获取子应用注入的 bus，如果获取不到，尝试获取主应用 import 的 bus
    // const bus = window.$wujie?.bus || wujie.bus;
    const bus = window.$wujie?.bus;

    if (bus) {
      bus.$on(eventName, handler);
      return () => {
        bus.$off(eventName, handler);
      };
    } else {
      console.warn(`[useWujieEvent] 未找到无界 Bus 实例，监听 "${eventName}" 失败。`);
    }
  }, [eventName]);
}
