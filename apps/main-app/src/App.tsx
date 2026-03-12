import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import WujieReact from "wujie-react";
import { Home } from "./Home";

const { setupApp, preloadApp, bus } = WujieReact;

const subApps = [
  { name: "react168", url: "http://localhost:8168/" },
  { name: "react17", url: "http://localhost:8017/" },
  { name: "react18", url: "http://localhost:8018/" },
  { name: "react19", url: "http://localhost:8019/" },
];

// Preload the sub apps
subApps.forEach((app) => {
  setupApp({
    name: app.name,
    url: app.url,
    exec: true,
    sync: true,
  });
  preloadApp({ name: app.name, url: app.url });
});

function SubApp({ name, url, mainKey }: { name: string; url: string; mainKey: string }) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <WujieReact
        width="100%"
        height="100%"
        name={name}
        url={url}
        sync={true}
        props={{ mainKey }}
      />
    </div>
  );
}

function Layout() {
  const randomKey = Math.random();
  const mainKey: string = `${randomKey}`.replace(/\d\./g, "");

  useEffect(() => {
    if (randomKey > 0.5) {
      bus.$emit("Echo", mainKey);
    } else {
      bus.$emit("Echo");
    }
  }, [mainKey, randomKey]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div
        style={{
          width: "200px",
          borderRight: "1px solid #ccc",
          padding: "16px",
          background: "#f5f5f5",
        }}
      >
        <h3>Base App</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ marginBottom: "10px" }}>
            <Link to="/">Home</Link>
          </li>
          {subApps.map((app) => (
            <li key={app.name} style={{ marginBottom: "10px" }}>
              <Link to={`/${app.name}`}>{app.name}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1, padding: "16px", overflow: "auto" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          {subApps.map((app) => (
            <Route
              key={app.name}
              path={`/${app.name}/*`}
              element={<SubApp name={app.name} url={app.url} mainKey={mainKey} />}
            />
          ))}
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
