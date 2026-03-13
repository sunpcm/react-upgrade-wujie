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

const App = () => {
  const [count, setCount] = useState(0);
  const [showChart, setShowChart] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggleChart = () => {
    startTransition(() => {
      setShowChart((prev) => !prev);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-brand-600 mb-8 text-4xl font-bold">Hello React 19</h1>
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <p className="mb-4 text-lg">
            Count: <span className="text-brand-500 font-bold">{count}</span>
          </p>
          <div className="flex gap-4">
            <button onClick={() => setCount((c) => c + 1)} className="btn-primary">
              Increment
            </button>
            <button onClick={handleToggleChart} className="btn-primary">
              Heavy Chart
            </button>
          </div>
          {isPending ? "后台正在爆闪下载图表中..." : "Heavy Chart (Transition 版本)"}
        </div>
        {showChart && (
          <div>
            <Suspense fallback={<div>Loading 19...</div>}>
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
