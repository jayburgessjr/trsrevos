'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';

import { TRS_CARD } from '@/lib/style';
import { cn } from '@/lib/utils';
import { Badge } from '@/ui/badge';
import { Button } from '@/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/ui/card';
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
  className,
}: {
  points: number[];
  height?: number;
  className?: string;
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
    <svg viewBox={`0 0 ${w} ${h}`} className={cn('h-10 w-full', className)}>
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
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">{help}</span>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-[color:var(--color-accent)]"
        />
        <div className="flex w-24 items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-right text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <span className="text-sm text-gray-500">{suffix}</span>
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
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">{help}</span>
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-7 pr-3 text-right text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">{help}</span>
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-right text-sm text-gray-900 shadow-sm focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
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
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-gray-900">{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-500">{sub}</div>}
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
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <Card className={cn(TRS_CARD, 'overflow-hidden')}>
        <CardHeader className="gap-4 border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Revenue Clear</Badge>
            <Badge variant="success">Interactive model</Badge>
            <Badge variant="default">Board-ready</Badge>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <CardTitle className="text-2xl text-black md:text-3xl">Revenue Clear scenario model</CardTitle>
              <CardDescription className="max-w-2xl text-sm text-gray-600">
                Change the four core levers that Revenue Clear tightens to show ROI in minutes. Bring it to prospect calls or
                executive reviews before opening the full workspace.
              </CardDescription>
            </div>
            <div className="flex w-full max-w-sm flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                Launch the module
              </span>
              <Button asChild size="md" className="w-full">
                <Link href="/revenue-clear">Open Revenue Clear workspace</Link>
              </Button>
              <p className="text-xs text-gray-500">
                Guided intake, autosave, AI summaries, and board-ready exports live inside RevOS.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex flex-wrap items-center justify-start gap-2 border-gray-200 text-xs text-gray-600">
          {['Pricing discipline', 'Activation lift', 'Churn repair', 'Expansion growth'].map((item) => (
            <span key={item} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1">
              {item}
            </span>
          ))}
        </CardFooter>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card className={TRS_CARD}>
            <CardHeader className="border-gray-200">
              <CardTitle className="text-lg text-black">Baseline inputs</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Anchor the model with current revenue run rate and retention.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MoneyField
                label="Current MRR"
                value={currentMRR}
                setValue={setCurrentMRR}
                help="Monthly recurring revenue today"
              />
              <MoneyField
                label="Baseline new MRR / mo"
                value={baselineNewMRR}
                setValue={setBaselineNewMRR}
                help="Inbound sales added each month"
              />
              <PercentField
                label="Monthly churn %"
                value={churnPct}
                setValue={setChurnPct}
                help="Logo or revenue churn rate"
              />
              <PercentField
                label="Monthly expansion % of MRR"
                value={expansionPct}
                setValue={setExpansionPct}
                help="Existing customers growing each month"
              />
              <PercentField
                label="Gross margin %"
                value={grossMarginPct}
                setValue={setGrossMarginPct}
                help="Needed for ROI math"
              />
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader className="border-gray-200">
              <CardTitle className="text-lg text-black">Revenue Clear levers</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Dial in the lifts that the program drives during the first 30–45 days.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SliderField
                label="Pricing uplift"
                value={pricingUpliftPct}
                setValue={setPricingUpliftPct}
                min={0}
                max={40}
                step={1}
                help="ARPU step-up"
              />
              <SliderField
                label="Activation lift"
                value={activationLiftPct}
                setValue={setActivationLiftPct}
                min={0}
                max={200}
                step={5}
                help="More new MRR"
              />
              <SliderField
                label="Churn reduction"
                value={churnReductionPct}
                setValue={setChurnReductionPct}
                min={0}
                max={80}
                step={5}
                help="Lower cancel rate"
              />
              <SliderField
                label="Expansion lift"
                value={expansionLiftPct}
                setValue={setExpansionLiftPct}
                min={0}
                max={200}
                step={5}
                help="Higher expansion %"
              />
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader className="border-gray-200">
              <CardTitle className="text-lg text-black">Program economics</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Set the engagement fee and time horizon that you want to pressure test.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MoneyField
                label="Program fee"
                value={programFee}
                setValue={setProgramFee}
                help="Used for ROI and payback"
              />
              <SliderField
                label="Model horizon"
                value={months}
                setValue={setMonths}
                min={1}
                max={12}
                step={1}
                suffix="mo"
                help="1–12 month window"
              />
              <p className="text-xs text-gray-500">
                Outputs refresh automatically as you adjust the horizon or fee assumptions.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={TRS_CARD}>
            <CardHeader className="border-gray-200">
              <CardTitle className="text-lg text-black">Revenue Clear impact</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Results update instantly so you can narrate ROI live with your prospect.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Kpi label="Added net MRR" value={money(sim.totals.totalAddedMRR)} sub="End of horizon" />
                <Kpi
                  label="Added gross profit"
                  value={money(sim.totals.cumulativeAddedGrossProfit)}
                  sub="Cumulative"
                />
                <Kpi label="ROI" value={pct(sim.totals.roi)} sub="Gross profit / fee" />
                <Kpi
                  label="Payback"
                  value={sim.totals.paybackMonth ? `${sim.totals.paybackMonth} mo` : 'Beyond horizon'}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">With TRS</p>
                  <Sparkline points={sim.baseSeries} className="text-sky-500" />
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Baseline</p>
                  <Sparkline points={sim.cfSeries} className="text-gray-400" />
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">End of horizon comparison</p>
                <p className="mt-1">
                  With Revenue Clear: {money(sim.totals.endMRRWithTRS)} · Baseline: {money(sim.totals.endMRRNoTRS)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader className="border-gray-200">
              <CardTitle className="text-lg text-black">Month-by-month impact</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Export this table or screenshot it for follow-up notes and board decks.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                    <tr>
                      <th className="px-5 py-3 text-left">Month</th>
                      <th className="px-5 py-3 text-right">MRR (baseline)</th>
                      <th className="px-5 py-3 text-right">MRR (with TRS)</th>
                      <th className="px-5 py-3 text-right">Added MRR</th>
                      <th className="px-5 py-3 text-right">Added gross profit</th>
                      <th className="px-5 py-3 text-right">Cumulative GP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sim.monthRows.map((r) => (
                      <tr key={r.month} className="odd:bg-white even:bg-gray-50">
                        <td className="px-5 py-3 text-left">{r.month}</td>
                        <td className="px-5 py-3 text-right">{money(r.cfMRR)}</td>
                        <td className="px-5 py-3 text-right">{money(r.baseMRR)}</td>
                        <td className="px-5 py-3 text-right">{money(r.addedMRR)}</td>
                        <td className="px-5 py-3 text-right">{money(r.addedGrossProfit)}</td>
                        <td className="px-5 py-3 text-right">{money(r.cumulativeAddedGrossProfit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className={TRS_CARD}>
            <CardHeader className="border-gray-200">
              <CardTitle className="text-lg text-black">Model notes</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Keep these assumptions in mind when you share the numbers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
                <li>Pricing uplift applies immediately to baseline revenue and to new inflows.</li>
                <li>Activation lift boosts new MRR inflow. Churn reduction and expansion lift modify monthly rates.</li>
                <li>ROI uses added gross profit only and the program fee you set above.</li>
                <li>Use this for directional alignment. We calibrate exact rates during the Clarity Audit.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className={TRS_CARD}>
        <CardHeader className="border-gray-200">
          <CardTitle className="text-lg text-black">How to run this in a call</CardTitle>
          <CardDescription className="text-sm text-gray-500">
            A simple script so prospects see cash impact, timing, and next steps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <div>
            <p className="font-semibold text-gray-900">What it is</p>
            <p className="mt-1">
              A money calculator for your business. Move a few sliders and it shows how much more revenue and profit unlock when
              TRS fixes pricing, activation, churn, and expansion.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">What you enter</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Current monthly recurring revenue</li>
              <li>New dollars landing each month</li>
              <li>Monthly churn rate</li>
              <li>Monthly expansion rate</li>
              <li>Gross margin and the TRS fee</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900">What the sliders represent</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Pricing uplift: raising average deal value</li>
              <li>Activation lift: more new customers converting</li>
              <li>Churn reduction: fewer accounts leaving</li>
              <li>Expansion lift: customers buying more each month</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900">What to point out</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Incremental monthly revenue versus status quo</li>
              <li>Total gross profit added</li>
              <li>ROI compared to the program fee</li>
              <li>Payback month across the horizon</li>
              <li>The line chart and table that visualize the shift</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Live call flow</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5">
              <li>Enter their current numbers on the left.</li>
              <li>Set realistic lifts on the four Revenue Clear sliders.</li>
              <li>Highlight payback and ROI on the right-hand side.</li>
              <li>Screenshot the output and include it with your proposal.</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold text-gray-900">One-line summary</p>
            <p className="mt-1">
              It’s a live demo that turns the Revenue Clear workflow into simple dollars and a payback clock.
            </p>
          </div>
        </CardContent>
      </Card>
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
