import { useState, lazy, Suspense, useTransition } from "react";

const LazyHeavyChart = lazy(() => {
  return Promise.all([
    import("@biu/util-components"),
    new Promise((resolve) => {
      setTimeout(() => {
        return resolve(1);
      }, 4000);
    }),
  ]).then(([modules]) => {
    return {
      default: modules.HeavyChart,
    };
  });
});

// 一个非常轻量的占位面板，用于展示“旧视图”如何保持在屏幕上
const LightDashboard = () => (
  <div style={{ padding: 24, border: "2px dashed #ddd", borderRadius: 8, marginTop: 20 }}>
    <h3>📊 轻量级占位面板 (瞬间渲染)</h3>
    <p>仔细看！点击 切换重型图表 后，这个面板**不会**立刻变成难看的 Loading 图标。</p>
    <p>
      React 会让这个旧视图在屏幕上等待，甚至这个时候你还能去点上面的 Increment
      按钮，主线程完全不卡！等到4秒后组件下载完毕，才平滑替换掉这块区域。
    </p>
  </div>
);

const App = () => {
  const [count, setCount] = useState(0);
  const [tab, setTab] = useState<"light" | "heavy">("light");
  const [isPending, startTransition] = useTransition();

  const handleSwitchTab = (targetTab: "light" | "heavy") => {
    // 【核心魔法】：把状态切换放入 startTransition，React 就会把它当做后台并发任务处理
    startTransition(() => {
      setTab(targetTab);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-brand-600 mb-8 text-4xl font-bold">🎯 React 19 并发渲染体验</h1>
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <p className="mb-4 text-lg">
            Count: <span className="text-brand-500 font-bold">{count}</span>
          </p>
          <div className="flex gap-4">
            <button onClick={() => setCount((c) => c + 1)} className="btn-primary">
              Increment
            </button>
            <button
              onClick={() => handleSwitchTab("light")}
              className="btn-primary"
              style={{ opacity: tab === "light" ? 0.5 : 1 }}
            >
              轻量面板
            </button>
            <button onClick={() => handleSwitchTab("heavy")} className="btn-primary">
              加载重型图表 (4秒)
            </button>
          </div>

          {/* isPending 为真时，说明正在后台默默等待 Promise */}
          {isPending && (
            <div style={{ color: "#d97706", marginTop: "12px", fontWeight: "bold" }}>
              ⏳ React 19 正在后台爆闪拉取重型组件中... 旧视图安全保持在屏幕上！
            </div>
          )}
        </div>

        {/*
          【核心修正】：永远不要把 Suspense 写在条件判断 (showChart &&) 里。
          必须让 Suspense 常驻在树上，只在里面切换它的 children (tab)。
          这样 React 判定为 "Update" 而非 "Mount"，就可以触发 Transition 特性！
        */}
        <div>
          <Suspense
            fallback={
              <div style={{ padding: "20px", color: "red" }}>
                这是一个你几乎不可能看到的 fallback loading（除非首次毫无预热加载）
              </div>
            }
          >
            {tab === "light" ? <LightDashboard /> : <LazyHeavyChart />}
          </Suspense>
        </div>

        <div className="prose prose-brand mt-8">
          <h2>Tailwind Classes Working!</h2>
          <ul>
            <li>Custom brand colors</li>
            <li>Responsive utilities</li>
            <li>Custom components</li>
          </ul>
        </div>
      </div>
      <div className="bg-brand-500 p-18">测试共享主题</div>
    </div>
  );
};

export default App;
