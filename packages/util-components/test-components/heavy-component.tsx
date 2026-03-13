import React, { useMemo } from "react";

export function HeavyChart() {
  // 1. 模拟重型的 CPU 计算（例如对海量原始数据进行聚合、降维操作）
  const chartData = useMemo(() => {
    // 假设我们在这里进行了一些非常耗时的同步操作
    const data = [];
    for (let i = 0; i < 60; i++) {
      // 生成 10~100 的随机高度模拟柱状图数据
      data.push(Math.floor(Math.random() * 90) + 10);
    }
    return data;
  }, []);

  return (
    <div
      style={{
        padding: "24px",
        background: "#1e1e1e",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        marginTop: "20px",
      }}
    >
      <h3 style={{ color: "#fff", margin: "0 0 20px 0", fontFamily: "sans-serif" }}>
        📈 核心业务数据看板 (Heavy Component)
      </h3>

      {/* 2. 模拟图表渲染区：使用 Flexbox 配合海量 DOM 节点模拟复杂图表 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          height: "250px",
          gap: "4px",
          borderBottom: "2px solid #444",
        }}
      >
        {chartData.map((val, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              // 根据数值动态生成颜色，模拟热力映射
              backgroundColor: `hsl(${200 + val}, 80%, 60%)`,
              height: `${val}%`,
              borderRadius: "4px 4px 0 0",
              transition: "height 0.5s ease-out",
            }}
            title={`数据点: ${val}`}
          />
        ))}
      </div>

      <div style={{ color: "#888", fontSize: "12px", marginTop: "16px", textAlign: "center" }}>
        * 这是一个模拟的重型组件。真实场景中，这里可能是几百 KB 的 ECharts 实例。
      </div>
    </div>
  );
}
