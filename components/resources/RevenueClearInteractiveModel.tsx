'use client';

import React, { useMemo, useState } from 'react';
const money = (n: number) =>
  n.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function Sparkline({
  points,
  height = 40,
}: {
  points: number[];
  height?: number;
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const pad = 6;
  const w = Math.max(120, points.length * 12);
  const h = height;
  const d = points
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / (points.length - 1 || 1);
      const y = pad + ((max - v) * (h - pad * 2)) / (max - min || 1);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full">
      <path d={d} fill="none" strokeWidth={2} stroke="currentColor" opacity={0.85} />
    </svg>
  );
}

function SliderField({
  label,
  value,
  setValue,
  min = 0,
  max = 100,
  step = 1,
  suffix = '%',
  help,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-neutral-200">{label}</label>
        <span className="text-xs text-neutral-400">{help}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-white"
        />
        <div className="flex w-24 items-center gap-1">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full rounded border border-neutral-700 bg-neutral-900 px-2 py-1 text-right"
          />
          <span className="text-sm text-neutral-400">{suffix}</span>
        </div>
      </div>
    </div>
  );
}

function MoneyField({
  label,
  value,
  setValue,
  help,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-neutral-200">{label}</label>
        <span className="text-xs text-neutral-400">{help}</span>
      </div>
      <div className="relative">
        <span className="absolute left-2 top-1.5 text-neutral-500">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
          className="w-full rounded border border-neutral-700 bg-neutral-900 pl-6 pr-3 py-1.5"
        />
      </div>
    </div>
  );
}

function PercentField({
  label,
  value,
  setValue,
  help,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-neutral-200">{label}</label>
        <span className="text-xs text-neutral-400">{help}</span>
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
          className="w-full rounded border border-neutral-700 bg-neutral-900 py-1.5 pl-3 pr-6 text-right"
        />
        <span className="absolute right-2 top-1.5 text-neutral-500">%</span>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-neutral-100">{value}</div>
      {sub && <div className="mt-1 text-xs text-neutral-400">{sub}</div>}
    </div>
  );
}

export type SimParams = {
  currentMRR: number;
  baselineNewMRR: number;
  churnPct: number;
  expansionPct: number;
  grossMarginPct: number;
  pricingUpliftPct: number;
  activationLiftPct: number;
  churnReductionPct: number;
  expansionLiftPct: number;
  months: number;
  programFee: number;
};

export function simulateRevenue(p: SimParams) {
  const margin = p.grossMarginPct / 100;
  const churn = p.churnPct / 100;
  const expansion = p.expansionPct / 100;

  const priceLift = p.pricingUpliftPct / 100;
  const activationLift = p.activationLiftPct / 100;
  const churnRed = p.churnReductionPct / 100;
  const expansionLift = p.expansionLiftPct / 100;

  const adjChurn = Math.max(0, churn * (1 - churnRed));
  const adjExpansion = expansion * (1 + expansionLift);

  let base = p.currentMRR;
  let baseSeries: number[] = [base];

  let cf = p.currentMRR;
  let cfSeries: number[] = [cf];

  base *= 1 + priceLift;

  let cumulativeAddedGrossProfit = 0;
  let paybackMonth: number | null = null;

  const monthRows: Array<{
    month: number;
    cfMRR: number;
    baseMRR: number;
    addedMRR: number;
    addedGrossProfit: number;
    cumulativeAddedGrossProfit: number;
  }> = [];

  for (let m = 1; m <= p.months; m++) {
    const cfExpansion = cf * expansion;
    const cfChurn = cf * churn;
    cf = cf + p.baselineNewMRR + cfExpansion - cfChurn;
    cfSeries.push(cf);

    const inflow = p.baselineNewMRR * (1 + activationLift) * (1 + priceLift);
    const baseExp = base * adjExpansion;
    const baseChurn = base * adjChurn;
    base = base + inflow + baseExp - baseChurn;
    baseSeries.push(base);

    const addedMRR = Math.max(0, base - cf);
    const addedGrossProfit = addedMRR * margin;
    cumulativeAddedGrossProfit += addedGrossProfit;
    if (paybackMonth === null && cumulativeAddedGrossProfit >= p.programFee) {
      paybackMonth = m;
    }

    monthRows.push({
      month: m,
      cfMRR: cf,
      baseMRR: base,
      addedMRR,
      addedGrossProfit,
      cumulativeAddedGrossProfit,
    });
  }

  const totalAddedMRR = Math.max(0, base - cf);
  const roi =
    p.programFee > 0
      ? (cumulativeAddedGrossProfit - p.programFee) / p.programFee
      : Number.POSITIVE_INFINITY;

  return {
    monthRows,
    baseSeries,
    cfSeries,
    totals: {
      totalAddedMRR,
      cumulativeAddedGrossProfit,
      roi,
      paybackMonth,
      endMRRWithTRS: base,
      endMRRNoTRS: cf,
    },
  };
}

