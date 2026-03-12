import { useEffect } from "react";
import { useWujieEvent } from "@biu/wujie-hooks";
import { AppStore, useAppStore } from "./store";

const App = () => {
  const count = useAppStore((state: AppStore) => state.count);
  const increment = useAppStore((state: AppStore) => state.increment);
  const message = useAppStore((state: AppStore) => state.message);
  const setMessage = useAppStore((state: AppStore) => state.setMessage);

  useWujieEvent("Echo", (msg: string) => setMessage(msg));

  useEffect(() => {
    const bus = window.$wujie?.bus;
    if (bus) {
      bus.$emit("react18-ready");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-brand-600 mb-8 text-4xl font-bold">Hello React 18</h1>
        <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
          <p className="mb-4 text-lg">
            Count: <span className="text-brand-500 font-bold">{count}</span>
          </p>
          <div className="flex gap-4">
            <button onClick={increment} className="btn-primary">
              Increment
            </button>
            Button
          </div>
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
      message: {message}
    </div>
  );
};

export default App;
