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

const App = () => {
  const [count, setCount] = useState(0);
  const [showChart, setShowChart] = useState(false);

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
            <button onClick={() => setShowChart(!showChart)} className="btn-primary">
              Heavy Chart
            </button>
          </div>
        </div>

        <div></div>

        {showChart && (
          <div>
            {/* @ts-expect-error eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            <Suspense fallback={<div>正在请求核心数据，请稍候...</div>}>
              <LazyHeavyChart />
            </Suspense>
          </div>
        )}

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