export default function RevenueClearInteractiveModel() {
  const [currentMRR, setCurrentMRR] = useState(150000);
  const [baselineNewMRR, setBaselineNewMRR] = useState(30000);
  const [churnPct, setChurnPct] = useState(4);
  const [expansionPct, setExpansionPct] = useState(1);
  const [grossMarginPct, setGrossMarginPct] = useState(80);

  const [pricingUpliftPct, setPricingUpliftPct] = useState(12);
  const [activationLiftPct, setActivationLiftPct] = useState(20);
  const [churnReductionPct, setChurnReductionPct] = useState(25);
  const [expansionLiftPct, setExpansionLiftPct] = useState(30);

  const [months, setMonths] = useState(6);
  const [programFee, setProgramFee] = useState(45000);

  const [view, setView] = useState<'model' | 'howto'>('model');

  const sim = useMemo(
    () =>
      simulateRevenue({
        currentMRR,
        baselineNewMRR,
        churnPct,
        expansionPct,
        grossMarginPct,
        pricingUpliftPct,
        activationLiftPct,
        churnReductionPct,
        expansionLiftPct,
        months,
        programFee,
      }),
    [
      currentMRR,
      baselineNewMRR,
      churnPct,
      expansionPct,
      grossMarginPct,
      pricingUpliftPct,
      activationLiftPct,
      churnReductionPct,
      expansionLiftPct,
      months,
      programFee,
    ],
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-neutral-100">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">
            Revenue Clear — Interactive Model
          </h1>
          <p className="mt-1 max-w-2xl text-neutral-400">
            Change three levers. See cash fast. This mirrors what TRS installs in
            30–45 days: price discipline, activation uplift, and churn repair —
            visualized against your baseline.
          </p>
        </div>
        <div className="min-w-[260px]">
          <MoneyField
            label="Program Fee"
            value={programFee}
            setValue={setProgramFee}
            help="Flat fee used for ROI/payback"
          />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setView('model')}
          className={`rounded-full border bg-neutral-950/60 px-3 py-1.5 ${
            view === 'model'
              ? 'border-white text-white'
              : 'border-neutral-700 text-neutral-400'
          }`}
        >
          Model
        </button>
        <button
          onClick={() => setView('howto')}
          className={`rounded-full border bg-neutral-950/60 px-3 py-1.5 ${
            view === 'howto'
              ? 'border-white text-white'
              : 'border-neutral-700 text-neutral-400'
          }`}
        >
          How to use
        </button>
      </div>

      {view === 'model' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="text-sm font-semibold">Baseline</div>
              <div className="mt-3 space-y-3">
                <MoneyField
                  label="Current MRR"
                  value={currentMRR}
                  setValue={setCurrentMRR}
                  help="Your current monthly recurring revenue"
                />
                <MoneyField
                  label="Baseline New MRR / mo"
                  value={baselineNewMRR}
                  setValue={setBaselineNewMRR}
                  help="New sales inflow per month"
                />
                <PercentField
                  label="Monthly Churn %"
                  value={churnPct}
                  setValue={setChurnPct}
                  help="e.g., 3–6% typical"
                />
                <PercentField
                  label="Monthly Expansion % of MRR"
                  value={expansionPct}
                  setValue={setExpansionPct}
                  help="e.g., 0.5–2% typical"
                />
                <PercentField
                  label="Gross Margin %"
                  value={grossMarginPct}
                  setValue={setGrossMarginPct}
                  help="For ROI math"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="text-sm font-semibold">TRS Interventions</div>
              <div className="mt-3 space-y-4">
                <SliderField
                  label="Pricing Uplift"
                  value={pricingUpliftPct}
                  setValue={setPricingUpliftPct}
                  min={0}
                  max={40}
                  step={1}
                  help="ARPU step-up"
                />
                <SliderField
                  label="Activation Lift"
                  value={activationLiftPct}
                  setValue={setActivationLiftPct}
                  min={0}
                  max={200}
                  step={5}
                  help="More new MRR"
                />
                <SliderField
                  label="Churn Reduction"
                  value={churnReductionPct}
                  setValue={setChurnReductionPct}
                  min={0}
                  max={80}
                  step={5}
                  help="Lower cancel rate"
                />
                <SliderField
                  label="Expansion Lift"
                  value={expansionLiftPct}
                  setValue={setExpansionLiftPct}
                  min={0}
                  max={200}
                  step={5}
                  help="Higher expansion %"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Horizon</div>
                <div className="text-xs text-neutral-400">
                  {months} month{months !== 1 ? 's' : ''}
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={12}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="mt-2 w-full accent-white"
              />
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Kpi label="Added Net MRR (end of horizon)" value={money(sim.totals.totalAddedMRR)} />
              <Kpi
                label="Cumulative Added Gross Profit"
                value={money(sim.totals.cumulativeAddedGrossProfit)}
              />
              <Kpi label="ROI (gross profit / fee)" value={pct(sim.totals.roi)} sub="Excludes overhead" />
              <Kpi
                label="Payback"
                value={sim.totals.paybackMonth ? `${sim.totals.paybackMonth} mo` : '> horizon'}
              />
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">Projected MRR with TRS vs Baseline</div>
                  <div className="text-xs text-neutral-400">
                    End: {money(sim.totals.endMRRWithTRS)} vs {money(sim.totals.endMRRNoTRS)}
                  </div>
                </div>
                <div className="text-right text-xs text-neutral-400">Live preview</div>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-800 p-3">
                  <div className="mb-1 text-xs text-neutral-400">With TRS</div>
                  <Sparkline points={sim.baseSeries} />
                </div>
                <div className="rounded-xl border border-neutral-800 p-3 opacity-80">
                  <div className="mb-1 text-xs text-neutral-400">Baseline</div>
                  <Sparkline points={sim.cfSeries} />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-800">
              <div className="bg-neutral-950/60 px-4 py-3 text-sm font-semibold">Month-by-Month Impact</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-950/60 text-neutral-300">
                      <th className="px-4 py-2 text-left">Month</th>
                      <th className="px-4 py-2 text-right">MRR (Baseline)</th>
                      <th className="px-4 py-2 text-right">MRR (With TRS)</th>
                      <th className="px-4 py-2 text-right">Added MRR</th>
                      <th className="px-4 py-2 text-right">Added Gross Profit</th>
                      <th className="px-4 py-2 text-right">Cumulative GP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sim.monthRows.map((r) => (
                      <tr key={r.month} className="odd:bg-neutral-950/40 even:bg-neutral-950/20">
                        <td className="px-4 py-2">{r.month}</td>
                        <td className="px-4 py-2 text-right">{money(r.cfMRR)}</td>
                        <td className="px-4 py-2 text-right">{money(r.baseMRR)}</td>
                        <td className="px-4 py-2 text-right">{money(r.addedMRR)}</td>
                        <td className="px-4 py-2 text-right">{money(r.addedGrossProfit)}</td>
                        <td className="px-4 py-2 text-right">{money(r.cumulativeAddedGrossProfit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
              <div className="text-sm font-semibold">Model Notes</div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-neutral-300">
                <li>Pricing uplift applies immediately to the base and to new inflows.</li>
                <li>
                  Activation lift boosts new MRR inflow. Churn reduction and expansion lift modify monthly rates.
                </li>
                <li>ROI uses added gross profit only and the Program Fee above. Taxes/overhead excluded.</li>
                <li>Use this for directional decisions. We calibrate exact rates during the Clarity Audit.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {view === 'howto' && (
        <div className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
          <h2 className="text-xl font-semibold">How to use</h2>
          <div className="space-y-3 text-sm text-neutral-300">
            <div>
              <div className="font-medium text-neutral-100">What it is</div>
              <p>
                It’s a money calculator for your business. You move a few sliders, and it shows how much more money you can make
                if TRS fixes pricing, sign-ups, and churn.
              </p>
            </div>
            <div>
              <div className="font-medium text-neutral-100">What you tell it</div>
              <ul className="list-disc space-y-1 pl-5">
                <li>How much you make each month now</li>
                <li>How many new dollars you add each month</li>
                <li>How many customers leave each month (churn)</li>
                <li>How much customers usually grow each month (expansion)</li>
                <li>Your profit margin and the TRS fee</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-neutral-100">What the sliders do (the TRS fixes)</div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Pricing uplift: raise average price a bit</li>
                <li>Activation lift: get more new customers buying</li>
                <li>Churn reduction: fewer customers leaving</li>
                <li>Expansion lift: existing customers buy a little more</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-neutral-100">What it shows you</div>
              <ul className="list-disc space-y-1 pl-5">
                <li>Extra monthly money versus doing nothing</li>
                <li>Total profit added over time</li>
                <li>ROI compared to the fee</li>
                <li>When the fee pays back in months</li>
                <li>A simple chart and a month-by-month table so you can see the change</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-neutral-100">Why this matters</div>
              <p>
                You use it live with a prospect. In two minutes they see, in dollars, why “Revenue Clear” is worth it and when it
                pays for itself. No fluff—targets, cash, timing.
              </p>
            </div>
            <div>
              <div className="font-medium text-neutral-100">How to use it in a call</div>
              <ol className="list-decimal space-y-1 pl-5">
                <li>Enter their current numbers on the left</li>
                <li>Nudge the four TRS sliders to realistic lifts (not crazy)</li>
                <li>Point to payback month and ROI on the right</li>
                <li>Save the screenshot and send it with your proposal</li>
              </ol>
            </div>
            <div>
              <div className="font-medium text-neutral-100">One-line summary</div>
              <p>
                It’s a live demo that turns TRS’s work into simple dollars and a payback clock.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function runDevTests() {
  const base: SimParams = {
    currentMRR: 100000,
    baselineNewMRR: 20000,
    churnPct: 4,
    expansionPct: 1,
    grossMarginPct: 80,
    pricingUpliftPct: 0,
    activationLiftPct: 0,
    churnReductionPct: 0,
    expansionLiftPct: 0,
    months: 6,
    programFee: 45000,
  };
  const noLift = simulateRevenue(base);
  console.assert(Math.abs(noLift.totals.totalAddedMRR) < 1e-6, 'Test 1: zero lifts ⇒ no added MRR');
  console.assert(
    Math.abs(noLift.totals.cumulativeAddedGrossProfit) < 1e-6,
    'Test 1: zero lifts ⇒ no added GP',
  );

  const priceOnly = simulateRevenue({ ...base, pricingUpliftPct: 10 });
  console.assert(priceOnly.totals.totalAddedMRR > 0, 'Test 2: pricing lift ⇒ added MRR > 0');

  const aggressive = simulateRevenue({
    ...base,
    pricingUpliftPct: 15,
    activationLiftPct: 50,
    churnReductionPct: 50,
    expansionLiftPct: 50,
    months: 6,
  });
  console.assert(aggressive.totals.cumulativeAddedGrossProfit > 0, 'Test 3: lifts ⇒ positive GP');
}

if (typeof window !== 'undefined') {
  try {
    runDevTests();
  } catch (e) {
    // no-op
  }
}
