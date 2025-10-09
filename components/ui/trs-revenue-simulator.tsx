"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

type TRSRevenueSimulatorProps = {
  label?: string;
  metric?: string;
  unit?: string;
  className?: string;
};

export const TRSRevenueSimulator: React.FC<TRSRevenueSimulatorProps> = ({
  label = "Monthly Revenue",
  metric = "Revenue Growth",
  unit = "%",
  className,
}) => {
  const [value, setValue] = useState(50);

  const roi = Math.min(5 + value * 0.8, 250).toFixed(1);
  const marginGain = Math.min(value * 0.6, 180).toFixed(1);
  const efficiency = Math.min(70 + value * 0.2, 100).toFixed(1);

  return (
    <section
      className={cn(
        "w-full max-w-4xl mx-auto rounded-xl border border-gray-200 bg-white p-8",
        className,
      )}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-black">{label}</h2>
        <p className="text-sm text-gray-500">
          Adjust the input below to model {metric.toLowerCase()} impact.
        </p>
      </div>

      <div className="mb-8">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          className="w-full appearance-none h-3 rounded bg-gray-200"
          style={{
            background: `linear-gradient(to right, black 0%, black ${
              (value / 100) * 100
            }%, #E5E7EB ${(value / 100) * 100}%, #E5E7EB 100%)`,
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Compounding ROI</div>
          <div className="text-2xl font-semibold text-black">
            {roi}
            {unit}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Margin Uplift</div>
          <div className="text-2xl font-semibold text-black">
            {marginGain}
            {unit}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Capital Efficiency</div>
          <div className="text-2xl font-semibold text-black">
            {efficiency}
            {unit}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500">
        Modeled on historical TRS data. For directional analysis only.
      </div>
    </section>
  );
};
