"use client";

export function LineChart() {
  const pts = [0, 8, 2, 6, 3, 5, 4, 5.2, 4.5, 6, 7, 10].map((y, i) => `${i * 20},${80 - y * 6}`).join(" ");
  const ys = [0, 8, 2, 6, 3, 5, 4, 5.2, 4.5, 6, 7, 10];
  return (
    <svg viewBox="0 0 220 90" className="w-full h-full">
      <polyline fill="none" stroke="#111111" strokeWidth="2" points={pts} />
      {ys.map((y, i) => (
        <circle key={i} cx={i * 20} cy={80 - y * 6} r="2" fill="#111111" />
      ))}
    </svg>
  );
}

export function AreaChart() {
  const top = [2, 7, 12, 10, 8, 9, 11, 13, 14, 16, 18, 17];
  const bot = [1, 3, 5, 6, 5, 6, 7, 8, 8, 9, 10, 9];
  const path = (arr: number[]) => arr.map((y, i) => `${i * 18},${100 - y * 5}`).join(" L ");
  return (
    <svg viewBox="0 0 220 110" className="w-full h-full">
      <path d={`M0,${100 - bot[0] * 5} L ${path(bot)} L 220,110 L 0,110 Z`} fill="#dddddd" />
      <path d={`M0,${100 - top[0] * 5} L ${path(top)} L 220,110 L 0,110 Z`} fill="#bbbbbb" />
    </svg>
  );
}

export function BarChart() {
  const bars = [8, 12, 6, 10, 7, 14, 4, 9, 5, 12, 7, 10];
  return (
    <svg viewBox="0 0 240 120" className="w-full h-full">
      {bars.map((v, i) => (
        <rect key={i} x={i * 18 + 8} y={110 - v * 6} width="10" height={v * 6} rx="2" fill={i % 2 ? "#333333" : "#999999"} />
      ))}
    </svg>
  );
}
