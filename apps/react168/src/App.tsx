import React, { useState, lazy, Suspense } from "react";

const LazyHeavyChart: any = lazy(() => {
  return Promise.all([
    import("@biu/util-components"),
    new Promise((resolve) => {
      // 模拟网络延迟，确保加载状态能被观察到
      setTimeout(resolve, 4000);
    }),
  ]).then(([module]) => ({
    default: module.HeavyChart,
  }));
});

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

  console.log("[tab]", tab);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-brand-600 mb-8 text-4xl font-bold">Hello React 16.8</h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <p className="mb-4 text-lg">
            Count: <span className="text-brand-500 font-bold">{count}</span>
          </p>
          <div className="flex gap-4">
            <button onClick={() => setCount((c) => c + 1)} className="btn-primary">
              Increment
            </button>
            <button
              onClick={() => setTab("light")}
              className="btn-primary"
              style={{ opacity: tab === "light" ? 0.5 : 1 }}
            >
              轻量面板
            </button>
            <button onClick={() => setTab("heavy")} className="btn-primary">
              加载重型图表 (4秒)
            </button>
          </div>
        </div>

        <div></div>

        <div>
          {/* @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          <Suspense
            fallback={<div style={{ padding: "20px", color: "red" }}>我是 fallback loading</div>}
          >
            {tab === "light" ? <LightDashboard /> : <LazyHeavyChart />}
          </Suspense>
        </div>

        <div className="prose prose-brand">
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
