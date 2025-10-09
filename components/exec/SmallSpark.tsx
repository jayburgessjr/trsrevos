"use client";
export function SmallSpark({ points = [1,2,1.5,2.2,2.6,2.1] }: { points?: number[] }) {
  const pts = points.map((y,i)=>`${i*20},${40 - y*10}`).join(" ");
  return (
    <svg viewBox="0 0 120 44" className="w-full h-[44px]">
      <polyline fill="none" stroke="#111111" strokeWidth="2" points={pts}/>
    </svg>
  );
}
